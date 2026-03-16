import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import CoordinationClient from "./CoordinationClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CoordinationPage({ params }: PageProps) {
  const { id: campaignId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  const user = session.user as Record<string, unknown>;
  const currentUserId = user.volunteerId as string;
  const currentUserName = (user.name as string) ?? "Volunteer";
  const currentUserAvatar = (user.image as string) ?? null;

  const supabase = createServiceClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "name, neighborhood, location_name, campaign_date, volunteers_needed, status, lat, lng"
    )
    .eq("id", campaignId)
    .single();

  if (!campaign) notFound();

  const { data: volunteerRows } = await supabase
    .from("campaign_volunteers")
    .select("volunteer:volunteers(id, name, avatar_url)")
    .eq("campaign_id", campaignId);

  const volunteers = (volunteerRows ?? [])
    .map((row) => (row as Record<string, unknown>).volunteer as { id: string; name: string | null; avatar_url: string | null })
    .filter(Boolean);

  const { data: pinRows } = await supabase
    .from("flyer_pins")
    .select("lat, lng")
    .eq("campaign_id", campaignId);

  const initialPins: { lat: number; lng: number }[] = pinRows ?? [];

  return (
    <CoordinationClient
      campaignId={campaignId}
      campaign={campaign}
      volunteers={volunteers}
      initialPins={initialPins}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
      currentUserAvatar={currentUserAvatar}
    />
  );
}
