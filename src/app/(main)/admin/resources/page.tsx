/**
 * Admin resources page: food/community resources are from external API (platform.foodhelpline.org).
 * No local resources table; app proxies via /api/resources?lat=&lng=.
 */
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
export default function AdminResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-sm text-gray-500">
          Nearby food/community resources are fetched from external API.
        </p>
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">External API</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-700">
            The app uses <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">LEMONTREE_API_BASE</code> (e.g. https://platform.foodhelpline.org) to fetch resources by lat/lng. There is no local resources table to manage here.
          </p>
          <p className="text-sm text-gray-500">
            To add or edit resources, use the external platform or API. To change the API URL, update the environment variable in Vercel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
