import SidePanel from "@/components/cng-calculator/SidePanel";
import MainContent from "@/components/cng-calculator/MainContent";
import { useCalculator } from "@/contexts/CalculatorContext";

export default function Home() {
  const { sidebarCollapsed } = useCalculator();
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:w-0 overflow-hidden' : 'md:w-80'}`}>
        <SidePanel />
      </div>
      <MainContent />
    </div>
  );
}
