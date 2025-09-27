import { useState, useCallback } from "react";

interface UseServerPaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

interface UseServerPaginationReturn {
  // Estado da paginação
  currentPage: number;
  itemsPerPage: number;
  offset: number;

  // Controles de navegação
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setItemsPerPage: (items: number) => void;

  // Informações calculadas
  hasNextPage: (totalItems: number) => boolean;
  hasPreviousPage: () => boolean;
  totalPages: (totalItems: number) => number;
}

export function useServerPagination({
  itemsPerPage: initialItemsPerPage = 20,
  initialPage = 1,
}: UseServerPaginationOptions = {}): UseServerPaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Calcular offset baseado na página atual
  const offset = (currentPage - 1) * itemsPerPage;

  // Funções de navegação
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const previousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleSetItemsPerPage = useCallback((items: number) => {
    setItemsPerPage(Math.max(1, items));
    setCurrentPage(1); // Reset para primeira página
  }, []);

  // Funções de informação
  const totalPages = useCallback(
    (totalItems: number) => {
      return Math.ceil(totalItems / itemsPerPage);
    },
    [itemsPerPage]
  );

  const hasNextPage = useCallback(
    (totalItems: number) => {
      return currentPage < totalPages(totalItems);
    },
    [currentPage, totalPages]
  );

  const hasPreviousPage = useCallback(() => {
    return currentPage > 1;
  }, [currentPage]);

  return {
    currentPage,
    itemsPerPage,
    offset,
    goToPage,
    nextPage,
    previousPage,
    setItemsPerPage: handleSetItemsPerPage,
    hasNextPage,
    hasPreviousPage,
    totalPages,
  };
}
