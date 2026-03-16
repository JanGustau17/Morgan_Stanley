"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  volunteers: number;
  active: boolean;
  tags: string[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function HeroSection() {
  return (
    <section className="pt-16 min-h-screen bg-[#fff6E0] flex items-center relative overflow-hidden">
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

          <p className="text-[#101726]/65 text-lg leading-relaxed mb-8 max-w-md">
            Join Lemontree&apos;s volunteer network. Post flyers, run outreach events,
            and connect 1 in 8 Americans with the food resources they deserve — right
            in your neighborhood.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth"
              className="text-center px-7 py-3.5 rounded-full text-white font-semibold text-base transition-colors hover:opacity-90"
              style={{ background: "#5C3D8F" }}
            >
              Get Started — It&apos;s Free
            </Link>
            <a
              href="#events"
              className="text-center px-7 py-3.5 rounded-full border-2 border-[#101726]/15 text-[#101726] font-medium text-base hover:border-[#008A81] hover:text-[#008A81] transition-colors"
            >
              Browse Events
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-8">
            {[
              { value: "900k+", label: "Families helped" },
              { value: "30+", label: "Corporate partners" },
              { value: "12,988", label: "Helped yesterday" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-[#008A81]">{s.value}</div>
                <div className="text-xs text-[#101726]/50 mt-0.5 leading-snug">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 shadow border border-[#e8e0cc]">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "#008A8114" }}
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

  return (
    <section id="mission" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-block bg-[#ffcc10] text-[#101726] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Our Mission
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-[#101726] mb-4"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Making ends meet is hard.
            <br />
            <span className="text-[#008A81]">Getting help shouldn&apos;t be.</span>
          </h2>
          <p className="text-[#101726]/60 text-lg leading-relaxed max-w-2xl mx-auto">
            Lemontree connects neighbors in need with free food resources and powers
            the volunteer network that gets the word out.
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

type FilterType = "all" | "active";

function EventCard({ event }: { event: Event }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e0cc] p-5 flex flex-col gap-3.5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
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

      <div>
        <h3 className="font-bold text-[#101726] text-sm leading-snug mb-1.5">
          {event.title}
        </h3>
      </div>

      <div className="flex flex-col gap-1 text-xs text-[#101726]/50">
        <div className="flex items-center gap-1.5">
          <span>📅</span>
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>📍</span>
          <span>{event.location}</span>
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
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data: Array<Record<string, unknown>>) => {
        setEvents(
          data.map((c) => ({
            id: c.id as string,
            title: c.name as string,
            date: (c.campaign_date as string) ?? "",
            location: (c.neighborhood as string) ?? (c.location_name as string) ?? "",
            volunteers: (c.volunteer_count as number) ?? 0,
            active: c.status === "active",
            tags: [(c.neighborhood as string) ?? "Outreach"],
          }))
        );
      })
      .catch(() => {});
  }, []);

  const filtered = events.filter((e) => {
    const match =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    if (!match) return false;
    if (filter === "active") return e.active;
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
            href="/events/new"
            className="shrink-0 inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
            style={{ background: "#ffcc10", color: "#101726" }}
          >
            + Create Event
          </Link>
        </div>

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

        {events.length === 0 ? (
          <div className="text-center py-20 text-[#101726]/40">
            <div className="text-5xl mb-3">🍋</div>
            <p className="font-medium">Loading events…</p>
          </div>
        ) : filtered.length > 0 ? (
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

function DonateSection() {
  const cards = [
    {
      icon: "💛",
      title: "Donate",
      desc: "$1 can unlock $8 in free groceries.",
      href: "https://www.foodhelpline.org/donate",
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
      title: "Forum",
      desc: "Chat with other volunteers and share ideas.",
      href: "/forum",
      primary: false,
    },
    {
      icon: "📋",
      title: "List Your Pantry",
      desc: "Run a food pantry? Add your organization.",
      href: "https://www.foodhelpline.org/claim",
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

function CTASection() {
  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: "#008A81" }}
    >
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
            href="/auth"
            className="px-8 py-4 rounded-full font-bold text-[#101726] text-base transition-colors hover:opacity-90"
            style={{ background: "#ffcc10" }}
          >
            Create Your Account
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-full font-semibold text-white text-base border-2 border-white/35 hover:border-white/70 hover:bg-white/10 transition-all"
          >
            I Already Have an Account
          </Link>
        </div>
      </div>
    </section>
  );
}

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
                { href: "/forum", label: "Forum" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/profile", label: "My Profile" },
                { href: "/events/new", label: "Create Event" },
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
                { href: "https://www.foodhelpline.org/donate", label: "Donate" },
                { href: "/#events", label: "Volunteer" },
                { href: "https://www.foodhelpline.org/claim", label: "List a Pantry" },
                { href: "/forum", label: "Forum" },
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
            Built with ❤️ at Morgan Stanley Hackathon 2026
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

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'dia', system-ui, sans-serif" }}>
      <HeroSection />
      <MissionSection />
      <EventsSection />
      <HowItWorksSection />
      <DonateSection />
      <CTASection />
      <Footer />
    </div>
  );
}
