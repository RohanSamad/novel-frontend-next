import ChapterReaderClient from "@/components/pages/ChapterReaderPage";
import { Metadata } from "next";

// Server-side API calls - same as your Redux logic
async function getNovelData(novelId: string) {
  try {
    const response = await fetch(
      `https://development.mitprogrammer.com/novel/public/api/novels/${encodeURIComponent(novelId)}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // next: { revalidate: 3600 }
         cache: "no-store",
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch novel');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching novel:', error);
    return null;
  }
}

async function getChaptersData(novelId: string) {
  try {
    const response = await fetch(
      `https://development.mitprogrammer.com/novel/public/api/chapters/novel/${encodeURIComponent(novelId)}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
         cache: "no-store",
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch chapters');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return null;
  }
}

async function getChapterData(novelId: string, chapterId: string) {
  try {
    // This should match your Redux fetchChapterById endpoint
    const response = await fetch(
      `https://development.mitprogrammer.com/novel/public/api/chapters/novel/${encodeURIComponent(novelId)}/${chapterId}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
         cache: "no-store",
      }
    );
    
    if (!response.ok) {
      console.error('Chapter fetch failed:', response.status, response.statusText);
      throw new Error('Failed to fetch chapter');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return null;
  }
}

// Generate metadata - same as your Helmet logic
export async function generateMetadata({ 
  params 
}: { 
params: Promise<{ slug: string; chapterId: string }>;
}): Promise<Metadata> {
   const { slug, chapterId } = await params; // ✅ await it
  const novelId = slug.replace(/-/g, " ");
  
  const [novelResponse, chapterResponse] = await Promise.all([
    getNovelData(novelId),
    getChapterData(novelId, chapterId),
  ]);

  const selectedNovel = novelResponse?.data;
  const selectedChapter = chapterResponse?.data;

  if (!selectedNovel || !selectedChapter) {
    return {
      title: 'Chapter Not Found | Novel Tavern',
      description: 'The requested chapter could not be found.',
    };
  }

  return {
    title: `Chapter ${selectedChapter.chapter_number} | ${selectedNovel.title} | Novel Tavern`,
    description: `${selectedChapter.content_text
      ?.split(/\n+/)
      .filter((line: string) => line.trim() !== "")
      .slice(0, 2)
      .join(" ")
      .slice(0, 160)}`,
    other: {
      'application/ld+json': JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Chapter",
        name: `Chapter ${selectedChapter.chapter_number}: ${selectedChapter.title}`,
        position: selectedChapter.chapter_number,
        isPartOf: {
          "@type": "Book",
          name: selectedNovel.title,
          author: {
            "@type": "Person",
            name: selectedNovel.author?.name || "Unknown",
          },
          publisher: {
            "@type": "Organization",
            name: selectedNovel.publisher || "Unknown",
          },
          image: selectedNovel.cover_image_url,
        },
        datePublished: selectedChapter.created_at || "N/A",
        description: selectedChapter.content_text
          ?.split(/\n+/)
          .filter((line: string) => line.trim() !== "")
          .slice(0, 2)
          .join(" ")
          .slice(0, 200),
      })
    }
  };
}

// Main SSR page component - same structure as your component
export default async function ChapterReaderPage({ 
  params 
}: { 
  params: Promise<{ slug: string; chapterId: string }>;
}) {
    const { slug, chapterId } = await params; // ✅ await here
  const novelId = slug?.replace(/-/g, " ");
  
  
  // Fetch all data in parallel - same as your useEffect calls
  const [novelResponse, chaptersResponse, chapterResponse] = await Promise.all([
    getNovelData(novelId),
    getChaptersData(novelId),
    getChapterData(novelId, chapterId),
  ]);



  const selectedNovel = novelResponse?.data;
  const chapters = chaptersResponse?.data || [];
  const selectedChapter = chapterResponse?.data;

  // Same error handling as your component
  if (!selectedNovel || !selectedChapter) {
  
    
    return (
      <div className="pt-20 min-h-screen container mx-auto px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-serif font-bold text-primary-900 mb-4">
            Chapter Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The chapter you are looking for does not exist or has been removed.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Debug: Novel ID: {novelId}, Chapter ID: {chapterId}
          </p>
         
        </div>
      </div>
    );
  }

  // Pass server-rendered data to client component - same data structure
  return (
    <>
      {/* Structured Data for SEO - same as your Helmet script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Chapter",
            name: `Chapter ${selectedChapter.chapter_number}: ${selectedChapter.title}`,
            position: selectedChapter.chapter_number,
            isPartOf: {
              "@type": "Book",
              name: selectedNovel.title,
              author: {
                "@type": "Person",
                name: selectedNovel.author?.name || "Unknown",
              },
              publisher: {
                "@type": "Organization",
                name: selectedNovel.publisher || "Unknown",
              },
              image: selectedNovel.cover_image_url,
            },
            datePublished: selectedChapter.created_at || "N/A",
            description: selectedChapter.content_text
              ?.split(/\n+/)
              .filter((line: string) => line.trim() !== "")
              .slice(0, 2)
              .join(" ")
              .slice(0, 200),
          }),
        }}
      />
      
      <ChapterReaderClient
        selectedNovel={selectedNovel}
        chapters={chapters}
        selectedChapter={selectedChapter}
        novelId={novelId}
        chapterId={chapterId}
        slug={slug}
      />
    </>
  );
}