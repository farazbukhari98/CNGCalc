import SidePanel from "@/components/cng-calculator/SidePanel";
import MainContent from "@/components/cng-calculator/MainContent";
import { useCalculator } from "@/contexts/CalculatorContext";
import { useState, useCallback, useEffect } from "react";

export default function Home() {
  const { sidebarCollapsed } = useCalculator();
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default 320px (md:w-80)
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = Math.min(Math.max(e.clientX, 240), 600); // Min 240px, Max 600px
    setSidebarWidth(newWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add global mouse listeners when resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {!sidebarCollapsed && (
        <>
          <div 
            className="relative"
            style={{ width: `${sidebarWidth}px` }}
          >
            <SidePanel />
            {/* Resize handle */}
            <div
              className="absolute top-0 right-0 w-1 h-full bg-gray-300 hover:bg-blue-400 cursor-col-resize transition-colors z-10"
              onMouseDown={handleMouseDown}
              style={{ 
                backgroundColor: isResizing ? '#3b82f6' : undefined 
              }}
            />
          </div>
        </>
      )}
      <MainContent />
    </div>
  );
}
