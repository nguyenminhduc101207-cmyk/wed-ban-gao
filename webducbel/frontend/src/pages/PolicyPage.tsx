import React from 'react';
import { Link } from 'react-router-dom';

export const PolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <nav className="flex items-center gap-1.5 text-xs text-[#4B5563]">
        <Link to="/" className="hover:text-[#166534]">Trang chủ</Link>
        <span>/</span>
        <span className="font-semibold text-[#121c2a]">Chính sách giao hàng & Đổi trả</span>
      </nav>

      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#D1D5DB]/60 shadow-xs space-y-6">
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold text-[#795900] tracking-wider">
            Cam kết phục vụ tận tâm
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#166534] tracking-tight">
            Chính sách giao hàng tận cửa & Đổi trả trong 7 ngày
          </h1>
          <p className="text-sm text-[#4B5563]">
            Áp dụng cho toàn bộ các đơn hàng đặt mua gạo trực tuyến tại hệ thống DucBel.
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#121c2a] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#121c2a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#166534] text-[20px]">local_shipping</span>
              1. Dịch vụ vận chuyển & Hỗ trợ bốc vác
            </h2>
            <p className="text-[#4B5563]">
              Bao gạo 5kg, 10kg, 25kg là mặt hàng có trọng lượng tương đối lớn. Đội ngũ giao hàng chuyên trách của DucBel cam kết hỗ trợ khách hàng mang vác gạo lên tận phòng chung cư hoặc cửa bếp gia đình mà không phụ thu thêm chi phí bốc vác thông thường.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#121c2a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#166534] text-[20px]">verified</span>
              2. Kiểm tra trước khi trả tiền (COD)
            </h2>
            <p className="text-[#4B5563]">
              Khách hàng hoàn toàn có quyền mở kiện hàng kiểm tra bao bì còn nguyên tem niêm phong chống ẩm, kiểm tra đúng loại gạo, quy cách và số bao trước khi thanh toán tiền mặt cho nhân viên giao hàng.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#121c2a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#166534] text-[20px]">published_with_changes</span>
              3. Chính sách đổi trả trong 7 ngày
            </h2>
            <p className="text-[#4B5563]">
              Trong vòng 7 ngày kể từ khi nhận hàng, nếu quý khách nấu cơm cảm thấy độ dẻo, ngọt hoặc mùi thơm không đúng như cam kết, DucBel sẽ tiến hành đổi sang loại gạo khác hoặc hoàn tiền 100% một cách nhanh chóng và vui vẻ.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#121c2a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#166534] text-[20px]">call</span>
              4. Hỗ trợ khách hàng
            </h2>
            <p className="text-[#4B5563]">
              Mọi thắc mắc hoặc yêu cầu hỗ trợ đơn hàng, quý khách vui lòng liên hệ hotline: <strong className="text-[#166534]">0912 345 678</strong> (Hỗ trợ từ 7:00 đến 21:00 hàng ngày).
            </p>
          </section>
        </div>

        <div className="pt-4 border-t border-[#D1D5DB]/40 flex justify-center">
          <Link
            to="/san-pham"
            className="px-6 py-2.5 rounded-xl bg-[#166534] text-white font-bold text-xs hover:bg-[#14532D] shadow-xs transition-colors"
          >
            Quay lại chọn mua gạo
          </Link>
        </div>
      </div>
    </div>
  );
};

