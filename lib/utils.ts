/**
 * Creates a URL-friendly slug from a title
 * - Converts to lowercase
 * - Only keeps letters and numbers
 * - Replaces spaces with hyphens
 */
export const createSlug = (title: string): string => {
  if (!title || typeof title !== 'string') {
    return 'untitled-novel';
  }

  const slug = title
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s]/g, '') // Remove everything except lowercase letters, numbers, and spaces
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens

  // If slug is empty after processing, return a default
  return slug || 'untitled-novel';
};
