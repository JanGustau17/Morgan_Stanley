import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/lemontree_logo.svg" alt="Lemontree logo" width={32} height={32} />
              <Image src="/lemontree_word.svg" alt="Lemontree" width={100} height={22} />
            </Link>

            <div className="hidden sm:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--muted)' }}
              >
                Home
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--muted)' }}
              >
                Leaderboard
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/events/new"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{ background: 'var(--primary)' }}
            >
              Create Event
            </Link>

            {user ? (
              <Link href="/profile">
                <Avatar src={user.image} name={user.name} size="sm" />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--muted)' }}
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

      <footer
        className="border-t"
        style={{ background: 'var(--background-paper)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Image src="/lemontree_logo.svg" alt="Lemontree" width={20} height={20} />
            <Image src="/lemontree_word.svg" alt="Lemontree" width={80} height={18} />
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Connecting food-insecure families to free food resources through community volunteering.
          </p>
        </div>
      </footer>
    </div>
  );
}
