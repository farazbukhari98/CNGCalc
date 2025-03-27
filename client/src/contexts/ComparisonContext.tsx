import { createContext, useContext, useState, ReactNode } from "react";
import { CalculationResults, DeploymentStrategy } from "@/types/calculator";

interface ComparisonItem {
  id: string;
  strategy: DeploymentStrategy;
  strategyName: string;
  results: CalculationResults;
}

interface ComparisonContextType {
  comparisonItems: ComparisonItem[];
  addComparisonItem: (strategy: DeploymentStrategy, results: CalculationResults) => void;
  removeComparisonItem: (id: string) => void;
  clearComparisonItems: () => void;
  isInComparison: (strategy: DeploymentStrategy) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);

  const getStrategyName = (strategy: DeploymentStrategy): string => {
    const strategyNames: Record<DeploymentStrategy, string> = {
      immediate: "Immediate Deployment",
      phased: "Phased Deployment",
      aggressive: "Aggressive Early",
      deferred: "Deferred Deployment",
      manual: "Manual Distribution"
    };
    return strategyNames[strategy];
  };

  const addComparisonItem = (strategy: DeploymentStrategy, results: CalculationResults) => {
    // Only allow 4 comparison items max
    if (comparisonItems.length >= 4) {
      return;
    }

    // Don't add if this strategy is already in the comparison
    if (isInComparison(strategy)) {
      return;
    }

    const newItem: ComparisonItem = {
      id: `${strategy}-${Date.now()}`,
      strategy,
      strategyName: getStrategyName(strategy),
      results
    };

    setComparisonItems([...comparisonItems, newItem]);
  };

  const removeComparisonItem = (id: string) => {
    setComparisonItems(comparisonItems.filter(item => item.id !== id));
  };

  const clearComparisonItems = () => {
    setComparisonItems([]);
  };

  const isInComparison = (strategy: DeploymentStrategy) => {
    return comparisonItems.some(item => item.strategy === strategy);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparisonItems,
        addComparisonItem,
        removeComparisonItem,
        clearComparisonItems,
        isInComparison
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}