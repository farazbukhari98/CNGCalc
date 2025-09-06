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
              defaultSize={25} 
              minSize={20} 
              maxSize={40}
              className="bg-gray-50 border-r border-gray-200"
            >
              <SidePanel />
            </Panel>
            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors cursor-col-resize flex items-center justify-center group">
              <div className="w-1 h-8 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors"></div>
            </PanelResizeHandle>
          </>
        )}
        <Panel className="bg-white">
          <MainContent />
        </Panel>
      </PanelGroup>
    </div>
  );
}
