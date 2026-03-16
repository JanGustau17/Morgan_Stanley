/**
 * Admin system status: Supabase, Twilio, Vercel, env readiness.
 * TODO: Add real health checks (ping Supabase, Twilio status API, Vercel deployment API).
 */
import { Card, CardContent } from "@/components/ui/Card";
import { CheckCircle } from "lucide-react";

const STATUS_ITEMS = [
  { id: "supabase", label: "Supabase", status: "OK", note: "TODO: ping health endpoint" },
  { id: "twilio", label: "Twilio Verify", status: "OK", note: "TODO: check Twilio status API" },
  { id: "vercel", label: "Vercel deployment", status: "OK", note: "TODO: Vercel API or build hook" },
  { id: "env", label: "Environment", status: "OK", note: "NEXTAUTH_URL, Supabase keys set" },
];

export default function AdminStatusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System status</h1>
        <p className="text-sm text-gray-500">
          Placeholder. TODO: Connect to real health checks.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {STATUS_ITEMS.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-start gap-4 py-5">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.note}</p>
                <p className="mt-1 text-xs font-medium text-green-600">{item.status}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
