/**
 * Admin events page: manage campaigns (events).
 * Access controlled by admin layout (role from volunteers table via NextAuth).
 */
import { EventTable } from "@/components/admin/EventTable";

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Event management</h1>
        <p className="text-sm text-gray-500">
          View, filter, approve/publish, and delete events (campaigns)
        </p>
      </div>
      <EventTable />
    </div>
  );
}
