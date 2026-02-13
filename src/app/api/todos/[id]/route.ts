import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '@/lib/auth';

const TODOS_FILE = path.join(process.cwd(), 'data', 'todos.json');

type RouteParams = { params: Promise<{ id: string }> };

const canModify = async (request?: NextRequest) => {
  const session = await auth();
  if (session?.user?.isAdmin) return true;

  if (request) {
    const token = request.headers.get('x-agent-token');
    if (token && process.env.AGENT_TODO_TOKEN && token === process.env.AGENT_TODO_TOKEN) {
      return true;
    }
  }

  return false;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const data = JSON.parse(fs.readFileSync(TODOS_FILE, 'utf8'));
    const todo = data.todos.find((t: any) => t.id === id);
    
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    
    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read todo' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const isAuthorized = await canModify(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  try {
    const { title, status, description } = await request.json();
    const data = JSON.parse(fs.readFileSync(TODOS_FILE, 'utf8'));
    
    const todoIndex = data.todos.findIndex((t: any) => t.id === id);
    if (todoIndex === -1) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    if (title !== undefined) data.todos[todoIndex].title = title;
    if (status !== undefined) data.todos[todoIndex].status = status;
    if (description !== undefined) data.todos[todoIndex].description = description;
    data.todos[todoIndex].updatedAt = new Date().toISOString();
    data.stats.lastUpdate = new Date().toISOString();

    fs.writeFileSync(TODOS_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true, todo: data.todos[todoIndex] });
  } catch (error) {
    console.error('Todo update error:', error);
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const isAuthorized = await canModify(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  try {
    const data = JSON.parse(fs.readFileSync(TODOS_FILE, 'utf8'));
    const todoIndex = data.todos.findIndex((t: any) => t.id === id);
    
    if (todoIndex === -1) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    data.todos.splice(todoIndex, 1);
    data.stats.total--;
    data.stats.lastUpdate = new Date().toISOString();

    fs.writeFileSync(TODOS_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
