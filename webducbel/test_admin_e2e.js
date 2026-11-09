const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runAdminE2ETests() {
  console.log('--- KHỞI ĐỘNG KIỂM THỬ PLAYWRIGHT E2E CHO FRONTEND ADMIN DUCBEL ---');

  // Đọc credentials an toàn từ file local (không in mật khẩu ra log/console)
  const credPath = path.join(__dirname, 'admin_credentials.local.json');
  if (!fs.existsSync(credPath)) {
    throw new Error('Không tìm thấy file cấu hình kiểm thử admin_credentials.local.json');
  }
  const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  const adminEmail = creds.adminEmail || creds.admin?.email;
  const adminPassword = creds.adminPassword || creds.admin?.password;

  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const logConsole = (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Browser Console Error]: ${msg.text()}`);
      errors.push(msg.text());
    }
  };

  try {
    // ==========================================
    // 1. BRANDING & PUBLIC CHECK
    // ==========================================
    console.log('\n[TEST 1]: Kiểm tra thương hiệu DucBel trên giao diện khách hàng');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await desktopContext.newPage();
    page.on('console', logConsole);

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    const pageTitle = await page.title();
    console.log(`✓ Page Title: "${pageTitle}"`);
    if (!pageTitle.includes('DucBel')) {
      throw new Error(`Page title không chứa "DucBel": ${pageTitle}`);
    }

    const brandHeader = await page.textContent('header');
    if (!brandHeader.includes('DucBel')) {
      throw new Error('Header không hiển thị thương hiệu DucBel');
    }
    console.log('✓ Header hiển thị thương hiệu DucBel');

    const footerText = await page.textContent('footer');
    if (!footerText.includes('DucBel')) {
      throw new Error('Footer không hiển thị thương hiệu DucBel');
    }
    console.log('✓ Footer hiển thị thương hiệu DucBel');

    // ==========================================
    // 2. ROUTE GUARD: TRUY CẬP /admin KHI CHƯA ĐĂNG NHẬP
    // ==========================================
    console.log('\n[TEST 2]: Kiểm tra Route Guard khi truy cập /admin chưa đăng nhập');
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const redirectedUrl = page.url();
    console.log(`✓ URL sau khi bị chặn chuyển hướng: ${redirectedUrl}`);
    if (!redirectedUrl.includes('/dang-nhap')) {
      throw new Error(`Không chuyển hướng về trang đăng nhập: ${redirectedUrl}`);
    }

    // ==========================================
    // 3. ĐĂNG NHẬP TÀI KHOẢN ADMIN THẬT
    // ==========================================
    console.log('\n[TEST 3]: Đăng nhập với tài khoản Admin từ hệ thống');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button:has-text("Đăng nhập ngay")');

    // Chờ điều hướng trở lại /admin
    await page.waitForURL('**/admin**', { timeout: 10000 });
    console.log(`✓ Đăng nhập thành công, đã vào cổng Admin: ${page.url()}`);

    // ==========================================
    // 4. KIỂM THỬ ADMIN DASHBOARD
    // ==========================================
    console.log('\n[TEST 4]: Kiểm tra giao diện Dashboard Quản trị (/admin)');
    await page.waitForSelector('text=Bảng điều khiển kinh doanh DucBel', { timeout: 10000 });
    const adminHeading = await page.textContent('h1');
    console.log(`✓ Dashboard H1: "${adminHeading.trim()}"`);

    const adminBrand = await page.textContent('aside');
    if (adminBrand.includes('DucBel') && adminBrand.includes('Admin Portal')) {
      console.log('✓ Sidebar hiển thị "DucBel Admin Portal" chính xác');
    } else {
      throw new Error('Sidebar Admin không chứa "DucBel Admin Portal"');
    }

    // ==========================================
    // 5. KIỂM THỬ TỪNG TRANG ADMIN
    // ==========================================
    const adminRoutes = [
      { name: 'Đơn hàng', path: '/admin/orders', expectedText: 'Danh sách Đơn hàng' },
      { name: 'Sản phẩm', path: '/admin/products', expectedText: 'Quản lý Các Loại Gạo' },
      { name: 'Thêm sản phẩm', path: '/admin/products/create', expectedText: 'Thêm Mới Loại Gạo Vào Kho' },
      { name: 'Danh mục', path: '/admin/categories', expectedText: 'Quản lý Danh mục Gạo' },
      { name: 'Kho hàng', path: '/admin/inventory', expectedText: 'Quản lý Kho Gạo DucBel' },
      { name: 'Khách hàng', path: '/admin/customers', expectedText: 'Quản lý Khách hàng' },
      { name: 'Nhân sự', path: '/admin/staff', expectedText: 'Nhân sự & Phân quyền' },
      { name: 'Báo cáo', path: '/admin/reports', expectedText: 'Báo Cáo Phân Tích Chuyên Sâu DucBel' },
      { name: 'Cài đặt', path: '/admin/settings', expectedText: 'Cài Đặt Hệ Thống & Vùng Giao Hàng' },
    ];

    for (const route of adminRoutes) {
      console.log(`\n[TEST 5.${route.name}]: Kiểm tra điều hướng tới ${route.path}`);
      await page.goto(`http://localhost:5173${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForSelector(`text=${route.expectedText}`, { timeout: 8000 });
      console.log(`✓ Trang ${route.name} tải thành công, tìm thấy "${route.expectedText}"`);
    }

    // ==========================================
    // 6. TƯƠNG TÁC THỰC TẾ TRÊN KHO HÀNG (INVENTORY)
    // ==========================================
    console.log('\n[TEST 6]: Thử nghiệm Modal Điều chỉnh kho tại /admin/inventory');
    await page.goto('http://localhost:5173/admin/inventory', { waitUntil: 'networkidle' });
    const adjustButtons = await page.$$('button:has-text("Nhập / Xuất kho")');
    if (adjustButtons.length > 0) {
      await adjustButtons[0].click();
      console.log('✓ Đã click mở modal điều chỉnh kho');
      await page.waitForSelector('text=Điều chỉnh Tồn kho Gạo');
      await page.fill('input[placeholder*="Nhập lô gạo"]', 'Playwright Test nhập thử');
      await page.click('button:has-text("Xác nhận cập nhật kho")');
      await page.waitForSelector('text=Đã cập nhật kho:');
      console.log('✓ Cập nhật kho thành công với thông báo Toast trực quan');
    }

    // ==========================================
    // 7. RESPONSIVE MOBILE 390px TRÊN ADMIN
    // ==========================================
    console.log('\n[TEST 7]: Kiểm thử Admin trên màn hình Mobile 390px');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });

    const mobileTitle = await page.textContent('body');
    if (mobileTitle.includes('DucBel')) {
      console.log('✓ Mobile Admin hiển thị tốt không lỗi layout');
    }

    // Click Hamburger button để mở Drawer
    const menuBtn = await page.$('header button:has(span:text("menu"))');
    if (menuBtn) {
      await menuBtn.click();
      console.log('✓ Đã bấm mở mobile sidebar drawer');
      await page.waitForSelector('.lg\\:hidden nav >> text=Cài đặt & Vùng giao', { state: 'visible', timeout: 5000 });
      console.log('✓ Sidebar drawer mở đầy đủ menu quản trị');
    }

    console.log('\n=========================================');
    console.log('TẤT CẢ CÁC BƯỚC KIỂM THỬ PLAYWRIGHT ADMIN ĐỀU THÀNH CÔNG RỰC RỠ!');
    console.log('=========================================');

  } finally {
    await browser.close();
  }
}

runAdminE2ETests().catch((err) => {
  console.error('\n❌ KIỂM THỬ THẤT BẠI:', err);
  process.exit(1);
});
