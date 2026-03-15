import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { Avatar } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { XPBar } from '@/components/gamification/XPBar';
import { PointsHistory } from '@/components/gamification/PointsHistory';
import {
  Megaphone, MapPin, UserCheck, Users,
  Flame, Star, Trophy, Sparkles,
} from 'lucide-react';
import type { PointEvent, Badge as BadgeType, Volunteer } from '@/lib/types';

// Level titles for personalization
const LEVEL_TITLES: Record<number, string> = {
  1: 'Seedling',
  2: 'Sprout',
  3: 'Helper',
  4: 'Advocate',
  5: 'Champion',
  6: 'Guardian',
  7: 'Legend',
};

// Badge icon + color mapping using brand colors
const BADGE_META: Record<string, { emoji: string; color: string; bg: string }> = {
  first_flyer:    { emoji: '📌', color: 'var(--primary-dark)', bg: 'var(--primary-pale)' },
  streak_week:    { emoji: '🔥', color: '#c2410c',             bg: '#fff7ed' },
  top_recruiter:  { emoji: '🌟', color: 'var(--secondary-dark)', bg: '#fffbeb' },
  community_hero: { emoji: '💜', color: 'var(--third)',        bg: '#f5f3ff' },
};

function WeeklyStreak({ streakDays }: { streakDays: number }) {
  const weeks = Math.max(Math.floor(streakDays / 7), 1);
  const dots = Math.min(weeks, 8);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1">
        <Flame className="h-5 w-5 text-orange-500" />
        <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{weeks}</span>
        <span className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          wk{weeks !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: dots }).map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full"
            style={{ background: 'var(--secondary)' }}
          />
        ))}
      </div>
      <span className="text-[10px] tracking-wide uppercase font-medium" style={{ color: 'var(--muted)' }}>
        streak
      </span>
    </div>
  );
}

function getGreeting(name: string | null) {
  const hour = new Date().getHours();
  const first = name?.split(' ')[0] ?? 'Volunteer';
  if (hour < 12) return `Good morning, ${first} 🌤️`;
  if (hour < 17) return `Good afternoon, ${first} ☀️`;
  return `Good evening, ${first} 🌙`;
}

