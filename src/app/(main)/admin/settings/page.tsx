/**
 * Admin settings: auth providers, OTP config, storage usage, config summary.
 * Read-only summary; actual config lives in Vercel env and Supabase dashboard.
 */
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Settings } from "lucide-react";

const CONFIG_ITEMS = [
  { label: "Auth providers", value: "Google OAuth, Phone OTP (Twilio Verify)" },
  { label: "OTP", value: "Supabase Auth + Twilio Verify; SMS code verification" },
  { label: "Storage", value: "Supabase Storage: flyer-photos, avatars, campaign-images" },
  { label: "Config", value: "NEXTAUTH_URL, NEXTAUTH_SECRET, Supabase keys, GOOGLE_* in Vercel" },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Platform configuration summary. Edit in Vercel env and Supabase dashboard.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            {CONFIG_ITEMS.map((item) => (
              <div key={item.label} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="w-40 shrink-0 font-medium text-gray-700">{item.label}</dt>
                <dd className="text-gray-600">{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-gray-400">
            For auth provider toggles and OTP settings, use Supabase Dashboard → Authentication and Vercel → Environment Variables.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
