import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5173/";

const slugify = (str: string) => str?.trim().replace(/\s+/g, "-");

const getNovels = async () => {
  try {
    const res = await fetch(
      `${baseUrl}/api/novels`,
      {
        next: { revalidate: 3600 },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch novels:", error);
    return [];
  }
};

const getChapters = async (novelId: string) => {
  try {
    const res = await fetch(
      `${baseUrl}/api/chapters/novel/${encodeURIComponent(
        novelId
      )}`,
      {
        next: { revalidate: 3600 },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
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

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  try {
    const staticPaths = [
      "browse",
      "genres",
      "contact",
      "terms",
      "privacy",
      "search",
      "signin",
      "signup",
      "profile",
    ];

    const urls: Array<{
      loc: string;
      lastmod?: string;
      changefreq?: string;
      priority?: string;
    }> = [
      {
        loc: `${baseUrl}`,
        lastmod: new Date().toISOString(),
        changefreq: "daily",
        priority: "1.0",
      },
      ...staticPaths.map((path) => ({
        loc: `${baseUrl}/${path}`,
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
        priority: "0.8",
      })),
    ];

    const novels = await getNovels();

    const maxNovels = 1000;
    const limitedNovels = novels.slice(0, maxNovels);

    for (const novel of limitedNovels) {
      if (!novel?.title) continue;

      const slug = slugify(novel.title);

      urls.push({
        loc: `${baseUrl}/novel/${slug}`,
        lastmod:
          novel.updated_at || novel.created_at || new Date().toISOString(),
        changefreq: "weekly",
        priority: "0.9",
      });

      try {
        const chapters = await getChapters(novel.id?.toString() || novel.title);
        const maxChapters = 100;
        const limitedChapters = chapters.slice(0, maxChapters);

        for (const chapter of limitedChapters) {
          if (!chapter?.chapter_number) continue;

          urls.push({
            loc: `${baseUrl}/novel/${slug}/chapter/${chapter.chapter_number}`,
            lastmod:
              chapter.updated_at ||
              chapter.created_at ||
              new Date().toISOString(),
            changefreq: "monthly",
            priority: "0.7",
          });
        }
      } catch (chapterError) {
        console.error(
          `Failed to fetch chapters for novel ${novel.title}:`,
          chapterError
        );
      }
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ""}
    ${url.priority ? `<priority>${url.priority}</priority>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);

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
        "Content-Type": "application/xml",
      },
    });
  }
}
