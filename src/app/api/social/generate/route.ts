import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { neighborhood, resources, date, targetGroup, language } =
      await req.json();

    if (!neighborhood || !date) {
      return NextResponse.json(
        { error: 'neighborhood and date are required' },
        { status: 400 }
      );
    }

    const resourceList =
      Array.isArray(resources) && resources.length > 0
        ? resources.join(', ')
        : 'local food pantries and community resources';

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Generate social media posts for a Lemontree flyering campaign.
Neighborhood: ${neighborhood}
Nearby food resources: ${resourceList}
Event date: ${date}
Target group: ${targetGroup || 'families in need'}
Language: ${language || 'English'}

Return ONLY valid JSON with keys: instagram, twitter, linkedin, facebook.
Each should have: text (string), hashtags (string[]).
Tone: warm, community-first, never preachy. Always include a CTA to foodhelpline.org`,
        },
      ],
    });

    const textBlock = msg.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'No text response from AI' },
        { status: 502 }
      );
    }

    const raw = textBlock.text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 502 }
      );
    }

    const posts = JSON.parse(jsonMatch[0]);
    return NextResponse.json(posts);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to generate social posts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
