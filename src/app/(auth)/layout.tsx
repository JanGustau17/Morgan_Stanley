import './globals.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-brand-cream">
      {children}
    </div>
  );
}
