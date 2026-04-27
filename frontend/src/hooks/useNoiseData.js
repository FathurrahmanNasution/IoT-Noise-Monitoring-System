import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLatest, fetchHistory, fetchStats, checkHealth } from '../utils/api';

const POLL_INTERVAL = 3000; // 3 seconds

export function useNoiseData() {
  const [latestReadings, setLatestReadings] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [latestRes, historyRes, statsRes] = await Promise.all([
        fetchLatest(),
        fetchHistory({ limit: 200 }),
        fetchStats(60),
      ]);

      setLatestReadings(latestRes.data || []);
      setHistory((historyRes.data || []).reverse()); // oldest first for chart
      setStats(statsRes.data || null);
      setIsConnected(true);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchAllData();

    intervalRef.current = setInterval(fetchAllData, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAllData]);

  return {
    latestReadings,
    history,
    stats,
    isConnected,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchAllData,
  };
}
