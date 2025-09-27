"use client";

import { useState, useEffect, useCallback } from "react";
import { employeeService } from "@/lib/supabase-services";
import { Employee } from "@/lib/supabase";

interface UseEmployeesPaginatedOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  department?: string;
}

interface UseEmployeesPaginatedReturn {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setDepartment: (department: string) => void;
}

export function useEmployeesPaginated(
  options: UseEmployeesPaginatedOptions = {}
): UseEmployeesPaginatedReturn {
  const [data, setData] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(options.page || 1);
  const [limit, setLimit] = useState(options.limit || 20);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(options.search || "");
  const [status, setStatus] = useState(options.status || "");
  const [department, setDepartment] = useState(options.department || "");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await employeeService.getPaginated({
        page,
        limit,
        search,
        status,
        department,
      });

      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar colaboradores"
      );
      console.error("Erro ao buscar colaboradores:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, department]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(Math.max(1, newLimit));
    setPage(1); // Reset para primeira página
  }, []);

  const handleSetSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset para primeira página
  }, []);

  const handleSetStatus = useCallback((newStatus: string) => {
    setStatus(newStatus);
    setPage(1); // Reset para primeira página
  }, []);

  const handleSetDepartment = useCallback((newDepartment: string) => {
    setDepartment(newDepartment);
    setPage(1); // Reset para primeira página
  }, []);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    refetch: fetchData,
    setPage: handleSetPage,
    setLimit: handleSetLimit,
    setSearch: handleSetSearch,
    setStatus: handleSetStatus,
    setDepartment: handleSetDepartment,
  };
}
