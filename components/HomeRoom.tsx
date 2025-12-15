
import React, { useState } from 'react';
import { GameState, Theme, DecorationCategory } from '../types';
import { Maximize2, Minimize2, Palette } from 'lucide-react';
import { IsoItem } from './IsoAssets';

interface HomeRoomProps {
  state: GameState;
  theme: Theme;
  texts: any;
  lang: string;
}

const HomeRoom: React.FC<HomeRoomProps> = ({ state, theme, texts, lang }) => {
  const isDark = theme === 'dark';
  const isMinimal = theme === 'minimal';
  const { activeDecorations } = state.inventory;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isEquipped = (cat: DecorationCategory) => !!activeDecorations[cat];

  // Vertical (9:16) format configuration
  // No more rotation, simple full screen expansion
  const FullscreenWrapper = isFullscreen 
     ? 'fixed inset-0 z-[100] bg-black flex items-center justify-center' 
     : 'relative w-full aspect-[9/16] overflow-hidden shadow-md bg-white mx-auto max-w-sm border-x border-gray-100';

  const RotatedInner = 'w-full h-full bg-[#E2BFB3]';

  // 9:16 ViewBox (540 x 960)
  const VIEWBOX_W = 540;
  const VIEWBOX_H = 960;
  
  const CENTER_X = VIEWBOX_W / 2; // 270
  const HORIZON_Y = 600; // Floor starts lower down
  
  // -- VERTICAL LAYOUT POSITIONS --
  
  // High Wall Items
  const WINDOW_X = CENTER_X; // Centered Window
  const WINDOW_Y = 200;

  const BOARD_X = CENTER_X; 
  const BOARD_Y = 350; // Below window

  const SHELF_X = CENTER_X; 
  const SHELF_Y = 400; // Below window, alternative to board position

  // Floor Items
  const RUG_X = CENTER_X; 
  const RUG_Y = HORIZON_Y + 60; 

  // Furniture (Center Stage, lower)
  const TABLE_X = CENTER_X;
  const TABLE_Y = HORIZON_Y + 20; 

  // Items ON Table 
  const TABLE_TOP_Y = TABLE_Y - 100; 

  const CHAIR_X = CENTER_X;
  const CHAIR_Y = TABLE_Y + 40; 

  return (
    <div className={`flex flex-col h-full w-full mx-auto`}> 
        
        {/* ROOM CONTAINER */}
        <div className={`${FullscreenWrapper} transition-all duration-500 bg-white`}>
            
            <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="absolute top-4 right-4 z-[110] p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition"
            >
                {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>

            <div className={RotatedInner}>
              <svg 
                viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} 
                preserveAspectRatio="xMidYMid slice" 
                className="w-full h-full max-w-full max-h-full" 
              >
                  {/* 1. BACK LAYER: WALL */}
                  <IsoItem type="wall_base" x={CENTER_X} y={300} variant={activeDecorations['wall_base']} /> 

                  {/* 2. WALL DECORATIONS */}
                  {/* Window is generally higher up */}
                  <IsoItem type="window_default" x={WINDOW_X} y={WINDOW_Y} scale={1.2} />
                  
                  {/* If Board is equipped, show it. If Shelf is equipped, it might overlap if we are not careful. 
                      Let's vertically offset them if both present, or just center them if only one. */}
                  {isEquipped('board') && <IsoItem type="board" x={BOARD_X} y={BOARD_Y} scale={1.0} />}
                  
                  {/* Shelf placed slightly above desk, might overlap board if both equipped. 
                      In a real game we'd have slots. Here we just layer. */}
                  {isEquipped('shelf') && <IsoItem type="shelf" x={SHELF_X} y={isEquipped('board') ? SHELF_Y + 80 : SHELF_Y} scale={1.0} />}

                  {/* 3. FLOOR LAYER */}
                  <IsoItem type="floor_base" x={CENTER_X} y={HORIZON_Y} variant={activeDecorations['floor_base']} /> 
                  
                  {isEquipped('rug') && <IsoItem type="rug" x={RUG_X} y={RUG_Y} scale={1.0} />}

                  {/* 4. FURNITURE LAYER (Back to Front) */}
                  
                  {isEquipped('table') && (
                    <g>
                      {/* The Desk */}
                      <IsoItem type="table" x={TABLE_X} y={TABLE_Y} scale={1.2} />
                      
                      {/* Items ON the table surface */}
                      {/* PC centered */}
                      {isEquipped('pc') && <IsoItem type="pc" x={TABLE_X} y={TABLE_TOP_Y} scale={1.2} />}
                      
                      {/* Lamp Left */}
                      {isEquipped('lamp') && <IsoItem type="lamp" x={TABLE_X - 80} y={TABLE_TOP_Y} scale={1.2} />}
                      
                      {/* Books Right */}
                      {isEquipped('books') && <IsoItem type="books" x={TABLE_X + 80} y={TABLE_TOP_Y} scale={1.2} />}
                      
                      {/* Coffee somewhere */}
                      {isEquipped('coffee') && <IsoItem type="coffee" x={TABLE_X + 40} y={TABLE_TOP_Y + 5} scale={1.2} />}
                      
                      {/* Agenda */}
                      {isEquipped('agenda') && <IsoItem type="agenda" x={TABLE_X - 40} y={TABLE_TOP_Y + 10} scale={1.2} />}
                    </g>
                  )}

                  {/* Chair is in front of table */}
                  {isEquipped('chair') && (
                    <IsoItem type="chair" x={CHAIR_X} y={CHAIR_Y} scale={1.2} />
                  )}

              </svg>
            </div>

        </div>
    </div>
  );
};

export default HomeRoom;
