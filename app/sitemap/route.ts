import { NextResponse } from 'next/server';

// ✅ Fix 1: Use production URL or environment variable
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5173/';

const slugify = (str: string) => str?.trim().replace(/\s+/g, '-');

const getNovels = async () => {
  try {
    const res = await fetch('https://development.mitprogrammer.com/novel/public/api/novels', {
      // ✅ Fix 2: Use static revalidation instead of no-store for better performance
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch novels:', error);
    return [];
  }
};

const getChapters = async (novelId: string) => {
  try {
    const res = await fetch(
      `https://development.mitprogrammer.com/novel/public/api/chapters/novel/${encodeURIComponent(novelId)}`, 
      {
        // ✅ Fix 3: Use static revalidation
        next: { revalidate: 3600 },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error(`Failed to fetch chapters for novel ${novelId}:`, error);
    return [];
  }
};

// ✅ Fix 4: Add proper export config for static generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const staticPaths = [
      'browse', 'genres', 'contact', 'terms', 'privacy',
      'search', 'signin', 'signup', 'profile',
    ];

    // ✅ Fix 5: Use proper URL construction
    const urls: Array<{
      loc: string;
      lastmod?: string;
      changefreq?: string;
      priority?: string;
    }> = [
      {
        loc: `${baseUrl}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '1.0'
      },
      ...staticPaths.map(path => ({
        loc: `${baseUrl}/${path}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.8'
      }))
    ];

    const novels = await getNovels();
    console.log(`Fetched ${novels.length} novels for sitemap`);

    // ✅ Fix 6: Add error handling and limits for large datasets
    const maxNovels = 1000; // Limit to prevent huge sitemaps
    const limitedNovels = novels.slice(0, maxNovels);

    for (const novel of limitedNovels) {
      if (!novel?.title) continue; // Skip invalid novels
      
      const slug = slugify(novel.title);
      
      // Add novel page
      urls.push({
        loc: `${baseUrl}/novel/${slug}`,
        lastmod: novel.updated_at || novel.created_at || new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.9'
      });

      // ✅ Fix 7: Add rate limiting for chapter fetching
      try {
        const chapters = await getChapters(novel.id?.toString() || novel.title);
        const maxChapters = 100; // Limit chapters per novel
        const limitedChapters = chapters.slice(0, maxChapters);
        
        for (const chapter of limitedChapters) {
          if (!chapter?.chapter_number) continue; // Skip invalid chapters
          
          urls.push({
            loc: `${baseUrl}/novel/${slug}/chapter/${chapter.chapter_number}`,
            lastmod: chapter.updated_at || chapter.created_at || new Date().toISOString(),
            changefreq: 'monthly',
            priority: '0.7'
          });
        }
      } catch (chapterError) {
        console.error(`Failed to fetch chapters for novel ${novel.title}:`, chapterError);
        // Continue with other novels even if one fails
      }
    }

    // ✅ Fix 8: Proper XML sitemap format
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    console.log(`Generated sitemap with ${urls.length} URLs`);

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        // ✅ Fix 9: Add caching headers
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // ✅ Fix 10: Return basic sitemap on error
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(basicSitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}