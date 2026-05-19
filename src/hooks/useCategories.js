/**
 * hooks/useCategories.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Loads category list. Handles:
 *   - Static data (current) with simulated async delay
 *   - "Trending" sort: sorts by enrollmentCount DESC
 *   - isPopular flag: computed dynamically from enrollmentCount threshold
 *
 * BACKEND INTEGRATION:
 *   All  : GET /api/categories
 *   Trending: GET /api/categories?sortBy=enrollment&order=desc
 *   Swap the static block for a fetch() call — no component changes needed.
 *
 * RETURNS:
 *   categories : Array   — processed list (sorted/filtered by activeFilter)
 *   loading    : boolean
 *   error      : Error | null
 *   refetch    : () => void
 */

import { useState, useEffect, useCallback } from 'react';
import { categoriesData } from '../data/data';
const TRENDING_THRESHOLD = 800;

const useCategories = (activeFilter = 'all') => {
  const [error, setError] = useState(null);

  /* ── Synchronous data processing ─────────────────────────────────────────
   * Data is static (categoriesData.js) — no network call, no delay.
   * Computed inline so loading is always false and no spinner is shown.
   *
   * BACKEND INTEGRATION: when connecting a real API, replace this block
   * with a useState([]) + useEffect fetch() pattern, re-adding a loading
   * boolean during the network request.
   * ──────────────────────────────────────────────────────────────────────── */
  let categories = [];
  try {
    /* Attach dynamic isPopular based on enrollmentCount threshold */
    categories = categoriesData.map((cat) => ({
      ...cat,
      isPopular: cat.enrollmentCount >= TRENDING_THRESHOLD,
    }));

    /* Trending sort: highest enrollment first */
    if (activeFilter === 'trending') {
      categories = [...categories].sort((a, b) => b.enrollmentCount - a.enrollmentCount);
    }
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Failed to load categories'));
    categories = [];
  }

  /* ── API CALL (uncomment when backend is ready) ─────────────────────────
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const params = activeFilter === 'trending' ? '?sortBy=enrollment&order=desc' : '';
      const res = await fetch(`${apiUrl}/categories${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCategories(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load categories'));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);
  useEffect(() => { loadCategories(); }, [loadCategories]);
  ──────────────────────────────────────────────────────────────────────── */

  return { categories, loading: false, error, refetch: () => {} };
};

export default useCategories;
