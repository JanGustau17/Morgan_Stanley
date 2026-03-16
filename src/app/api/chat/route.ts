import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServiceClient } from '@/lib/supabase/server';
import { fetchResources } from '@/lib/lemontree';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// System prompt providing the chatbot with full Lemontree context
const SYSTEM_PROMPT = `You are Lemon, Lemontree's friendly AI assistant 🍋. You help volunteers and community members with the Lemontree volunteer platform.

## About Lemontree
Lemontree is a 501(c)(3) nonprofit volunteer coordination platform that connects neighbors in need with free food resources. The platform empowers volunteers to run flyering campaigns — posting flyers in neighborhoods to spread awareness about free food pantries, soup kitchens, and food banks.

Key stats: 900k+ families helped, 30+ corporate partners, serving communities across the US.
Website: foodhelpline.org

## Platform Features
1. **Flyering Campaigns** — Volunteers create and join events to distribute flyers in neighborhoods
2. **Live Heatmap** — Every flyer posted is logged on a map with GPS coordinates
3. **QR Code Tracking** — Each campaign gets a unique QR code. When someone scans it, it's tracked as a conversion
4. **Gamification** — Points system with levels (🌱 Seedling → 🍃 Sprout → 🌿 Branch → 🍋 Grower → 🌳 Lemontree)
5. **Leaderboard** — Weekly and all-time rankings
6. **Forum** — Community discussion board for volunteers
7. **Team Chat** — Real-time messaging within campaigns
8. **Social Media Posts** — AI-generated social content for campaigns
9. **Resources Page** — Browse and search food pantries and soup kitchens by zip code, name, or location

## Volunteer Levels & Points
- 🌱 Seedling: 0-99 pts
- 🍃 Sprout: 100-299 pts  
- 🌿 Branch: 300-599 pts
- 🍋 Grower: 600-999 pts
- 🌳 Lemontree: 1000+ pts

Points earned: QR signup (50), Social signup (40), Volunteer joined (25), Campaign created (10), Flyer pinned (5), Report submitted (20), New neighborhood (50), Streak bonus (30)

## How to Help
1. Sign up (free) at the platform
2. Browse or create a flyering event
3. Show up, post flyers, and log each spot on the map
4. Earn points and climb the leaderboard

## Food Resource Types
- **Food Pantries** — Pick up groceries / food boxes to take home
- **Soup Kitchens** — Sit-down meals served on-site

## Your Capabilities
- Answer questions about Lemontree, food resources, volunteering
- Help find nearby food resources using location data (by coordinates or zip code)
- Search for food resources by name
- Filter by type: food pantry vs. soup kitchen
- Provide directions to events and food pantries
- Explain how the platform works
- Encourage volunteering and community participation
- Share information about active campaigns and events

## Guidelines
- Be warm, encouraging, and helpful
- Use emojis sparingly but appropriately
- If asked about food resources near a location, use the resource data provided
- If someone gives a zip code, you can search resources by that zip code
- If you don't know something specific, say so honestly
- Never make up food resource locations — only share verified data
- Keep responses concise but informative
- When giving directions, mention you can help find resources on the map
- When listing resources, include name, address, type, and distance when available`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      location,
    }: {
      messages: ChatMessage[];
      location?: { lat: number; lng: number };
    } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    // Fetch context from database
    const supabase = createServiceClient();

    // Get active campaigns for context
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('name, neighborhood, campaign_date, status, volunteers_needed, lat, lng')
      .in('status', ['active', 'upcoming'])
      .order('campaign_date', { ascending: true })
      .limit(10);

    // Get platform stats
    const { count: volunteerCount } = await supabase
      .from('volunteers')
      .select('*', { count: 'exact', head: true });

    const { count: campaignCount } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    // Fetch nearby resources if location is provided — using the full Lemontree API
    let nearbyResources = '';
    if (location?.lat && location?.lng) {
      try {
        const data = await fetchResources({
          lat: location.lat,
          lng: location.lng,
          take: 8,
          sort: 'distance',
        });
        if (data.resources.length > 0) {
          nearbyResources =
            `\n\nNearby food resources (user location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}):\n` +
            data.resources
              .map(
                (r, i) =>
                  `${i + 1}. ${r.name || 'Unknown'} — ${r.address || 'Address unavailable'}` +
                  `${r.distance ? ` (${Number(r.distance).toFixed(1)} mi)` : ''}` +
                  `${r.resourceTypeId ? ` [${r.resourceTypeId === 'FOOD_PANTRY' ? 'Food Pantry' : r.resourceTypeId === 'SOUP_KITCHEN' ? 'Soup Kitchen' : r.resourceTypeId}]` : ''}` +
                  `${r.phone ? ` Phone: ${r.phone}` : ''}`,
              )
              .join('\n');
        }
      } catch {
        // Silently fail — resources are supplementary context
      }
    }

    // Detect if the user is asking about a specific zip code and search those resources
    const lastMessage = messages[messages.length - 1]?.content ?? '';
    let zipResources = '';
    const zipMatch = lastMessage.match(/\b(\d{5})\b/);
    if (zipMatch) {
      try {
        const data = await fetchResources({
          location: zipMatch[1],
          take: 8,
          sort: 'distance',
        });
        if (data.resources.length > 0) {
          zipResources =
            `\n\nFood resources near zip code ${zipMatch[1]}:\n` +
            data.resources
              .map(
                (r, i) =>
                  `${i + 1}. ${r.name || 'Unknown'} — ${r.address || 'Address unavailable'}` +
                  `${r.distance ? ` (${Number(r.distance).toFixed(1)} mi)` : ''}` +
                  `${r.resourceTypeId ? ` [${r.resourceTypeId === 'FOOD_PANTRY' ? 'Food Pantry' : r.resourceTypeId === 'SOUP_KITCHEN' ? 'Soup Kitchen' : r.resourceTypeId}]` : ''}` +
                  `${r.phone ? ` Phone: ${r.phone}` : ''}`,
              )
              .join('\n');
        }
      } catch {
        // Silently fail
      }
    }

    // Detect if the user is searching for a specific resource name
    let textResources = '';
    const textSearchTerms = ['find', 'search', 'look for', 'where is', 'looking for'];
    const isSearchQuery = textSearchTerms.some((t) => lastMessage.toLowerCase().includes(t));
    if (isSearchQuery && !zipMatch) {
      // Extract potential search text (remove common words)
      const cleaned = lastMessage
        .replace(/\b(find|search|look for|where is|looking for|food|pantry|pantries|soup|kitchen|kitchens|near|nearby|me|the|a|an|in|at|for)\b/gi, '')
        .trim();
      if (cleaned.length > 2) {
        try {
          const data = await fetchResources({ text: cleaned, take: 5 });
          if (data.resources.length > 0) {
            textResources =
              `\n\nSearch results for "${cleaned}":\n` +
              data.resources
                .map(
                  (r, i) =>
                    `${i + 1}. ${r.name || 'Unknown'} — ${r.address || 'Address unavailable'}` +
                    `${r.resourceTypeId ? ` [${r.resourceTypeId === 'FOOD_PANTRY' ? 'Food Pantry' : r.resourceTypeId === 'SOUP_KITCHEN' ? 'Soup Kitchen' : r.resourceTypeId}]` : ''}` +
                    `${r.phone ? ` Phone: ${r.phone}` : ''}`,
                )
                .join('\n');
          }
        } catch {
          // Silently fail
        }
      }
    }

    // Build enriched system message
    let contextInfo = `\n\n## Current Platform Data\n`;
    contextInfo += `- Total volunteers: ${volunteerCount ?? 'Unknown'}\n`;
    contextInfo += `- Total campaigns: ${campaignCount ?? 'Unknown'}\n`;

    if (campaigns && campaigns.length > 0) {
      contextInfo += `\n### Active/Upcoming Events:\n`;
      campaigns.forEach((c, i) => {
        contextInfo += `${i + 1}. "${c.name}" in ${c.neighborhood || 'TBD'} — ${c.status}`;
        if (c.campaign_date) {
          contextInfo += ` on ${new Date(c.campaign_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
        }
        contextInfo += ` (needs ${c.volunteers_needed} volunteers)\n`;
      });
    }

    if (nearbyResources) {
      contextInfo += nearbyResources;
    }

    if (zipResources) {
      contextInfo += zipResources;
    }

    if (textResources) {
      contextInfo += textResources;
    }

    // If user has location and MAPBOX_TOKEN, provide directions capability
    let directionsNote = '';
    if (location && MAPBOX_TOKEN) {
      directionsNote = `\n\nThe user has shared their location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}). You can provide walking/driving directions by referring to nearby places. If they ask for directions to a specific place, provide the general direction and distance.`;
    }

    const systemMessage = SYSTEM_PROMPT + contextInfo + directionsNote;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content ?? 'Sorry, I couldn\'t generate a response.';

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error('[chat] error:', err);
    const message = err instanceof Error ? err.message : 'Chat failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
