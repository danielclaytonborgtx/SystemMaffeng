"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface VirtualPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  startIndex: number;
  endIndex: number;
  isLoading?: boolean;
  showItemsPerPageSelector?: boolean;
  itemsPerPageOptions?: number[];
}

export function VirtualPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  startIndex,
  endIndex,
  isLoading = false,
  showItemsPerPageSelector = true,
  itemsPerPageOptions = [10, 20, 50, 100],
}: VirtualPaginationProps) {
  // Calcular páginas visíveis
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1 && !showItemsPerPageSelector) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-gray-50/50">
      {/* Informações de exibição */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Mostrando <span className="font-medium">{startIndex}</span> a{" "}
          <span className="font-medium">{endIndex}</span> de{" "}
          <span className="font-medium">{totalItems}</span> itens
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Seletor de itens por página */}
        {showItemsPerPageSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Itens por página:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navegação de páginas */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Primeira página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1 || isLoading}
              className="cursor-pointer"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Página anterior */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Páginas visíveis */}
            {visiblePages.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`dots-${index}`}
                    className="px-2 py-1 text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                );
              }

              const pageNumber = page as number;
              const isActive = pageNumber === currentPage;

              return (
                <Button
                  key={pageNumber}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  disabled={isLoading}
                  className={`cursor-pointer min-w-[40px] ${
                    isActive
                      ? "bg-gray-800 text-white hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {pageNumber}
                </Button>
              );
            })}

            {/* Próxima página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Última página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              className="cursor-pointer"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
