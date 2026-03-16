/**
 * Admin logs page: placeholder for auth failures, OTP failures, API errors.
 * TODO: Connect to real log source (e.g. Vercel logs, Supabase logs, or external logging).
 */
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { FileText } from "lucide-react";

const MOCK_LOGS = [
  { id: "1", type: "auth", message: "Google sign-in success", time: "2025-03-15T14:00:00Z" },
  { id: "2", type: "otp", message: "SMS OTP sent", time: "2025-03-15T13:58:00Z" },
  { id: "3", type: "api", message: "GET /api/campaigns 200", time: "2025-03-15T13:55:00Z" },
];

export default function AdminLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Logs</h1>
        <p className="text-sm text-gray-500">
          Placeholder. TODO: Connect to Vercel/Supabase logs or logging service.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Recent activity (mock)</h2>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {MOCK_LOGS.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap items-center gap-3 rounded border border-gray-100 bg-gray-50/50 px-3 py-2"
              >
                <span className="font-mono text-gray-500">{log.type}</span>
                <span className="text-gray-900">{log.message}</span>
                <span className="ml-auto text-gray-400">{new Date(log.time).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-gray-400">
            Replace with real log stream (e.g. Vercel Log Drains, Supabase logs, or Axiom/Datadog).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
