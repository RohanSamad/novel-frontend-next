'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { login, clearAuthError } from '@/store/slices/authSlice';
import { BookOpen, Mail, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { error } = useAppSelector(state => state.auth);
  
  // Add theme state access
  //const { isDarkMode } = useAppSelector((state) => state.theme);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const resultAction = await dispatch(login({ email, password }));

      if (login.fulfilled.match(resultAction)) {
        toast.success('Signed in successfully');
        router.push('/');
      } else if (login.rejected.match(resultAction)) {
        toast.error((resultAction.payload as string) || 'Failed to sign in');
      }
    } catch  {
      toast.error('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-16 my-10 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-primary-900 dark:text-gray-100">Sign In to Novel Tavern</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Resume your reading journey</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-50 dark:bg-red-900/20 border border-error-200 dark:border-red-700 rounded-md">
            <p className="text-error-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 appearance-auto focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button type="submit" variant="primary" size="full" isLoading={isLoading}>
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Privacy Policy
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Dont have an account?{' '}
          <Link href="/signup" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;