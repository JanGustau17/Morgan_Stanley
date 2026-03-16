"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserNav } from "@/components/auth/UserNav";
import { ChatBot } from "@/components/chat/ChatBot";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";

function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Use role from the NextAuth session (populated from volunteers.role in lib/auth.ts)
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setCommunityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const linkCls =
    "text-sm font-semibold text-[#101726] px-3 py-2 rounded-lg hover:bg-black/8 transition-colors";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#ffcc10] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center justify-between gap-3">

        {/* LEFT: hamburger (mobile) + nav links (desktop) */}
        <div className="flex items-center gap-1">
          <button
            className="md:hidden p-2 -ml-1 rounded-lg text-[#101726]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-0.5">
            <Link href="/" className={linkCls}>Home</Link>

            {/* Community dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setCommunityOpen((v) => !v)}
                className={`${linkCls} flex items-center gap-1`}
              >
                Community
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${communityOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 16 16"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {communityOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl border border-[#e8e0cc] shadow-xl py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#101726]/40">
                    Community
                  </div>
                  {[
                    { href: "/#events", icon: "📅", label: "Events" },
                    { href: "/resources", icon: "🍎", label: "Food Resources" },
                    { href: "/forum", icon: "💬", label: "Forum" },
                    { href: "/leaderboard", icon: "🏆", label: "Leaderboard" },
                    { href: "/profile", icon: "👤", label: "My Profile" },
                    { href: "/events/new", icon: "➕", label: "Create Event" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setCommunityOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#101726] hover:bg-[#fff6E0] hover:text-[#5C3D8F] transition-colors"
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-[#e8e0cc] mt-1 pt-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#101726]/40">
                      Organization
                    </div>
                    {[
                      { href: "/donate", icon: "💛", label: "Donate" },
                      { href: "/pantry/new", icon: "🏪", label: "List a Pantry" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setCommunityOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#101726] hover:bg-[#fff6E0] hover:text-[#5C3D8F] transition-colors"
                      >
                        <span className="text-base leading-none">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/events/new" className={linkCls}>Create Event</Link>

            <Link href="/resources" className={linkCls}>Resources</Link>

            <Link href="/forum" className={linkCls}>Forum</Link>

            {/* Admin — only rendered when role === "admin" in session */}
            {isAdmin && (
              <Link href="/admin" className={linkCls}>Admin</Link>
            )}
          </div>
        </div>

        {/* CENTER: orange lemon icon + wordmark (matches landing page design) */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#E8522A" }}
          >
            <svg viewBox="0 0 100 100" width="22" height="22" fill="none">
              <ellipse cx="50" cy="54" rx="28" ry="24" fill="#ffcc10" />
              <ellipse cx="76" cy="50" rx="7" ry="5" fill="#ffcc10" transform="rotate(-20 76 50)" />
              <ellipse cx="24" cy="58" rx="7" ry="5" fill="#ffcc10" transform="rotate(20 24 58)" />
              <ellipse cx="50" cy="28" rx="10" ry="7" fill="#008A81" transform="rotate(-15 50 28)" />
              <circle cx="46" cy="56" r="2" fill="#E8522A" opacity="0.5" />
              <circle cx="53" cy="60" r="2" fill="#E8522A" opacity="0.5" />
            </svg>
          </div>
          <img
            src="https://www.foodhelpline.org/_next/static/media/wordmark.483cff36.svg"
            alt="lemontree"
            className="h-6 w-auto"
            style={{ filter: "brightness(0)" }}
          />
        </Link>

        {/* RIGHT: notifications + auth */}
        <div className="flex items-center gap-2">
          {session?.user && <NotificationCenter />}
          {session?.user ? (
            <UserNav name={session.user.name} image={session.user.image} />
          ) : (
            <>
              <Link
                href="/auth"
                className="hidden sm:block text-sm font-semibold text-[#101726] px-4 py-1.5 rounded-md border-2 border-[#101726] hover:bg-black/5 transition-colors"
              >
                LOG IN
              </Link>
              <Link
                href="/auth"
                className="text-sm font-bold text-white px-4 py-1.5 rounded-md transition-colors hover:opacity-90"
                style={{ background: "#5C3D8F" }}
              >
                GET STARTED
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#ffcc10] border-t border-black/10 px-4 py-3 flex flex-col gap-0.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#101726]/40 px-3 pt-1 pb-0.5">Community</div>
          {[
            { href: "/", label: "🏠 Home" },
            { href: "/#events", label: "📅 Events" },
            { href: "/resources", label: "🍎 Food Resources" },
            { href: "/forum", label: "💬 Forum" },
            { href: "/leaderboard", label: "🏆 Leaderboard" },
            { href: "/profile", label: "👤 My Profile" },
            { href: "/events/new", label: "➕ Create Event" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-semibold text-[#101726] py-2.5 px-3 rounded-lg hover:bg-black/8 transition-colors min-h-[44px] flex items-center"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-black/10 mt-1 pt-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#101726]/40 px-3 pb-0.5">Organization</div>
            {[
              { href: "/donate", label: "💛 Donate" },
              { href: "/pantry/new", label: "🏪 List a Pantry" },
              ...(isAdmin ? [{ href: "/admin", label: "⚙️ Admin" }] : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-[#101726] py-2.5 px-3 rounded-lg hover:bg-black/8 transition-colors min-h-[44px] flex items-center"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-black/10">
            {session?.user ? (
              <UserNav name={session.user.name} image={session.user.image} />
            ) : (
              <>
                <Link
                  href="/auth"
                  className="flex-1 text-center text-sm font-bold text-[#101726] py-2 rounded-md border-2 border-[#101726] min-h-[44px] flex items-center justify-center"
                >
                  LOG IN
                </Link>
                <Link
                  href="/auth"
                  className="flex-1 text-center text-sm font-bold text-white py-2 rounded-md min-h-[44px] flex items-center justify-center"
                  style={{ background: "#5C3D8F" }}
                >
                  GET STARTED
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {/* pt-[60px] offsets the fixed navbar; pb-14 on mobile gives space for the bottom nav */}
      <main className="pt-[60px] pb-14 md:pb-0">{children}</main>
      <MobileBottomNav />
      <ChatBot />
    </>
  );
}
