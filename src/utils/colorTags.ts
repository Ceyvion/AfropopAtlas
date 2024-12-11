type ColorScheme = {
  primary: string;
  accent: string;
  gradient: string;
  background: string;
};

// Afrofuturistic color palettes inspired by African art and contemporary design
const colorPalettes: ColorScheme[] = [
  // Sunset Gold
  {
    primary: '#FFB627',
    accent: '#FF7A48',
    gradient: 'linear-gradient(135deg, #FFB627 0%, #FF7A48 100%)',
    background: 'rgba(255, 182, 39, 0.05)'
  },
  // Royal Purple
  {
    primary: '#9D4EDD',
    accent: '#5A189A',
    gradient: 'linear-gradient(135deg, #9D4EDD 0%, #5A189A 100%)',
    background: 'rgba(157, 78, 221, 0.05)'
  },
  // Ocean Teal
  {
    primary: '#2CB1BC',
    accent: '#14919B',
    gradient: 'linear-gradient(135deg, #2CB1BC 0%, #14919B 100%)',
    background: 'rgba(44, 177, 188, 0.05)'
  },
  // Desert Rose
  {
    primary: '#FF6B6B',
    accent: '#EE5253',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)',
    background: 'rgba(255, 107, 107, 0.05)'
  },
  // Forest Emerald
  {
    primary: '#00B894',
    accent: '#00A07D',
    gradient: 'linear-gradient(135deg, #00B894 0%, #00A07D 100%)',
    background: 'rgba(0, 184, 148, 0.05)'
  }
];

// Genre-specific color mappings
const genreColorMap: Record<string, ColorScheme> = {
  'Afrobeats': {
    primary: '#FFD93D',
    accent: '#FF9F1C',
    gradient: 'linear-gradient(135deg, #FFD93D 0%, #FF9F1C 100%)',
    background: 'rgba(255, 217, 61, 0.05)'
  },
  'Highlife': {
    primary: '#4CAF50',
    accent: '#2E7D32',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    background: 'rgba(76, 175, 80, 0.05)'
  },
  'Afro-Fusion': {
    primary: '#9C27B0',
    accent: '#6A1B9A',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #6A1B9A 100%)',
    background: 'rgba(156, 39, 176, 0.05)'
  },
  'Afro-Pop': {
    primary: '#1E88E5',
    accent: '#1565C0',
    gradient: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
    background: 'rgba(30, 136, 229, 0.05)'
  },
  'Afro-Soul': {
    primary: '#E91E63',
    accent: '#C2185B',
    gradient: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
    background: 'rgba(233, 30, 99, 0.05)'
  },
  'Afro-Jazz': {
    primary: '#FF5722',
    accent: '#E64A19',
    gradient: 'linear-gradient(135deg, #FF5722 0%, #E64A19 100%)',
    background: 'rgba(255, 87, 34, 0.05)'
  }
};

// Generate a deterministic hash from a string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get color scheme for a genre with fallback to dynamic generation
export function getGenreColor(genre: string): ColorScheme {
  // Use predefined colors for known genres
  if (genreColorMap[genre]) {
    return genreColorMap[genre];
  }

  // Generate deterministic color for unknown genres
  const hash = hashString(genre);
  const paletteIndex = hash % colorPalettes.length;
  return colorPalettes[paletteIndex];
}

// Generate harmonious colors for an artist based on their genres
export function getArtistColors(artist: { genres?: string[] }): ColorScheme {
  if (!artist.genres || artist.genres.length === 0) {
    return colorPalettes[0];
  }

  // Use the first genre as the primary influence
  const primaryGenre = artist.genres[0];
  const primaryColors = getGenreColor(primaryGenre);

  // If there are multiple genres, create a unique blend
  if (artist.genres.length > 1) {
    const secondaryGenre = artist.genres[1];
    const secondaryColors = getGenreColor(secondaryGenre);

    // Create a unique gradient based on both genres
    return {
      primary: primaryColors.primary,
      accent: secondaryColors.primary,
      gradient: `linear-gradient(135deg, ${primaryColors.primary} 0%, ${secondaryColors.primary} 100%)`,
      background: `linear-gradient(135deg, ${adjustAlpha(primaryColors.primary, 0.05)} 0%, ${adjustAlpha(secondaryColors.primary, 0.05)} 100%)`
    };
  }

  return primaryColors;
}

// Helper function to adjust color alpha
function adjustAlpha(color: string, alpha: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Generate a color scheme based on location
export function getLocationColor(location: string): ColorScheme {
  const hash = hashString(location);
  const paletteIndex = hash % colorPalettes.length;
  const baseColors = colorPalettes[paletteIndex];

  return {
    ...baseColors,
    gradient: `linear-gradient(135deg, ${baseColors.primary} 0%, ${baseColors.accent} 100%)`,
    background: adjustAlpha(baseColors.primary, 0.05)
  };
}

// Generate a unique color scheme based on any string
export function getUniqueColor(str: string): ColorScheme {
  const hash = hashString(str);
  const paletteIndex = hash % colorPalettes.length;
  const baseColors = colorPalettes[paletteIndex];

  return {
    ...baseColors,
    gradient: `linear-gradient(${(hash % 360)}deg, ${baseColors.primary} 0%, ${baseColors.accent} 100%)`,
    background: adjustAlpha(baseColors.primary, 0.05)
  };
}
