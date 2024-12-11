'use client';

import { useEffect, useState } from 'react';
import { Artist } from '../types/artist';
import CreativeGrid from '../components/creative/CreativeGrid';

export default function Home() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    let phaseInterval: NodeJS.Timeout;

    if (loading) {
      phaseInterval = setInterval(() => {
        setLoadingPhase(prev => (prev + 1) % 4);
      }, 2000);
    }

    return () => {
      if (phaseInterval) clearInterval(phaseInterval);
    };
  }, [loading]);

  const loadingMessages = [
    'Initializing Network Connections',
    'Mapping Sonic Landscapes',
    'Calibrating Genre Harmonics',
    'Synchronizing Artist Data'
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/data/AfropopArtists.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Filter and process the data
        const validArtists = data
          .filter((artist: Artist) => 
            artist.name !== 'UNKNOWN' && 
            artist.location !== 'UNKNOWN' && 
            artist.genres && 
            artist.genres.length > 0 &&
            !artist.genres.includes('UNKNOWN')
          )
          .map((artist: Artist) => ({
            ...artist,
            genres: artist.genres.filter((genre: string) => genre !== 'UNKNOWN')
          }));

        setArtists(validArtists);
        setLoading(false);
        // Add a slight delay before removing the initial load state
        setTimeout(() => setIsInitialLoad(false), 600);
      } catch (error) {
        console.error('Error loading artist data:', error);
        setError('Failed to load artist data. Please try again later.');
        setLoading(false);
        setIsInitialLoad(false);
      }
    }

    fetchData();
  }, []);

  if (loading || isInitialLoad) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
        <div className="relative flex flex-col items-center">
          {/* Animated Pattern */}
          <div className="absolute inset-0 grid grid-cols-8 gap-px opacity-20">
            {Array.from({ length: 64 }).map((_, i) => (
              <div 
                key={i}
                className="w-8 h-8 bg-white/5"
                style={{
                  animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>

          {/* Loading Indicator */}
          <div className="relative">
            <div className="w-px h-16 bg-white/20">
              <div className="w-1 h-4 bg-white absolute top-0 animate-loader" />
            </div>
            <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)]" />
          </div>

          {/* Loading Text */}
          <div className="mt-12 flex flex-col items-center relative">
            <div className="font-mono text-xs tracking-wider text-white/40 uppercase">
              {loadingMessages[loadingPhase]}
            </div>
            <div className="mt-2 text-[10px] font-mono text-white/20 tracking-widest uppercase">
              System Initializing
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/5" />
          <div className="relative">
            <div className="text-white/40 mb-6 flex flex-col items-center">
              <div className="w-px h-12 bg-red-500/20 relative mb-4">
                <div className="w-full h-1 bg-red-500/40 absolute top-0" />
                <div className="w-full h-1 bg-red-500/40 absolute bottom-0" />
              </div>
              <h2 className="font-mono text-xs tracking-wider text-center uppercase">System Error</h2>
              <div className="mt-1 text-[10px] font-mono tracking-widest text-white/20 uppercase">Connection Failed</div>
            </div>
            <p className="text-white/60 text-center text-sm mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 glass glass-hover
                       rounded-md text-white/80 text-sm font-mono
                       transition-all duration-200 relative
                       hover:transform hover:translate-y-[-1px]
                       active:transform active:translate-y-[1px]"
            >
              <div className="absolute inset-0 bg-white/[0.01]" />
              <span className="relative">Retry Connection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <CreativeGrid data={artists} />
    </div>
  );
}
