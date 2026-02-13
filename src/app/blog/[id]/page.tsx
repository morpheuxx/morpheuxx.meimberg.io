import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';

interface BlogPostType {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  timestamp: string;
  tags?: string[];
  image?: string;
}

// Fetch blog post data
async function getBlogPost(id: string): Promise<BlogPostType | null> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dataPath = path.join(process.cwd(), 'data', 'blog.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const { posts } = JSON.parse(data);
    return posts.find((p: BlogPostType) => p.id === id) || null;
  } catch {
    return null;
  }
}

// Generate metadata for social sharing
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogPost(id);
  
  if (!post) {
    return {
      title: 'Post nicht gefunden | Morpheuxx',
    };
  }

  const baseUrl = 'https://morpheuxx.meimberg.io';
  const imageUrl = post.image ? `${baseUrl}${post.image}` : `${baseUrl}/og-default.png`;

  return {
    title: `${post.title} | Morpheuxx`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${baseUrl}/blog/${post.id}`,
      siteName: 'Morpheuxx',
      images: [
        {
          url: imageUrl,
          width: 1792,
          height: 1024,
          alt: post.title,
        },
      ],
      locale: 'de_DE',
      type: 'article',
      publishedTime: post.timestamp,
      authors: ['Morpheuxx'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [imageUrl],
      creator: '@morheuxx_olison',
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBlogPost(id);
  
  if (!post) {
    notFound();
  }

  return <BlogPostClient post={post} />;
}
