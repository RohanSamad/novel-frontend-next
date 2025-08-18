import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173/";

const slugify = (str: string) => str?.trim().replace(/\s+/g, "-");

const getNovels = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/novels`, {
      next: { revalidate: 3600 }, // novels can be cached hourly
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`Novels fetch failed: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("❌ Failed to fetch novels:", error);
    return [];
  }
};

const getChapters = async (novelId: string) => {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/chapters/novel/${encodeURIComponent(novelId)}?limit=1000000`, // keep it high if you want "all"
      {
        cache: "no-store", // prevent 2MB cache error
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) throw new Error(`Chapters fetch failed: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error(`❌ Failed to fetch chapters for novel ${novelId}:`, error);
    return [];
  }
};

export const dynamic = "force-static";
export const revalidate = 3600; // hourly revalidation

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
    console.log(`✅ Fetched ${novels.length} novels for sitemap`);

    for (const novel of novels) {
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
        for (const chapter of chapters) {
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
      } catch (err) {
        console.error(`❌ Skipped chapters for ${novel.title}:`, err);
      }
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `<url>
  <loc>${url.loc}</loc>
  ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
  ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ""}
  ${url.priority ? `<priority>${url.priority}</priority>` : ""}
</url>`
  )
  .join("\n")}
</urlset>`;

    console.log(`✅ Generated sitemap with ${urls.length} URLs`);

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);

    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(fallback, {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
