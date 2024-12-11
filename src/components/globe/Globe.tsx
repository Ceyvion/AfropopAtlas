'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Mesh, Vector3, LineBasicMaterial, EdgesGeometry, LineSegments, SphereGeometry, Color, BufferGeometry, Float32BufferAttribute, DoubleSide } from 'three';
import { ProcessedLocation } from '../../types/artist';

interface GlobeProps {
  locations: ProcessedLocation[];
  selectedLocation: string | null;
}

interface LocationMarkerProps {
  location: ProcessedLocation;
  onHover: (location: ProcessedLocation | null) => void;
  isHovered: boolean;
  isSelected: boolean;
}

const GLOBE_RADIUS = 1.5;
const MARKER_SIZE = 0.035;
const GRID_COLOR = '#334155';
const MARKER_COLOR = '#ef4444';
const MARKER_HOVER_COLOR = '#dc2626';

function createLatitudeLines(radius: number, segments: number = 36) {
  const points: number[] = [];
  const step = 180 / segments;

  for (let lat = -90 + step; lat < 90; lat += step) {
    const phi = (90 - lat) * (Math.PI / 180);
    const circleSegments = 180;
    const circleRadius = radius * Math.sin(phi);
    const y = radius * Math.cos(phi);

    for (let i = 0; i <= circleSegments; i++) {
      const theta = (i / circleSegments) * Math.PI * 2;
      const x = circleRadius * Math.cos(theta);
      const z = circleRadius * Math.sin(theta);
      points.push(x, y, z);
      if (i < circleSegments) {
        points.push(
          circleRadius * Math.cos((i + 1) * (Math.PI * 2) / circleSegments),
          y,
          circleRadius * Math.sin((i + 1) * (Math.PI * 2) / circleSegments)
        );
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
  return geometry;
}

function createLongitudeLines(radius: number, segments: number = 36) {
  const points: number[] = [];
  const step = 360 / segments;

  for (let long = 0; long < 360; long += step) {
    const theta = long * (Math.PI / 180);
    for (let lat = -90; lat <= 90; lat += 1) {
      const phi = (90 - lat) * (Math.PI / 180);
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      points.push(x, y, z);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
  return geometry;
}

function latLongToVector3(lat: number, long: number, radius: number): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (long + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new Vector3(x, y, z);
}

const LocationMarker = ({ location, onHover, isHovered, isSelected }: LocationMarkerProps) => {
  const position = latLongToVector3(
    location.coordinates.latitude,
    location.coordinates.longitude,
    GLOBE_RADIUS
  );

  const isActive = isHovered || isSelected;

  return (
    <group position={position}>
      <pointLight
        intensity={isActive ? 1 : 0.3}
        distance={0.5}
        color={MARKER_COLOR}
      />
      <mesh
        scale={isActive ? 1.5 : 1}
        onPointerOver={() => onHover(location)}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[MARKER_SIZE, 16, 16]} />
        <meshStandardMaterial 
          color={new Color(isActive ? MARKER_HOVER_COLOR : MARKER_COLOR)}
          emissive={new Color(isActive ? MARKER_HOVER_COLOR : MARKER_COLOR)}
          emissiveIntensity={isActive ? 2 : 1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {isActive && (
        <Html position={[0, MARKER_SIZE * 4, 0]} center>
          <div className="location-tooltip">
            <h3>{location.name}</h3>
            <p className="artist-count">{location.artists.length} Artists</p>
            <p className="artist-list">
              Including: {location.artists.slice(0, 3).map(artist => artist.name).join(', ')}
              {location.artists.length > 3 ? '...' : ''}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
};

const GlobeObject = ({ locations, hoveredLocation, selectedLocation, onHover }: { 
  locations: ProcessedLocation[]; 
  hoveredLocation: ProcessedLocation | null;
  selectedLocation: string | null;
  onHover: (location: ProcessedLocation | null) => void;
}) => {
  const globeRef = useRef<Mesh>(null);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4444ff" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#ff4444" />

      {/* Main Globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
          emissive="#111111"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Grid Lines */}
      <lineSegments>
        <primitive object={createLatitudeLines(GLOBE_RADIUS * 1.001)} />
        <lineBasicMaterial color={GRID_COLOR} transparent opacity={0.4} />
      </lineSegments>
      <lineSegments>
        <primitive object={createLongitudeLines(GLOBE_RADIUS * 1.001)} />
        <lineBasicMaterial color={GRID_COLOR} transparent opacity={0.4} />
      </lineSegments>

      {/* Location Markers */}
      {locations.map((location, index) => (
        <LocationMarker
          key={`${location.name}-${index}`}
          location={location}
          onHover={onHover}
          isHovered={hoveredLocation?.name === location.name}
          isSelected={selectedLocation === location.name}
        />
      ))}
    </>
  );
};

const Globe = ({ locations, selectedLocation }: GlobeProps) => {
  const [hoveredLocation, setHoveredLocation] = useState<ProcessedLocation | null>(null);

  const handleLocationHover = useCallback((location: ProcessedLocation | null) => {
    setHoveredLocation(location);
  }, []);

  return (
    <div className="canvas-container">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
      >
        <color attach="background" args={['#000000']} />
        
        <GlobeObject 
          locations={locations}
          hoveredLocation={hoveredLocation}
          selectedLocation={selectedLocation}
          onHover={handleLocationHover}
        />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          rotateSpeed={0.5}
          autoRotate={!hoveredLocation && !selectedLocation}
          autoRotateSpeed={0.3}
          zoomSpeed={0.8}
        />
      </Canvas>

      <div className="stats">
        <div className="stat-item">
          <div className="stat-value">{locations.length}</div>
          <div className="stat-label">Locations</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {locations.reduce((sum, location) => sum + location.artists.length, 0)}
          </div>
          <div className="stat-label">Artists</div>
        </div>
        {(hoveredLocation || selectedLocation) && (
          <div className="stat-item">
            <div className="stat-value">
              {(hoveredLocation || locations.find(l => l.name === selectedLocation))?.artists.length}
            </div>
            <div className="stat-label">
              {(hoveredLocation || locations.find(l => l.name === selectedLocation))?.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Globe;
