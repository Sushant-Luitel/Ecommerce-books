export const BOOK_CATEGORIES = [
  { label: 'Fiction', slug: 'fiction' },
  { label: 'Self Help', slug: 'self-help' },
  { label: 'Romance', slug: 'romance' },
  { label: 'Novels', slug: 'novels' },
  { label: 'Mystery', slug: 'mystery' },
  { label: 'Biography', slug: 'biography' },
  { label: 'Fantasy', slug: 'fantasy' },
  { label: 'Science Fiction', slug: 'science-fiction' },
  { label: 'Thriller', slug: 'thriller' },
  { label: 'History', slug: 'history' },
];

export function getCategoryLabel(slug: string): string {
  return BOOK_CATEGORIES.find(c => c.slug === slug)?.label || slug;
}

export function parseCategories(categoryData: any): string[] {
  if (!categoryData) return [];
  if (Array.isArray(categoryData)) return categoryData;
  if (typeof categoryData === 'string') {
    // Handle PostgreSQL array string format: "{fiction,mystery}"
    if (categoryData.startsWith('{') && categoryData.endsWith('}')) {
      return categoryData
        .slice(1, -1)
        .split(',')
        .map(s => s.replace(/"/g, '').trim())
        .filter(Boolean);
    }
    // Handle JSON array string format: '["fiction", "mystery"]'
    if (categoryData.startsWith('[')) {
      try {
        const parsed = JSON.parse(categoryData);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    // Fallback: treat as a single category
    return [categoryData];
  }
  return [];
}

