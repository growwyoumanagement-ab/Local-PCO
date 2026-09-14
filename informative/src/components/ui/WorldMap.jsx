"use client";

import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DottedMap from "dotted-map";

export function WorldMap({ 
  dots = [], 
  lineColor = "#FF5C1A",
  showLabels = true,
  animationDuration = 2,
  loop = true
}) {
  const svgRef = useRef(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);

  const { backgroundDots, mapWidth, mapHeight, projectedPaths } = useMemo(() => {
    // Generate the India map grid
    const map = new DottedMap({ height: 100, grid: "diagonal", countries: ["IND"] });
    
    // Get all points that make up the map shape
    const points = map.getPoints();
    
    // Project city dots
    const paths = dots.map(dot => {
      const startPin = map.addPin({ lat: dot.start.lat, lng: dot.start.lng, data: dot.start.label });
      const endPin = map.addPin({ lat: dot.end.lat, lng: dot.end.lng, data: dot.end.label });
      return {
        start: { x: startPin.x, y: startPin.y, label: startPin.data },
        end: { x: endPin.x, y: endPin.y, label: endPin.data }
      };
    });

    return { 
      backgroundDots: points, 
      mapWidth: map.image.width, 
      mapHeight: map.image.height,
      projectedPaths: paths 
    };
  }, [dots]);

  const createCurvedPath = (start, end) => {
    const dist = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const midX = (start.x + end.x) / 2;
    const curveHeight = Math.max(10, dist * 0.4);
    const midY = Math.min(start.y, end.y) - curveHeight;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const staggerDelay = 0.4;
  const totalAnimationTime = dots.length * staggerDelay + animationDuration;
  const pauseTime = 1.5;
  const fullCycleDuration = totalAnimationTime + pauseTime;

  return (
    <div className="w-full h-full bg-[#0A0F1A]/20 relative font-sans overflow-hidden">
      {/* SVG Container */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        className="w-full h-full pointer-events-auto select-none z-20"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor={lineColor} stopOpacity="0.8" />
            <stop offset="70%" stopColor={lineColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <radialGradient id="dot-gradient">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* 1. Background India Map Dots (Rendered directly) */}
        <g opacity="0.4">
          {backgroundDots.map((dot, index) => (
            <circle
              key={`bg-dot-${index}`}
              cx={dot.x}
              cy={dot.y}
              r="0.25"
              fill="currentColor"
              className="text-white/30"
            />
          ))}
        </g>

        {/* 2. Animated Paths */}
        {projectedPaths.map((path, i) => {
          const { start, end } = path;
          const startTime = (i * staggerDelay) / fullCycleDuration;
          const endTime = (i * staggerDelay + animationDuration) / fullCycleDuration;
          const resetTime = totalAnimationTime / fullCycleDuration;
          
          return (
            <g key={`path-group-${i}`} filter="url(#glow)">
              <motion.path
                d={createCurvedPath(start, end)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="0.4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={loop ? {
                  pathLength: [0, 0, 1, 1, 0, 0],
                  opacity: [0, 0, 1, 1, 0, 0]
                } : {
                  pathLength: 1,
                  opacity: 1
                }}
                transition={loop ? {
                  duration: fullCycleDuration,
                  times: [0, startTime, endTime, resetTime, resetTime + 0.1, 1],
                  ease: "easeInOut",
                  repeat: Infinity,
                } : {
                  duration: animationDuration,
                  delay: i * staggerDelay,
                  ease: "easeInOut",
                }}
              />
            </g>
          );
        })}

        {/* 3. Hub Markers and Labels */}
        {projectedPaths.map((path, i) => {
          const { start, end } = path;
          return (
            <g key={`markers-${i}`}>
              {/* Pulse effect for start */}
              <circle cx={start.x} cy={start.y} r="0.8" fill={lineColor} opacity="0.3">
                <animate attributeName="r" from="0.8" to="3" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Actual start dot */}
              <circle 
                cx={start.x} 
                cy={start.y} 
                r="0.8" 
                fill={lineColor} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredLocation(start.label)}
                onMouseLeave={() => setHoveredLocation(null)}
              />

              {/* Pulse effect for end */}
              <circle cx={end.x} cy={end.y} r="0.8" fill="#00D4FF" opacity="0.3">
                <animate attributeName="r" from="0.8" to="3" dur="2s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur="2s" begin="1s" repeatCount="indefinite" />
              </circle>
              {/* Actual end dot */}
              <circle 
                cx={end.x} 
                cy={end.y} 
                r="0.8" 
                fill="#00D4FF" 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredLocation(end.label)}
                onMouseLeave={() => setHoveredLocation(null)}
              />

              {/* Labels */}
              {showLabels && (
                <g className="pointer-events-none select-none" style={{ fontSize: '2.5px', fontWeight: 'bold' }}>
                  <text x={start.x} y={start.y + 4} textAnchor="middle" fill="#8FA3BF" className="uppercase tracking-tighter">
                    {start.label}
                  </text>
                  <text x={end.x} y={end.y + 4} textAnchor="middle" fill="#8FA3BF" className="uppercase tracking-tighter">
                    {end.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Tooltip Overlay */}
      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-4 right-4 bg-[#0F1623]/95 border border-[#FF5C1A]/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-xl z-40 shadow-2xl"
          >
            HUB: <span className="text-[#FF5C1A]">{hoveredLocation}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
