import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { Badge } from '@/components/ui/Badge';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { XPBar } from '@/components/gamification/XPBar';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { PointsHistory } from '@/components/gamification/PointsHistory';
import { Megaphone, MapPin, UserCheck, Users } from 'lucide-react';
import type { PointEvent, Badge as BadgeType, Volunteer } from '@/lib/types';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth');
  }

  const volunteerId = (session.user as Record<string, unknown>).volunteerId as string;
  if (!volunteerId) {
    redirect('/auth');
  }

  const supabase = createServiceClient();

  const [volunteerRes, eventsRes, badgesRes, campaignsRes, flyersRes, conversionsRes, recruitsRes] =
    await Promise.all([
      supabase
        .from('volunteers')
        .select('*')
        .eq('id', volunteerId)
        .single(),
      supabase
        .from('point_events')
        .select('*')
        .eq('volunteer_id', volunteerId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('badges')
        .select('*')
        .eq('volunteer_id', volunteerId)
        .order('earned_at', { ascending: false }),
      supabase
        .from('campaigns')
        .select('id', { count: 'exact', head: true })
        .eq('organizer_id', volunteerId),
      supabase
        .from('flyer_pins')
        .select('id', { count: 'exact', head: true })
        .eq('volunteer_id', volunteerId),
      supabase
        .from('conversions')
        .select('id', { count: 'exact', head: true })
        .eq('volunteer_id', volunteerId),
      supabase
        .from('campaign_volunteers')
        .select('campaign_id', { count: 'exact', head: true })
        .eq('volunteer_id', volunteerId),
    ]);

  const volunteer = volunteerRes.data as Volunteer | null;
  if (!volunteer) {
    redirect('/auth');
  }

  const events = (eventsRes.data ?? []) as PointEvent[];
  const badges = (badgesRes.data ?? []) as BadgeType[];
  const campaignCount = campaignsRes.count ?? 0;
  const flyerCount = flyersRes.count ?? 0;
  const conversionCount = conversionsRes.count ?? 0;
  const recruitCount = recruitsRes.count ?? 0;

  const stats = [
    { label: 'Campaigns Run', value: campaignCount, icon: Megaphone },
    { label: 'Flyers Distributed', value: flyerCount, icon: MapPin },
    { label: 'Sign-ups Generated', value: conversionCount, icon: UserCheck },
    { label: 'Volunteers Recruited', value: recruitCount, icon: Users },
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-center gap-6 py-8">
          <AvatarUpload
            currentUrl={volunteer.avatar_url}
            name={volunteer.name}
            volunteerId={volunteer.id}
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">
              {volunteer.name ?? 'Volunteer'}
            </h1>
            {volunteer.email && (
              <p className="text-sm text-gray-500">{volunteer.email}</p>
            )}
            {volunteer.phone && (
              <p className="text-sm text-gray-500">{volunteer.phone}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Level + XP + Streak */}
      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex items-center justify-between">
            <LevelBadge level={volunteer.level} size="lg" />
            <StreakCounter streakDays={volunteer.streak_days} />
          </div>
          <XPBar currentPoints={volunteer.total_points} level={volunteer.level} />
          <p className="text-center text-sm text-gray-600">
            <span className="font-semibold text-green-600">{volunteer.total_points}</span> total points
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex flex-col items-center gap-2 py-6">
                <Icon className="h-6 w-6 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
                <span className="text-xs text-gray-500 text-center">
                  {stat.label}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Badges</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge key={badge.id} variant="level" size="md">
                  {badge.badge_type.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points History */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Points History
          </h2>
        </CardHeader>
        <CardContent>
          <PointsHistory events={events} />
        </CardContent>
      </Card>
    </div>
  );
}
