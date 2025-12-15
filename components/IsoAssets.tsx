
import React from 'react';
import { DecorationCategory } from '../types';

interface IsoItemProps {
  type: DecorationCategory | 'window_default';
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  variant?: string | null; // Add variant prop to check specific item ID
}

// COZY PALETTE (Strict Adherence)
// #FFBE98 - Primary Peach (Accents)
// #FEECE2 - Lightest (Backgrounds/Highlights)
// #F7DED0 - Mid Peach (Floor/Furniture Base)
// #E2BFB3 - Darker Rose/Brown (Walls/Outlines)
// + #5C4033 (Dark Brown for text/contrast details)

const C = {
  wall: '#E2BFB3',       
  wallDefault: '#F3F4F6', // Grayish White for basic wall

  floor: '#F7DED0',      
  floorDefault: '#E6E0D4', // Plain Beige for basic floor
  
  floorLine: '#E6A680',  // Laminate effect
  
  woodLight: '#FFBE98', 
  woodDark: '#C08B76',   
  woodOutline: '#A6705D',

  tableTop: '#5C4033', // Dark contrast for table
  tableLegs: '#8D6E63',

  glass: '#D0E8F2',      
  glassFrame: '#FFF8F3',
  
  rug: '#FFF8F3',
  rugPattern: '#FFBE98',

  book1: '#8D6E63',
  book2: '#C08B76',
  book3: '#A6705D',
  
  plantPot: '#A6705D',
  plantGreen: '#96B8A3', // Muted cozy green
  
  lampMetal: '#7D5245',
  lampLight: '#FFE0B2', // Warm light
};

