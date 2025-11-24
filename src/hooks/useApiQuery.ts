import { useQuery } from '@tanstack/react-query';
import { apiCall } from '../config/api';

type UseApiQueryParams<TData> = {
  endpoint: string;
  queryKey?: readonly unknown[];
  requestInit?: RequestInit;
  select?: (data: any) => TData;
  enabled?: boolean;
  staleTime?: number;
};

export function useApiQuery<TData = any>({
  endpoint,
  queryKey,
  requestInit,
  select,
  enabled = true,
  staleTime
}: UseApiQueryParams<TData>) {
  return useQuery<TData>({
    queryKey: queryKey ?? [endpoint, requestInit],
    queryFn: async () => apiCall(endpoint, requestInit),
    select,
    enabled,
    staleTime
  });
}