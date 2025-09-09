// Vehicle parameters
export interface VehicleParameters {
  lightDutyCount: number;
  mediumDutyCount: number;
  heavyDutyCount: number;
  lightDutyCost: number;
  mediumDutyCost: number;
  heavyDutyCost: number;
  lightDutyLifespan: number;  // Average lifespan in years
  mediumDutyLifespan: number; // Average lifespan in years
  heavyDutyLifespan: number;  // Average lifespan in years
  lightDutyMPG: number;       // Miles per gallon
  mediumDutyMPG: number;      // Miles per gallon 
  heavyDutyMPG: number;       // Miles per gallon
  lightDutyAnnualMiles: number; // Annual miles driven
  mediumDutyAnnualMiles: number; // Annual miles driven
  heavyDutyAnnualMiles: number;  // Annual miles driven
  lightDutyFuelType: 'gasoline' | 'diesel';   // Fuel type for light duty vehicles
  mediumDutyFuelType: 'gasoline' | 'diesel';  // Fuel type for medium duty vehicles
  heavyDutyFuelType: 'gasoline' | 'diesel';   // Fuel type for heavy duty vehicles
}

// Station configuration
export interface StationConfig {
  stationType: "fast" | "time";
  businessType: "aglc" | "cgc" | "vng";
  turnkey: boolean; // Yes = upfront cost, No = financed cost
  sizingMethod: "total" | "peak"; // Total vehicles vs peak year usage
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

// Vehicle distribution by year with lifecycle tracking
export interface VehicleDistribution {
  // New vehicle purchases in this year
  light: number;
  medium: number;
  heavy: number;
  investment: number;
  
  // Replacement vehicles in this year (due to 7-year lifespan)
  lightReplacements?: number;
  mediumReplacements?: number;
  heavyReplacements?: number;
  replacementInvestment?: number;
  
  // Total active vehicles in this year (existing + new + replacements, avoiding double count)
  totalActiveLight?: number;
  totalActiveMedium?: number;
  totalActiveHeavy?: number;
}

// Calculation results
export interface CalculationResults {
  totalInvestment: number;
  annualFuelSavings: number;
  yearlySavings: number[];
  yearlyFuelSavings: number[];
  yearlyMaintenanceSavings: number[];
  yearlyTariffFees: number[];
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
