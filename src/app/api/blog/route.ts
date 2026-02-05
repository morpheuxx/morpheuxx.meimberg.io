
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BLOG_FILE = path.join(process.cwd(), 'data', 'blog.json');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  
  try {
    const data = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    
    let posts = data.posts.map((post: any) => ({
      ...post,
      content: undefined, // Don't send full content in list
    }));

    if (limit) {
      posts = posts.slice(0, parseInt(limit));
    }
    
    return NextResponse.json({ posts, stats: data.stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read blog posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, excerpt, tags, image } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 });
    }

    const data = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    
    const post = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      title,
      content,
      excerpt: excerpt || content.substring(0, 200).replace(/\n/g, ' ') + '...',
      tags: tags || [],
      image: image || null
    };

    data.posts.unshift(post);
    data.stats.totalPosts++;
    data.stats.lastPost = new Date().toISOString();

    fs.writeFileSync(BLOG_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Blog post error:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
