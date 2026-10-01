'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type SidebarContextType = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileOpen: boolean;
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMounted = React.useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('demarco_sidebar_collapsed');
    if (saved) {
      setIsCollapsed(saved === 'true');
    }
    // Allow initial render to pass before enabling localStorage sync
    setTimeout(() => {
      isMounted.current = true;
    }, 10);
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      localStorage.setItem('demarco_sidebar_collapsed', String(isCollapsed));
    }
  }, [isCollapsed]);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
