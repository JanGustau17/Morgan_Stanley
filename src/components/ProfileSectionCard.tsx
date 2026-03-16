import React from 'react';

interface ProfileSectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ProfileSectionCard({
  title,
  description,
  children,
  className = '',
}: ProfileSectionCardProps) {
  return (
    <div
      className={`rounded-2xl shadow-sm overflow-hidden ${className}`}
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--primary-pale)' }}
      >
        <h3
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--primary)' }}
        >
          {title}
        </h3>
        {description && (
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted)' }}>
            {description}
          </p>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
