import React from 'react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: string) => void;
  selectedFilter: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  onFilterChange,
  selectedFilter
}) => {
  const filters = [
    { value: 'all', label: 'All Events' },
    { value: 'paid', label: 'Paid Events' },
    { value: 'free', label: 'Free Events' },
    { value: 'upcoming', label: 'Upcoming' }
  ];

  return (
    <div className="p-5 md:p-6 rounded-lg border border-border bg-surface shadow-sm mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-subtle w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-surface-alt focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-text-subtle text-text-base"
            />
          </div>
        </div>
        
        <div className="w-full md:w-auto">
          <select
            value={selectedFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-md border border-border bg-surface-alt focus:ring-2 focus:ring-primary/50 focus:border-primary text-text-base"
          >
            {filters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};