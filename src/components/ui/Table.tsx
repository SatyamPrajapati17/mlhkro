import React from 'react';
import { clsx } from 'clsx';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'NO RECORDS FOUND',
  className,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className={clsx('w-full overflow-x-auto border-2 border-wt-white bg-wt-black', className)}>
      <table className="w-full border-collapse font-mono text-sm text-left">
        <thead className="bg-wt-black border-b-2 border-wt-white sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 font-bold text-xs uppercase tracking-wider text-wt-yellow select-none border-r border-wt-white/20 last:border-r-0',
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-wt-white/15">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-wt-gray font-mono uppercase tracking-widest text-xs"
              >
                // {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={clsx(
                  'transition-colors duration-75 relative group',
                  onRowClick && 'cursor-pointer hover:bg-wt-white/10 hover:border-l-4 hover:border-l-wt-yellow'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      'px-4 py-3.5 text-wt-white border-r border-wt-white/10 last:border-r-0',
                      col.align === 'right' ? 'text-right font-mono' : col.align === 'center' ? 'text-center' : 'text-left'
                    )}
                  >
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
