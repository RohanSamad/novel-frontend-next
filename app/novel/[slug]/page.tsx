import NovelDetailClient from "@/components/pages/NovelDetailPage";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// ✅ Optimized API calls with better error handling and caching
async function getNovelData(novelId: string) {
  try {
    const response = await fetch(
      `https://development.mitprogrammer.com/novel/public/api/novels/${encodeURIComponent(
        novelId
      )}`,
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
    const response = await fetch(
      `https://development.mitprogrammer.com/novel/public/api/chapters/novel/${encodeURIComponent(
        novelId
      )}`,
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
      `https://development.mitprogrammer.com/novel/public/api/novels/stats/${encodeURIComponent(
        novelId
      )}`,
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
      setTimeout(() => reject(new Error("Metadata generation timeout")), 5000)
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

    const title = `${novel.title} | Novel Tavern`;
    const description = novel.synopsis
      ? novel.synopsis.slice(0, 160).trim() +
        (novel.synopsis.length > 160 ? "..." : "")
      : `Read the latest chapters of ${novel.title} on Novel Tavern.`;

    return {
      title,
      description,
      keywords: [
        novel.title,
        "novel",
        "read online",
        ...(novel.genres?.map((g: { id: number; name: string }) => g.name) ||
          []),
        novel.author?.name || "",
      ]
        .filter(Boolean)
        .join(", "),
      authors: [{ name: novel.author?.name || "Unknown Author" }],
      publisher: novel.publisher || "Novel Tavern",
      openGraph: {
        title: novel.title,
        description: description,
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
        title: novel.title,
        description: description,
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
          initialChapters={chapters}
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
