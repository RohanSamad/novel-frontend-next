


import SearchResultsPage from "@/components/pages/SearchResultsPage";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>; // ✅ Promise type
}

const Page = async ({ searchParams }: SearchPageProps) => { // ✅ async function
  const { q } = await searchParams; // ✅ await the Promise
  const query = q || "";
  return <SearchResultsPage query={query} />;
};

export default Page;