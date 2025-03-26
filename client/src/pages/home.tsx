import SidePanel from "@/components/cng-calculator/SidePanel";
import MainContent from "@/components/cng-calculator/MainContent";

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <SidePanel />
      <MainContent />
    </div>
  );
}
