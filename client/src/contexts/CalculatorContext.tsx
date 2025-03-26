import { createContext, useContext, useState, ReactNode } from "react";
import { 
  VehicleParameters, 
  StationConfig, 
  FuelPrices,
  DeploymentStrategy,
  CalculationResults,
  VehicleDistribution 
} from "@/types/calculator";
import { calculateROI, distributeVehicles } from "@/lib/calculator";

// Context type
interface CalculatorContextType {
  vehicleParameters: VehicleParameters;
  stationConfig: StationConfig;
  fuelPrices: FuelPrices;
  timeHorizon: number;
  deploymentStrategy: DeploymentStrategy;
  vehicleDistribution: VehicleDistribution[] | null;
  results: CalculationResults | null;
  
  updateVehicleParameters: (params: VehicleParameters) => void;
  updateStationConfig: (config: StationConfig) => void;
  updateFuelPrices: (prices: FuelPrices) => void;
  updateTimeHorizon: (years: number) => void;
  updateDeploymentStrategy: (strategy: DeploymentStrategy) => void;
  setDistributionStrategy: (strategy: DeploymentStrategy) => void;
  calculateResults: () => void;
}

// Create the context
const CalculatorContext = createContext<CalculatorContextType | null>(null);

// Provider component
export function CalculatorProvider({ children }: { children: ReactNode }) {
  // Initial state values
  const [vehicleParameters, setVehicleParameters] = useState<VehicleParameters>({
    lightDutyCount: 10,
    mediumDutyCount: 5,
    heavyDutyCount: 2
  });

  const [stationConfig, setStationConfig] = useState<StationConfig>({
    stationType: "fast",
    businessType: "aglc"
  });

  const [fuelPrices, setFuelPrices] = useState<FuelPrices>({
    gasolinePrice: 3.85,
    dieselPrice: 4.25,
    cngPrice: 2.15,
    annualIncrease: 2.5
  });

  const [timeHorizon, setTimeHorizon] = useState<number>(5);
  const [deploymentStrategy, setDeploymentStrategy] = useState<DeploymentStrategy>("phased");
  const [vehicleDistribution, setVehicleDistribution] = useState<VehicleDistribution[] | null>(null);
  const [results, setResults] = useState<CalculationResults | null>(null);

  // Method to update vehicle parameters
  const updateVehicleParameters = (params: VehicleParameters) => {
    setVehicleParameters(params);
  };

  // Method to update station configuration
  const updateStationConfig = (config: StationConfig) => {
    setStationConfig(config);
  };

  // Method to update fuel prices
  const updateFuelPrices = (prices: FuelPrices) => {
    setFuelPrices(prices);
  };

  // Method to update time horizon
  const updateTimeHorizon = (years: number) => {
    setTimeHorizon(years);
  };

  // Method to update deployment strategy
  const updateDeploymentStrategy = (strategy: DeploymentStrategy) => {
    setDeploymentStrategy(strategy);
    
    // If we change to or from immediate, recalculate
    if (strategy === 'immediate' || deploymentStrategy === 'immediate') {
      // We need to redistribute vehicles if we're changing to or from immediate
      const distribution = distributeVehicles(
        vehicleParameters,
        timeHorizon,
        strategy
      );
      setVehicleDistribution(distribution);
    }
  };

  // Method to change distribution strategy without changing overall deployment strategy
  const setDistributionStrategy = (strategy: DeploymentStrategy) => {
    if (strategy !== 'manual') {
      setDeploymentStrategy(strategy);
      const distribution = distributeVehicles(
        vehicleParameters,
        timeHorizon,
        strategy
      );
      setVehicleDistribution(distribution);
      
      // Recalculate with new distribution
      if (distribution) {
        const calculationResults = calculateROI(
          vehicleParameters,
          stationConfig,
          fuelPrices,
          timeHorizon,
          strategy,
          distribution
        );
        setResults(calculationResults);
      }
    }
  };

  // Method to calculate ROI and other metrics
  const calculateResults = () => {
    // First, distribute vehicles based on strategy
    const distribution = distributeVehicles(
      vehicleParameters,
      timeHorizon,
      deploymentStrategy
    );
    setVehicleDistribution(distribution);
    
    // Then calculate ROI and other metrics
    if (distribution) {
      const calculationResults = calculateROI(
        vehicleParameters,
        stationConfig,
        fuelPrices,
        timeHorizon,
        deploymentStrategy,
        distribution
      );
      setResults(calculationResults);
    }
  };

  // Context value
  const value = {
    vehicleParameters,
    stationConfig,
    fuelPrices,
    timeHorizon,
    deploymentStrategy,
    vehicleDistribution,
    results,
    
    updateVehicleParameters,
    updateStationConfig,
    updateFuelPrices,
    updateTimeHorizon,
    updateDeploymentStrategy,
    setDistributionStrategy,
    calculateResults
  };

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
}

// Custom hook for using the calculator context
export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error("useCalculator must be used within a CalculatorProvider");
  }
  return context;
}
