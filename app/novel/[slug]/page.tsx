// import NovelDetailClient from "@/pages/NovelDetailPage";
// import { Metadata } from "next";

// // Server-side API calls
// async function getNovelData(novelId: string) {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/novels/${encodeURIComponent(
//         novelId
//       )}`,
      
//       {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//          cache: "no-store",
//       },
      

//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch novel");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching novel:", error);
//     return null;
//   }
// }

// async function getChaptersData(novelId: string) {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/chapters/novel/${encodeURIComponent(
//         novelId
//       )}`,
//       {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//          cache: "no-store",
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch chapters");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching chapters:", error);
//     return null;
//   }
// }

// async function getNovelStats(novelId: string) {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/novels/stats/${encodeURIComponent(
//         novelId
//       )}`,
//       {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//          cache: "no-store",
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch novel stats");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching novel stats:", error);
//     return { data: { average_rating: 0, rating_count: 0 } };
//   }
// }

// // Generate metadata
// export async function generateMetadata({
//   params,
// }: {
//   params: { slug: string };
// }): Promise<Metadata> {
//   // const novelId = params.slug.replace(/-/g, " ");
//   const { slug } = await Promise.resolve(params); // ✅ Fix
//   const novelId = slug.replace(/-/g, " ");
//   const novelResponse = await getNovelData(novelId);
//   const novel = novelResponse?.data;

//   if (!novel) {
//     return {
//       title: "Novel Not Found | Novel Tavern",
//       description: "The requested novel could not be found.",
//     };
//   }

//   return {
//     title: `${novel.title} | Novel Tavern`,
//     description: novel.synopsis
//       ? novel.synopsis.slice(0, 160)
//       : `Read the latest chapters of ${novel.title} on Novel Tavern.`,
//     openGraph: {
//       title: novel.title,
//       description: novel.synopsis?.slice(0, 200),
//       images: novel.cover_image_url ? [novel.cover_image_url] : [],
//       type: "book",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: novel.title,
//       description: novel.synopsis?.slice(0, 200),
//       images: novel.cover_image_url ? [novel.cover_image_url] : [],
//     },
//   };
// }

// // Main SSR page component
// export default async function NovelDetailPage({
//   params,
// }: {
//   params: { slug: string };
// }) {
//   const { slug } = await Promise.resolve(params); // ✅ Fix
//   const novelId = slug.replace(/-/g, " ");

//   // Fetch all data in parallel on the server
//   const [novelResponse, chaptersResponse, statsResponse] = await Promise.all([
//     getNovelData(novelId),
//     getChaptersData(novelId),
//     getNovelStats(novelId),
//   ]);

//   const novel = novelResponse?.data;
//   const chapters = chaptersResponse?.data || [];
//   const stats = statsResponse?.data || { average_rating: 0, rating_count: 0 };

//   // If novel not found, show 404
//   if (!novel) {
//     return (
//       <div className="pt-20 min-h-screen container mx-auto px-4">
//         <div className="text-center py-12">
//           <h2 className="text-2xl font-serif font-bold text-primary-900 mb-4">
//             Novel Not Found
//           </h2>
//           <p className="text-gray-600 mb-6">
//             The novel you are looking for does not exist or has been removed.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Add structured data for SEO
//   const structuredData = {
//     "@context": "https://schema.org",
//     "@type": "Book",
//     name: novel.title,
//     author: {
//       "@type": "Person",
//       name: novel.author?.name || "Unknown",
//     },
//     datePublished: novel.publishing_year || "N/A",
//     publisher: {
//       "@type": "Organization",
//       name: novel.publisher || "Unknown",
//     },
//     image: novel.cover_image_url,
//     aggregateRating: {
//       "@type": "AggregateRating",
//       ratingValue: parseFloat(stats.average_rating).toFixed(1),
//       ratingCount: stats.rating_count,
//     },
//     description: novel.synopsis?.slice(0, 200),
//     genre: novel.genres?.map((g: { id: number; name: string }) => g.name),
//   };

//   return (
//     <>
//       {/* Structured Data for SEO */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{
//           __html: JSON.stringify(structuredData),
//         }}
//       />

//       {/* Pass server-rendered data to client component */}
//       <NovelDetailClient
//         initialNovel={novel}
//         initialChapters={chapters}
//         initialStats={stats}
//         novelId={novelId}
//         slug={slug}
//       />
//     </>
//   );
// }



import NovelDetailClient from "@/components/pages/NovelDetailPage";
import { Metadata } from "next";

// Server-side API calls
async function getNovelData(novelId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/novels/${encodeURIComponent(
        novelId
      )}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch novel");
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
      `${process.env.NEXT_PUBLIC_API_URL}/api/chapters/novel/${encodeURIComponent(
        novelId
      )}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch chapters");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return null;
  }
}

async function getNovelStats(novelId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/novels/stats/${encodeURIComponent(
        novelId
      )}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch novel stats");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching novel stats:", error);
    return { data: { average_rating: 0, rating_count: 0 } };
  }
}

// Generate metadata - Fixed for Next.js 15
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>; // ✅ Correct type
}): Promise<Metadata> {
  const { slug } = await params; // ✅ Await the Promise directly
  const novelId = slug.replace(/-/g, " ");
  const novelResponse = await getNovelData(novelId);
  const novel = novelResponse?.data;

  if (!novel) {
    return {
      title: "Novel Not Found | Novel Tavern",
      description: "The requested novel could not be found.",
    };
  }

  return {
    title: `${novel.title} | Novel Tavern`,
    description: novel.synopsis
      ? novel.synopsis.slice(0, 160)
      : `Read the latest chapters of ${novel.title} on Novel Tavern.`,
    openGraph: {
      title: novel.title,
      description: novel.synopsis?.slice(0, 200),
      images: novel.cover_image_url ? [novel.cover_image_url] : [],
      type: "book",
    },
    twitter: {
      card: "summary_large_image",
      title: novel.title,
      description: novel.synopsis?.slice(0, 200),
      images: novel.cover_image_url ? [novel.cover_image_url] : [],
    },
  };
}

// Main SSR page component - Fixed for Next.js 15
export default async function NovelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>; // ✅ Correct type
}) {
  const { slug } = await params; // ✅ Await the Promise directly
  const novelId = slug.replace(/-/g, " ");

  // Fetch all data in parallel on the server
  const [novelResponse, chaptersResponse, statsResponse] = await Promise.all([
    getNovelData(novelId),
    getChaptersData(novelId),
    getNovelStats(novelId),
  ]);

  const novel = novelResponse?.data;
  const chapters = chaptersResponse?.data || [];
  const stats = statsResponse?.data || { average_rating: 0, rating_count: 0 };

  // If novel not found, show 404
  if (!novel) {
    return (
      <div className="pt-20 min-h-screen container mx-auto px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-serif font-bold text-primary-900 mb-4">
            Novel Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The novel you are looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Add structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: novel.title,
    author: {
      "@type": "Person",
      name: novel.author?.name || "Unknown",
    },
    datePublished: novel.publishing_year || "N/A",
    publisher: {
      "@type": "Organization",
      name: novel.publisher || "Unknown",
    },
    image: novel.cover_image_url,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: parseFloat(stats.average_rating).toFixed(1),
      ratingCount: stats.rating_count,
    },
    description: novel.synopsis?.slice(0, 200),
    genre: novel.genres?.map((g: { id: number; name: string }) => g.name),
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Pass server-rendered data to client component */}
      <NovelDetailClient
        initialNovel={novel}
        initialChapters={chapters}
        initialStats={stats}
        novelId={novelId}
        slug={slug}
      />
    </>
  );
}