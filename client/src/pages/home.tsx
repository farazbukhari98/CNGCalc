import SidePanel from "@/components/cng-calculator/SidePanel";
import MainContent from "@/components/cng-calculator/MainContent";
import { useCalculator } from "@/contexts/CalculatorContext";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function Home() {
  const { sidebarCollapsed } = useCalculator();
  
  return (
    <div className="h-screen overflow-hidden">
      <PanelGroup direction="horizontal">
        {!sidebarCollapsed && (
          <>
            <Panel 
              id="sidebar"
              order={1}
              defaultSize={25} 
              minSize={15} 
              maxSize={50}
            >
              <SidePanel />
            </Panel>
            <PanelResizeHandle className="w-1 bg-gray-300 hover:bg-blue-400 transition-colors cursor-col-resize data-[resize-handle-active]:bg-blue-500" />
          </>
        )}
        <Panel 
          id="main-content"
          order={2}
        >
          <MainContent />
        </Panel>
      </PanelGroup>
    </div>
  );
}
