import { useState, useMemo, useCallback, useEffect } from "react";

interface UseVirtualPaginationOptions<T> {
  data: T[];
  itemsPerPage?: number;
  searchTerm?: string;
  searchFields?: (keyof T)[];
  filters?: Record<string, any>;
}

interface UseVirtualPaginationReturn<T> {
  // Dados paginados
  paginatedData: T[];

  // Informações de paginação
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;

  // Controles de navegação
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;

  // Controles de itens por página
  setItemsPerPage: (items: number) => void;

  // Informações de exibição
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // Estados de carregamento
  isLoading: boolean;
}

export function useVirtualPagination<T>({
  data,
  itemsPerPage: initialItemsPerPage = 20,
  searchTerm = "",
  searchFields = [],
  filters = {},
}: UseVirtualPaginationOptions<T>): UseVirtualPaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Filtrar dados baseado na busca e filtros
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Aplicar busca se houver termo de busca e campos definidos
    if (searchTerm && searchFields.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        return searchFields.some((field) => {
          const value = item[field];
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchLower);
          }
          if (typeof value === "number") {
            return value.toString().includes(searchLower);
          }
          return false;
        });
      });
    }

    // Aplicar filtros adicionais
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        filtered = filtered.filter((item) => {
          const itemValue = (item as any)[key];
          return itemValue === value;
        });
      }
    });

    return filtered;
  }, [data, searchTerm, searchFields, filters]);

  // Calcular informações de paginação
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Dados paginados
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, startIndex, endIndex]);

  // Estados de navegação
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Funções de navegação
  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  // Função para alterar itens por página
  const handleSetItemsPerPage = useCallback((items: number) => {
    setItemsPerPage(Math.max(1, items));
    setCurrentPage(1); // Reset para primeira página
  }, []);

  // Reset para primeira página quando dados ou filtros mudarem
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return {
    // Dados paginados
    paginatedData,

    // Informações de paginação
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,

    // Controles de navegação
    goToPage,
    nextPage,
    previousPage,

    // Controles de itens por página
    setItemsPerPage: handleSetItemsPerPage,

    // Informações de exibição
    startIndex: startIndex + 1, // Mostrar índice baseado em 1
    endIndex,
    hasNextPage,
    hasPreviousPage,

    // Estados de carregamento
    isLoading: false,
  };
}