export const IsoItem: React.FC<IsoItemProps> = ({ type, x, y, scale = 1, opacity = 1, variant }) => {
  
  const transform = `translate(${x}, ${y}) scale(${scale})`;

  const renderContent = () => {
    switch (type) {
      case 'wall_base':
        // Check if DEK001 is equipped, otherwise use default gray
        const wallColor = variant === 'DEK001' ? C.wall : C.wallDefault;
        // Extend height for vertical 9:16 format
        return (
          <g>
            <rect x="-800" y="-1200" width="1600" height="1200" fill={wallColor} />
            {/* Subtle Texture/Gradient/Stripes on wall only if painted */}
            {variant === 'DEK001' && (
                <rect x="-800" y="-1200" width="1600" height="20" fill="rgba(255,255,255,0.1)" />
            )}
          </g>
        );

      case 'floor_base':
        // Check if DEK002 is equipped for Wood Floor, otherwise plain beige
        const isWoodFloor = variant === 'DEK002';
        const floorColor = isWoodFloor ? C.floor : C.floorDefault;

        return (
          <g>
            {/* Main Floor Background - Extended downwards */}
            <rect x="-800" y="0" width="1600" height="600" fill={floorColor} />
            
            {/* Laminate Parke Effect (Perspective Lines) - ONLY if Wood Floor equipped */}
            {isWoodFloor && (
                <g opacity="0.4">
                    <line x1="-800" y1="20" x2="800" y2="20" stroke={C.floorLine} strokeWidth="1" />
                    <line x1="-800" y1="50" x2="800" y2="50" stroke={C.floorLine} strokeWidth="1" />
                    <line x1="-800" y1="90" x2="800" y2="90" stroke={C.floorLine} strokeWidth="1" />
                    <line x1="-800" y1="140" x2="800" y2="140" stroke={C.floorLine} strokeWidth="1" />
                    <line x1="-800" y1="200" x2="800" y2="200" stroke={C.floorLine} strokeWidth="1" />
                    
                    {/* Vertical random joints */}
                    <line x1="-500" y1="20" x2="-500" y2="50" stroke={C.floorLine} strokeWidth="1" />
                    <line x1="-300" y1="50" x2="-300" y2="90" stroke={C.floorLine} strokeWidth="1" />
                    <line x1="-100" y1="0" x2="-100" y2="20" stroke={C.floorLine} strokeWidth="1" />
                    <line x1="150" y1="50" x2="150" y2="90" stroke={C.floorLine} strokeWidth="1" />
                    <line x1="450" y1="20" x2="450" y2="50" stroke={C.floorLine} strokeWidth="1" />
                    <line x1="650" y1="50" x2="650" y2="90" stroke={C.floorLine} strokeWidth="1" />
                </g>
            )}

            {/* Baseboard */}
            <rect x="-800" y="-10" width="1600" height="10" fill="#FFF8F3" />
            <line x1="-800" y1="-10" x2="800" y2="-10" stroke="#D7CCC8" strokeWidth="1" />
          </g>
        );

      case 'window_default':
        return (
            <g>
                {/* Outer Frame */}
                <rect x="-60" y="20" width="120" height="100" rx="4" fill={C.glassFrame} stroke={C.woodOutline} strokeWidth="2"/>
                
                {/* Inner Glass (Sky) */}
                <rect x="-50" y="30" width="100" height="80" fill={C.glass} />
                
                {/* Clouds / Outside View */}
                <circle cx="-30" cy="50" r="10" fill="white" opacity="0.6"/>
                <circle cx="-10" cy="60" r="15" fill="white" opacity="0.6"/>
                
                {/* Crossbars */}
                <rect x="-2" y="30" width="4" height="80" fill={C.glassFrame} />
                <rect x="-50" y="70" width="100" height="4" fill={C.glassFrame} />
                
                {/* Sill */}
                {/* y koordinatı 40'tan 120'ye (+80 birim) artırıldı */}
                <rect x="-65" y="120" width="130" height="8" rx="2" fill={C.glassFrame} stroke={C.woodOutline} strokeWidth="2"/>
            </g>
        )

      case 'rug':
        return (
          <g>
             {/* Flat Oval Rug */}
             <ellipse cx="0" cy="0" rx="180" ry="40" fill={C.rug} />
             <ellipse cx="0" cy="0" rx="160" ry="30" fill="none" stroke={C.rugPattern} strokeWidth="4" strokeDasharray="10,10"/>
          </g>
        );

    case 'table':
    return (
        <g>
            {/* Main Focus of the Room - Resized for 9:16 width (narrower) */}
            {/* Original Width was 350, new width is 260 */}

            {/* Back Legs (Darker) */}
            <rect x="-120" y="-80" width="20" height="150" fill={C.tableLegs} /> 
            <rect x="100" y="-80" width="20" height="150" fill={C.tableLegs} />

            {/* Table Top Surface (Thick slab) */}
            {/* x = -130, width = 260 */}
            <rect x="-130" y="-100" width="260" height="40" fill={C.tableTop} rx="5" stroke="#3E2723" strokeWidth="1"/> 
            
            {/* Drawer Section under top */}
            {/* x = -120, width = 240 */}
            <rect x="-120" y="-60" width="240" height="30" fill="#6D4C41" /> 
            
            {/* Handle - Shortened */}
            <rect x="-20" y="-45" width="40" height="6" fill="#D7CCC8" rx="3" /> 

            {/* Front Legs */}
            <path d="M-125,-60 L-130,50 L-110,50 L-110,-60 Z" fill={C.tableLegs} />
            <path d="M125,-60 L130,50 L110,50 L110,-60 Z" fill={C.tableLegs} />
        </g>
    );
      case 'chair':
        // Made Larger
        return (
          <g transform="scale(1.2)">
             {/* 2D Side/Front Hybrid View Chair */}
             {/* Back Legs */}
             <rect x="-25" y="40" width="8" height="60" fill={C.woodDark} />
             <rect x="17" y="40" width="8" height="60" fill={C.woodDark} />
             
             {/* Seat */}
             <rect x="-30" y="40" width="60" height="10" fill={C.woodLight} stroke={C.woodOutline} strokeWidth="1"/>
             
             {/* Backrest */}
             <rect x="-30" y="-20" width="60" height="60" rx="4" fill={C.woodLight} stroke={C.woodOutline} strokeWidth="1"/>
             <rect x="-20" y="-10" width="40" height="40" rx="2" fill="none" stroke={C.woodOutline} strokeWidth="1" opacity="0.5"/>

             {/* Front Legs */}
             <rect x="-28" y="50" width="8" height="50" fill={C.woodOutline} />
             <rect x="20" y="50" width="8" height="50" fill={C.woodOutline} />
          </g>
        );

      case 'pc':
        return (
          <g>
             {/* Laptop 2D Front View */}
             {/* Screen */}
             <rect x="-35" y="-45" width="70" height="45" fill="#333" rx="2" />
             <rect x="-32" y="-42" width="64" height="39" fill="#E0F7FA" /> {/* Display */}
             {/* Base */}
             <path d="M-40,0 L40,0 L42,5 L-42,5 Z" fill="#90A4AE" />
             {/* Logo */}
             <circle cx="0" cy="-22" r="3" fill="white" opacity="0.3"/>
          </g>
        );

      case 'lamp':
        return (
          <g>
             {/* New Shape: Modern Rounded/Cozy Lamp */}
             {/* Base */}
             <path d="M-15,0 L15,0 L18,5 L-18,5 Z" fill={C.lampMetal} />
             {/* Stand */}
             <rect x="-2" y="-35" width="4" height="35" fill={C.lampMetal} />
             {/* Shade */}
             <path d="M-20,-35 L20,-35 L25,-15 L-25,-15 Z" fill={C.woodLight} stroke={C.woodOutline} strokeWidth="1" transform="translate(0, -10)" />
             {/* Bulb glow */}
             <circle cx="0" cy="-35" r="12" fill={C.lampLight} opacity="0.5" filter="blur(4px)" />
          </g>
        );

      case 'coffee':
        return (
          <g>
             {/* Mug */}
             <rect x="-6" y="-12" width="12" height="12" fill="#FFFFFF" rx="1"/>
             {/* Handle */}
             <path d="M6,-10 Q10,-10 10,-6 Q10,-2 6,-2" fill="none" stroke="#FFFFFF" strokeWidth="2"/>
             {/* Steam */}
             <path d="M-2,-16 Q0,-20 2,-16" stroke="#DDD" strokeWidth="1" opacity="0.6"/>
          </g>
        );

      case 'books':
        return (
          <g>
             {/* Stack of books on table */}
             <rect x="-15" y="-5" width="30" height="5" fill={C.book1} rx="1" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
             <rect x="-12" y="-10" width="24" height="5" fill={C.book2} rx="1" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
          </g>
        );

      case 'agenda':
        return (
          <g>
             {/* Notebook open or closed */}
             <rect x="-15" y="-2" width="30" height="4" fill="#37474F" rx="1"/>
             {/* Pen */}
             <rect x="-20" y="0" width="40" height="2" fill="#CFD8DC" rx="1" transform="rotate(-5)"/>
          </g>
        );

      case 'shelf':
        // Made Larger
        return (
          <g transform="scale(1.4)">
             {/* Wall Shelf 2D */}
             <rect x="-60" y="0" width="120" height="6" fill={C.woodLight} rx="1" stroke={C.woodOutline} strokeWidth="1"/>
             {/* Brackets */}
             <path d="M-40,6 L-40,15 L-35,6 Z" fill={C.woodOutline} />
             <path d="M40,6 L40,15 L35,6 Z" fill={C.woodOutline} />

             {/* Lots of Books */}
             <rect x="-55" y="-25" width="5" height="25" fill={C.book1} />
             <rect x="-50" y="-22" width="6" height="22" fill={C.book2} />
             <rect x="-44" y="-28" width="4" height="28" fill={C.book3} />
             <rect x="-40" y="-20" width="5" height="20" fill={C.book1} />
             
             {/* Plant */}
             <path d="M45,0 L55,0 L53,-8 L47,-8 Z" fill={C.plantPot} />
             <circle cx="50" cy="-10" r="6" fill={C.plantGreen} />
             <circle cx="55" cy="-12" r="4" fill={C.plantGreen} />
             <circle cx="45" cy="-12" r="4" fill={C.plantGreen} />

             {/* Leaning Books */}
             <path d="M10,0 L15,0 L25,-20 L20,-20 Z" fill="#5D4037" />
          </g>
        );

      case 'board':
        // Made Larger
        return (
          <g transform="scale(1.3)">
             {/* Cork Board */}
             <rect x="-50" y="-40" width="100" height="80" fill="#D7CCC8" stroke={C.woodOutline} strokeWidth="3" rx="2"/>
             {/* Notes */}
             <rect x="-40" y="-30" width="20" height="25" fill="#FFECB3" transform="rotate(-2)" />
             <rect x="-10" y="-20" width="25" height="20" fill="#C8E6C9" transform="rotate(3)" />
             <rect x="20" y="-35" width="20" height="25" fill="#FFCDD2" transform="rotate(-1)" />
             
             {/* Pins */}
             <circle cx="-30" cy="-28" r="2" fill="red"/>
             <circle cx="5" cy="-18" r="2" fill="blue"/>
          </g>
        );

      default:
        return null;
    }
  };

  return <g transform={transform} opacity={opacity}>{renderContent()}</g>;
};
