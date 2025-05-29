// src/hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react';
import { enhancedApiClient } from '../services/apiClient';
import { PaginatedResponse } from '../types/api';
import { PaginationParams } from '../types/common';

/**
 * Custom hook for making API requests with loading and error states
 * 
 * @template T - The type of data returned by the API
 * @param {Function} apiCall - The API call function to execute
 * @param {any[]} dependencies - Dependencies for the useEffect hook
 * @param {boolean} immediate - Whether to execute the API call immediately
 * @returns {Object} The API call state and execution function
 */
export const useApi = <T>(
  apiCall: (...args: any[]) => Promise<T>,
  dependencies: any[] = [],
  immediate = true
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      console.error('API call error:', err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [...dependencies, execute, immediate]);

  return { data, loading, error, execute, setData };
};

/**
 * Custom hook for making paginated API requests
 * 
 * @template T - The type of data items returned by the API
 * @param {string} url - The API endpoint URL
 * @param {PaginationParams} initialParams - Initial pagination parameters
 * @param {any} additionalParams - Additional query parameters
 * @param {any[]} dependencies - Dependencies for the useEffect hook
 * @returns {Object} The paginated API call state and execution function
 */
export const usePaginatedApi = <T>(
  url: string,
  initialParams: PaginationParams = { page: 1, pageSize: 10 },
  additionalParams: any = {},
  dependencies: any[] = []
) => {
  const [params, setParams] = useState<PaginationParams & Record<string, any>>({
    ...initialParams,
    ...additionalParams
  });
  
  const [response, setResponse] = useState<PaginatedResponse<T> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (newParams?: Partial<PaginationParams & Record<string, any>>) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = newParams ? { ...params, ...newParams } : params;
      setParams(queryParams);
      
      const result = await enhancedApiClient.getPaginated<T>(url, queryParams);
      setResponse(result);
      return result;
    } catch (err) {
      console.error('Paginated API call error:', err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [url, params]);

  useEffect(() => {
    fetchData();
  }, [...dependencies, url]);

  const changePage = useCallback((page: number) => {
    return fetchData({ page });
  }, [fetchData]);

  const changePageSize = useCallback((pageSize: number) => {
    return fetchData({ pageSize, page: 1 });
  }, [fetchData]);

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data: response?.items || [],
    pagination: {
      page: response?.page || params.page,
      pageSize: response?.pageSize || params.pageSize,
      totalRows: response?.totalRows || 0,
      totalPages: response?.totalPages || 0
    },
    loading,
    error,
    changePage,
    changePageSize,
    refresh,
    fetchData
  };
};

export default useApi;
