import { Metadata } from 'next';
import GenrePageClient from '@/components/pages/GenrePage';

export const dynamic = 'force-dynamic'; // Optional if needed

const genreMap:  Record<string, { name: string; description: string }> = {
  action: {
    name: "Action",
    description: "Action-packed stories with thrilling adventures",
  },
  adult: {
    name: "Adult",
    description: "Mature content intended for adult audiences",
  },
  "anime-comic": {
    name: "Anime / Comic",
    description: "Stories adapted from or inspired by anime and comics",
  },
  comedy: {
    name: "Comedy",
    description: "Humorous tales meant to entertain and amuse",
  },
  contemporary: {
    name: "Contemporary",
    description: "Modern-day stories reflecting current times",
  },
  cultivation: {
    name: "Cultivation",
    description: "Stories about martial artists and spiritual cultivation",
  },
  dark: {
    name: "Dark",
    description: "Stories with darker themes and mature content",
  },
  drama: {
    name: "Drama",
    description: "Character-driven stories with emotional depth",
  },
  ecchi: {
    name: "Ecchi",
    description: "Stories with mild adult themes and fanservice",
  },
  fanfiction: {
    name: "Fanfiction",
    description: "Stories based on existing works, characters, or universes",
  },
  fantasy: {
    name: "Fantasy",
    description: "Tales of magic, mythical creatures, and epic adventures",
  },
  game: {
    name: "Game",
    description: "Stories based on or involving video games and gaming worlds",
  },
  gore: {
    name: "Gore",
    description: "Stories containing graphic violence and intense content",
  },
  harem: {
    name: "Harem",
    description: "Stories featuring multiple romantic interests",
  },
  hentai: {
    name: "Hentai",
    description: "Adult-oriented content with explicit themes",
  },
  historical: {
    name: "Historical Fiction",
    description: "Stories set in the past with historical accuracy",
  },
  horror: {
    name: "Horror",
    description: "Scary stories designed to thrill and frighten",
  },
  isekai: {
    name: "Isekai",
    description: "Stories about characters transported to another world",
  },
  literary: {
    name: "Literary Fiction",
    description: "Character-focused stories with artistic merit",
  },
  mystery: {
    name: "Mystery",
    description: "Intriguing novels focused on solving crimes or puzzles",
  },
  other: {
    name: "Other",
    description: "Stories that don't fit into other specific categories",
  },
  reincarnation: {
    name: "Reincarnation",
    description:
      "Stories about characters being reborn or transported to new worlds",
  },
  romance: {
    name: "Romance",
    description: "Stories focusing on romantic relationships",
  },
  "sci-fi": {
    name: "Science Fiction",
    description: "Stories exploring futuristic concepts and technology",
  },
  "slice-of-life": {
    name: "Slice of Life",
    description:
      "Stories focusing on everyday life experiences and personal growth",
  },
  system: {
    name: "System",
    description: "Stories featuring system-based progression and mechanics",
  },
  tragedy: {
    name: "Tragedy",
    description: "Stories with dramatic and often sorrowful themes",
  },
  "urban-fantasy": {
    name: "Urban Fantasy",
    description: "Fantasy stories set in modern urban settings",
  },
  war: {
    name: "War",
    description: "Stories centered around military conflicts and their impact",
  },
  "young-adult": {
    name: "Young Adult",
    description: "Stories targeting teenage and young adult readers",
  },
};


interface Params {
  slug: string;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<Params> 
}): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  const genre = genreMap[normalizedSlug];

  return {
    title: genre?.name ? `${genre.name} Novels | Novel Tavern` : 'Genre Not Found | Novel Tavern',
    description: genre?.description || 'Explore novels by genre on Novel Tavern.',
    openGraph: {
      title: genre?.name ? `${genre.name} Novels` : 'Genre Not Found',
      description: genre?.description || 'Explore novels by genre.',
      type: 'website',
    },
  };
}

export default async function Page({ 
  params 
}: { 
  params: Promise<Params> 
}) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  const genre = genreMap[normalizedSlug];

  return <GenrePageClient slug={normalizedSlug} genre={genre} />;
}