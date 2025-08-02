import HomePage from "@/components/pages/HomePage";
import React from "react";

async function getNovels() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/novels`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
          cache: "force-cache", // or "no-store" if it's dynamic
        next: { revalidate: 1800 },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch novels");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching novels:", error);
    return [];
  }
}

async function getRecentChapters() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chapters/recent`, 
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
          cache: "force-cache", // or "no-store" if it's dynamic
        next: { revalidate: 900 }, 
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recent chapters");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching recent chapters:", error);
    return [];
  }
}

const page = async () => {
  const [initialNovels, initialRecentChapters] = await Promise.all([
    getNovels(),
    getRecentChapters(),
  ]);

  return (
    <div>
      <HomePage
        initialNovels={initialNovels}
        initialRecentChapters={initialRecentChapters}
      />
    </div>
  );
};

export default page;
