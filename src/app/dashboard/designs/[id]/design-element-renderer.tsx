import React from "react";
import { parseElementContent } from "@/lib/design/content";

export function DesignElementRenderer({ element, assetMap = {} }: { element: any, assetMap?: Record<string, { url: string }> }) {
  const content = parseElementContent(element.content);
  
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation || 0}deg)`,
    opacity: element.opacity ?? 1,
    zIndex: element.z_index,
    ...(element.style || {})
  };

  if (['text', 'button', 'badge'].includes(element.type || element.element_type)) {
    return (
      <div style={{ ...baseStyle, display: 'flex' }}>
        {content.text || ''}
      </div>
    );
  }

  if (['image', 'logo', 'icon'].includes(element.type || element.element_type)) {
    return (
      <div style={baseStyle} className="overflow-hidden border border-outline-variant/20 bg-surface-container-high/50 flex items-center justify-center rounded-md">
        {element.asset_id && assetMap[element.asset_id]?.url ? (
          <img src={assetMap[element.asset_id].url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
        ) : (
          <span className="text-[10px] text-on-surface-variant font-bold uppercase">{content.placeholder || element.type || element.element_type}</span>
        )}
      </div>
    );
  }

  if ((element.type || element.element_type) === 'shape') {
    return (
      <div style={{ 
        ...baseStyle, 
        backgroundColor: element.style?.backgroundColor || '#ccc',
        borderRadius: element.style?.borderRadius || 0
      }} />
    );
  }

  if ((element.type || element.element_type) === 'line') {
    return (
      <div style={{
        ...baseStyle,
        height: 2,
        backgroundColor: element.style?.backgroundColor || element.style?.borderColor || '#ccc'
      }} />
    );
  }

  if ((element.type || element.element_type) === 'qr') {
    return (
      <div style={baseStyle} className="bg-white border border-outline-variant flex items-center justify-center">
        <span className="font-mono text-xs font-bold">QR</span>
      </div>
    );
  }

  return (
    <div style={baseStyle} className="bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center">
      <span className="text-xs text-primary font-bold">{element.type || element.element_type}</span>
    </div>
  );
}
