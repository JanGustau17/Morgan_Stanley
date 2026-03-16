import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CampaignForm } from '@/components/campaign/CampaignForm';

export const metadata = {
  title: 'Create a Flyering Campaign | Lemontree',
};

export default async function NewEventPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth');
  }

  const volunteerId = (session.user as Record<string, unknown>).volunteerId as string | undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold" style={{ color: '#101726', fontFamily: "Georgia, 'Times New Roman', serif" }}>
        Create a Flyering Campaign
      </h1>
      <p className="mb-6 text-sm" style={{ color: '#101726', opacity: 0.5 }}>
        Set up a new flyering event to spread the word in your community.
      </p>
      <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: '#e8e0cc' }}>
        <CampaignForm volunteerId={volunteerId} />
      </div>
    </div>
  );
}
