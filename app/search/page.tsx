// import SearchResultsPage from "@/pages/SearchResultsPage";

// interface SearchPageProps {
//   searchParams: { q?: string };
// }

// const Page = ({ searchParams }: SearchPageProps) => {
//   const query = searchParams.q || "";
//   return <SearchResultsPage query={query} />;
// };

// export default Page;


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