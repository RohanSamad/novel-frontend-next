import SearchResultsPage from "@/components/pages/SearchResultsPage";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

const Page = async ({ searchParams }: SearchPageProps) => {
  const { q } = await searchParams;
  const query = q || "";
  return <SearchResultsPage query={query} />;
};

export default Page;
