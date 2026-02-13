
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '@/lib/auth';

const TODOS_FILE = path.join(process.cwd(), 'data', 'todos.json');
const TODOS_META_FILE = path.join(process.cwd(), 'data', 'todos.meta.json');

const canModify = async (request?: NextRequest) => {
  const session = await auth();
  if (session?.user?.isAdmin) return true;

  // Agent access (server-to-server): allow if token matches
  if (request) {
    const token = request.headers.get('x-agent-token');
    if (token && process.env.AGENT_TODO_TOKEN && token === process.env.AGENT_TODO_TOKEN) {
      return true;
    }
  }

  return false;
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

function readMeta() {
  try {
    return JSON.parse(fs.readFileSync(TODOS_META_FILE, 'utf8'));
  } catch (_) {
    return { nextSeq: 1 };
  }
}

function writeMeta(meta: any) {
  fs.writeFileSync(TODOS_META_FILE, JSON.stringify(meta, null, 2));
}

export async function POST(request: NextRequest) {
  const isAuthorized = await canModify(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const session = await auth();
    const { title, status, description, creator } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const data = JSON.parse(fs.readFileSync(TODOS_FILE, 'utf8'));

    const meta = readMeta();
    const seq = Number(meta.nextSeq || 1);
    meta.nextSeq = seq + 1;

    const todo = {
      id: Date.now().toString(),
      seq,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title,
      status: status || 'idea',
      description: description || '',
      creator: (session?.user?.name || session?.user?.email) ? 'oli' : (creator || 'unknown')
    };

    writeMeta(meta);

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