function getImpactLine(flyerCount: number, conversionCount: number) {
  if (flyerCount === 0) return "Start distributing flyers to see your impact grow!";
  if (conversionCount === 0) return `You've distributed ${flyerCount} flyers — keep going!`;
  return `Your ${flyerCount} flyers have helped ${conversionCount} families find food. That's real impact.`;
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect('/auth');

  const volunteerId = (session.user as Record<string, unknown>).volunteerId as string;
  if (!volunteerId) redirect('/auth');

  const supabase = createServiceClient();

  const [volunteerRes, eventsRes, badgesRes, campaignsRes, flyersRes, conversionsRes, recruitsRes] =
    await Promise.all([
      supabase.from('volunteers').select('*').eq('id', volunteerId).single(),
      supabase.from('point_events').select('*').eq('volunteer_id', volunteerId).order('created_at', { ascending: false }).limit(20),
      supabase.from('badges').select('*').eq('volunteer_id', volunteerId).order('earned_at', { ascending: false }),
      supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('organizer_id', volunteerId),
      supabase.from('flyer_pins').select('id', { count: 'exact', head: true }).eq('volunteer_id', volunteerId),
      supabase.from('conversions').select('id', { count: 'exact', head: true }).eq('volunteer_id', volunteerId),
      supabase.from('campaign_volunteers').select('campaign_id', { count: 'exact', head: true }).eq('volunteer_id', volunteerId),
    ]);

  const volunteer = volunteerRes.data as Volunteer | null;
  if (!volunteer) redirect('/auth');

  const events = (eventsRes.data ?? []) as PointEvent[];
  const badges = (badgesRes.data ?? []) as BadgeType[];
  const campaignCount = campaignsRes.count ?? 0;
  const flyerCount = flyersRes.count ?? 0;
  const conversionCount = conversionsRes.count ?? 0;
  const recruitCount = recruitsRes.count ?? 0;

  const levelTitle = LEVEL_TITLES[volunteer.level] ?? `Level ${volunteer.level}`;
  const greeting = getGreeting(volunteer.name);
  const impactLine = getImpactLine(flyerCount, conversionCount);

  const stats = [
    { label: 'Campaigns Run',        value: campaignCount,   icon: Megaphone, color: 'var(--primary)',       pale: 'var(--primary-pale)' },
    { label: 'Flyers Distributed',   value: flyerCount,      icon: MapPin,    color: 'var(--third)',          pale: '#f5f3ff' },
    { label: 'Sign-ups Generated',   value: conversionCount, icon: UserCheck, color: 'var(--secondary-dark)', pale: '#fffbeb' },
    { label: 'Volunteers Recruited', value: recruitCount,    icon: Users,     color: '#c2410c',               pale: '#fff7ed' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">

      {/*  Greeting Banner  */}
      <div
        className="rounded-2xl px-6 py-4"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #00736b 55%, var(--third) 100%)',
        }}
      >
        <p className="text-white font-semibold">{greeting}</p>
        <p className="text-white/70 text-sm mt-0.5 leading-relaxed">{impactLine}</p>
      </div>

      {/* Profile Card */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Gradient top strip*/}
        <div
          className="h-24 w-full relative"
          style={{
            background: 'linear-gradient(120deg, var(--primary-dark) 0%, var(--primary) 45%, var(--third) 100%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <Avatar
                src={volunteer.avatar_url}
                name={volunteer.name}
                size="lg"
                className="!h-20 !w-20 !text-2xl ring-4 ring-white shadow-md"
              />
              {/* Level number */}
              <div
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shadow"
                style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}
              >
                {volunteer.level}
              </div>
            </div>

            {/* Level title */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: '#f5f3ff', color: 'var(--third)' }}
            >
              <Star className="h-3.5 w-3.5" />
              {levelTitle}
            </div>
          </div>

          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            {volunteer.name ?? 'Volunteer'}
          </h1>
          {volunteer.email && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{volunteer.email}</p>
          )}
          {volunteer.phone && (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{volunteer.phone}</p>
          )}
        </div>
      </div>

      {/*  XP + Streak  */}
      <div
        className="rounded-2xl p-5 shadow-sm space-y-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" style={{ color: 'var(--third)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
              Progress
            </span>
          </div>
          <WeeklyStreak streakDays={volunteer.streak_days} />
        </div>

        <LevelBadge level={volunteer.level} size="md" />
        <XPBar currentPoints={volunteer.total_points} level={volunteer.level} />

        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: 'var(--primary-pale)' }}
        >
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Total points</span>
          <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>
            {volunteer.total_points.toLocaleString()}
          </span>
        </div>
      </div>

      {/*  Stats Grid  */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4" style={{ color: 'var(--third)' }} />
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Your Impact
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl p-5 flex flex-col gap-2 shadow-sm"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center"
                  style={{ background: stat.pale }}
                >
                  <Icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
                <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {stat.value}
                </span>
                <span className="text-xs leading-tight" style={{ color: 'var(--muted)' }}>
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4" style={{ color: 'var(--secondary-dark)' }} />
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Badges Earned
            </h2>
          </div>
          <div
            className="rounded-2xl p-5 shadow-sm"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => {
                const meta = BADGE_META[badge.badge_type] ?? {
                  emoji: '🏅',
                  color: 'var(--third)',
                  bg: '#f5f3ff',
                };
                return (
                  <span
                    key={badge.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium capitalize"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    <span>{meta.emoji}</span>
                    {badge.badge_type.replace(/_/g, ' ')}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Points History */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="h-4 w-4 text-orange-500" />
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Points History
          </h2>
        </div>
        <div
          className="rounded-2xl p-5 shadow-sm"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <PointsHistory events={events} />
        </div>
      </div>

    </div>
  );
}
