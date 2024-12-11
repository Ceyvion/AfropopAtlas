'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import './DataPanel.css';

type TabType = 'artists' | 'countries' | 'genres';

interface DataPanelProps {
  onSelect?: (type: TabType, item: string) => void;
  className?: string;
}

const DataPanel = ({ onSelect, className = '' }: DataPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('artists');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<{
    artists: string[];
    countries: string[];
    genres: string[];
  }>({
    artists: [],
    countries: [],
    genres: [],
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [artistsRes, countriesRes, genresRes] = await Promise.all([
          fetch('/data/AfropopArtistList.json'),
          fetch('/data/AfropopFullCountryList.json'),
          fetch('/data/AfropopFullGenreList.json'),
        ]);

        const [artists, countries, genres] = await Promise.all([
          artistsRes.json(),
          countriesRes.json(),
          genresRes.json(),
        ]);

        setData({ artists, countries, genres });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return {
      artists: data.artists.filter(item => 
        item.toLowerCase().includes(term)
      ),
      countries: data.countries.filter(item => 
        item.toLowerCase().includes(term)
      ),
      genres: data.genres.filter(item => 
        item.toLowerCase().includes(term)
      ),
    };
  }, [data, searchTerm]);

  // Virtual list setup
  const parentRef = useRef<HTMLDivElement>(null);
  const currentList = filteredData[activeTab];
  
  const virtualizer = useVirtualizer({
    count: currentList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const handleSelect = (item: string) => {
    onSelect?.(activeTab, item);
  };

  return (
    <div className={`data-panel ${className}`}>
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          aria-label="Search"
        />
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'artists' ? 'active' : ''}`}
          onClick={() => setActiveTab('artists')}
        >
          Artists ({filteredData.artists.length})
        </button>
        <button
          className={`tab ${activeTab === 'countries' ? 'active' : ''}`}
          onClick={() => setActiveTab('countries')}
        >
          Countries ({filteredData.countries.length})
        </button>
        <button
          className={`tab ${activeTab === 'genres' ? 'active' : ''}`}
          onClick={() => setActiveTab('genres')}
        >
          Genres ({filteredData.genres.length})
        </button>
      </div>

      {/* Virtualized List */}
      <div
        ref={parentRef}
        className="list-container"
        style={{
          height: 'calc(100vh - 200px)',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              className="list-item"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              onClick={() => handleSelect(currentList[virtualItem.index])}
            >
              {currentList[virtualItem.index]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataPanel;
