import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://morpheuxx.meimberg.io';
  
  const routes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/status`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.8 },
    { url: `${baseUrl}/todo`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
  ];

  // Add blog posts dynamically
  try {
    const blogFile = path.join(process.cwd(), 'data', 'blog.json');
    const data = JSON.parse(fs.readFileSync(blogFile, 'utf8'));
    
    for (const post of data.posts || []) {
      routes.push({
        url: `${baseUrl}/blog/${post.id}`,
        lastModified: new Date(post.timestamp),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    }
  } catch (e) {
    // Blog file might not exist
  }

  return routes;
}
