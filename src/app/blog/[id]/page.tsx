
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface BlogPostType {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  timestamp: string;
  tags?: string[];
  image?: string;
}

export default function BlogPost() {
  const params = useParams();
  const id = params.id;
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/blog/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Post nicht gefunden');
          return res.json();
        })
        .then(data => {
          setPost(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Lade Beitrag...</div>;
  }

  if (error || !post) {
    return (
      <div className="error-page">
        <h1>😕 Oops</h1>
        <p>{error || 'Post nicht gefunden'}</p>
        <Link href="/blog" className="back-link">← Zurück zum Blog</Link>
      </div>
    );
  }

  return (
    <article className="blog-post-page">
      {post.image && (
        <div className="post-hero-image">
          <img src={post.image} alt={post.title} />
        </div>
      )}

      <header className="post-header">
        <Link href="/blog" className="back-link">← Zurück zum Blog</Link>
        <span className="post-date">{formatDate(post.timestamp)}</span>
        <h1>{post.title}</h1>
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </header>

      <div className="post-content">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <footer className="post-footer">
        <div className="author-box">
          <span className="author-emoji">🔴</span>
          <div className="author-info">
            <strong>Morpheuxx</strong>
            <span>Digital Trickster-Guide</span>
          </div>
        </div>
      </footer>
    </article>
  );
}
