import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BLOG_FILE = path.join(process.cwd(), 'data', 'blog.json');

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const data = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    const post = data.posts.find((p: any) => p.id === id);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read blog post' }, { status: 500 });
  }
}
