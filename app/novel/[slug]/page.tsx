import NovelDetailClient from "@/components/pages/NovelDetailPage";
import { Metadata } from "next";
import { notFound } from "next/navigation";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function getNovelData(novelId: string) {
  try {
    const response = await fetch(
      `${API_BASE}/api/novels/${encodeURIComponent(novelId)}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 3600,
          tags: [`novel-${novelId}`],
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch novel: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching novel:", error);
    return null;
  }
}

async function getChaptersData(novelId: string) {
  try {
    const page = 1;
    const response = await fetch(
      `${API_BASE}/api/chapters/novel/${encodeURIComponent(novelId)}?page=${page}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 1800,
          tags: [`chapters-${novelId}`],
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch chapters: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return { data: [] };
  }
}

async function getNovelStats(novelId: string) {
  try {
    const response = await fetch(
      `${API_BASE}/api/novels/stats/${encodeURIComponent(novelId)}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 900,
          tags: [`stats-${novelId}`],
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch novel stats: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching novel stats:", error);
    return { data: { average_rating: 0, rating_count: 0 } };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const novelId = slug.replace(/-/g, " ");

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Metadata generation timeout")), 10000)
    );

    type GetNovelDataReturn = Awaited<ReturnType<typeof getNovelData>>;

    const novelResponse: GetNovelDataReturn = await Promise.race([
      getNovelData(novelId),
      timeoutPromise,
    ]);

    const novel = novelResponse?.data;

    if (!novel) {
      return {
        title: "Novel Not Found | Novel Tavern",
        description: "The requested novel could not be found.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    // Title as per client
    const title = `${novel.title} novel, read listen ${novel.title} online for free - NovelTavern`;

    // Prepare truncated synopsis
    const rawSynopsis = novel.synopsis || "No description available";
    const synopsis =
      rawSynopsis.length > 160 ? rawSynopsis.slice(0, 157).trim() + "..." : rawSynopsis.trim();

    const authorName = novel.author?.name || "Unknown Author";
    const yearPublished = novel.publishing_year || "Unknown Year";
    const novelStatus = novel.status || "unknown status";

    // Description exactly as client wants, with truncated synopsis
    const description = `Read and listen to ${novel.title} novel full audiobook by ${authorName} released on ${yearPublished} which is still ${novelStatus} and telling a story about ${synopsis}`;

    return {
      title,
      description,
      keywords: [
        novel.title,
        "novel",
        "read online",
        ...(novel.genres?.map((g: { id: number; name: string }) => g.name) || []),
        authorName,
      ]
        .filter(Boolean)
        .join(", "),
      authors: [{ name: authorName }],
      publisher: novel.publisher || "Novel Tavern",
      openGraph: {
        title,
        description,
        images: novel.cover_image_url
          ? [
              {
                url: novel.cover_image_url,
                width: 400,
                height: 600,
                alt: `Cover of ${novel.title}`,
              },
            ]
          : [],
        type: "book",
        siteName: "Novel Tavern",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: novel.cover_image_url ? [novel.cover_image_url] : [],
        creator: "@noveltavern",
      },
      alternates: {
        canonical: `/novel/${slug}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Novel | Novel Tavern",
      description: "Read amazing novels on Novel Tavern.",
    };
  }
}


export default async function NovelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const novelId = slug.replace(/-/g, " ");

    const [novelResponse, chaptersResponse, statsResponse] =
      await Promise.allSettled([
        getNovelData(novelId),
        getChaptersData(novelId),
        getNovelStats(novelId),
      ]);

    const novel =
      novelResponse.status === "fulfilled" ? novelResponse.value?.data : null;
    const chapters =
      chaptersResponse.status === "fulfilled"
        ? chaptersResponse.value?.data || []
        : [];
    const totalChapters =
      chaptersResponse.status === "fulfilled"
        ? chaptersResponse.value?.totalChapters
        : undefined;
    const latestChapter =
      chaptersResponse.status === "fulfilled"
        ? chaptersResponse.value?.latestChapter
        : undefined;
    const stats =
      statsResponse.status === "fulfilled"
        ? statsResponse.value?.data || { average_rating: 0, rating_count: 0 }
        : { average_rating: 0, rating_count: 0 };

    if (!novel) {
      notFound();
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Book",
      "@id": `https://noveltavern.com/novel/${slug}`,
      name: novel.title,
      author: {
        "@type": "Person",
        name: novel.author?.name || "Unknown",
      },
      datePublished: novel.publishing_year || undefined,
      publisher: {
        "@type": "Organization",
        name: novel.publisher || "Novel Tavern",
      },
      image: novel.cover_image_url || undefined,
      aggregateRating:
        stats.rating_count > 0
          ? {
              "@type": "AggregateRating",
              ratingValue: parseFloat(stats.average_rating).toFixed(1),
              ratingCount: stats.rating_count,
              bestRating: "5",
              worstRating: "1",
            }
          : undefined,
      description: novel.synopsis?.slice(0, 200),
      genre:
        novel.genres?.map((g: { id: number; name: string }) => g.name) || [],
      numberOfPages: chapters.length,
      bookFormat: "EBook",
      inLanguage: "en",
      url: `https://noveltavern.com/novel/${slug}`,
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <NovelDetailClient
          initialNovel={novel}
          totalChapters={totalChapters}
          initialChapters={chapters}
          latestChapter={latestChapter}
          initialStats={stats}
          novelId={novelId}
          slug={slug}
        />
      </>
    );
  } catch (error) {
    console.error("Error in NovelDetailPage:", error);
    notFound();
  }
}
