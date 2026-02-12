import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function GET(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const sector = searchParams.get('sector') || 'all';

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
        max_tokens: 4096,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [
          {
            role: 'user',
            content: `You are a stock screening assistant. Search the web for current stock market data and identify 10-15 of the most promising U.S. stocks right now${sector !== 'all' ? ` in the ${sector} sector` : ' across all sectors'}.

For each stock, research and evaluate using these criteria:

FUNDAMENTALS (30% weight):
- Revenue growth (YoY)
- Earnings surprise (last quarter beat/miss)
- P/E ratio vs sector average
- Debt-to-equity ratio

TECHNICALS (30% weight):
- RSI (relative strength index) - is it oversold (<30) or overbought (>70)?
- Price vs 50-day and 200-day moving averages
- Recent MACD signal (bullish/bearish crossover)
- 1-month and 3-month price performance

SENTIMENT (25% weight):
- Recent analyst upgrades or downgrades
- News sentiment (positive/negative headlines)
- Insider buying/selling activity
- Institutional ownership changes

SECTOR MOMENTUM (15% weight):
- Is the sector outperforming the S&P 500?
- Recent sector catalysts (regulation, earnings season, macro trends)

Give each stock a MOMENTUM SCORE from 0-100 based on the weighted criteria above.

Respond ONLY with a JSON array (no markdown, no backticks, no preamble). Each object:
{
  "ticker": "string",
  "company": "string",
  "sector": "string",
  "price": "string (current price)",
  "momentum_score": number (0-100),
  "signal": "Strong Buy" | "Buy" | "Watch",
  "fundamentals_score": number (0-100),
  "technicals_score": number (0-100),
  "sentiment_score": number (0-100),
  "sector_score": number (0-100),
  "key_reasons": ["string", "string", "string"],
  "risks": ["string"],
  "price_target": "string or null",
  "timeframe": "string (e.g. '1-3 months')",
  "revenue_growth": "string or null",
  "pe_ratio": "string or null",
  "rsi": "string or null",
  "analyst_consensus": "string or null"
}

Only include stocks scoring 60+. Sort by momentum_score descending.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return NextResponse.json({ error: 'Failed to fetch from API' }, { status: response.status });
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
        return NextResponse.json({ stocks: parsed, fetchedAt: new Date().toISOString() });
      }
    }

    return NextResponse.json({ error: 'No valid data found' }, { status: 500 });
  } catch (err) {
    console.error('Stock picks API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
