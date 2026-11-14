import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

type Range = '7days' | '30days' | 'quarter' | 'year';

const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // múi giờ Việt Nam (UTC+7)
const DAY_MS = 24 * 60 * 60 * 1000;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

@Injectable()
export class ReportsService {
  constructor(private dataSource: DataSource) {}

  /** Khoảng thời gian [from, to) theo giờ Việt Nam, đã quy ra mốc UTC */
  private getPeriod(range: Range) {
    const nowVn = new Date(Date.now() + VN_OFFSET_MS);
    const y = nowVn.getUTCFullYear();
    const m = nowVn.getUTCMonth();
    const d = nowVn.getUTCDate();
    const todayStartVn = Date.UTC(y, m, d); // 00:00 hôm nay (giờ VN, biểu diễn dạng UTC)
    const tomorrowStartVn = todayStartVn + DAY_MS;

    let fromVn: number;
    if (range === '7days') {
      fromVn = tomorrowStartVn - 7 * DAY_MS;
    } else if (range === 'quarter') {
      fromVn = Date.UTC(y, Math.floor(m / 3) * 3, 1);
    } else if (range === 'year') {
      fromVn = Date.UTC(y, 0, 1);
    } else {
      fromVn = tomorrowStartVn - 30 * DAY_MS;
    }

    const length = tomorrowStartVn - fromVn;
    return {
      fromVn,
      toVn: tomorrowStartVn,
      from: new Date(fromVn - VN_OFFSET_MS),
      to: new Date(tomorrowStartVn - VN_OFFSET_MS),
      prevFrom: new Date(fromVn - length - VN_OFFSET_MS),
      prevTo: new Date(fromVn - VN_OFFSET_MS),
    };
  }

  private async summarize(from: Date, to: Date) {
    const [row] = await this.dataSource.query(
      `SELECT
         COUNT(*) AS totalOrders,
         COALESCE(SUM(CASE WHEN orderStatus <> 'CANCELLED' THEN 1 ELSE 0 END), 0) AS validOrders,
         COALESCE(SUM(CASE WHEN orderStatus <> 'CANCELLED' THEN totalAmount ELSE 0 END), 0) AS revenue,
         COALESCE(SUM(CASE WHEN orderStatus <> 'CANCELLED' THEN totalBags ELSE 0 END), 0) AS bags,
         COALESCE(SUM(CASE WHEN orderStatus IN ('DELIVERED','COMPLETED') THEN 1 ELSE 0 END), 0) AS successOrders,
         COALESCE(SUM(CASE WHEN orderStatus = 'CANCELLED' THEN 1 ELSE 0 END), 0) AS cancelledOrders
       FROM orders
       WHERE createdAt >= ? AND createdAt < ?`,
      [from, to],
    );
    return {
      totalOrders: Number(row.totalOrders),
      validOrders: Number(row.validOrders),
      revenue: Number(row.revenue),
      bags: Number(row.bags),
      successOrders: Number(row.successOrders),
      cancelledOrders: Number(row.cancelledOrders),
    };
  }

