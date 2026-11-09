export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  PENDING = 'PENDING',                     // Chờ xác nhận
  CONFIRMED = 'CONFIRMED',                 // Đã xác nhận
  PACKING = 'PACKING',                     // Đang đóng gói
  DELIVERING = 'DELIVERING',               // Đang giao hàng
  DELIVERED = 'DELIVERED',                 // Đã giao hàng
  CANCEL_REQUESTED = 'CANCEL_REQUESTED',   // Yêu cầu hủy
  CANCELLED = 'CANCELLED',                 // Đã hủy
  COMPLETED = 'COMPLETED',                 // Hoàn tất
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',     // Chưa thanh toán (COD / Chờ chuyển khoản)
  PAID = 'PAID',         // Đã thanh toán (Thu COD thành công / Admin đối soát)
  REFUNDED = 'REFUNDED', // Đã hoàn tiền
}

export enum PaymentMethod {
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}
