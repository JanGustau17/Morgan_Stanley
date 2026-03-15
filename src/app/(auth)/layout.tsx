import './globals.css';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-brand-cream">
      <header className="shrink-0 bg-[#ffcc10] shadow-sm">
        <div className="mx-auto flex h-14 max-w-[420px] items-center px-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#101726] hover:opacity-90 transition-opacity"
            aria-label="lemontree home"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#E8522A' }}
            >
              <svg viewBox="0 0 100 100" width={22} height={22} fill="none" aria-hidden>
                <ellipse cx="50" cy="54" rx="28" ry="24" fill="#ffcc10" />
                <ellipse cx="76" cy="50" rx="7" ry="5" fill="#ffcc10" transform="rotate(-20 76 50)" />
                <ellipse cx="24" cy="58" rx="7" ry="5" fill="#ffcc10" transform="rotate(20 24 58)" />
                <ellipse cx="50" cy="28" rx="10" ry="7" fill="#008A81" transform="rotate(-15 50 28)" />
                <circle cx="46" cy="56" r="2" fill="#E8522A" opacity={0.5} />
                <circle cx="53" cy="60" r="2" fill="#E8522A" opacity={0.5} />
              </svg>
            </div>
            <img
              src="https://www.foodhelpline.org/_next/static/media/wordmark.483cff36.svg"
              alt="lemontree"
              className="h-6 w-auto"
              style={{ filter: 'brightness(0)' }}
            />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
