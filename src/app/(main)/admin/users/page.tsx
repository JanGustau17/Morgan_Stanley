/**
 * Admin users page: list and manage volunteers.
 * Access controlled by admin layout (role from volunteers table via NextAuth).
 */
import { UserTable } from "@/components/admin/UserTable";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User management</h1>
        <p className="text-sm text-gray-500">
          Search, filter, change roles, and delete users
        </p>
      </div>
      <UserTable />
    </div>
  );
}
