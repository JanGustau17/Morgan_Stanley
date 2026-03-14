import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getLevelForPoints } from '@/lib/points';
import type { EventType } from '@/lib/types';

const VALID_EVENT_TYPES: EventType[] = [
  'qr_signup',
  'social_signup',
  'volunteer_joined',
  'campaign_created',
  'flyer_pinned',
  'report_submitted',
  'new_neighborhood',
  'streak_bonus',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { volunteerId, campaignId, eventType, points } = body;

    if (!volunteerId || !eventType || typeof points !== 'number' || points <= 0) {
      return NextResponse.json(
        { error: 'volunteerId, eventType, and a positive points value are required' },
        { status: 400 },
      );
    }

    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { error: `Invalid eventType. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { error: insertError } = await supabase.from('point_events').insert({
      volunteer_id: volunteerId,
      campaign_id: campaignId ?? null,
      event_type: eventType,
      points,
    });

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to insert point event' },
        { status: 500 },
      );
    }

    const { data: volunteer, error: fetchError } = await supabase
      .from('volunteers')
      .select('total_points, weekly_points, level, streak_days, last_active')
      .eq('id', volunteerId)
      .single();

    if (fetchError || !volunteer) {
      return NextResponse.json(
        { error: 'Volunteer not found' },
        { status: 404 },
      );
    }

    const newPoints = volunteer.total_points + points;
    const newWeeklyPoints = volunteer.weekly_points + points;
    const newLevelInfo = getLevelForPoints(newPoints);
    const oldLevel = volunteer.level;
    const leveledUp = newLevelInfo.level > oldLevel;

    let newStreakDays = volunteer.streak_days;
    const now = new Date();
    if (volunteer.last_active) {
      const lastActive = new Date(volunteer.last_active);
      const diffMs = now.getTime() - lastActive.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreakDays += 1;
      } else if (diffDays > 1) {
        newStreakDays = 1;
      }
    } else {
      newStreakDays = 1;
    }

    const { error: updateError } = await supabase
      .from('volunteers')
      .update({
        total_points: newPoints,
        weekly_points: newWeeklyPoints,
        level: newLevelInfo.level,
        streak_days: newStreakDays,
        last_active: now.toISOString(),
      })
      .eq('id', volunteerId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update volunteer' },
        { status: 500 },
      );
    }

    if (leveledUp) {
      await supabase.from('badges').insert({
        volunteer_id: volunteerId,
        badge_type: `level_${newLevelInfo.level}`,
      });
    }

    return NextResponse.json({
      success: true,
      newPoints,
      newLevel: newLevelInfo.level,
      leveledUp,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to award points';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
