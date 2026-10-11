import React from 'react';
import { DesignElementRenderer } from '../[id]/design-element-renderer';

export function scaleFor(width: number, height: number, maxWidth = 720, maxHeight = 540) {
  const scaleX = maxWidth / width;
  const scaleY = maxHeight / height;
  return Math.min(scaleX, scaleY, 1);
}

export function InteractiveStage({ 
  output, 
  assetMap, 
  scale = 1 
}: { 
  output: any; 
  assetMap: Record<string, { url: string }>; 
  scale?: number;
}) {
  return (
    <div 
      className="relative bg-surface-container-lowest overflow-hidden shadow-2xl rounded-sm border border-outline-variant/30 flex-shrink-0"
      style={{
        width: output.width * scale,
        height: output.height * scale,
      }}
    >
      <div 
        id="ai-design-stage"
        className="absolute top-0 left-0 bg-white"
        style={{
          width: output.width,
          height: output.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {[...output.elements]
          .sort((a: any, b: any) => (a.z_index || 0) - (b.z_index || 0))
          .map((el: any, index: number) => (
            <DesignElementRenderer 
              key={el.id || index} 
              element={el} 
              assetMap={assetMap} 
            />
          ))}
      </div>
    </div>
  );
}
