export interface Artist {
  // Core artist information
  name: string;
  location: string;
  genres: string[];

  // Extended metadata
  subGenres?: string[];
  era?: string;
  influences?: string[];
  collaborators?: string[];
  
  // Visual representation
  colorScheme?: {
    primary: string;
    accent: string;
    gradient: string;
    background: string;
  };

  // Network connections
  connections?: {
    type: 'collaboration' | 'influence' | 'similar';
    artistId: string;
    strength: number;
  }[];

  // Additional metadata
  stats?: {
    popularity: number;
    connections: number;
    genreOverlap: number;
  };

  // Timestamps
  lastUpdated?: string;
  dateAdded?: string;
}

export interface ArtistConnection {
  source: string;
  target: string;
  type: 'collaboration' | 'influence' | 'similar';
  strength: number;
}

export interface ArtistGroup {
  id: string;
  name: string;
  artists: Artist[];
  primaryGenre?: string;
  location?: string;
  colorScheme?: {
    primary: string;
    accent: string;
    gradient: string;
    background: string;
  };
}

export interface ArtistFilter {
  type: 'genre' | 'location' | 'era';
  value: string;
  count: number;
  colorScheme?: {
    primary: string;
    accent: string;
    gradient: string;
    background: string;
  };
}

export interface ArtistMetadata {
  totalArtists: number;
  totalGenres: number;
  totalLocations: number;
  totalConnections: number;
  mostPopularGenres: {
    name: string;
    count: number;
    colorScheme?: {
      primary: string;
      accent: string;
      gradient: string;
      background: string;
    };
  }[];
  mostConnectedArtists: {
    name: string;
    connections: number;
    colorScheme?: {
      primary: string;
      accent: string;
      gradient: string;
      background: string;
    };
  }[];
  genreDistribution: {
    [key: string]: number;
  };
  locationDistribution: {
    [key: string]: number;
  };
}

// Utility type for color schemes
export interface ColorScheme {
  primary: string;
  accent: string;
  gradient: string;
  background: string;
}

// Utility type for network visualization
export interface NetworkNode {
  id: string;
  label: string;
  type: 'artist' | 'genre' | 'location';
  data: Artist | string;
  colorScheme: ColorScheme;
  size?: number;
  x?: number;
  y?: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  type: 'collaboration' | 'influence' | 'similar' | 'genre' | 'location';
  strength: number;
  colorScheme?: ColorScheme;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  metadata: ArtistMetadata;
}

// Animation states for UI components
export interface AnimationState {
  isEntering: boolean;
  isLeaving: boolean;
  isVisible: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
}

// View modes for different visualizations
export type ViewMode = 'grid' | 'network' | 'globe' | 'timeline';

// Sort options for artist lists
export type SortOption = 'name' | 'location' | 'connections' | 'genres';

// Filter state for UI
export interface FilterState {
  genres: Set<string>;
  locations: Set<string>;
  eras: Set<string>;
  searchTerm: string;
  sortBy: SortOption;
  viewMode: ViewMode;
}
