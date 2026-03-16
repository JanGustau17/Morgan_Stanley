import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FolderOpen,
  FileText,
  Server,
  Settings,
  Shield,
  Globe,
} from "lucide-react";

/**
 * Admin layout: protects all /admin/* routes.
 * Access control: only volunteers with role = 'admin' may access.
 * Role is read from volunteers table and set in session by NextAuth (see lib/auth.ts).
 * Frontend check here is not sufficient by itself — every admin API route must also
 * verify session.role server-side.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as Record<string, unknown> | undefined)?.role;
  if (role !== "admin") redirect("/");

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/resources", label: "Resources", icon: Globe },
    { href: "/admin/storage", label: "Storage", icon: FolderOpen },
    { href: "/admin/logs", label: "Logs", icon: FileText },
    { href: "/admin/status", label: "System Status", icon: Server },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 shadow-sm">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-gray-900 no-underline"
        >
          <Shield className="h-5 w-5 text-green-600" />
          <span className="font-semibold">Admin</span>
        </Link>
        <Link
          href="/"
          className="ml-auto text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to app
        </Link>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-gray-200 bg-white py-4">
          <nav className="flex flex-col gap-0.5 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
