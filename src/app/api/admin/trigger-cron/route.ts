import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 });
    }

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    
    const response = await fetch(`${protocol}://${host}/api/cron/distribute-profits`, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: 'Invalid JSON response from cron route', text };
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to trigger cron', details: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Manual cron trigger failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
