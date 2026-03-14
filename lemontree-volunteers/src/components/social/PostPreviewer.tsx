'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, Instagram, Twitter, Linkedin, Facebook, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SocialPost {
  text: string;
  hashtags: string[];
}

interface SocialPosts {
  instagram: SocialPost;
  twitter: SocialPost;
  linkedin: SocialPost;
  facebook: SocialPost;
}

type Platform = keyof SocialPosts;

interface PostPreviewerProps {
  campaignId: string;
  neighborhood: string;
  date: string;
  targetGroup: string;
  language: string;
  lat?: number;
  lng?: number;
}

const TABS: { key: Platform; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'instagram', label: 'Instagram', icon: <Instagram className="h-4 w-4" />, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { key: 'twitter', label: 'Twitter', icon: <Twitter className="h-4 w-4" />, color: 'bg-black' },
  { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-4 w-4" />, color: 'bg-[#0A66C2]' },
  { key: 'facebook', label: 'Facebook', icon: <Facebook className="h-4 w-4" />, color: 'bg-[#1877F2]' },
];

export function PostPreviewer({
  neighborhood,
  date,
  targetGroup,
  language,
  lat,
  lng,
}: PostPreviewerProps) {
  const [posts, setPosts] = useState<SocialPosts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Platform>('instagram');
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      let resources: string[] = [];

      if (lat && lng) {
        try {
          const resResponse = await fetch(
            `/api/resources?lat=${lat}&lng=${lng}`
          );
          if (resResponse.ok) {
            const data = await resResponse.json();
            resources = Array.isArray(data)
              ? data.map(
                  (r: { name?: string; agency?: string }) =>
                    r.name || r.agency || ''
                ).filter(Boolean)
              : [];
          }
        } catch {
          // Resources are optional — proceed without them
        }
      }

      const response = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neighborhood,
          resources,
          date,
          targetGroup,
          language,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate posts');
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(platform: Platform) {
    if (!posts) return;
    const post = posts[platform];
    const fullText = `${post.text}\n\n${post.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}`;

    try {
      await navigator.clipboard.writeText(fullText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  }

  if (!posts) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <div className="rounded-full bg-green-100 p-3">
            <Sparkles className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              AI Social Posts
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate tailored posts for every platform in one click
            </p>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <Button onClick={handleGenerate} loading={loading}>
            {loading ? 'Generating...' : 'Generate Social Posts'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activePost = posts[activeTab];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Posts
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            loading={loading}
          >
            {loading ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
      </CardHeader>

      <div className="border-b border-gray-200">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {activePost.text}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {activePost.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => handleCopy(activeTab)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  copiedPlatform === activeTab
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copiedPlatform === activeTab ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Post
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
