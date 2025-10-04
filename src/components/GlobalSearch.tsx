"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X, Building2, Briefcase, Calendar } from 'lucide-react';
import { Contractor, Job, ScheduleEntry } from '@/types';

interface GlobalSearchProps {
  contractors: Contractor[];
  jobs: Job[];
  scheduleEntries: ScheduleEntry[];
  onSearchResultClick?: (type: 'contractor' | 'job' | 'schedule', id: string) => void;
}

interface SearchResult {
  id: string;
  type: 'contractor' | 'job' | 'schedule';
  title: string;
  subtitle: string;
  description?: string;
  icon: React.ReactNode;
  badge?: string;
}

export default function GlobalSearch({ 
  contractors, 
  jobs, 
  scheduleEntries, 
  onSearchResultClick 
}: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Search contractors
    contractors.forEach(contractor => {
      if (
        contractor.company.toLowerCase().includes(term) ||
        contractor.name.toLowerCase().includes(term) ||
        contractor.email?.toLowerCase().includes(term) ||
        contractor.phone?.toLowerCase().includes(term) ||
        contractor.specialty?.toLowerCase().includes(term)
      ) {
        results.push({
          id: contractor.id,
          type: 'contractor',
          title: contractor.company,
          subtitle: contractor.name,
          description: `${contractor.specialty || 'No specialty'} • ${contractor.email || 'No email'}`,
          icon: <Building2 className="h-4 w-4" />,
          badge: 'Company'
        });
      }
    });

    // Search jobs
    jobs.forEach(job => {
      if (
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term) ||
        job.tags.some(tag => tag.toLowerCase().includes(term)) ||
        job.notes?.toLowerCase().includes(term)
      ) {
        results.push({
          id: job.id,
          type: 'job',
          title: job.title,
          subtitle: job.location,
          description: `${job.description} • ${job.tags.join(', ')}`,
          icon: <Briefcase className="h-4 w-4" />,
          badge: 'Service'
        });
      }
    });

    // Search schedule entries
    scheduleEntries.forEach(entry => {
      const contractor = contractors.find(c => c.id === entry.contractorId);
      const job = jobs.find(j => j.id === entry.jobId);
      
      if (
        contractor?.company.toLowerCase().includes(term) ||
        contractor?.name.toLowerCase().includes(term) ||
        job?.title.toLowerCase().includes(term) ||
        job?.location.toLowerCase().includes(term) ||
        entry.notes?.toLowerCase().includes(term)
      ) {
        results.push({
          id: entry.id,
          type: 'schedule',
          title: `${contractor?.company || 'Unknown Company'} - ${job?.title || 'Unknown Job'}`,
          subtitle: new Date(entry.startTime).toLocaleDateString(),
          description: `${job?.location || 'Unknown Location'} • ${entry.status}`,
          icon: <Calendar className="h-4 w-4" />,
          badge: 'Appointment'
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [searchTerm, contractors, jobs, scheduleEntries]);

  const handleResultClick = useCallback((result: SearchResult) => {
    if (onSearchResultClick) {
      onSearchResultClick(result.type, result.id);
    }
    setIsOpen(false);
    setSearchTerm('');
    setSelectedIndex(-1);
  }, [onSearchResultClick]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            handleResultClick(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchResults, handleResultClick]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(e.target.value.length > 0);
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="relative w-full max-w-md mx-auto sm:mx-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search companies, services, appointments..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10 h-10 sm:h-9 text-sm"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Search Results</CardTitle>
            <CardDescription className="text-xs">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors touch-manipulation ${
                    index === selectedIndex
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 text-gray-500">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {result.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {result.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {result.subtitle}
                      </p>
                      {result.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {isOpen && searchTerm.length > 0 && searchResults.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border-2">
          <CardContent className="p-4 text-center">
            <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">No results found</p>
            <p className="text-xs text-gray-500 mt-1">
              Try searching for company names, service titles, or locations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
