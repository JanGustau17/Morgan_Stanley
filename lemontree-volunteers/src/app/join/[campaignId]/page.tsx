import { redirect } from 'next/navigation';

interface JoinPageProps {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function JoinPage({ params, searchParams }: JoinPageProps) {
  const { campaignId } = await params;
  const { ref } = await searchParams;

  const target = ref
    ? `/events/${campaignId}?ref=${encodeURIComponent(ref)}`
    : `/events/${campaignId}`;

  redirect(target);
}
