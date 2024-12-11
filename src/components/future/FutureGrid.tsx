'use client';

import { useState, useEffect, useMemo } from 'react';
import { Artist } from '@/types/artist';
import './FutureGrid.css';

interface FutureGridProps {
  data: Artist[];
}

const FutureGrid = ({ data }: FutureGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Extract and sort metadata
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

  // Filter artists based on search and filters
  const filteredArtists = useMemo(() => {
    return data.filter(artist => {
      const matchesSearch = searchTerm === '' || 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.genres?.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGenre = !selectedGenre || artist.genres?.includes(selectedGenre);
      const matchesLocation = !selectedLocation || artist.location === selectedLocation;

      return matchesSearch && matchesGenre && matchesLocation;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [data, searchTerm, selectedGenre, selectedLocation]);

  // Handle card hover effects
  const handleCardHover = (artistName: string | null) => {
    setHoveredCard(artistName);
  };

  // Handle 3D card rotation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.future-card');
      cards.forEach((card: Element) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        (card as HTMLElement).style.transform = 
          `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="future-container">
      <div className="ambient-layer" />
      <div className="particle-field" />
      
      <div className="interface-container">
        <nav className="nav-panel">
          <div>
            <h1 className="interface-title">Afropop Network</h1>
            <p className="text-sm text-white/60">
              Exploring {data.length} artists across {locations.length} regions
            </p>
          </div>

          <div className="search-interface">
            <input
              type="text"
              className="search-field"
              placeholder="Search the network..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-system">
            <div className="filter-group">
              <h3 className="filter-title">Genres</h3>
              {genres.slice(0, 8).map(genre => (
                <button
                  key={genre}
                  className={`filter-option ${selectedGenre === genre ? 'active' : ''}`}
                  onClick={() => setSelectedGenre(genre === selectedGenre ? null : genre)}
                >
                  <span>{genre}</span>
                  <span className="text-white/40">
                    {data.filter(a => a.genres?.includes(genre)).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="filter-group">
              <h3 className="filter-title">Regions</h3>
              {locations.slice(0, 8).map(location => (
                <button
                  key={location}
                  className={`filter-option ${selectedLocation === location ? 'active' : ''}`}
                  onClick={() => setSelectedLocation(location === selectedLocation ? null : location)}
                >
                  <span>{location}</span>
                  <span className="text-white/40">
                    {data.filter(a => a.location === location).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main className="content-area">
          {filteredArtists.map((artist, index) => (
            <article
              key={artist.name}
              className="future-card"
              style={{ animationDelay: `${index * 0.05}s` }}
              onMouseEnter={() => handleCardHover(artist.name)}
              onMouseLeave={() => handleCardHover(null)}
            >
              <div className="card-content">
                <h2 className="artist-name">{artist.name}</h2>
                
                <div className="meta-info">
                  {artist.location && (
                    <>
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
                      <span>{artist.location}</span>
                    </>
                  )}
                </div>

                <div className="genre-chips">
                  {artist.genres?.map(genre => (
                    <button
                      key={genre}
                      className="genre-chip"
                      onClick={() => setSelectedGenre(genre === selectedGenre ? null : genre)}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                {hoveredCard === artist.name && (
                  <div className="connections">
                    {data
                      .filter(a => 
                        a.name !== artist.name && (
                          a.location === artist.location ||
                          a.genres?.some(g => artist.genres?.includes(g))
                        )
                      )
                      .slice(0, 3)
                      .map(related => (
                        <div key={related.name} className="text-sm text-white/40">
                          Connected with {related.name}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
};

export default FutureGrid;
