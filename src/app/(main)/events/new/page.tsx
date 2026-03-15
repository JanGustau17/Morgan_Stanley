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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Create a Flyering Campaign
      </h1>
      <p className="mb-8 text-gray-500">
        Set up a new flyering event to spread the word in your community.
      </p>
      <CampaignForm volunteerId={volunteerId} />
    </div>
  );
}
