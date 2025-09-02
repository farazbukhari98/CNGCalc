import { createContext, useContext, useState, ReactNode } from "react";
import { CalculationResults, DeploymentStrategy } from "@/types/calculator";

interface ComparisonItem {
  id: string;
  strategy: DeploymentStrategy;
  strategyName: string;
  customName?: string; // Allow custom naming for variations
  results: CalculationResults;
  manualDistribution?: number[][]; // Store manual distribution if applicable
}

interface ComparisonContextType {
  comparisonItems: ComparisonItem[];
  addComparisonItem: (
    strategy: DeploymentStrategy, 
    results: CalculationResults, 
    customName?: string,
    manualDistribution?: number[][]
  ) => void;
  removeComparisonItem: (id: string) => void;
  clearComparisonItems: () => void;
  isInComparison: (strategy: DeploymentStrategy) => boolean;
  canAddMoreComparisons: () => boolean;
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

  const addComparisonItem = (
    strategy: DeploymentStrategy, 
    results: CalculationResults, 
    customName?: string,
    manualDistribution?: number[][]
  ) => {
    // Only allow 6 comparison items max (increased to support multiple variations)
    if (comparisonItems.length >= 6) {
      return;
    }

    // Generate a unique display name
    const baseStrategyName = getStrategyName(strategy);
    let displayName = customName || baseStrategyName;
    
    // If no custom name and strategy already exists, add a number suffix
    if (!customName) {
      const existingCount = comparisonItems.filter(item => item.strategy === strategy).length;
      if (existingCount > 0) {
        displayName = `${baseStrategyName} ${existingCount + 1}`;
      }
    }

    const newItem: ComparisonItem = {
      id: `${strategy}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      strategy,
      strategyName: displayName,
      customName,
      results,
      manualDistribution
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
    // For non-manual strategies, only check if any version exists
    if (strategy !== 'manual') {
      return comparisonItems.some(item => item.strategy === strategy);
    }
    // For manual strategies, always allow more since each can be different
    return false;
  };

  const canAddMoreComparisons = () => {
    return comparisonItems.length < 6;
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparisonItems,
        addComparisonItem,
        removeComparisonItem,
        clearComparisonItems,
        isInComparison,
        canAddMoreComparisons
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