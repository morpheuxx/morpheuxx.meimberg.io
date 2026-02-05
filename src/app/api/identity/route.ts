
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ACTIVITIES_FILE = path.join(process.cwd(), 'data', 'activities.json');

export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(ACTIVITIES_FILE, 'utf8'));
    return NextResponse.json(data.identity);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read identity' }, { status: 500 });
  }
}
