/**
 * Admin resources page: food/community resources are from external API (platform.foodhelpline.org).
 * No local resources table; app proxies via /api/resources?lat=&lng=.
 */
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
export default function AdminResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-sm text-gray-500">
          Nearby food/community resources are fetched from the Lemontree external API.
        </p>
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Lemontree Resources API</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            The app uses <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">LEMONTREE_API_BASE</code> (defaults to https://platform.foodhelpline.org) to fetch resources. Responses are deserialized with <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">superjson</code>.
          </p>
          <p className="text-sm text-gray-700">
            <strong>Supported query params:</strong> lat, lng, location (zip), text, resourceTypeId (FOOD_PANTRY / SOUP_KITCHEN), tagId, occurrencesWithin, region, sort, take, cursor.
          </p>
          <p className="text-sm text-gray-700">
            <strong>API routes:</strong>
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/resources</code> — Full query support</li>
            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/resources/nearby</code> — Location-based (lat, lng)</li>
            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/resources/search</code> — Text search + filters</li>
          </ul>
          <p className="text-sm text-gray-500">
            To add or edit resources, use the external platform. To change the API URL, update the <code className="text-xs bg-gray-100 px-1 rounded">LEMONTREE_API_BASE</code> environment variable.
          </p>
          <Link
            href="/resources"
            className="inline-block text-sm font-semibold text-[#008A81] hover:underline"
          >
            → View public Resources page
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
