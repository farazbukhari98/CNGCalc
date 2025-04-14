import { createContext, useContext, useState, ReactNode } from "react";

type TooltipContextType = {
  showDetailedTooltips: boolean;
  toggleDetailedTooltips: () => void;
};

const TooltipContext = createContext<TooltipContextType | null>(null);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [showDetailedTooltips, setShowDetailedTooltips] = useState<boolean>(false);

  const toggleDetailedTooltips = () => {
    setShowDetailedTooltips((prev) => !prev);
  };

  return (
    <TooltipContext.Provider value={{ showDetailedTooltips, toggleDetailedTooltips }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltips() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltips must be used within a TooltipProvider");
  }
  return context;
}