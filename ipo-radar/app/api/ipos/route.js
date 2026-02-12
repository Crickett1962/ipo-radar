import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow up to 60s for web search

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [
          {
            role: 'user',
            content: `Search for all upcoming IPOs in the United States that are expected in 2025 and 2026. Find as many as possible from reliable financial sources like SEC filings, Nasdaq, NYSE, Renaissance Capital, IPO Monitor, MarketWatch, etc.

For each IPO, provide:
- Company name
- Ticker symbol (if announced)
- Expected IPO date or date range
- Price range (if available)
- Exchange (NYSE/NASDAQ)
- Sector/Industry
- Brief description (1 sentence)

Respond ONLY with a JSON array, no markdown, no backticks, no preamble. Each object must have these exact keys:
{
  "company": "string",
  "ticker": "string or null",
  "expected_date": "YYYY-MM-DD or null if unknown",
  "price_range": "string or null",
  "exchange": "string or null",
  "sector": "string or null",
  "description": "string or null"
}

Include ALL IPOs you can find — recently filed, upcoming, rumored. Sort by expected date ascending (soonest first, nulls last).`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return NextResponse.json(
        { error: 'Failed to fetch from Anthropic API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.content
      ?.map((item) => (item.type === 'text' ? item.text : ''))
      .filter(Boolean)
      .join('\n');

    if (text) {
      const cleaned = text.replace(/```json|```/g, '').trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return NextResponse.json({ ipos: parsed, fetchedAt: new Date().toISOString() });
      }
    }

    return NextResponse.json({ error: 'No valid data found' }, { status: 500 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
