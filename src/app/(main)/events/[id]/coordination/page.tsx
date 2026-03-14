import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ArrowLeft } from "lucide-react";
import type { Volunteer } from "@/lib/types";

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
    .select("*")
    .eq("id", campaignId)
    .single();

  if (!campaign) notFound();

  const { data: volunteerRows } = await supabase
    .from("campaign_volunteers")
    .select("volunteer:volunteers(*)")
    .eq("campaign_id", campaignId);

  const volunteers: Volunteer[] =
    volunteerRows
      ?.map((row) => (row as Record<string, unknown>).volunteer as Volunteer)
      .filter(Boolean) ?? [];

  const tasks = [
    "Print flyers",
    "Distribute in target area",
    "Take photos of posted flyers",
    "Report back to organizer",
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/events/${campaignId}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Campaign Coordination
          </h1>
          <p className="text-sm text-gray-500">{campaign.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChatWindow
            campaignId={campaignId}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Volunteers ({volunteers.length})
            </h3>
            {volunteers.length === 0 ? (
              <p className="text-sm text-gray-400">No volunteers yet.</p>
            ) : (
              <ul className="space-y-2">
                {volunteers.map((v) => (
                  <li key={v.id} className="flex items-center gap-2.5">
                    <Avatar src={v.avatar_url} name={v.name} size="sm" />
                    <span className="truncate text-sm text-gray-700">
                      {v.name ?? "Anonymous"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Task Checklist
            </h3>
            <ul className="space-y-2.5">
              {tasks.map((task) => (
                <li key={task} className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-green-600 accent-green-600"
                  />
                  <span className="text-sm text-gray-700">{task}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
