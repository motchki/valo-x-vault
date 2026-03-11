import React from 'react';

export interface Crosshair {
  id: string;
  name: string;
  code: string;
  author: string;
  type: 'dot' | 'plus' | 'simple' | 'custom';
  color: string;
  
  // Outlines
  outlines: boolean;
  outlineOpacity: number;
  outlineThickness: number;
  
  // Center Dot
  centerDot: boolean;
  dotOpacity: number;
  dotThickness: number;
  
  // Inner Lines
  innerLines: boolean;
  innerOpacity: number;
  innerLength: number;
  innerThickness: number;
  innerOffset: number;
  
  // Outer Lines
  outerLines: boolean;
  outerOpacity: number;
  outerLength: number;
  outerThickness: number;
  outerOffset: number;
  
  // Legacy fields for compatibility
  thickness?: number;
  gap?: number;
}

export const CrosshairPreview: React.FC<{ crosshair: Partial<Crosshair> }> = ({ crosshair }) => {
  const {
    color = '#00ff00',
    outlines = true,
    outlineOpacity = 1,
    outlineThickness = 1,
    centerDot = false,
    dotOpacity = 1,
    dotThickness = 2,
    innerLines = true,
    innerOpacity = 1,
    innerLength = 6,
    innerThickness = 2,
    innerOffset = 3,
    outerLines = false,
    outerOpacity = 0.5,
    outerLength = 2,
    outerThickness = 2,
    outerOffset = 10,
  } = crosshair;

  const renderLine = (
    type: 'inner' | 'outer',
    direction: 'top' | 'bottom' | 'left' | 'right',
    opacity: number,
    length: number,
    thickness: number,
    offset: number
  ) => {
    const isVertical = direction === 'top' || direction === 'bottom';
    const style: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: color,
      opacity: opacity,
      boxShadow: outlines ? `0 0 0 ${outlineThickness}px rgba(0,0,0,${outlineOpacity})` : 'none',
      width: isVertical ? `${thickness}px` : `${length}px`,
      height: isVertical ? `${length}px` : `${thickness}px`,
    };

    if (direction === 'top') style.bottom = `${offset}px`;
    if (direction === 'bottom') style.top = `${offset}px`;
    if (direction === 'left') style.right = `${offset}px`;
    if (direction === 'right') style.left = `${offset}px`;

    return <div style={style} />;
  };

  return (
    <div className="w-full h-full bg-[#1a1a1a] rounded-xl flex items-center justify-center overflow-hidden relative border border-white/5">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
      
      <div className="relative w-0 h-0 flex items-center justify-center">
        {/* Center Dot */}
        {centerDot && (
          <div 
            style={{
              position: 'absolute',
              backgroundColor: color,
              opacity: dotOpacity,
              width: `${dotThickness}px`,
              height: `${dotThickness}px`,
              boxShadow: outlines ? `0 0 0 ${outlineThickness}px rgba(0,0,0,${outlineOpacity})` : 'none',
            }}
          />
        )}

        {/* Inner Lines */}
        {innerLines && (
          <>
            {renderLine('inner', 'top', innerOpacity, innerLength, innerThickness, innerOffset)}
            {renderLine('inner', 'bottom', innerOpacity, innerLength, innerThickness, innerOffset)}
            {renderLine('inner', 'left', innerOpacity, innerLength, innerThickness, innerOffset)}
            {renderLine('inner', 'right', innerOpacity, innerLength, innerThickness, innerOffset)}
          </>
        )}

        {/* Outer Lines */}
        {outerLines && (
          <>
            {renderLine('outer', 'top', outerOpacity, outerLength, outerThickness, outerOffset)}
            {renderLine('outer', 'bottom', outerOpacity, outerLength, outerThickness, outerOffset)}
            {renderLine('outer', 'left', outerOpacity, outerLength, outerThickness, outerOffset)}
            {renderLine('outer', 'right', outerOpacity, outerLength, outerThickness, outerOffset)}
          </>
        )}
      </div>
    </div>
  );
};
