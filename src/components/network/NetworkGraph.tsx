'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { Artist, NetworkNode, NetworkLink, ForceNode, ForceLink } from '../../types/artist';
import './NetworkGraph.css';

interface NetworkGraphProps {
  data: Artist[];
}

const NetworkGraph = ({ data }: NetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<ForceNode, ForceLink> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);

  // Define gradients and effects
  const effects = {
    artist: {
      gradient: {
        id: 'artistGradient',
        colors: ['#FF6B6B', '#FF4B4B'],
        glow: '#FF6B6B'
      },
      filter: {
        id: 'artistGlow',
        color: '#FF6B6B'
      }
    },
    genre: {
      gradient: {
        id: 'genreGradient',
        colors: ['#4ECDC4', '#45B7AF'],
        glow: '#4ECDC4'
      },
      filter: {
        id: 'genreGlow',
        color: '#4ECDC4'
      }
    },
    country: {
      gradient: {
        id: 'countryGradient',
        colors: ['#45B7D1', '#3B9EBA'],
        glow: '#45B7D1'
      },
      filter: {
        id: 'countryGlow',
        color: '#45B7D1'
      }
    }
  };

  // Process data with memoization
  const { nodes, links } = useMemo(() => {
    const nodesMap = new Map<string, NetworkNode>();
    const linksArray: NetworkLink[] = [];
    const genreCounts = new Map<string, number>();
    const countryCounts = new Map<string, number>();

    // Count occurrences
    data.forEach(artist => {
      if (artist.location && artist.location !== 'UNKNOWN') {
        countryCounts.set(artist.location, (countryCounts.get(artist.location) || 0) + 1);
      }
      artist.genres?.forEach(genre => {
        if (genre !== 'UNKNOWN') {
          genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
        }
      });
    });

    // Create nodes for significant genres
    genreCounts.forEach((count, genre) => {
      if (count > 8) {
        nodesMap.set(genre, {
          id: genre,
          group: 'genre',
          type: 'genre',
          value: Math.sqrt(count) * 1.2,
          metadata: `${count} artists`
        });
      }
    });

    // Create nodes for significant countries
    countryCounts.forEach((count, country) => {
      if (count > 4) {
        nodesMap.set(country, {
          id: country,
          group: 'country',
          type: 'country',
          value: Math.sqrt(count) * 1.2,
          metadata: `${count} artists`
        });
      }
    });

    // Create artist nodes and connections
    data.forEach(artist => {
      if (artist.name && artist.name !== 'UNKNOWN') {
        const hasSignificantConnection = (
          (artist.location && nodesMap.has(artist.location)) ||
          artist.genres?.some(genre => nodesMap.has(genre))
        );

        if (hasSignificantConnection) {
          nodesMap.set(artist.name, {
            id: artist.name,
            group: artist.location || 'unknown',
            type: 'artist',
            value: 1,
            metadata: artist.metadata
          });

          if (artist.location && nodesMap.has(artist.location)) {
            linksArray.push({
              source: artist.name,
              target: artist.location,
              value: 1
            });
          }

          artist.genres?.forEach(genre => {
            if (nodesMap.has(genre)) {
              linksArray.push({
                source: artist.name,
                target: genre,
                value: 1
              });
            }
          });
        }
      }
    });

    return {
      nodes: Array.from(nodesMap.values()) as ForceNode[],
      links: linksArray as ForceLink[]
    };
  }, [data]);

  // Handle zoom interactions
  const handleZoom = useCallback((event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
    const newTransform = event.transform;
    setTransform(newTransform);
    d3.select(svgRef.current)
      .select('g')
      .attr('transform', newTransform.toString());
  }, []);

  // Initialize visualization
  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll("*").remove();

    // Define SVG defs for visual effects
    const defs = svg.append("defs");

    // Add gradients
    Object.entries(effects).forEach(([type, effect]) => {
      const gradient = defs.append("radialGradient")
        .attr("id", effect.gradient.id)
        .attr("cx", "30%")
        .attr("cy", "30%")
        .attr("r", "70%");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", effect.gradient.colors[0]);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", effect.gradient.colors[1]);

      // Add glow filter
      const filter = defs.append("filter")
        .attr("id", effect.filter.id)
        .attr("width", "300%")
        .attr("height", "300%")
        .attr("x", "-100%")
        .attr("y", "-100%");

      filter.append("feGaussianBlur")
        .attr("class", "blur")
        .attr("stdDeviation", "3")
        .attr("result", "coloredBlur");

      filter.append("feFlood")
        .attr("flood-color", effect.filter.color)
        .attr("flood-opacity", "0.5")
        .attr("result", "glowColor");

      filter.append("feComposite")
        .attr("in", "glowColor")
        .attr("in2", "coloredBlur")
        .attr("operator", "in")
        .attr("result", "softGlow");

      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode")
        .attr("in", "softGlow");
      feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
    });

    const container = svg.append("g");

    // Initialize zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", handleZoom);

    svg.call(zoom);

    // Initialize force simulation
    const simulation = d3.forceSimulation<ForceNode>(nodes)
      .force("link", d3.forceLink<ForceNode, ForceLink>(links)
        .id(d => d.id)
        .distance(d => {
          const source = d.source as ForceNode;
          const target = d.target as ForceNode;
          return (source.value + target.value) * 20;
        })
        .strength(0.15))
      .force("charge", d3.forceManyBody<ForceNode>()
        .strength(d => d.type === 'artist' ? -30 : -120)
        .distanceMax(250))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collision", d3.forceCollide<ForceNode>().radius(d => d.value * 3))
      .force("x", d3.forceX(dimensions.width / 2).strength(0.05))
      .force("y", d3.forceY(dimensions.height / 2).strength(0.05))
      .alphaDecay(0.01)
      .velocityDecay(0.4);

    simulationRef.current = simulation;

    // Create curved links
    const link = container.append("g")
      .selectAll<SVGPathElement, ForceLink>("path")
      .data(links)
      .join("path")
      .attr("class", "link")
      .attr("stroke-width", 1.5);

    // Create nodes with effects
    const node = container.append("g")
      .selectAll<SVGCircleElement, ForceNode>("circle")
      .data(nodes)
      .join("circle")
      .attr("class", d => `node ${d.type}`)
      .attr("r", d => d.value * 3)
      .style("fill", d => `url(#${effects[d.type].gradient.id})`)
      .style("filter", d => `url(#${effects[d.type].filter.id})`);

    // Add labels
    const label = container.append("g")
      .selectAll<SVGTextElement, ForceNode>("text")
      .data(nodes.filter(n => n.type !== 'artist' || n.value > 2))
      .join("text")
      .attr("class", "node-label")
      .text(d => d.id)
      .attr("font-size", d => Math.max(10, Math.min(d.value * 1.2, 14)))
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("dy", d => d.type === 'artist' ? -d.value * 3 - 5 : d.value * 3 + 15);

    // Handle interactions
    const handleNodeHover = (event: MouseEvent, d: ForceNode) => {
      const connectedNodes = new Set<string>();
      const connections = {
        artists: new Set<string>(),
        genres: new Set<string>(),
        countries: new Set<string>()
      };

      links.forEach(l => {
        const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
        const targetId = typeof l.target === 'string' ? l.target : l.target.id;
        if (sourceId === d.id || targetId === d.id) {
          connectedNodes.add(sourceId);
          connectedNodes.add(targetId);
          const otherNode = nodes.find(n => n.id === (sourceId === d.id ? targetId : sourceId));
          if (otherNode) {
            connections[`${otherNode.type}s` as keyof typeof connections].add(otherNode.id);
          }
        }
      });

      // Update visual elements
      node.transition()
        .duration(300)
        .attr("opacity", n => connectedNodes.has(n.id) || n.id === d.id ? 1 : 0.1)
        .attr("r", n => (connectedNodes.has(n.id) || n.id === d.id ? n.value * 3.5 : n.value * 3));

      link.transition()
        .duration(300)
        .attr("opacity", l => {
          const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
          const targetId = typeof l.target === 'string' ? l.target : l.target.id;
          return connectedNodes.has(sourceId) && connectedNodes.has(targetId) ? 0.8 : 0.1;
        })
        .attr("stroke-width", l => {
          const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
          const targetId = typeof l.target === 'string' ? l.target : l.target.id;
          return connectedNodes.has(sourceId) && connectedNodes.has(targetId) ? 2 : 1;
        });

      label.transition()
        .duration(300)
        .attr("opacity", n => connectedNodes.has(n.id) || n.id === d.id ? 1 : 0.1);

      // Update tooltip
      const connectionSummary = [
        connections.artists.size > 0 ? `${connections.artists.size} Artists` : '',
        connections.genres.size > 0 ? `${connections.genres.size} Genres` : '',
        connections.countries.size > 0 ? `${connections.countries.size} Countries` : '',
      ].filter(Boolean).join(' • ');

      tooltip
        .style("opacity", 1)
        .html(`
          <div class="title">${d.id}</div>
          <div class="type">${d.type}</div>
          <div class="info">${d.metadata}</div>
          ${connectionSummary ? `<div class="connections">${connectionSummary}</div>` : ''}
        `)
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY}px`);
    };

    const handleNodeLeave = () => {
      node.transition()
        .duration(300)
        .attr("opacity", 1)
        .attr("r", d => d.value * 3);

      link.transition()
        .duration(300)
        .attr("opacity", 0.3)
        .attr("stroke-width", 1.5);

      label.transition()
        .duration(300)
        .attr("opacity", 1);

      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
    };

    node
      .on("mouseover", handleNodeHover as any)
      .on("mouseout", handleNodeLeave)
      .on("click", (event, d) => {
        event.stopPropagation();
        // Handle click events
      });

    // Add drag behavior
    const drag = d3.drag<SVGCircleElement, ForceNode>()
      .on("start", (event) => {
        if (!event.active && simulationRef.current) {
          simulationRef.current.alphaTarget(0.3).restart();
        }
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on("drag", (event) => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on("end", (event) => {
        if (!event.active && simulationRef.current) {
          simulationRef.current.alphaTarget(0);
        }
        event.subject.fx = null;
        event.subject.fy = null;
      });

    node.call(drag as any);

    // Update positions on tick
    simulation.on("tick", () => {
      link.attr("d", (d) => {
        const source = d.source as ForceNode;
        const target = d.target as ForceNode;
        const dx = target.x! - source.x!;
        const dy = target.y! - source.y!;
        const dr = Math.sqrt(dx * dx + dy * dy) * 2;
        return `M${source.x},${source.y}A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
      });

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);

      label
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

    return () => {
      simulation.stop();
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [nodes, links, dimensions, effects, handleZoom]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current?.parentElement) {
        const width = svgRef.current.parentElement.clientWidth;
        const height = svgRef.current.parentElement.clientHeight;
        setDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="network-container">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="network-graph"
      />
      <div
        ref={tooltipRef}
        className="node-tooltip"
        style={{ opacity: 0 }}
      />
      <div className="network-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: effects.artist.gradient.colors[0] }} />
          <span className="legend-label">Artists</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: effects.genre.gradient.colors[0] }} />
          <span className="legend-label">Genres</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: effects.country.gradient.colors[0] }} />
          <span className="legend-label">Countries</span>
        </div>
      </div>
      <div className="network-controls">
        <button 
          className="control-button" 
          onClick={() => transform.k < 4 && setTransform(transform.scale(1.2))}
        >
          +
        </button>
        <button 
          className="control-button" 
          onClick={() => transform.k > 0.2 && setTransform(transform.scale(0.8))}
        >
          −
        </button>
      </div>
    </div>
  );
};

export default NetworkGraph;
