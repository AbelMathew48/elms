/**
 * hooks/useCategoryStats.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches dynamic stats (coursesCount, jobsCount, eventsCount) for every
 * category from the backend.
 *
 * BACKEND INTEGRATION:
 *   Replace the mock block with:
 *     const res = await fetch(`${import.meta.env.VITE_API_URL}/categories/stats`);
 *     if (!res.ok) throw new Error(`HTTP ${res.status}`);
 *     const data = await res.json();
 *     // data: [{ categoryId, coursesCount, jobsCount, eventsCount }]
 *     const map = {};
 *     data.forEach(item => { map[item.categoryId] = item; });
 *     setStatsMap(map);
 *
 * RETURNS:
 *   statsMap  : { [categoryId]: { coursesCount, jobsCount, eventsCount } }
 *   loadingStats : boolean
 *   errorStats   : Error | null
 *   refetchStats : () => void
 */

import { useState, useEffect, useCallback } from 'react';

/* Mock data — replace with API response */
const MOCK_STATS = {
  'cat-001': { coursesCount: 13, jobsCount: 22, eventsCount: 16 },
  'cat-002': { coursesCount: 8,  jobsCount: 14, eventsCount: 9  },
  'cat-003': { coursesCount: 11, jobsCount: 18, eventsCount: 7  },
  'cat-004': { coursesCount: 5,  jobsCount: 6,  eventsCount: 4  },
  'cat-005': { coursesCount: 9,  jobsCount: 10, eventsCount: 5  },
  'cat-006': { coursesCount: 7,  jobsCount: 12, eventsCount: 3  },
  'cat-007': { coursesCount: 4,  jobsCount: 5,  eventsCount: 8  },
  'cat-008': { coursesCount: 6,  jobsCount: 9,  eventsCount: 4  },
  'cat-009': { coursesCount: 3,  jobsCount: 7,  eventsCount: 2  },
  'cat-010': { coursesCount: 5,  jobsCount: 8,  eventsCount: 3  },
  'cat-011': { coursesCount: 4,  jobsCount: 3,  eventsCount: 6  },
  'cat-012': { coursesCount: 7,  jobsCount: 5,  eventsCount: 5  },
};

const useCategoryStats = () => {
  const [statsMap, setStatsMap]         = useState({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats]     = useState(null);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setErrorStats(null);
    try {
      /* ── STATIC MOCK (swap for API call) ─────────────────── */
      await new Promise((r) => setTimeout(r, 800));
      setStatsMap(MOCK_STATS);

      /* ── API CALL (uncomment when backend is ready) ────────
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/categories/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const map = {};
      data.forEach(({ categoryId, coursesCount, jobsCount, eventsCount }) => {
        map[categoryId] = { coursesCount, jobsCount, eventsCount };
      });
      setStatsMap(map);
      ──────────────────────────────────────────────────────── */
    } catch (err) {
      setErrorStats(err instanceof Error ? err : new Error('Stats fetch failed'));
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { statsMap, loadingStats, errorStats, refetchStats: fetchStats };
};

export default useCategoryStats;
