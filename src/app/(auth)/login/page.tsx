import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main aria-label="Log in page">
      <div className="relative w-full max-w-[420px]">
        <div className="rounded-2xl border border-brand-border bg-brand-card p-8 shadow-sm">
          <h1 className="text-brand-green font-bold text-2xl mb-1">
            Welcome back
          </h1>
          <p className="text-brand-muted text-sm mb-6">
            Log in to manage your volunteer campaigns.
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

