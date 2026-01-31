"use client";
import { useState } from 'react';

const Table = ({ columns, data, sortable = true, hoverable = true, striped = false, actions }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (columnKey) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedData = getSortedData();

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-gray-600 transition-colors duration-150">
          <path d="M8 4L11 7H5L8 4Z" fill="currentColor" opacity="0.3"/>
          <path d="M8 12L5 9H11L8 12Z" fill="currentColor" opacity="0.3"/>
        </svg>
      );
    }
    
    if (sortConfig.direction === 'asc') {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-gray-600 transition-colors duration-150">
          <path d="M8 4L11 7H5L8 4Z" fill="currentColor"/>
        </svg>
      );
    }
    
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-gray-600 transition-colors duration-150">
        <path d="M8 12L5 9H11L8 12Z" fill="currentColor"/>
      </svg>
    );
  };

  const getAlignmentClass = (align) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-300">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr className="border-b-2 border-gray-300">
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable !== false && sortable && handleSort(column.key)}
                className={`px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap select-none transition-colors duration-150 ${
                  column.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-300' : ''
                } ${getAlignmentClass(column.align)}`}
                style={{ width: column.width }}
              >
                <div className="flex items-center gap-2">
                  <span>{column.header}</span>
                  {column.sortable !== false && sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
            {actions && (
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-5 py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18"/>
                    <path d="M9 21V9"/>
                  </svg>
                  <p className="text-sm font-medium m-0">No data available</p>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((item, index) => (
              <tr 
                key={item.id || index}
                className={`border-b border-gray-300 transition-colors duration-150 last:border-b-0 ${
                  hoverable ? 'hover:bg-gray-100' : ''
                } ${striped && index % 2 === 1 ? 'bg-gray-50/50' : ''}`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-5 py-4 text-sm text-black leading-relaxed ${getAlignmentClass(column.align)}`}
                  >
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-5 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {actions(item)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;