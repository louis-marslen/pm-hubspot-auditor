"use client";

import { useState } from "react";

interface PaginatedListProps<T> {
  items: T[];
  pageSize?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}

export function PaginatedList<T>({
  items,
  pageSize = 20,
  renderItem,
  emptyMessage = "Aucun problème détecté",
}: PaginatedListProps<T>) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / pageSize);
  const start = page * pageSize;
  const visible = items.slice(start, start + pageSize);

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
        <span className="text-green-500">✓</span>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">{visible.map((item, i) => renderItem(item, start + i))}</div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            {start + 1}–{Math.min(start + pageSize, items.length)} sur {items.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded border px-3 py-1 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="rounded border px-3 py-1 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
