/**
 * Admin storage page: list and manage Supabase Storage files.
 * Access controlled by admin layout. API uses service role for list/delete.
 */
import { StorageList } from "@/components/admin/StorageList";

export default function AdminStoragePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Storage</h1>
        <p className="text-sm text-gray-500">
          List and delete files in flyer-photos, avatars, campaign-images
        </p>
      </div>
      <StorageList />
    </div>
  );
}
