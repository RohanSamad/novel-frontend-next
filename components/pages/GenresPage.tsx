import React from 'react';
import  Link  from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';

const genres = [
  {
    slug: 'action',
    name: 'Action',
    description: 'Action-packed stories with thrilling adventures',
    color: 'bg-red-100 text-red-600'
  },
  {
    slug: 'adult',
    name: 'Adult',
    description: 'Mature content intended for adult audiences',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    slug: 'anime-comic',
    name: 'Anime / Comic',
    description: 'Stories adapted from or inspired by anime and comics',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    slug: 'comedy',
    name: 'Comedy',
    description: 'Humorous tales meant to entertain and amuse',
    color: 'bg-green-100 text-green-600'
  },
  {
    slug: 'contemporary',
    name: 'Contemporary',
    description: 'Modern-day stories reflecting current times',
    color: 'bg-teal-100 text-teal-600'
  },
  {
    slug: 'cultivation',
    name: 'Cultivation',
    description: 'Stories about martial artists and spiritual cultivation',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    slug: 'dark',
    name: 'Dark',
    description: 'Stories with darker themes and mature content',
    color: 'bg-slate-100 text-slate-600'
  },
  {
    slug: 'drama',
    name: 'Drama',
    description: 'Character-driven stories with emotional depth',
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    slug: 'ecchi',
    name: 'Ecchi',
    description: 'Stories with mild adult themes and fanservice',
    color: 'bg-fuchsia-100 text-fuchsia-600'
  },
  {
    slug: 'fanfiction',
    name: 'Fanfiction',
    description: 'Stories based on existing works, characters, or universes',
    color: 'bg-violet-100 text-violet-600'
  },
  {
    slug: 'fantasy',
    name: 'Fantasy',
    description: 'Tales of magic, mythical creatures, and epic adventures',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    slug: 'game',
    name: 'Game',
    description: 'Stories based on or involving video games and gaming worlds',
    color: 'bg-lime-100 text-lime-600'
  },
  {
    slug: 'gore',
    name: 'Gore',
    description: 'Stories containing graphic violence and intense content',
    color: 'bg-red-100 text-red-600'
  },
  {
    slug: 'harem',
    name: 'Harem',
    description: 'Stories featuring multiple romantic interests',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    slug: 'hentai',
    name: 'Hentai',
    description: 'Adult-oriented content with explicit themes',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    slug: 'historical',
    name: 'Historical Fiction',
    description: 'Stories set in the past with historical accuracy',
    color: 'bg-amber-100 text-amber-600'
  },
  {
    slug: 'horror',
    name: 'Horror',
    description: 'Scary stories designed to thrill and frighten',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    slug: 'isekai',
    name: 'Isekai',
    description: 'Stories about characters transported to another world',
    color: 'bg-cyan-100 text-cyan-600'
  },
  {
    slug: 'literary',
    name: 'Literary Fiction',
    description: 'Character-focused stories with artistic merit',
    color: 'bg-emerald-100 text-emerald-600'
  },
  {
    slug: 'mystery',
    name: 'Mystery',
    description: 'Intriguing novels focused on solving crimes or puzzles',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    slug: 'other',
    name: 'Other',
    description: 'Stories that don\'t fit into other specific categories',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    slug: 'reincarnation',
    name: 'Reincarnation',
    description: 'Stories about characters being reborn or transported to new worlds',
    color: 'bg-rose-100 text-rose-600'
  },
  {
    slug: 'romance',
    name: 'Romance',
    description: 'Stories focusing on romantic relationships',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    slug: 'sci-fi',
    name: 'Science Fiction',
    description: 'Stories exploring futuristic concepts and technology',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    slug: 'slice-of-life',
    name: 'Slice of Life',
    description: 'Stories focusing on everyday life experiences and personal growth',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    slug: 'system',
    name: 'System',
    description: 'Stories featuring system-based progression and mechanics',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    slug: 'tragedy',
    name: 'Tragedy',
    description: 'Stories with dramatic and often sorrowful themes',
    color: 'bg-red-100 text-red-600'
  },
  {
    slug: 'urban-fantasy',
    name: 'Urban Fantasy',
    description: 'Fantasy stories set in modern urban settings',
    color: 'bg-violet-100 text-violet-600'
  },
  {
    slug: 'war',
    name: 'War',
    description: 'Stories centered around military conflicts and their impact',
    color: 'bg-red-100 text-red-600'
  },
  {
    slug: 'young-adult',
    name: 'Young Adult',
    description: 'Stories targeting teenage and young adult readers',
    color: 'bg-cyan-100 text-cyan-600'
  }
].sort((a, b) => a.name.localeCompare(b.name));

const GenresPage: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900">Genres</span>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-primary-900 mb-4">
            Browse by Genre
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our diverse collection of novels across different genres. 
            From heart-pounding action to sweeping romances, find your next favorite read.
          </p>
        </div>

        {/* Genres Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {genres.map((genre) => (
            <Link
              key={genre.slug}
              href={`/genre/${genre.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${genre.color}`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-gray-900 ml-4">
                    {genre.name}
                  </h2>
                </div>
                <p className="text-gray-600">{genre.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenresPage;