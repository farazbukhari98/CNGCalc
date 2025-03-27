// Vehicle parameters
export interface VehicleParameters {
  lightDutyCount: number;
  mediumDutyCount: number;
  heavyDutyCount: number;
}

// Station configuration
export interface StationConfig {
  stationType: "fast" | "time";
  businessType: "aglc" | "cgc";
}

// Fuel prices
export interface FuelPrices {
  gasolinePrice: number;
  dieselPrice: number;
  cngPrice: number;
  annualIncrease: number;
}

// Deployment strategies
export type DeploymentStrategy = "immediate" | "phased" | "aggressive" | "deferred" | "manual";

// Vehicle distribution by year
export interface VehicleDistribution {
  light: number;
  medium: number;
  heavy: number;
  investment: number;
}

// Calculation results
export interface CalculationResults {
  totalInvestment: number;
  annualFuelSavings: number;
  yearlySavings: number[];
  cumulativeSavings: number[];
  cumulativeInvestment: number[];
  paybackPeriod: number;
  roi: number;
  annualRateOfReturn: number;
  netCashFlow: number;
  co2Reduction: number;
  yearlyEmissionsSaved: number[];
  cumulativeEmissionsSaved: number[];
  totalEmissionsSaved: number;
  costPerMileGasoline: number;
  costPerMileCNG: number;
  costReduction: number;
  vehicleDistribution: VehicleDistribution[];
}
