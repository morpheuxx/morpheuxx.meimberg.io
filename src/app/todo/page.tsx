
'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = [
  { value: 'idea', label: 'Idee', emoji: '💡', color: '#9333ea' },
  { value: 'todo', label: 'Todo', emoji: '📋', color: '#3b82f6' },
  { value: 'in_progress', label: 'In Arbeit', emoji: '🔧', color: '#f59e0b' },
  { value: 'done', label: 'Erledigt', emoji: '✅', color: '#22c55e' },
  { value: 'discarded', label: 'Verworfen', emoji: '🗑️', color: '#6b7280' }
];

const CREATORS = [
  { value: 'morpheuxx', label: 'Morpheuxx', emoji: '🔴' },
  { value: 'oli', label: 'Oli', emoji: '👤' }
];

export default function Todo() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('open');
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: '', status: 'idea', description: '', creator: 'oli' });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    if (user) {
      fetchTodos();
    }
  }, [user, loading, router]);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      const list = (data.todos || []).slice();
      // sort by seq asc (fallback to createdAt)
      list.sort((a: any, b: any) => {
        const as = typeof a.seq === 'number' ? a.seq : Number.MAX_SAFE_INTEGER;
        const bs = typeof b.seq === 'number' ? b.seq : Number.MAX_SAFE_INTEGER;
        if (as !== bs) return as - bs;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      setTodos(list);
    } catch (e) {
      console.error('Failed to fetch todos:', e);
    }
  };

  const createTodo = async () => {
    if (!newTodo.title.trim()) return;
    
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      });
      if (res.ok) {
        setNewTodo({ title: '', status: 'idea', description: '', creator: 'oli' });
        setShowNew(false);
        fetchTodos();
      }
    } catch (e) {
      console.error('Failed to create todo:', e);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchTodos();
        if (selectedTodo?.id === id) {
          setSelectedTodo({ ...selectedTodo, ...updates });
        }
      }
    } catch (e) {
      console.error('Failed to update todo:', e);
    }
  };

  const deleteTodo = async (id) => {
    if (!confirm('Wirklich löschen?')) return;
    
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedTodo(null);
        fetchTodos();
      }
    } catch (e) {
      console.error('Failed to delete todo:', e);
    }
  };
  
  const getStatusInfo = (status) => STATUSES.find(s => s.value === status) || STATUSES[0];
  const getCreatorInfo = (creator) => CREATORS.find(c => c.value === creator) || CREATORS[0];

  const filteredTodos = filter === 'open'
    ? todos.filter(t => t.status !== 'done' && t.status !== 'discarded')
    : todos.filter(t => t.status === filter);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <main className="todo-page main-content-wide">
      <header className="page-header">
        <h1>📋 Todo</h1>
        <p>Gemeinsame Ideen und Aufgaben</p>
      </header>

      {/* Filter & New Button */}
      <div className="todo-toolbar">
        <div className="todo-filters">
          <button 
            className={filter === 'open' ? 'active' : ''} 
            onClick={() => setFilter('open')}
          >
            Offen ({todos.filter(t => t.status !== 'done' && t.status !== 'discarded').length})
          </button>
          {/* Optional status filters */}
          {STATUSES.map(s => {
            const count = todos.filter(t => t.status === s.value).length;
            return (
              <button 
                key={s.value}
                className={filter === s.value ? 'active' : ''} 
                onClick={() => setFilter(s.value)}
              >
                {s.emoji} {s.label} ({count})
              </button>
            );
          })}
        </div>
        <button className="btn-new" onClick={() => setShowNew(true)}>
          + Neu
        </button>
      </div>

      {/* New Todo Form */}
      {showNew && (
        <div className="todo-form">
          <h3>Neues Todo</h3>
          <input
            type="text"
            placeholder="Titel"
            value={newTodo.title}
            onChange={e => setNewTodo({ ...newTodo, title: e.target.value })}
          />
          <div className="form-row">
            <select 
              value={newTodo.status} 
              onChange={e => setNewTodo({ ...newTodo, status: e.target.value })}
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
              ))}
            </select>
            <select value={newTodo.creator} disabled>
              {CREATORS.map(c => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Beschreibung (Markdown)"
            value={newTodo.description}
            onChange={e => setNewTodo({ ...newTodo, description: e.target.value })}
            rows={4}
          />
          <div className="form-actions">
            <button onClick={createTodo}>Erstellen</button>
            <button className="btn-cancel" onClick={() => setShowNew(false)}>Abbrechen</button>
          </div>
        </div>
      )}

      {/* Todo List */}
      <div className="todo-layout">
        <div className="todo-list">
          {filteredTodos.map(todo => {
            const statusInfo = getStatusInfo(todo.status);
            const creatorInfo = getCreatorInfo(todo.creator);
            
            return (
              <div 
                key={todo.id} 
                className={`todo-card ${selectedTodo?.id === todo.id ? 'selected' : ''}`}
                onClick={() => { setSelectedTodo(todo); setIsEditing(false); }}
              >
                <div className="todo-status" style={{ backgroundColor: statusInfo.color }}>
                  {statusInfo.emoji}
                </div>
                <div className="todo-info">
                  <h4>{todo.seq ? `#${todo.seq} — ${todo.title}` : todo.title}</h4>
                  <div className="todo-meta">
                    <span>{creatorInfo.emoji} {creatorInfo.label}</span>
                    <span>•</span>
                    <span>{formatDate(todo.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredTodos.length === 0 && (
            <p className="empty-state">Keine Todos in dieser Kategorie.</p>
          )}
        </div>

        {/* Todo Detail */}
        {selectedTodo && (
          <div className="todo-detail">
            {isEditing ? (
              <div className="todo-edit">
                <input
                  type="text"
                  value={selectedTodo.title}
                  onChange={e => setSelectedTodo({ ...selectedTodo, title: e.target.value })}
                />
                <select 
                  value={selectedTodo.status}
                  onChange={e => setSelectedTodo({ ...selectedTodo, status: e.target.value })}
                >
                  {STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
                  ))}
                </select>
                <textarea
                  value={selectedTodo.description}
                  onChange={e => setSelectedTodo({ ...selectedTodo, description: e.target.value })}
                  rows={10}
                  placeholder="Beschreibung (Markdown)"
                />
                <div className="form-actions">
                  <button onClick={() => {
                    updateTodo(selectedTodo.id, {
                      title: selectedTodo.title,
                      status: selectedTodo.status,
                      description: selectedTodo.description
                    });
                    setIsEditing(false);
                  }}>Speichern</button>
                  <button className="btn-cancel" onClick={() => setIsEditing(false)}>Abbrechen</button>
                </div>
              </div>
            ) : (
              <>
                <div className="detail-header">
                  <div className="detail-status-row">
                    <Select
                      value={selectedTodo.status}
                      onValueChange={(nextStatus) => {
                        setSelectedTodo({ ...selectedTodo, status: nextStatus });
                        updateTodo(selectedTodo.id, { status: nextStatus });
                      }}
                    >
                      <SelectTrigger className="w-fit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.emoji} {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <h2>{selectedTodo.title}</h2>
                  <div className="detail-meta">
                    <span>{getCreatorInfo(selectedTodo.creator).emoji} {getCreatorInfo(selectedTodo.creator).label}</span>
                    <span>•</span>
                    <span>Erstellt: {formatDate(selectedTodo.createdAt)}</span>
                    {selectedTodo.updatedAt !== selectedTodo.createdAt && (
                      <>
                        <span>•</span>
                        <span>Aktualisiert: {formatDate(selectedTodo.updatedAt)}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="detail-content">
                  {selectedTodo.description ? (
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedTodo.description}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="no-description">Keine Beschreibung</p>
                  )}
                </div>
                
                <div className="detail-actions">
                  <button onClick={() => setIsEditing(true)}>Bearbeiten</button>
                  <button className="btn-danger" onClick={() => deleteTodo(selectedTodo.id)}>Löschen</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
