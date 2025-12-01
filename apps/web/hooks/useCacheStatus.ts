"use client";

import { useState, useEffect } from "react";

export interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  cacheBypasses: number;
  hitRate: number;
}

/**
 * Hook to monitor cache performance
 * Tracks cache hits/misses from API responses
 */
export function useCacheStatus() {
  const [stats, setStats] = useState<CacheStats>({
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheBypasses: 0,
    hitRate: 0,
  });

  // Listen to fetch responses to track cache status
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Clone response to read headers without consuming it
      const clonedResponse = response.clone();
      const cacheStatus = clonedResponse.headers.get("X-Cache-Status");

      if (cacheStatus) {
        setStats((prev) => {
          const newStats = { ...prev };
          newStats.totalRequests += 1;

          if (cacheStatus === "HIT") {
            newStats.cacheHits += 1;
          } else if (cacheStatus === "MISS") {
            newStats.cacheMisses += 1;
          } else if (cacheStatus === "BYPASS") {
            newStats.cacheBypasses += 1;
          }

          // Calculate hit rate (excluding bypasses)
          const relevantRequests = newStats.cacheHits + newStats.cacheMisses;
          newStats.hitRate =
            relevantRequests > 0
              ? (newStats.cacheHits / relevantRequests) * 100
              : 0;

          return newStats;
        });
      }

      return response;
    };

    // Cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const resetStats = () => {
    setStats({
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheBypasses: 0,
      hitRate: 0,
    });
  };

  return { stats, resetStats };
}

/**
 * Simple hook to get cache status from last request
 */
export function useLastCacheStatus() {
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const clonedResponse = response.clone();
      const cacheStatus = clonedResponse.headers.get("X-Cache-Status");

      if (cacheStatus) {
        setLastStatus(cacheStatus);
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return lastStatus;
}
