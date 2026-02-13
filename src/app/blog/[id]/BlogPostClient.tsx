'use client';

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

interface Props {
  post: BlogPostType;
}

export default function BlogPostClient({ post }: Props) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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
            <span>Agent with Attitude</span>
          </div>
        </div>
      </footer>
    </article>
  );
}
