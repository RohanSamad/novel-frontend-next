'use client'
import  Link  from 'next/link';
import { BookOpen, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#003667] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Brand Section */}
          <div className="mb-8 md:mb-0">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8" />
              <span className="ml-2 text-xl font-serif font-bold">Novel Tavern</span>
            </div>
            <p className="text-gray-300 text-sm mt-2">
              Your premier platform for audiobooks and novels.
            </p>
          </div>

          {/* Contact Button */}
          <div className="text-center md:text-right">
            <Link 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border-2 border-white rounded-full text-white hover:bg-white hover:text-primary-900 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Us
            </Link>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Novel Tavern. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition">
              Made with ❤️ for book lovers
            </a>
          </div>
        </div>

        {/* SEO Keywords */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            read novel free, listen audionovel, wuxia novel, translated novel, online novels, light novels, 
            web novels, chinese novels, korean novels, japanese novels, free audiobooks online, read light novels online, 
            read web novels free, best free novels online, popular web novels, latest translated novels, 
            read manga online free, manhwa online, free light novel reading, best wuxia novels, 
            cultivation novels, xianxia novels, martial arts novels, romance novels online free, 
            fantasy novels free reading, sci-fi novels online, horror novels free, mystery novels online
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;