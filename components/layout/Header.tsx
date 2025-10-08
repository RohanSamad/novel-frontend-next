'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ChevronDown,
  User,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import Button from '../ui/Button';
import BookIcon from '@/components/logo/BookIcon'; // Updated import path

const GenreOptions = [
  { value: 'action', label: 'Action' },
  { value: 'adult', label: 'Adult' },
  { value: 'anime-comic', label: 'Anime / Comic' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'cultivation', label: 'Cultivation' },
  { value: 'dark', label: 'Dark' },
  { value: 'drama', label: 'Drama' },
  { value: 'ecchi', label: 'Ecchi' },
  { value: 'fanfiction', label: 'Fanfiction' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'game', label: 'Game' },
  { value: 'gore', label: 'Gore' },
  { value: 'harem', label: 'Harem' },
  { value: 'hentai', label: 'Hentai' },
  { value: 'historical', label: 'Historical Fiction' },
  { value: 'horror', label: 'Horror' },
  { value: 'isekai', label: 'Isekai' },
  { value: 'literary', label: 'Literary Fiction' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'other', label: 'Other' },
  { value: 'reincarnation', label: 'Reincarnation' },
  { value: 'romance', label: 'Romance' },
  { value: 'sci-fi', label: 'Science Fiction' },
  { value: 'slice-of-life', label: 'Slice of Life' },
  { value: 'system', label: 'System' },
  { value: 'tragedy', label: 'Tragedy' },
  { value: 'urban-fantasy', label: 'Urban Fantasy' },
  { value: 'war', label: 'War' },
  { value: 'young-adult', label: 'Young Adult' },
].sort((a, b) => a.label.localeCompare(b.label));

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { isDarkMode } = useAppSelector((state) => state.theme);
  const dispatch = useAppDispatch();

  const router = useRouter();
  const pathname = usePathname();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  // Initialize theme on component mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []); // Run once on mount

  useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDarkMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleGenreSelect = (genreValue: string) => {
    router.push(`/genre/${genreValue}`);
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-primary-800 dark:bg-gray-800 shadow-md'
          : 'bg-primary-900 dark:bg-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <BookIcon className="h-8 w-8" />
            <span className="ml-2 text-xl font-serif font-bold text-white">
              Novel Tavern
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/browse" className="text-white hover:text-gray-200">
              Browse All
            </Link>

            {/* Genre Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center text-white hover:text-gray-200 focus:outline-none"
              >
                Genres <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isDropdownOpen && (
                <div className="absolute mt-2 w-[600px] -left-1/2 bg-white dark:bg-gray-800 rounded-md shadow-lg py-4 z-10">
                  <div className="grid grid-cols-3 gap-2 px-4">
                    {GenreOptions.map((genre) => (
                      <button
                        key={genre.value}
                        onClick={() => handleGenreSelect(genre.value)}
                        className="text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        {genre.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search novels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-1 rounded-full bg-primary-700 dark:bg-gray-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-1">
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-1 rounded-full hover:bg-primary-700 dark:hover:bg-gray-700"
                >
                  <User className="h-4 w-4 text-white mr-1" />
                  <span className="text-white text-sm">{user?.username}</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="text-white text-sm px-3 py-1 rounded-full hover:bg-primary-700 dark:hover:bg-gray-700"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-white text-sm px-3 py-1 rounded-full hover:bg-primary-700 dark:hover:bg-gray-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/signin">
                  <Button variant="secondary" size="small">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="small">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={handleThemeToggle}
              className="text-white p-1 hover:bg-primary-700 dark:hover:bg-gray-700 rounded-full"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-1 hover:bg-primary-700 dark:hover:bg-gray-700 rounded-full"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary-800 dark:bg-gray-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="px-4 py-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search novels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-full bg-primary-700 dark:bg-gray-700 text-white placeholder-gray-300 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            <Link href="/browse" className="block text-white py-2 px-4 hover:bg-primary-700 dark:hover:bg-gray-700 rounded-md">
              Browse All
            </Link>

            <div className="px-4 py-2">
              <p className="text-white font-medium mb-2">Genres</p>
              <div className="grid grid-cols-2 gap-2">
                {GenreOptions.map((genre) => (
                  <button
                    key={genre.value}
                    onClick={() => handleGenreSelect(genre.value)}
                    className="text-gray-200 hover:text-white text-left py-1"
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-2 border-t border-primary-700 dark:border-gray-700">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="block text-white py-2">
                    My Account
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin/dashboard" className="block text-white py-2">
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="block text-white py-2 w-full text-left">
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/signin">
                    <Button variant="secondary" size="full">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" size="full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;