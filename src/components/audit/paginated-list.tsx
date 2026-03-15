"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";

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
      <div className="flex items-center gap-2 rounded-md bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.15)] px-4 py-2 text-sm text-green-300">
        <CircleCheck className="h-4 w-4 text-green-400" />
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
              className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1 text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition-colors"
            >
              ← Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1 text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition-colors"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
