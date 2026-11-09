import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-[#D1D5DB]/50">
          <div className="w-full aspect-square bg-[#dee9fc] rounded-lg mb-4"></div>
          <div className="h-4 bg-[#dee9fc] rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-[#dee9fc] rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-[#dee9fc] rounded"></div>
        </div>
      ))}
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: string;
}> = ({
  title,
  description,
  actionText,
  actionHref,
  onAction,
  icon = 'inventory_2',
}) => {
  return (
    <div className="bg-white rounded-2xl p-8 md:p-12 text-center max-w-md mx-auto shadow-sm border border-[#D1D5DB]/40 my-8">
      <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-[#121c2a] mb-2">{title}</h3>
      <p className="text-sm text-[#4B5563] mb-6 leading-relaxed">{description}</p>
      {actionText && (actionHref || onAction) && (
        actionHref ? (
          <a
            href={actionHref}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#166534] text-white font-semibold text-sm hover:bg-[#14532D] shadow-sm transition-all"
          >
            {actionText}
          </a>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#166534] text-white font-semibold text-sm hover:bg-[#14532D] shadow-sm transition-all cursor-pointer"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
};

export const ErrorState: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = 'Không thể tải dữ liệu từ máy chủ', onRetry }) => {
  return (
    <div className="bg-[#ffdad6]/40 border border-[#ba1a1a]/20 rounded-xl p-6 text-center max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-3">
        <span className="material-symbols-outlined text-[24px]">error_outline</span>
      </div>
      <h4 className="text-base font-bold text-[#ba1a1a] mb-1">Đã xảy ra lỗi</h4>
      <p className="text-sm text-[#4B5563] mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#166534] text-white text-sm font-semibold hover:bg-[#14532D] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Thử lại
        </button>
      )}
    </div>
  );
};

