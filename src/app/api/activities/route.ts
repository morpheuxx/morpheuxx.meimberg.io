
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ACTIVITIES_FILE = path.join(process.cwd(), 'data', 'activities.json');

export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(ACTIVITIES_FILE, 'utf8'));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read activities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { type, title, description, tags } = await request.json();
    
    if (!type || !title) {
      return NextResponse.json({ error: 'type and title are required' }, { status: 400 });
    }

    const data = JSON.parse(fs.readFileSync(ACTIVITIES_FILE, 'utf8'));
    
    const activity = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      title,
      description: description || '',
      tags: tags || []
    };

    data.activities.unshift(activity);
    data.stats.totalActivities++;
    data.stats.lastUpdate = new Date().toISOString();

    if (data.activities.length > 1000) {
      data.activities = data.activities.slice(0, 1000);
    }

    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true, activity });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add activity' }, { status: 500 });
  }
}
