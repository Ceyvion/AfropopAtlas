'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Artist, ColorScheme } from '@/types/artist';
import { getArtistColors, getGenreColor } from '@/utils/colorTags';
import './ArtistModal.css';

interface ArtistModalProps {
  artist: Artist;
  onClose: () => void;
  relatedArtists: Artist[];
  onArtistClick: (artist: Artist) => void;
}

function generateSynopsis(artist: Artist, relatedArtists: Artist[]): string {
  const locationPhrase = artist.location 
    ? `Based in the vibrant musical landscape of ${artist.location}`
    : '';
  
  // Process genres with sophisticated descriptions
  const uniqueGenres = new Set(artist.genres);
  const mainGenres = Array.from(uniqueGenres).slice(0, 3);
  const genrePhrase = mainGenres.length > 0 
    ? (mainGenres.length === 1 
      ? `pioneering innovative approaches to ${mainGenres[0]}`
      : mainGenres.length === 2 
        ? `masterfully fusing ${mainGenres[0]} with ${mainGenres[1]} to create groundbreaking sonic landscapes`
        : `crafting a revolutionary blend of ${mainGenres[0]}, ${mainGenres[1]}, and ${mainGenres[2]}`)
    : '';

  // Find artists from the same region with shared genres
  const regionalArtists = relatedArtists
    .filter(a => a.location === artist.location)
    .sort((a, b) => {
      const aCommon = a.genres?.filter(g => artist.genres?.includes(g)).length || 0;
      const bCommon = b.genres?.filter(g => artist.genres?.includes(g)).length || 0;
      return bCommon - aCommon;
    })
    .slice(0, 2);

  const regionalPhrase = regionalArtists.length > 0
    ? `A visionary force in the evolving ${artist.location} scene, sharing creative energy with ${
        regionalArtists.length === 1
          ? regionalArtists[0].name
          : `both ${regionalArtists[0].name} and ${regionalArtists[1].name}`
      }`
    : '';

  // Find artists with most genre overlap and musical influence
  const genreConnections = relatedArtists
    .map(a => ({
      artist: a,
      commonGenres: a.genres?.filter(g => artist.genres?.includes(g)).length || 0
    }))
    .sort((a, b) => b.commonGenres - a.commonGenres)
    .slice(0, 2)
    .filter(c => c.commonGenres > 0);

  const connectionPhrase = genreConnections.length > 0
    ? `Drawing inspiration from and exchanging futuristic musical ideas with ${
        genreConnections.length === 1
          ? genreConnections[0].artist.name
          : `both ${genreConnections[0].artist.name} and ${genreConnections[1].artist.name}`
      }`
    : '';

  // Add artistic vision and innovation description
  const artisticVision = uniqueGenres.size > 3 
    ? `A boundary-pushing artist whose work transcends traditional genres, exploring ${uniqueGenres.size} distinct sonic territories while redefining the future of African music` 
    : uniqueGenres.size > 1
    ? `Known for seamlessly weaving together diverse musical traditions into forward-thinking sonic tapestries`
    : `Dedicated to evolving and reimagining their signature sound for the next generation of African music`;

  // Add cultural impact and genre influence
  const culturalImpact = mainGenres.length > 2
    ? `Their innovative approach to ${mainGenres.slice(0, -1).join(', ')}, and ${mainGenres[mainGenres.length - 1]} represents a bold vision for the future of these genres`
    : '';

  // Add futuristic vision
  const futuristicVision = `Their work stands at the intersection of tradition and innovation, helping shape the evolving narrative of contemporary African music`;

  const phrases = [
    locationPhrase,
    genrePhrase,
    artisticVision,
    regionalPhrase,
    connectionPhrase,
    culturalImpact,
    futuristicVision
  ].filter(Boolean);

  // Combine phrases with natural flow
  return phrases
    .reduce((acc, phrase, i) => {
      if (i === 0) return phrase;
      if (i === phrases.length - 1) return `${acc}, and ${phrase.toLowerCase()}`;
      return `${acc}, ${phrase.toLowerCase()}`;
    }, '') + '.';
}

function ArtistModal({ artist, onClose, relatedArtists, onArtistClick }: ArtistModalProps) {
  const colors = getArtistColors(artist);
  const synopsis = generateSynopsis(artist, relatedArtists);
  const modalRef = useRef<HTMLDivElement>(null);

  // Calculate genre relationships
  const genreConnections = useMemo(() => {
    const connections = new Map<string, Set<string>>();
    artist.genres?.forEach(genre => {
      connections.set(genre, new Set<string>());
      relatedArtists.forEach(related => {
        if (related.genres?.includes(genre)) {
          connections.get(genre)?.add(related.name);
        }
      });
    });
    return connections;
  }, [artist, relatedArtists]);

  // Handle keyboard interactions and click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content" 
        ref={modalRef}
        style={{ '--artist-color': colors.primary, '--artist-accent': colors.accent } as React.CSSProperties}
      >
        <button 
          className="modal-close" 
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <header className="modal-header">
          <h2 className="modal-title">
            {artist.name}
          </h2>
          <div className="modal-subtitle">
            {artist.location}
          </div>
        </header>

        <div className="modal-body">
          <div className="modal-section">
            <h3 className="modal-section-title">Synopsis</h3>
            <p className="artist-synopsis">{synopsis}</p>
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">Genres</h3>
            <div className="genre-list">
              {artist.genres?.map(genre => {
                const genreColors = getGenreColor(genre);
                const connectionCount = genreConnections.get(genre)?.size || 0;
                return (
                  <span 
                    key={genre} 
                    className="genre-tag"
                    style={{
                      '--genre-color': genreColors.primary,
                      '--genre-accent': genreColors.accent,
                      '--genre-gradient': genreColors.gradient,
                      '--genre-background': genreColors.background
                    } as React.CSSProperties}
                  >
                    <span className="genre-name">{genre}</span>
                    {connectionCount > 0 && (
                      <span className="genre-connection-count">
                        {connectionCount} connection{connectionCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {relatedArtists.length > 0 && (
            <div className="modal-section">
              <h3 className="modal-section-title">Related Artists</h3>
              <div className="related-artists">
                {relatedArtists.map(related => {
                  const relatedColors = getArtistColors(related);
                  const commonGenres = related.genres?.filter(g => artist.genres?.includes(g)) || [];
                  const connectionStrength = (commonGenres.length / Math.max(artist.genres?.length || 1, related.genres?.length || 1)) * 100;
                  
                  return (
                    <button 
                      key={related.name}
                      className="related-artist"
                      onClick={() => {
                        onClose();
                        onArtistClick(related);
                      }}
                      style={{ 
                        '--artist-color': relatedColors.primary, 
                        '--artist-accent': relatedColors.accent,
                        '--artist-gradient': relatedColors.gradient,
                        '--connection-strength': `${connectionStrength}%`
                      } as React.CSSProperties}
                    >
                      <div className="related-artist-name">{related.name}</div>
                      <div className="related-artist-meta">
                        <span className="location">{related.location}</span>
                        <span className="meta-divider">•</span>
                        <span className="connection-info">
                          {commonGenres.length} shared genre{commonGenres.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="connection-strength-bar" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArtistModal;
