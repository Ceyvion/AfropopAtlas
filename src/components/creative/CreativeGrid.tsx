'use client';

import { useState, useMemo, useCallback } from 'react';
import { Artist } from '@/types/artist';
import { getGenreColor, getArtistColors } from '@/utils/colorTags';
import ArtistModal from './ArtistModal';
import './CreativeGrid.css';

const SearchIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="search-icon"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ConnectionIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
  </svg>
);

interface CreativeGridProps {
  data: Artist[];
}

const CreativeGrid = ({ data }: CreativeGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [hoveredArtist, setHoveredArtist] = useState<string | null>(null);

  // Process metadata and colors with memoization
  const { genres, locations, genreCounts, locationCounts, genreColors } = useMemo(() => {
    const genreMap = new Map<string, number>();
    const locationMap = new Map<string, number>();
    const processedArtists = new Set<string>();
    const genreColorMap = new Map<string, ReturnType<typeof getGenreColor>>();

    data.forEach(artist => {
      if (!processedArtists.has(artist.name)) {
        processedArtists.add(artist.name);
        if (artist.location) {
          locationMap.set(artist.location, (locationMap.get(artist.location) || 0) + 1);
        }
        artist.genres?.forEach(genre => {
          genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
          if (!genreColorMap.has(genre)) {
            genreColorMap.set(genre, getGenreColor(genre));
          }
        });
      }
    });

    return {
      genres: Array.from(genreMap.keys()).sort(),
      locations: Array.from(locationMap.keys()).sort(),
      genreCounts: genreMap,
      locationCounts: locationMap,
      genreColors: genreColorMap
    };
  }, [data]);

  // Filter artists with memoization
  const filteredArtists = useMemo(() => {
    return data.filter(artist => {
      const matchesSearch = searchTerm === '' || 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.genres?.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGenre = !selectedGenre || artist.genres?.includes(selectedGenre);
      const matchesLocation = !selectedLocation || artist.location === selectedLocation;

      return matchesSearch && matchesGenre && matchesLocation;
    });
  }, [data, searchTerm, selectedGenre, selectedLocation]);

  // Get related artists with memoization
  const getRelatedArtists = useCallback((artist: Artist) => {
    return data
      .filter(a => 
        a.name !== artist.name && (
          a.location === artist.location ||
          a.genres?.some(g => artist.genres?.includes(g))
        )
      )
      .sort((a, b) => {
        const aCommonGenres = a.genres?.filter(g => artist.genres?.includes(g)).length || 0;
        const bCommonGenres = b.genres?.filter(g => artist.genres?.includes(g)).length || 0;
        return bCommonGenres - aCommonGenres;
      })
      .slice(0, 5);
  }, [data]);

  // Handle filter interactions
  const handleGenreSelect = useCallback((genre: string) => {
    setSelectedGenre(prev => prev === genre ? null : genre);
    setSelectedLocation(null);
  }, []);

  const handleLocationSelect = useCallback((location: string) => {
    setSelectedLocation(prev => prev === location ? null : location);
    setSelectedGenre(null);
  }, []);

  return (
    <div className="creative-container">
      <div className="grid-pattern" />
      
      <div className="interface-layout">
        <aside className="side-panel">
          <div className="brand">
            <h1 className="brand-title">Afropop Network</h1>
            <div className="brand-subtitle">
              {filteredArtists.length} Artists • {locations.length} Regions • {genres.length} Genres
            </div>
          </div>

          <div className="search-container">
            <SearchIcon />
            <input
              type="text"
              className="search-field"
              placeholder="Search network..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="filter-group">
            <div className="filter-label">Popular Genres</div>
            {genres
              .sort((a, b) => (genreCounts.get(b) || 0) - (genreCounts.get(a) || 0))
              .slice(0, 12)
              .map(genre => {
                const colors = genreColors.get(genre);
                return (
                  <button
                    key={`genre-${genre}`}
                    className={`filter-option ${selectedGenre === genre ? 'active' : ''}`}
                    onClick={() => handleGenreSelect(genre)}
                    style={{
                      '--genre-color': colors?.primary,
                      '--genre-accent': colors?.accent,
                      '--genre-gradient': colors?.gradient,
                      '--genre-background': colors?.background
                    } as React.CSSProperties}
                  >
                    <span>{genre}</span>
                    <span className="filter-count">{genreCounts.get(genre)}</span>
                  </button>
                );
              })}
          </div>

          <div className="filter-group">
            <div className="filter-label">Regions</div>
            {locations
              .sort((a, b) => (locationCounts.get(b) || 0) - (locationCounts.get(a) || 0))
              .slice(0, 8)
              .map(location => (
                <button
                  key={`location-${location}`}
                  className={`filter-option ${selectedLocation === location ? 'active' : ''}`}
                  onClick={() => handleLocationSelect(location)}
                >
                  <span>{location}</span>
                  <span className="filter-count">{locationCounts.get(location)}</span>
                </button>
              ))}
          </div>
        </aside>

        <main className="content-grid">
          {filteredArtists.map((artist, index) => {
            const artistKey = `${artist.name}-${artist.location}-${index}`;
            const colors = getArtistColors(artist);
            const relatedCount = getRelatedArtists(artist).length;
            const isHovered = hoveredArtist === artistKey;
            
            return (
              <article
                key={artistKey}
                className="artist-item"
                onClick={() => setSelectedArtist(artist)}
                onMouseEnter={() => setHoveredArtist(artistKey)}
                onMouseLeave={() => setHoveredArtist(null)}
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  '--artist-color': colors.primary,
                  '--artist-accent': colors.accent,
                  '--artist-gradient': `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                  '--artist-background': colors.background
                } as React.CSSProperties}
              >
                <div className="artist-content">
                  <div className="artist-header">
                    <h2 className="artist-name">{artist.name}</h2>
                    <div className="artist-meta">
                      {artist.location && (
                        <span className="location-tag">
                          {artist.location}
                        </span>
                      )}
                      <span className="meta-divider">•</span>
                      <span className="connection-count">
                        <ConnectionIcon />
                        {relatedCount} connection{relatedCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="genre-list">
                    {artist.genres?.slice(0, isHovered ? undefined : 3).map(genre => {
                      const genreColors = getGenreColor(genre);
                      return (
                        <button
                          key={`${artistKey}-genre-${genre}`}
                          className="genre-tag"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenreSelect(genre);
                          }}
                          style={{
                            '--genre-color': genreColors.primary,
                            '--genre-accent': genreColors.accent,
                            '--genre-gradient': `linear-gradient(135deg, ${genreColors.primary} 0%, ${genreColors.accent} 100%)`,
                            '--genre-background': genreColors.background
                          } as React.CSSProperties}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </main>
      </div>

      {selectedArtist && (
        <ArtistModal
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
          relatedArtists={getRelatedArtists(selectedArtist)}
          onArtistClick={setSelectedArtist}
        />
      )}
    </div>
  );
};

export default CreativeGrid;
