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
                Community
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${communityOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 16 16"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {communityOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-white rounded-xl border border-[#e8e0cc] shadow-xl py-1.5 z-50">
                  {[
                    { href: "/events", icon: "📅", label: "Events" },
                    { href: "/leaderboard", icon: "🏆", label: "Leaderboard" },
                    { href: "/profile", icon: "👤", label: "My Profile" },
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
              )}
            </div>

            <Link href="/events/create" className={linkCls}>Create Event</Link>
            <Link href="/admin" className={linkCls}>Admin</Link>
          </div>
        </div>

        {/* CENTER: orange lemon circle icon + wordmark */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 shrink-0">
          {/* Orange lemon circle — SVG inline matching their logo icon */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#E8522A" }}
          >
            <svg viewBox="0 0 100 100" width="22" height="22" fill="none">
              {/* lemon body */}
              <ellipse cx="50" cy="54" rx="28" ry="24" fill="#ffcc10" />
              {/* lemon tip right */}
              <ellipse cx="76" cy="50" rx="7" ry="5" fill="#ffcc10" transform="rotate(-20 76 50)" />
              {/* lemon tip left */}
              <ellipse cx="24" cy="58" rx="7" ry="5" fill="#ffcc10" transform="rotate(20 24 58)" />
              {/* leaf */}
              <ellipse cx="50" cy="28" rx="10" ry="7" fill="#008A81" transform="rotate(-15 50 28)" />
              {/* dots */}
              <circle cx="46" cy="56" r="2" fill="#E8522A" opacity="0.5" />
              <circle cx="53" cy="60" r="2" fill="#E8522A" opacity="0.5" />
            </svg>
          </div>
          {/* Wordmark — black on yellow */}
          <img
            src="https://www.foodhelpline.org/_next/static/media/wordmark.483cff36.svg"
            alt="lemontree"
            className="h-6 w-auto"
            style={{ filter: "brightness(0)" }}
          />
        </Link>

        {/* RIGHT: Log In + Sign Up */}
        <div className="flex items-center gap-2">
          <Link
            href="/(auth)/login"
            className="hidden sm:block text-sm font-semibold text-[#101726] px-4 py-1.5 rounded-md border-2 border-[#101726] hover:bg-black/5 transition-colors"
          >
            LOG IN
          </Link>
          <Link
            href="/(auth)/signup"
            className="text-sm font-bold text-white px-4 py-1.5 rounded-md transition-colors hover:opacity-90"
            style={{ background: "#5C3D8F" }}
          >
            GET STARTED
          </Link>
        </div>
      </div>

      {/* Mobile menu — slides down from yellow bar */}
      {mobileOpen && (
        <div className="md:hidden bg-[#ffcc10] border-t border-black/10 px-4 py-3 flex flex-col gap-0.5">
          {[
            { href: "/", label: "Home" },
            { href: "/events", label: "Events" },
            { href: "/events/create", label: "Create Event" },
            { href: "/leaderboard", label: "Leaderboard" },
            { href: "/profile", label: "My Profile" },
            { href: "/admin", label: "Admin" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-semibold text-[#101726] py-2.5 px-3 rounded-lg hover:bg-black/8 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 mt-3 pt-3 border-t border-black/10">
            <Link
              href="/events/new"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{ background: 'var(--primary)' }}
            >
              LOG IN
            </Link>
            <Link
              href="/(auth)/signup"
              className="flex-1 text-center text-sm font-bold text-white py-2 rounded-md"
              style={{ background: "#5C3D8F" }}
            >
              GET STARTED
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="pt-16 min-h-screen bg-[#fff6E0] flex items-center relative overflow-hidden">
      {/* Subtle radial accents */}
      <div
        className="absolute top-20 right-[-100px] w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,204,16,0.22) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute bottom-[-60px] left-[-80px] w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,138,129,0.15) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center w-full">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-[#ffcc10] text-[#101726] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <span>🍋</span> Volunteer Platform
          </div>

          <h1
            className="text-5xl md:text-6xl font-bold text-[#101726] leading-tight mb-5"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Help your{" "}
            <span className="text-[#008A81]">neighbors</span>
            <br />
            find free food.
          </h1>

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
                📍
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#101726] text-sm truncate">
                  Brooklyn Flyer Blitz
                </div>
                <div className="text-xs text-[#101726]/45">Bushwick · 1.2 mi away</div>
              </div>
              <span
                className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{ background: "#ffcc1022", color: "#7a5f00" }}
              >
                Active
              </span>
            </div>
            <div className="h-1.5 bg-[#e8e0cc] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: "40%", background: "#008A81" }}
              />
            </div>
            <div className="text-xs text-[#101726]/45 mt-1.5">8 volunteers joined</div>
          </div>

          <div
            className="rounded-2xl p-5 ml-8 text-white"
            style={{ background: "#008A81" }}
          >
            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">
              Live Flyer Heatmap
            </div>
            <div
              className="h-20 rounded-xl flex items-center justify-center text-3xl opacity-50"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              🗺️
            </div>
            <div className="text-sm font-medium mt-2 opacity-90">
              347 spots logged this week
            </div>
          </div>

          <div
            className="rounded-2xl p-5 mr-8"
            style={{ background: "#ffcc10" }}
          >
            <div className="text-xs font-bold uppercase tracking-widest text-[#101726]/55 mb-2">
              Top Volunteer This Week
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: "rgba(0,0,0,0.1)" }}
              >
                🏆
              </div>
              <div>
                <div className="font-bold text-[#101726] text-sm">Sarah M.</div>
                <div className="text-xs text-[#101726]/55">
                  1,240 pts · 8-week streak
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Mission ──────────────────────────────────────────────────────────────────
function MissionSection() {
  const pillars = [
    {
      icon: "📣",
      title: "Spread Awareness",
      desc: "Post flyers and canvass neighborhoods to reach families who don't know help is available.",
    },
    {
      icon: "🗺️",
      title: "Map the Impact",
      desc: "Every flyer you post gets logged on our live heatmap so we can track community reach in real time.",
    },
    {
      icon: "🤝",
      title: "Coordinate Together",
      desc: "Work with local volunteers and event leaders via built-in group chats and location divisions.",
    },
    {
      icon: "🏆",
      title: "Earn Recognition",
      desc: "Climb the leaderboard, build weekly streaks, and earn points for every action.",
    },
  ];

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl p-6 border border-[#e8e0cc] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: "#fff6E0" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: "#008A8112" }}
              >
                {p.icon}
              </div>
              <h3 className="font-bold text-[#101726] text-sm mb-2">{p.title}</h3>
              <p className="text-xs text-[#101726]/60 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Events ───────────────────────────────────────────────────────────────────
type FilterType = "all" | "nearby" | "active";

function EventCard({ event }: { event: Event }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e0cc] p-5 flex flex-col gap-3.5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Tags + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{ background: "#008A8112", color: "#008A81" }}
            >
              {tag}
            </span>
          ))}
        </div>
        <span
          className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={
            event.active
              ? { background: "#ffcc1022", color: "#7a5f00" }
              : { background: "#f0f0ee", color: "#888" }
          }
        >
          {event.active ? "Active" : "Upcoming"}
        </span>
      </div>

      {/* Content */}
      <div>
        <h3 className="font-bold text-[#101726] text-sm leading-snug mb-1.5">
          {event.title}
        </h3>
        <p className="text-xs text-[#101726]/55 leading-relaxed line-clamp-2">
          {event.description}
        </p>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1 text-xs text-[#101726]/50">
        <div className="flex items-center gap-1.5">
          <span>📅</span>
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>📍</span>
          <span>{event.location}</span>
          {event.distance !== undefined && (
            <span className="text-[#008A81] font-semibold">
              · {event.distance} mi
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span>👥</span>
          <span>{event.volunteers} volunteers joined</span>
        </div>
      </div>

      <Link
        href={`/events/${event.id}`}
        className="mt-auto block text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
        style={{ background: "#5C3D8F" }}
      >
        View Event →
      </Link>
    </div>
  );
}

function EventsSection() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_EVENTS.filter((e) => {
    const match =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    if (!match) return false;
    if (filter === "active") return e.active;
    if (filter === "nearby") return (e.distance ?? 99) <= 5;
    return true;
  });

  return (
    <section id="events" className="py-24" style={{ background: "#fff6E0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div>
            <div className="inline-block bg-[#ffcc10] text-[#101726] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              Volunteer Events
            </div>
            <h2
              className="text-4xl font-bold text-[#101726]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Find an event near you
            </h2>
          </div>
          <Link
            href="/events/create"
            className="shrink-0 inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
            style={{ background: "#ffcc10", color: "#101726" }}
          >
            + Create Event
          </Link>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Search by name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm bg-white text-[#101726] placeholder-[#101726]/30 focus:outline-none focus:ring-2 focus:ring-[#008A81]/25"
          />
          <div className="flex gap-2">
            {(
              [
                { val: "all", label: "All" },
                { val: "nearby", label: "📍 Nearby" },
                { val: "active", label: "⚡ Active" },
              ] as { val: FilterType; label: string }[]
            ).map((f) => (
              <button
                key={f.val}
                onClick={() => setFilter(f.val)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={
                  filter === f.val
                    ? { background: "#5C3D8F", color: "white" }
                    : {
                        background: "white",
                        color: "#101726",
                        border: "1px solid #e8e0cc",
                      }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[#101726]/40">
            <div className="text-5xl mb-3">🍋</div>
            <p className="font-medium">No events found.</p>
            <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: "01", icon: "📝", title: "Sign Up", desc: "Register in minutes. Free and confidential." },
    { num: "02", icon: "🗓️", title: "Find or Create an Event", desc: "Browse nearby volunteer events or start your own outreach campaign." },
    { num: "03", icon: "📌", title: "Show Up & Post Flyers", desc: "Attend, post flyers, and log each spot on our live heatmap." },
    { num: "04", icon: "🏅", title: "Earn Points & Rise Up", desc: "Every action earns points. Build streaks. Climb the leaderboard." },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block bg-[#ffcc10] text-[#101726] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            How It Works
          </div>
          <h2
            className="text-4xl font-bold text-[#101726]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Four steps to make a difference
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-[#e8e0cc] z-0" />
          {steps.map((s, i) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-4 border-4 border-white shadow-sm"
                style={{ background: i % 2 === 0 ? "#008A81" : "#ffcc10" }}
              >
                {s.icon}
              </div>
              <div className="text-xs font-bold text-[#008A81] tracking-widest mb-1">
                {s.num}
              </div>
              <h3 className="font-bold text-[#101726] text-sm mb-1.5">{s.title}</h3>
              <p className="text-xs text-[#101726]/55 leading-relaxed max-w-[150px]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Donate / 501c3 ───────────────────────────────────────────────────────────
function DonateSection() {
  const cards = [
    {
      icon: "💛",
      title: "Donate",
      desc: "$1 can unlock $8 in free groceries.",
      href: "/donate",
      primary: true,
    },
    {
      icon: "🙌",
      title: "Volunteer",
      desc: "Join an event and help spread the word.",
      href: "/#events",
      primary: false,
    },
    {
      icon: "📢",
      title: "Spread the Word",
      desc: "You never know who needs the help.",
      href: "/share",
      primary: false,
    },
    {
      icon: "📋",
      title: "List Your Pantry",
      desc: "Run a food pantry? Add your organization.",
      href: "/claim",
      primary: false,
    },
  ];

  return (
    <section className="py-24" style={{ background: "#fff6E0" }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-block bg-[#ffcc10] text-[#101726] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Support the Mission
          </div>
          <h2
            className="text-4xl font-bold text-[#101726] mb-4"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            1 in 8 Americans need help with food.
          </h2>
          <p className="text-[#101726]/60 text-lg leading-relaxed max-w-2xl mx-auto">
            Lemontree is a{" "}
            <span className="font-bold text-[#008A81]">501(c)(3) nonprofit</span> — your
            donation is tax-deductible and goes directly toward connecting neighbors with
            free food resources.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col items-start gap-3 p-6 rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={
                card.primary
                  ? { background: "#5C3D8F", borderColor: "#5C3D8F" }
                  : { background: "white", borderColor: "#e8e0cc" }
              }
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  background: card.primary
                    ? "rgba(255,255,255,0.15)"
                    : "#008A8112",
                }}
              >
                {card.icon}
              </div>
              <div>
                <h3
                  className="font-bold text-sm mb-1"
                  style={{ color: card.primary ? "white" : "#101726" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{
                    color: card.primary
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(16,23,38,0.6)",
                  }}
                >
                  {card.desc}
                </p>
              </div>
              <span
                className="text-xs font-semibold mt-auto"
                style={{ color: card.primary ? "#ffcc10" : "#008A81" }}
              >
                Learn more →
              </span>
            </Link>
          ))}
        </div>

        {/* 501c3 legal notice */}
        <p className="mt-10 text-center text-xs text-[#101726]/40 leading-relaxed">
          Lemontree Foods, Inc. is a registered 501(c)(3) nonprofit organization
          (EIN&nbsp;82-4540319).
          <br />
          Donations are tax-deductible to the extent permitted by law.
        </p>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section
    className="py-20 relative overflow-hidden"
    style={{ background: "#008A81" }}
    >
      {/* Hatching texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h2
          className="text-4xl md:text-5xl font-bold text-white mb-5"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Ready to make a difference?
        </h2>
        <p className="text-white/70 text-lg leading-relaxed mb-10">
          Sign up in minutes. Find an event. Show up. Your community needs you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/(auth)/signup"
            className="px-8 py-4 rounded-full font-bold text-[#101726] text-base transition-colors hover:opacity-90"
            style={{ background: "#ffcc10" }}
          >
            Create Your Account
          </Link>
          <Link
            href="/(auth)/login"
            className="px-8 py-4 rounded-full font-semibold text-white text-base border-2 border-white/35 hover:border-white/70 hover:bg-white/10 transition-all"
          >
            I Already Have an Account
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#101726" }} className="py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
          <div className="md:col-span-2">
            <img
              src="https://www.foodhelpline.org/_next/static/media/wordmark.483cff36.svg"
              alt="Lemontree"
              className="h-6 w-auto mb-3 brightness-0 invert"
            />
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Making free food accessible to every neighbor.
              Lemontree Foods, Inc. is a registered 501(c)(3) nonprofit.
            </p>
            <p className="text-white/25 text-xs mt-2">EIN: 82-4540319</p>
          </div>

          <div>
            <div className="text-white/45 text-xs font-bold uppercase tracking-widest mb-4">
              Community
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { href: "/events", label: "Events" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/profile", label: "My Profile" },
                { href: "/events/create", label: "Create Event" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-white/55 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-white/45 text-xs font-bold uppercase tracking-widest mb-4">
              Organization
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { href: "/donate", label: "Donate" },
                { href: "/volunteer", label: "Volunteer" },
                { href: "/claim", label: "List a Pantry" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/privacy", label: "Privacy Policy" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-white/55 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} Lemontree Foods, Inc. All rights reserved.
          </p>
          <p className="text-white/25 text-xs">
            Built with ❤️ at Morgan Stanley Hackathon 2025
          </p>
          <a
            href="https://www.foodhelpline.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/25 hover:text-white/55 text-xs transition-colors"
          >
            foodhelpline.org ↗
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="antialiased" style={{ fontFamily: "'dia', system-ui, sans-serif" }}>
      <Navbar />
      <HeroSection />
      <MissionSection />
      <EventsSection />
      <HowItWorksSection />
      <DonateSection />
      <CTASection />
      <Footer />
    </main>
  );
}