  async getReport(rangeInput?: string) {
    const range: Range = (['7days', '30days', 'quarter', 'year'] as const).includes(
      rangeInput as Range,
    )
      ? (rangeInput as Range)
      : '30days';
    const p = this.getPeriod(range);

    const [current, previous] = await Promise.all([
      this.summarize(p.from, p.to),
      this.summarize(p.prevFrom, p.prevTo),
    ]);

    const revenueChangePct =
      previous.revenue > 0
        ? Math.round(((current.revenue - previous.revenue) / previous.revenue) * 1000) / 10
        : null;

    // ----- Biểu đồ doanh thu -----
    const orders: { createdAt: Date; totalAmount: string }[] = await this.dataSource.query(
      `SELECT createdAt, totalAmount FROM orders
        WHERE createdAt >= ? AND createdAt < ? AND orderStatus <> 'CANCELLED'
        LIMIT 50000`,
      [p.from, p.to],
    );

    const byMonth = range === 'quarter' || range === 'year';
    const buckets = new Map<string, { label: string; revenue: number; orders: number }>();

    if (byMonth) {
      const start = new Date(p.fromVn);
      const end = new Date(p.toVn - 1);
      let cy = start.getUTCFullYear();
      let cm = start.getUTCMonth();
      while (cy < end.getUTCFullYear() || (cy === end.getUTCFullYear() && cm <= end.getUTCMonth())) {
        const key = `${cy}-${pad(cm + 1)}`;
        buckets.set(key, { label: `T${pad(cm + 1)}/${String(cy).slice(2)}`, revenue: 0, orders: 0 });
        cm++;
        if (cm > 11) {
          cm = 0;
          cy++;
        }
      }
    } else {
      for (let t = p.fromVn; t < p.toVn; t += DAY_MS) {
        const dt = new Date(t);
        const key = `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
        buckets.set(key, {
          label: `${pad(dt.getUTCDate())}/${pad(dt.getUTCMonth() + 1)}`,
          revenue: 0,
          orders: 0,
        });
      }
    }

    for (const o of orders) {
      const vn = new Date(new Date(o.createdAt).getTime() + VN_OFFSET_MS);
      const key = byMonth
        ? `${vn.getUTCFullYear()}-${pad(vn.getUTCMonth() + 1)}`
        : `${vn.getUTCFullYear()}-${pad(vn.getUTCMonth() + 1)}-${pad(vn.getUTCDate())}`;
      const b = buckets.get(key);
      if (b) {
        b.revenue += Number(o.totalAmount);
        b.orders += 1;
      }
    }
    const series = Array.from(buckets.values());

    // ----- Cơ cấu doanh số theo loại gạo -----
    const productRows = await this.dataSource.query(
      `SELECT oi.productName AS name, SUM(oi.lineTotal) AS sales
         FROM order_items oi
         JOIN orders o ON o.id = oi.orderId
        WHERE o.createdAt >= ? AND o.createdAt < ? AND o.orderStatus <> 'CANCELLED'
        GROUP BY oi.productName
        ORDER BY sales DESC
        LIMIT 5`,
      [p.from, p.to],
    );
    const [salesTotalRow] = await this.dataSource.query(
      `SELECT COALESCE(SUM(oi.lineTotal), 0) AS total
         FROM order_items oi
         JOIN orders o ON o.id = oi.orderId
        WHERE o.createdAt >= ? AND o.createdAt < ? AND o.orderStatus <> 'CANCELLED'`,
      [p.from, p.to],
    );
    const salesTotal = Number(salesTotalRow.total);
    const topProducts = productRows.map((r: any) => ({
      name: r.name,
      sales: Number(r.sales),
      share: salesTotal > 0 ? Math.round((Number(r.sales) / salesTotal) * 100) : 0,
    }));

    // ----- Phân bổ giao hàng theo vùng -----
    const zoneRows = await this.dataSource.query(
      `SELECT COALESCE(z.name, 'Không xác định') AS name,
              COALESCE(z.estimatedDelivery, '---') AS estimatedDelivery,
              COUNT(*) AS cnt
         FROM orders o
         LEFT JOIN delivery_zones z ON z.id = o.deliveryZoneId
        WHERE o.createdAt >= ? AND o.createdAt < ? AND o.orderStatus <> 'CANCELLED'
        GROUP BY o.deliveryZoneId, z.name, z.estimatedDelivery
        ORDER BY cnt DESC`,
      [p.from, p.to],
    );
    const zoneTotal = zoneRows.reduce((s: number, r: any) => s + Number(r.cnt), 0);
    const zones = zoneRows.map((r: any) => ({
      name: r.name,
      estimatedDelivery: r.estimatedDelivery,
      count: Number(r.cnt),
      pct: zoneTotal > 0 ? Math.round((Number(r.cnt) / zoneTotal) * 100) : 0,
    }));

    return {
      range,
      kpis: {
        revenue: current.revenue,
        revenueChangePct,
        successOrders: current.successOrders,
        successRate:
          current.validOrders > 0
            ? Math.round((current.successOrders / current.validOrders) * 1000) / 10
            : 0,
        avgOrderValue:
          current.validOrders > 0 ? Math.round(current.revenue / current.validOrders) : 0,
        avgBagsPerOrder:
          current.validOrders > 0
            ? Math.round((current.bags / current.validOrders) * 10) / 10
            : 0,
        cancelRate:
          current.totalOrders > 0
            ? Math.round((current.cancelledOrders / current.totalOrders) * 1000) / 10
            : 0,
        totalOrders: current.totalOrders,
      },
      series,
      topProducts,
      zones,
    };
  }
}
