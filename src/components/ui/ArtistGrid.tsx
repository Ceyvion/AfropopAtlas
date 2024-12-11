'use client';

import { useState, useMemo } from 'react';
import { Artist } from '@/types/artist';
import './ArtistGrid.css';

interface ArtistGridProps {
  data: Artist[];
}

const ArtistGrid = ({ data }: ArtistGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'genre' | 'location'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Extract unique genres and locations
  const { genres, locations } = useMemo(() => {
    const genreSet = new Set<string>();
    const locationSet = new Set<string>();

    data.forEach(artist => {
      if (artist.location) locationSet.add(artist.location);
      artist.genres?.forEach(genre => genreSet.add(genre));
    });

    return {
      genres: Array.from(genreSet).sort(),
      locations: Array.from(locationSet).sort()
    };
  }, [data]);

  // Filter and sort artists
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

  // Get related artists based on shared genres or location
  const getRelatedArtists = (artist: Artist) => {
    return data.filter(a => 
      a.name !== artist.name && (
        a.location === artist.location ||
        a.genres?.some(genre => artist.genres?.includes(genre))
      )
    ).slice(0, 3);
  };

  return (
    <div className="grid-container">
      <header className="grid-header">
        <h1 className="grid-title">Afropop Network</h1>
        <p className="grid-subtitle">
          A curated collection of {data.length} artists, spanning {locations.length} countries 
          and {genres.length} genres. Explore the rich tapestry of Afropop music through this 
          interactive catalogue.
        </p>
      </header>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search artists, genres, or locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-bar">
        <button
          className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setActiveFilter('all');
            setSelectedGenre(null);
            setSelectedLocation(null);
          }}
        >
          All
        </button>
        <button
          className={`filter-button ${activeFilter === 'genre' ? 'active' : ''}`}
          onClick={() => setActiveFilter('genre')}
        >
          By Genre
        </button>
        <button
          className={`filter-button ${activeFilter === 'location' ? 'active' : ''}`}
          onClick={() => setActiveFilter('location')}
        >
          By Location
        </button>

        {activeFilter === 'genre' && (
          genres.map(genre => (
            <button
              key={genre}
              className={`filter-button ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => setSelectedGenre(genre === selectedGenre ? null : genre)}
            >
              {genre}
            </button>
          ))
        )}

        {activeFilter === 'location' && (
          locations.map(location => (
            <button
              key={location}
              className={`filter-button ${selectedLocation === location ? 'active' : ''}`}
              onClick={() => setSelectedLocation(location === selectedLocation ? null : location)}
            >
              {location}
            </button>
          ))
        )}
      </div>

      <div className="grid-content">
        {filteredArtists.map(artist => {
          const relatedArtists = getRelatedArtists(artist);
          
          return (
            <div key={artist.name} className="artist-card">
              <h2 className="artist-name">{artist.name}</h2>
              {artist.location && (
                <div className="artist-location">
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {artist.location}
                </div>
              )}
              <div className="artist-genres">
                {artist.genres?.map(genre => (
                  <span 
                    key={genre} 
                    className="genre-tag"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFilter('genre');
                      setSelectedGenre(genre);
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
              {relatedArtists.length > 0 && (
                <div className="artist-connections">
                  Connected with {relatedArtists.map(a => a.name).join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArtistGrid;
