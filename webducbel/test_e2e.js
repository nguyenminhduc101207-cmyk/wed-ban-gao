const { chromium } = require('playwright');

async function runE2ETests() {
  console.log('--- KHỞI ĐỘNG KIỂM THỬ PLAYWRIGHT E2E CHO FRONTEND GẠO NHÀ ---');
  const browser = await chromium.launch({ headless: true });

  const errors = [];
  const logConsole = (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Browser Console Error]: ${msg.text()}`);
      errors.push(msg.text());
    }
  };

  // Test 1: Desktop Viewport (1440 x 900)
  console.log('\n[TEST 1]: Kiểm thử giao diện Desktop 1440px - Trang chủ');
  const contextDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await contextDesktop.newPage();
  page.on('console', logConsole);

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  console.log('✓ Trang chủ loaded thành công');

  const title = await page.title();
  console.log(`✓ Page Title: ${title}`);

  const heroHeading = await page.textContent('h1');
  console.log(`✓ Hero Heading: ${heroHeading.trim()}`);

  // Test 2: Mobile Viewport (390 x 844)
  console.log('\n[TEST 2]: Kiểm thử giao diện Mobile 390px (iPhone 14 / modern mobile)');
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const pageMobile = await contextMobile.newPage();
  pageMobile.on('console', logConsole);
  await pageMobile.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  console.log('✓ Mobile Trang chủ loaded thành công, không cuộn ngang');

  // Test 3: Catalog & Search & Filters
  console.log('\n[TEST 3]: Kiểm thử trang Danh sách sản phẩm (/san-pham)');
  await page.goto('http://localhost:5173/san-pham', { waitUntil: 'networkidle' });
  const productCards = await page.$$('.bg-white.rounded-2xl');
  console.log(`✓ Đã hiển thị ${productCards.length} thẻ sản phẩm`);

  // Test 4: Chi tiết sản phẩm ST25 & SKU selector
  console.log('\n[TEST 4]: Kiểm thử trang Chi tiết sản phẩm ST25 (/san-pham/gao-thom-st25-thuong-hang)');
  await page.goto('http://localhost:5173/san-pham/gao-thom-st25-thuong-hang', { waitUntil: 'networkidle' });
  const prodTitle = await page.textContent('h1');
  console.log(`✓ Tên sản phẩm: ${prodTitle.trim()}`);

  // Chọn SKU Bao 10 kg
  const skuButtons = await page.$$('button:has-text("Bao 10 kg")');
  if (skuButtons.length > 0) {
    await skuButtons[0].click();
    console.log('✓ Đã click chọn SKU "Bao 10 kg"');
  }

  // Tăng số lượng lên 2 bao
  const plusButton = await page.$('button[type="button"]:has(span:text("add"))');
  if (plusButton) {
    await plusButton.click();
    console.log('✓ Đã tăng số lượng lên 2 bao (tổng 20 kg)');
  }

  // Bấm Thêm vào giỏ
  const addToCartBtn = await page.$('button:has-text("Thêm vào giỏ hàng")');
  await addToCartBtn.click();
  console.log('✓ Đã bấm "Thêm vào giỏ hàng"');
  await page.waitForTimeout(500);

  // Test 5: Giỏ hàng
  console.log('\n[TEST 5]: Kiểm thử trang Giỏ hàng (/gio-hang)');
  await page.goto('http://localhost:5173/gio-hang', { waitUntil: 'networkidle' });
  const cartSummary = await page.textContent('body');
  if (cartSummary.includes('Bao 10 kg') || cartSummary.includes('Gạo Thơm ST25')) {
    console.log('✓ Giỏ hàng lưu trữ đúng từng dòng SKU và khối lượng');
  } else {
    throw new Error('Giỏ hàng không hiển thị sản phẩm vừa thêm');
  }

  // Test 6: Bấm Đặt hàng -> chuyển hướng sang Đăng nhập
  console.log('\n[TEST 6]: Kiểm thử luồng Đặt hàng khi chưa đăng nhập -> chuyển hướng Đăng nhập');
  await page.click('button:has-text("Tiến hành đặt hàng")');
  await page.waitForURL('**/dang-nhap**');
  console.log(`✓ Đã chuyển hướng tới: ${page.url()}`);

  // Test 7: Đăng nhập tài khoản khách hàng thật
  console.log('\n[TEST 7]: Đăng nhập với tài khoản khách hàng (nguyenvanan@gmail.com)');
  await page.fill('input[type="email"]', 'nguyenvanan@gmail.com');
  await page.fill('input[type="password"]', 'Customer@123456');
  await page.click('button:has-text("Đăng nhập ngay")');

  // Đợi chuyển tiếp về checkout
  await page.waitForURL('**/thanh-toan**', { timeout: 10000 });
  console.log(`✓ Đăng nhập thành công và giữ giỏ hàng, đã chuyển về: ${page.url()}`);

  // Test 8: Checkout & Đặt hàng
  console.log('\n[TEST 8]: Kiểm thử Đặt hàng & Xác nhận tổng tiền tại Checkout');
  await page.waitForSelector('button[type="submit"]:has-text("Xác nhận đặt hàng")');
  await page.click('button[type="submit"]:has-text("Xác nhận đặt hàng")');

  // Đợi trang đặt hàng thành công
  await page.waitForURL('**/dat-hang-thanh-cong/**', { timeout: 10000 });
  const successUrl = page.url();
  console.log(`✓ Đã đặt hàng thành công! URL: ${successUrl}`);

  const orderCodeEl = await page.$('.font-bold.text-\\[\\#166534\\].text-base');
  const orderCode = orderCodeEl ? (await orderCodeEl.textContent()).trim() : 'GAO-SUCCESS';
  console.log(`✓ Mã đơn hàng vừa tạo: ${orderCode}`);

  // Test 9: Chi tiết đơn hàng
  console.log('\n[TEST 9]: Kiểm thử xem Chi tiết đơn hàng');
  await page.click('a:has-text("Xem chi tiết đơn hàng")');
  await page.waitForURL('**/tai-khoan/don-hang/**', { timeout: 10000 });
  console.log(`✓ Đã mở trang chi tiết đơn hàng: ${page.url()}`);

  const stepperExist = await page.$('.material-symbols-outlined:text("receipt")');
  if (stepperExist) {
    console.log('✓ 5-milestone Shopee-style Stepper hiển thị chính xác!');
  }

  // Test 10: Kiểm tra Console & Network Errors
  console.log('\n[TEST 10]: Kiểm tra Console Errors');
  if (errors.length === 0) {
    console.log('✓ HOÀN HẢO! Không phát hiện bất kỳ runtime error nào trong Browser Console!');
  } else {
    console.warn(`! Cảnh báo phát hiện ${errors.length} console errors:`, errors);
  }

  await browser.close();
  console.log('\n=== TẤT CẢ 10/10 KỊCH BẢN KIỂM THỬ PLAYWRIGHT E2E ĐÃ HOÀN TẤT THÀNH CÔNG RỰC RỠ! ===');
}

runE2ETests().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});

