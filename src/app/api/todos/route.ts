
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '@/lib/auth';

const TODOS_FILE = path.join(process.cwd(), 'data', 'todos.json');

const canModify = async () => {
  const session = await auth();
  return session?.user?.isAdmin;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const data = JSON.parse(fs.readFileSync(TODOS_FILE, 'utf8'));
    let todos = data.todos;
    
    if (status) {
      todos = todos.filter((t: any) => t.status === status);
    }
    
    return NextResponse.json({ todos, stats: data.stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read todos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isAuthorized = await canModify();
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { title, status, description, creator } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const data = JSON.parse(fs.readFileSync(TODOS_FILE, 'utf8'));
    
    const todo = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title,
      status: status || 'idea',
      description: description || '',
      creator: creator || 'unknown'
    };

    data.todos.unshift(todo);
    data.stats.total++;
    data.stats.lastUpdate = new Date().toISOString();

    fs.writeFileSync(TODOS_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true, todo });
  } catch (error) {
    console.error('Todo create error:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}
