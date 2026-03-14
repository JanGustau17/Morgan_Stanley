import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Avatar } from '@/components/ui/Avatar';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: { name?: string | null; image?: string | null } | undefined;
  try {
    const session = await auth();
    user = session?.user ?? undefined;
  } catch {
    user = undefined;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-1.5">
              <span className="text-2xl" role="img" aria-label="Lemon">
                🍋
              </span>
              <span className="text-xl font-bold text-green-600">
                Lemontree
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                Leaderboard
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/events/new"
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Create Event
            </Link>

            {user ? (
              <Link href="/profile">
                <Avatar
                  src={user.image}
                  name={user.name}
                  size="sm"
                />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <span className="font-semibold text-green-600">Lemontree</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Connecting food-insecure families to free food resources through
            community volunteering.
          </p>
        </div>
      </footer>
    </div>
  );
}
