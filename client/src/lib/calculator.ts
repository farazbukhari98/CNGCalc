import { 
  VehicleParameters, 
  StationConfig, 
  FuelPrices, 
  DeploymentStrategy, 
  VehicleDistribution, 
  CalculationResults 
} from "@/types/calculator";

// Get vehicle costs from vehicleParameters (for compatibility with old code we'll create a helper function)
const getVehicleCosts = (vehicleParams: VehicleParameters) => {
  return {
    light: vehicleParams.lightDutyCost, // CNG conversion cost for light duty vehicles
    medium: vehicleParams.mediumDutyCost, // CNG conversion cost for medium duty vehicles
    heavy: vehicleParams.heavyDutyCost   // CNG conversion cost for heavy duty vehicles
  };
};

// Diesel deduction factor (5 cents per mile)
const DIESEL_DEDUCTION_PER_MILE = 0.05;

// CNG efficiency loss percentage
const CNG_LOSS = {
  light: 0.05,   // 5% loss
  medium: 0.075, // 7.5% loss
  heavy: 0.10    // 10% loss
};

// Maintenance costs (per mile)
const MAINTENANCE_COST = {
  gasoline: 0.47,
  diesel: 0.52,
  cng: 0.47 // Same as gasoline
};

// Business rates (markup percentage applied to CNG price)
const BUSINESS_RATES = {
  aglc: 0.18,   // 18% for AGLC
  cgc: 0.192,   // 19.2% for CGC
  vng: 0.18     // 18% for VNG (same as AGLC for now)
};

// Emission factors in kg CO2 per gallon (updated values)
const EMISSION_FACTORS = {
  gasoline: 8.887,    // kg CO₂/gallon for light duty
  dieselMedium: 10.180, // kg CO₂/gallon for medium duty
  dieselHeavy: 10.180,  // kg CO₂/gallon for heavy duty (updated to match medium)
  cng: 5.511         // kg CO₂/GGE
};

// Station sizing and cost data
const FAST_FILL_STATIONS = [
  { size: 1, capacity: 100, cost: 1828172 },
  { size: 2, capacity: 72001, cost: 2150219 },
  { size: 3, capacity: 192001, cost: 2694453 },
  { size: 4, capacity: 384001, cost: 2869245 },
  { size: 5, capacity: 576001, cost: 3080351 }
];

const TIME_FILL_STATIONS = [
  { size: 6, capacity: 100, cost: 491333 },
  { size: 1, capacity: 12961, cost: 1831219 },
  { size: 2, capacity: 108001, cost: 2218147 },
  { size: 3, capacity: 288001, cost: 2907603 },
  { size: 4, capacity: 576001, cost: 3200857 },
  { size: 5, capacity: 864001, cost: 3506651 }
];

// Helper function to find peak year vehicle count from vehicle distribution
function getPeakYearVehicleCount(vehicleDistribution: VehicleDistribution[] | null): { lightDutyCount: number, mediumDutyCount: number, heavyDutyCount: number } {
  if (!vehicleDistribution || vehicleDistribution.length === 0) {
    return { lightDutyCount: 0, mediumDutyCount: 0, heavyDutyCount: 0 };
  }

  let maxLight = 0;
  let maxMedium = 0;
  let maxHeavy = 0;

  // Find the maximum vehicle count across all years for each type
  vehicleDistribution.forEach(year => {
    maxLight = Math.max(maxLight, year.light || 0);
    maxMedium = Math.max(maxMedium, year.medium || 0);
    maxHeavy = Math.max(maxHeavy, year.heavy || 0);
  });

  return {
    lightDutyCount: maxLight,
    mediumDutyCount: maxMedium,
    heavyDutyCount: maxHeavy
  };
}

// Station cost calculation
export function calculateStationCost(config: StationConfig, vehicleParams?: VehicleParameters, vehicleDistribution?: VehicleDistribution[] | null): number {
  // If no vehicle params provided, return default costs
  if (!vehicleParams) {
    const defaultCost = config.stationType === 'fast' ? 2200000 : 1200000; // Default to medium size
    // Apply turnkey markup if applicable
    const turnkeyMultiplier = config.turnkey ? 1.2 : 1.0; // 20% markup for turnkey
    return Math.round(defaultCost * turnkeyMultiplier);
  }
  
  // Determine vehicle counts based on sizing method
  let vehicleCounts: { lightDutyCount: number, mediumDutyCount: number, heavyDutyCount: number };
  
  if (config.sizingMethod === 'peak' && vehicleDistribution) {
    // Use peak year vehicle counts from deployment strategy
    vehicleCounts = getPeakYearVehicleCount(vehicleDistribution);
  } else {
    // Use total vehicle counts (default behavior)
    vehicleCounts = {
      lightDutyCount: vehicleParams.lightDutyCount,
      mediumDutyCount: vehicleParams.mediumDutyCount,
      heavyDutyCount: vehicleParams.heavyDutyCount
    };
  }

  // Calculate annual GGE (Gasoline Gallon Equivalent) consumption
  // Formula: (Annual Miles / (MPG × CNG Efficiency Factor)) × Vehicle Count
  
  // CNG efficiency factors (fuel economy reduction)
  const cngEfficiencyFactors = {
    light: 0.95,    // 95% efficiency (5% reduction)
    medium: 0.925,  // 92.5% efficiency (7.5% reduction)  
    heavy: 0.90     // 90% efficiency (10% reduction)
  };
  
  // Calculate annual GGE per vehicle type
  const lightAnnualGGE = vehicleParams.lightDutyAnnualMiles / (vehicleParams.lightDutyMPG * cngEfficiencyFactors.light);
  const mediumAnnualGGE = vehicleParams.mediumDutyAnnualMiles / (vehicleParams.mediumDutyMPG * cngEfficiencyFactors.medium);
  const heavyAnnualGGE = vehicleParams.heavyDutyAnnualMiles / (vehicleParams.heavyDutyMPG * cngEfficiencyFactors.heavy);
  
  // Total annual GGE consumption for the fleet
  const annualGGE = 
    (vehicleCounts.lightDutyCount * lightAnnualGGE) + 
    (vehicleCounts.mediumDutyCount * mediumAnnualGGE) + 
    (vehicleCounts.heavyDutyCount * heavyAnnualGGE);
  
  // Station sizing and pricing based on annual GGE consumption
  // Each station size has a maximum capacity it can handle
  const stationSizes = {
    fast: [
      { size: 1, capacity: 100, cost: 1828172 },
      { size: 2, capacity: 72001, cost: 2150219 },
      { size: 3, capacity: 192001, cost: 2694453 },
      { size: 4, capacity: 384001, cost: 2869245 },
      { size: 5, capacity: 576001, cost: 3080351 }
    ],
    time: [
      { size: 6, capacity: 100, cost: 491333 },
      { size: 1, capacity: 12961, cost: 1831219 },
      { size: 2, capacity: 108001, cost: 2218147 },
      { size: 3, capacity: 288001, cost: 2907603 },
      { size: 4, capacity: 576001, cost: 3200857 },
      { size: 5, capacity: 864001, cost: 3506651 }
    ]
  };
  
  // Find the smallest station size that can handle the required annual GGE
  const getStationSizeAndCost = () => {
    const sizes = stationSizes[config.stationType];
    
    // Sort by capacity to find the smallest size that can accommodate the consumption
    const sortedSizes = [...sizes].sort((a, b) => a.capacity - b.capacity);
    
    // Find the smallest station that can handle the required consumption
    for (const sizeOption of sortedSizes) {
      if (annualGGE <= sizeOption.capacity) {
        return sizeOption;
      }
    }
    
    // If consumption exceeds all capacities, use the largest station
    return sortedSizes[sortedSizes.length - 1];
  };
  
  const selectedStation = getStationSizeAndCost();
  const baseCost = selectedStation.cost;
  
  // Apply business type adjustment
  const businessMultiplier = config.businessType === 'cgc' ? 0.95 : 1.0; // CGC is 0.95, AGLC and VNG are 1.0
  
  // Apply turnkey markup
  const turnkeyMultiplier = config.turnkey ? 1.2 : 1.0; // 20% markup for turnkey
  
  return Math.round(baseCost * businessMultiplier * turnkeyMultiplier);
}

// Apply vehicle lifecycle management to deployment distribution
export function applyVehicleLifecycle(
  baseDistribution: VehicleDistribution[],
  vehicleParams: VehicleParameters,
  timeHorizon: number
): VehicleDistribution[] {
  const vehicleCosts = getVehicleCosts(vehicleParams);
  const VEHICLE_LIFESPAN = 7; // All vehicles have 7-year lifespan
  
  // Create enhanced distribution array
  const enhancedDistribution: VehicleDistribution[] = [];
  
  // Track cumulative vehicles purchased by year for replacement calculation
  const cumulativePurchases = {
    light: 0,
    medium: 0,
    heavy: 0
  };
  
  for (let yearIndex = 0; yearIndex < timeHorizon; yearIndex++) {
    const currentYear = baseDistribution[yearIndex] || { light: 0, medium: 0, heavy: 0, investment: 0 };
    
    // New vehicle purchases this year
    const newPurchases = {
      light: currentYear.light,
      medium: currentYear.medium,
      heavy: currentYear.heavy
    };
    
    // Calculate replacements needed this year (vehicles purchased 7 years ago)
    const replacementYear = yearIndex - VEHICLE_LIFESPAN;
    let replacements = { light: 0, medium: 0, heavy: 0 };
    
    if (replacementYear >= 0 && baseDistribution[replacementYear]) {
      replacements = {
        light: baseDistribution[replacementYear].light,
        medium: baseDistribution[replacementYear].medium,
        heavy: baseDistribution[replacementYear].heavy
      };
    }
    
    // Calculate replacement investment
    const replacementInvestment = 
      (replacements.light * vehicleCosts.light) + 
      (replacements.medium * vehicleCosts.medium) + 
      (replacements.heavy * vehicleCosts.heavy);
    
    // Update cumulative purchases (add new purchases)
    cumulativePurchases.light += newPurchases.light;
    cumulativePurchases.medium += newPurchases.medium;
    cumulativePurchases.heavy += newPurchases.heavy;
    
    // Calculate total active vehicles this year
    // This is cumulative purchases minus vehicles that have been replaced
    let totalReplacedLight = 0;
    let totalReplacedMedium = 0;
    let totalReplacedHeavy = 0;
    
    // Sum up all replacements from previous years
    for (let prevYear = 0; prevYear < yearIndex; prevYear++) {
      const replYear = prevYear - VEHICLE_LIFESPAN;
      if (replYear >= 0 && baseDistribution[replYear]) {
        totalReplacedLight += baseDistribution[replYear].light;
        totalReplacedMedium += baseDistribution[replYear].medium;
        totalReplacedHeavy += baseDistribution[replYear].heavy;
      }
    }
    
    const totalActiveLight = cumulativePurchases.light - totalReplacedLight + replacements.light;
    const totalActiveMedium = cumulativePurchases.medium - totalReplacedMedium + replacements.medium;
    const totalActiveHeavy = cumulativePurchases.heavy - totalReplacedHeavy + replacements.heavy;
    
    // Create enhanced year entry
    enhancedDistribution.push({
      // Original purchase data
      light: newPurchases.light,
      medium: newPurchases.medium,
      heavy: newPurchases.heavy,
      investment: currentYear.investment,
      
      // Replacement data
      lightReplacements: replacements.light,
      mediumReplacements: replacements.medium,
      heavyReplacements: replacements.heavy,
      replacementInvestment: replacementInvestment,
      
      // Total active vehicles
      totalActiveLight: totalActiveLight,
      totalActiveMedium: totalActiveMedium,
      totalActiveHeavy: totalActiveHeavy
    });
  }
  
  return enhancedDistribution;
}

// Get station size information
export function getStationSizeInfo(config: StationConfig, vehicleParams?: VehicleParameters, vehicleDistribution?: VehicleDistribution[] | null): { size: number; capacity: number; annualGGE: number; baseCost: number; finalCost: number } | null {
  if (!vehicleParams) return null;
  
  // Determine vehicle counts based on sizing method
  let vehicleCounts: { lightDutyCount: number, mediumDutyCount: number, heavyDutyCount: number };
  
  if (config.sizingMethod === 'peak' && vehicleDistribution) {
    vehicleCounts = getPeakYearVehicleCount(vehicleDistribution);
  } else {
    vehicleCounts = {
      lightDutyCount: vehicleParams.lightDutyCount,
      mediumDutyCount: vehicleParams.mediumDutyCount,
      heavyDutyCount: vehicleParams.heavyDutyCount
    };
  }

  // Calculate annual GGE (same logic as calculateStationCost)
  const cngEfficiencyFactors = {
    light: 0.95,
    medium: 0.925,
    heavy: 0.90
  };
  
  const lightAnnualGGE = vehicleParams.lightDutyAnnualMiles / (vehicleParams.lightDutyMPG * cngEfficiencyFactors.light);
  const mediumAnnualGGE = vehicleParams.mediumDutyAnnualMiles / (vehicleParams.mediumDutyMPG * cngEfficiencyFactors.medium);
  const heavyAnnualGGE = vehicleParams.heavyDutyAnnualMiles / (vehicleParams.heavyDutyMPG * cngEfficiencyFactors.heavy);
  
  const annualGGE = 
    (vehicleCounts.lightDutyCount * lightAnnualGGE) + 
    (vehicleCounts.mediumDutyCount * mediumAnnualGGE) + 
    (vehicleCounts.heavyDutyCount * heavyAnnualGGE);
  
  // Station sizes (same as in calculateStationCost)
  const stationSizes = {
    fast: [
      { size: 1, capacity: 100, cost: 1828172 },
      { size: 2, capacity: 72001, cost: 2150219 },
      { size: 3, capacity: 192001, cost: 2694453 },
      { size: 4, capacity: 384001, cost: 2869245 },
      { size: 5, capacity: 576001, cost: 3080351 }
    ],
    time: [
      { size: 6, capacity: 100, cost: 491333 },
      { size: 1, capacity: 12961, cost: 1831219 },
      { size: 2, capacity: 108001, cost: 2218147 },
      { size: 3, capacity: 288001, cost: 2907603 },
      { size: 4, capacity: 576001, cost: 3200857 },
      { size: 5, capacity: 864001, cost: 3506651 }
    ]
  };
  
  // Find the appropriate station size
  const sizes = stationSizes[config.stationType];
  const sortedSizes = [...sizes].sort((a, b) => a.capacity - b.capacity);
  
  let selectedStation = sortedSizes[sortedSizes.length - 1]; // Default to largest
  for (const sizeOption of sortedSizes) {
    if (annualGGE <= sizeOption.capacity) {
      selectedStation = sizeOption;
      break;
    }
  }
  
  // Calculate final cost with business adjustments and markup
  const businessMultiplier = config.businessType === 'cgc' ? 0.95 : 1.0;
  const turnkeyMultiplier = config.turnkey ? 1.2 : 1.0;
  const finalCost = Math.round(selectedStation.cost * businessMultiplier * turnkeyMultiplier);
  
  return {
    size: selectedStation.size,
    capacity: selectedStation.capacity,
    annualGGE: Math.round(annualGGE),
    baseCost: selectedStation.cost,
    finalCost: finalCost
  };
}

// Distribute vehicles across years based on strategy
export function distributeVehicles(
  vehicleParams: VehicleParameters,
  timeHorizon: number,
  strategy: DeploymentStrategy
): VehicleDistribution[] {
  const { lightDutyCount, mediumDutyCount, heavyDutyCount } = vehicleParams;
  const vehicleCosts = getVehicleCosts(vehicleParams);
  const distribution: VehicleDistribution[] = [];
  
  // Ensure distribution has elements for the full time horizon
  const ensureFullTimeHorizon = (dist: VehicleDistribution[]): VehicleDistribution[] => {
    while (dist.length < timeHorizon) {
      dist.push({
        light: 0,
        medium: 0,
        heavy: 0,
        investment: 0
      });
    }
    return dist;
  };
  
  if (strategy === 'immediate') {
    // All vehicles in first year, none in subsequent years
    const firstYearInvestment = 
      (lightDutyCount * vehicleCosts.light) + 
      (mediumDutyCount * vehicleCosts.medium) + 
      (heavyDutyCount * vehicleCosts.heavy);
    
    distribution.push({
      light: lightDutyCount,
      medium: mediumDutyCount,
      heavy: heavyDutyCount,
      investment: firstYearInvestment
    });
    
    // Add empty years for the rest of the timeline
    for (let i = 1; i < timeHorizon; i++) {
      distribution.push({
        light: 0,
        medium: 0,
        heavy: 0,
        investment: 0
      });
    }
  } else if (strategy === 'phased') {
    // Evenly distribute vehicles across years
    const lightPerYear = Math.ceil(lightDutyCount / timeHorizon);
    const mediumPerYear = Math.ceil(mediumDutyCount / timeHorizon);
    const heavyPerYear = Math.ceil(heavyDutyCount / timeHorizon);
    
    let remainingLight = lightDutyCount;
    let remainingMedium = mediumDutyCount;
    let remainingHeavy = heavyDutyCount;
    
    for (let i = 0; i < timeHorizon; i++) {
      const lightThisYear = Math.min(lightPerYear, remainingLight);
      const mediumThisYear = Math.min(mediumPerYear, remainingMedium);
      const heavyThisYear = Math.min(heavyPerYear, remainingHeavy);
      
      remainingLight -= lightThisYear;
      remainingMedium -= mediumThisYear;
      remainingHeavy -= heavyThisYear;
      
      const yearInvestment = 
        (lightThisYear * vehicleCosts.light) + 
        (mediumThisYear * vehicleCosts.medium) + 
        (heavyThisYear * vehicleCosts.heavy);
      
      distribution.push({
        light: lightThisYear,
        medium: mediumThisYear,
        heavy: heavyThisYear,
        investment: yearInvestment
      });
    }
  } else if (strategy === 'aggressive') {
    // Front-load: 50% in first year, then distribute the rest
    const firstYearLight = Math.ceil(lightDutyCount * 0.5);
    const firstYearMedium = Math.ceil(mediumDutyCount * 0.5);
    const firstYearHeavy = Math.ceil(heavyDutyCount * 0.5);
    
    const firstYearInvestment = 
      (firstYearLight * vehicleCosts.light) + 
      (firstYearMedium * vehicleCosts.medium) + 
      (firstYearHeavy * vehicleCosts.heavy);
    
    distribution.push({
      light: firstYearLight,
      medium: firstYearMedium,
      heavy: firstYearHeavy,
      investment: firstYearInvestment
    });
    
    // Distribute remaining vehicles across remaining years
    const remainingLight = lightDutyCount - firstYearLight;
    const remainingMedium = mediumDutyCount - firstYearMedium;
    const remainingHeavy = heavyDutyCount - firstYearHeavy;
    
    const remainingYears = timeHorizon - 1;
    
    if (remainingYears > 0) {
      const lightPerYear = Math.ceil(remainingLight / remainingYears);
      const mediumPerYear = Math.ceil(remainingMedium / remainingYears);
      const heavyPerYear = Math.ceil(remainingHeavy / remainingYears);
      
      let rLight = remainingLight;
      let rMedium = remainingMedium;
      let rHeavy = remainingHeavy;
      
      for (let i = 0; i < remainingYears; i++) {
        const lightThisYear = Math.min(lightPerYear, rLight);
        const mediumThisYear = Math.min(mediumPerYear, rMedium);
        const heavyThisYear = Math.min(heavyPerYear, rHeavy);
        
        rLight -= lightThisYear;
        rMedium -= mediumThisYear;
        rHeavy -= heavyThisYear;
        
        const yearInvestment = 
          (lightThisYear * vehicleCosts.light) + 
          (mediumThisYear * vehicleCosts.medium) + 
          (heavyThisYear * vehicleCosts.heavy);
        
        distribution.push({
          light: lightThisYear,
          medium: mediumThisYear,
          heavy: heavyThisYear,
          investment: yearInvestment
        });
      }
    }
    
    // Ensure we have distribution entries for all years
    ensureFullTimeHorizon(distribution);
  } else if (strategy === 'deferred') {
    // Back-load: Minimal in early years, 50% in final year
    const finalYearLight = Math.ceil(lightDutyCount * 0.5);
    const finalYearMedium = Math.ceil(mediumDutyCount * 0.5);
    const finalYearHeavy = Math.ceil(heavyDutyCount * 0.5);
    
    const remainingLight = lightDutyCount - finalYearLight;
    const remainingMedium = mediumDutyCount - finalYearMedium;
    const remainingHeavy = heavyDutyCount - finalYearHeavy;
    
    const earlierYears = timeHorizon - 1;
    
    if (earlierYears > 0) {
      const lightPerYear = Math.ceil(remainingLight / earlierYears);
      const mediumPerYear = Math.ceil(remainingMedium / earlierYears);
      const heavyPerYear = Math.ceil(remainingHeavy / earlierYears);
      
      let rLight = remainingLight;
      let rMedium = remainingMedium;
      let rHeavy = remainingHeavy;
      
      for (let i = 0; i < earlierYears; i++) {
        const lightThisYear = Math.min(lightPerYear, rLight);
        const mediumThisYear = Math.min(mediumPerYear, rMedium);
        const heavyThisYear = Math.min(heavyPerYear, rHeavy);
        
        rLight -= lightThisYear;
        rMedium -= mediumThisYear;
        rHeavy -= heavyThisYear;
        
        const yearInvestment = 
          (lightThisYear * vehicleCosts.light) + 
          (mediumThisYear * vehicleCosts.medium) + 
          (heavyThisYear * vehicleCosts.heavy);
        
        distribution.push({
          light: lightThisYear,
          medium: mediumThisYear,
          heavy: heavyThisYear,
          investment: yearInvestment
        });
      }
    }
    
    // Add the final year with the heavy investment
    const finalYearInvestment = 
      (finalYearLight * vehicleCosts.light) + 
      (finalYearMedium * vehicleCosts.medium) + 
      (finalYearHeavy * vehicleCosts.heavy);
    
    distribution.push({
      light: finalYearLight,
      medium: finalYearMedium,
      heavy: finalYearHeavy,
      investment: finalYearInvestment
    });
    
    // Ensure we have distribution entries for all years
    ensureFullTimeHorizon(distribution);
  } else if (strategy === 'manual') {
    // For manual distribution, initialize with placeholder values 
    // that will be updated by the user input
    for (let i = 0; i < timeHorizon; i++) {
      // For initial setup, evenly distribute vehicles
      const lightThisYear = Math.ceil(lightDutyCount / timeHorizon);
      const mediumThisYear = Math.ceil(mediumDutyCount / timeHorizon);
      const heavyThisYear = Math.ceil(heavyDutyCount / timeHorizon);
      
      const yearInvestment = 
        (lightThisYear * vehicleCosts.light) + 
        (mediumThisYear * vehicleCosts.medium) + 
        (heavyThisYear * vehicleCosts.heavy);
      
      distribution.push({
        light: lightThisYear,
        medium: mediumThisYear,
        heavy: heavyThisYear,
        investment: yearInvestment
      });
    }
  } else {
    // Default to phased strategy if the strategy is unknown
    return distributeVehicles(vehicleParams, timeHorizon, 'phased');
  }
  
  return distribution;
}

// Calculate ROI and other financial metrics
export function calculateROI(
  vehicleParams: VehicleParameters,
  stationConfig: StationConfig,
  fuelPrices: FuelPrices,
  timeHorizon: number,
  strategy: DeploymentStrategy,
  vehicleDistribution: VehicleDistribution[]
): CalculationResults {
  // Create fuel efficiency object from vehicle parameters (no efficiency loss for CNG)
  const FUEL_EFFICIENCY = {
    light: { 
      gasoline: vehicleParams.lightDutyMPG,
      diesel: vehicleParams.lightDutyMPG,
      cng: vehicleParams.lightDutyMPG 
    },
    medium: { 
      gasoline: vehicleParams.mediumDutyMPG,
      diesel: vehicleParams.mediumDutyMPG, 
      cng: vehicleParams.mediumDutyMPG 
    },
    heavy: { 
      gasoline: vehicleParams.heavyDutyMPG,
      diesel: vehicleParams.heavyDutyMPG, 
      cng: vehicleParams.heavyDutyMPG 
    }
  };
  // Calculate total vehicle investment
  const vehicleCosts = getVehicleCosts(vehicleParams);
  const totalVehicleInvestment = 
    (vehicleParams.lightDutyCount * vehicleCosts.light) + 
    (vehicleParams.mediumDutyCount * vehicleCosts.medium) + 
    (vehicleParams.heavyDutyCount * vehicleCosts.heavy);
  
  // Calculate station cost based on vehicle parameters
  const stationCost = calculateStationCost(stationConfig, vehicleParams, vehicleDistribution);
  
  // Total investment - only include station cost upfront if turnkey is true
  const totalInvestment = totalVehicleInvestment + (stationConfig.turnkey ? stationCost : 0);
  
  // Ensure the vehicleDistribution array is long enough
  // (this should be handled already by distributeVehicles, but ensuring it here too)
  const ensuredDistribution = [...vehicleDistribution];
  while (ensuredDistribution.length < timeHorizon) {
    ensuredDistribution.push({
      light: 0,
      medium: 0,
      heavy: 0,
      investment: 0
    });
  }
  
  // Calculate yearly savings
  const yearlySavings: number[] = [];
  const yearlyFuelSavings: number[] = [];
  const yearlyMaintenanceSavings: number[] = [];
  const yearlyTariffFees: number[] = [];
  const cumulativeSavings: number[] = [];
  const cumulativeInvestment: number[] = [];
  
  // When turnkey is true, station cost is applied upfront
  // When turnkey is false, station cost is $0 upfront (not included in cumulativeInvestment)
  let cumulativeInvestmentToDate = stationConfig.turnkey ? stationCost : 0;
  
  // Monthly LDC investment tariff rates (as decimal) - 1.5% for AGLC/VNG, 1.6% for CGC
  // For non-TurnKey, this is a fixed monthly percentage of the station cost
  const monthlyTariffRate = stationConfig.businessType === 'cgc' ? 0.016 : 0.015; // CGC is 1.6%, AGLC and VNG are 1.5%
  // Annual tariff amount (monthly rate * 12 months)
  const annualTariffRate = monthlyTariffRate * 12;
  
  for (let year = 0; year < timeHorizon; year++) {
    // Calculate number of each vehicle type in operation this year (cumulative)
    let lightInOperation = 0;
    let mediumInOperation = 0;
    let heavyInOperation = 0;
    
    for (let i = 0; i <= year && i < ensuredDistribution.length; i++) {
      lightInOperation += ensuredDistribution[i].light || 0;
      mediumInOperation += ensuredDistribution[i].medium || 0;
      heavyInOperation += ensuredDistribution[i].heavy || 0;
    }
    
    // Factor in annual fuel price increase
    const yearMultiplier = Math.pow(1 + (fuelPrices.annualIncrease / 100), year);
    const adjustedGasolinePrice = fuelPrices.gasolinePrice * yearMultiplier;
    const adjustedDieselPrice = fuelPrices.dieselPrice * yearMultiplier;
    
    // Calculate CNG price without business rate (electricity already included in base price)
    const baseCngPrice = fuelPrices.cngPrice;
    const adjustedCngPrice = baseCngPrice * yearMultiplier;
    
    // Calculate fuel savings for each vehicle type using proper fuel efficiency accounting
    const lightConventionalPrice = vehicleParams.lightDutyFuelType === 'gasoline' ? adjustedGasolinePrice : adjustedDieselPrice;
    const lightConventionalEfficiency = vehicleParams.lightDutyFuelType === 'gasoline' ? FUEL_EFFICIENCY.light.gasoline : FUEL_EFFICIENCY.light.diesel;
    const lightFuelSavings = 
      ((lightInOperation * vehicleParams.lightDutyAnnualMiles) / lightConventionalEfficiency) * lightConventionalPrice -
      ((lightInOperation * vehicleParams.lightDutyAnnualMiles) / FUEL_EFFICIENCY.light.cng) * adjustedCngPrice;
    
    const mediumConventionalPrice = vehicleParams.mediumDutyFuelType === 'gasoline' ? adjustedGasolinePrice : adjustedDieselPrice;
    const mediumConventionalEfficiency = vehicleParams.mediumDutyFuelType === 'gasoline' ? FUEL_EFFICIENCY.medium.gasoline : FUEL_EFFICIENCY.medium.diesel;
    const mediumFuelSavings = 
      ((mediumInOperation * vehicleParams.mediumDutyAnnualMiles) / mediumConventionalEfficiency) * mediumConventionalPrice -
      ((mediumInOperation * vehicleParams.mediumDutyAnnualMiles) / FUEL_EFFICIENCY.medium.cng) * adjustedCngPrice;
    
    const heavyConventionalPrice = vehicleParams.heavyDutyFuelType === 'gasoline' ? adjustedGasolinePrice : adjustedDieselPrice;
    const heavyConventionalEfficiency = vehicleParams.heavyDutyFuelType === 'gasoline' ? FUEL_EFFICIENCY.heavy.gasoline : FUEL_EFFICIENCY.heavy.diesel;
    const heavyFuelSavings = 
      ((heavyInOperation * vehicleParams.heavyDutyAnnualMiles) / heavyConventionalEfficiency) * heavyConventionalPrice -
      ((heavyInOperation * vehicleParams.heavyDutyAnnualMiles) / FUEL_EFFICIENCY.heavy.cng) * adjustedCngPrice;
    
    // Calculate maintenance savings based on miles driven using vehicle-specific annual miles
    const lightMilesDriven = lightInOperation * vehicleParams.lightDutyAnnualMiles;
    const mediumMilesDriven = mediumInOperation * vehicleParams.mediumDutyAnnualMiles;
    const heavyMilesDriven = heavyInOperation * vehicleParams.heavyDutyAnnualMiles;
    
    // Maintenance savings: $0.05 per mile for diesel vehicles only
    const lightMaintenanceSavings = vehicleParams.lightDutyFuelType === 'diesel' ? lightMilesDriven * DIESEL_DEDUCTION_PER_MILE : 0;
    const mediumMaintenanceSavings = vehicleParams.mediumDutyFuelType === 'diesel' ? mediumMilesDriven * DIESEL_DEDUCTION_PER_MILE : 0;
    const heavyMaintenanceSavings = vehicleParams.heavyDutyFuelType === 'diesel' ? heavyMilesDriven * DIESEL_DEDUCTION_PER_MILE : 0;
    
    const maintenanceSavings = lightMaintenanceSavings + mediumMaintenanceSavings + heavyMaintenanceSavings;
    
    // Calculate annual LDC investment tariff for non-turnkey option
    // This is a fixed monthly cost that continues for the entire period
    let annualTariffFee = 0;
    if (!stationConfig.turnkey) {
      annualTariffFee = stationCost * annualTariffRate;
    }
    
    // Separate fuel and maintenance savings (before tariff fees)
    const totalFuelSavings = lightFuelSavings + mediumFuelSavings + heavyFuelSavings;
    
    // Total savings for the year (subtract tariff fee if applicable)
    const yearSavings = totalFuelSavings + maintenanceSavings - annualTariffFee;
    
    yearlySavings.push(Math.round(yearSavings));
    yearlyFuelSavings.push(Math.round(totalFuelSavings));
    yearlyMaintenanceSavings.push(Math.round(maintenanceSavings));
    yearlyTariffFees.push(Math.round(annualTariffFee));
    
    // Update cumulative savings
    const prevCumulativeSavings = year > 0 ? cumulativeSavings[year - 1] : 0;
    cumulativeSavings.push(Math.round(prevCumulativeSavings + yearSavings));
    
    // Update cumulative investment
    const yearInvestment = year < ensuredDistribution.length ? ensuredDistribution[year].investment : 0;
    cumulativeInvestmentToDate += yearInvestment;
    cumulativeInvestment.push(Math.round(cumulativeInvestmentToDate));
  }
  
  // Calculate payback period - find when cumulative savings exceeds investment
  let paybackPeriod = -1; // Default to -1 which will indicate no payback is possible
  
  // Check if it ever pays back within the analysis period
  for (let i = 0; i < timeHorizon; i++) {
    if (cumulativeSavings[i] >= cumulativeInvestment[i]) {
      // Simple linear interpolation for partial year
      if (i > 0) {
        const previousGap = cumulativeInvestment[i-1] - cumulativeSavings[i-1];
        const currentOverage = cumulativeSavings[i] - cumulativeInvestment[i];
        const fractionalYear = i - (previousGap / (previousGap + currentOverage));
        paybackPeriod = Math.max(1, fractionalYear); // Ensure at least 1 year
      } else {
        paybackPeriod = 1; // If it pays back in first year
      }
      break;
    }
  }
  
  // If no payback within time horizon, calculate projected payback
  // by extrapolating from the final years' trend
  if (paybackPeriod === -1 && timeHorizon > 1) {
    // Check if savings are still growing in the final years
    const finalYearSavingsGrowth = cumulativeSavings[timeHorizon-1] - cumulativeSavings[timeHorizon-2];
    
    if (finalYearSavingsGrowth > 0) {
      // Get final gap between investment and savings
      const gap = cumulativeInvestment[timeHorizon-1] - cumulativeSavings[timeHorizon-1];
      
      // Calculate additional years needed to reach payback based on final year's growth rate
      const additionalYearsToPayback = gap / finalYearSavingsGrowth;
      
      // Only return a projected payback if it's reasonably achievable (within 50 years total)
      if (timeHorizon + additionalYearsToPayback <= 50) {
        paybackPeriod = timeHorizon + additionalYearsToPayback;
      }
    }
  }
  
  // Calculate ROI at the end of the analysis period
  const finalSavings = cumulativeSavings[timeHorizon - 1];
  const roi = (finalSavings / totalInvestment) * 100;
  
  // Annual rate of return
  const annualRateOfReturn = (Math.pow((finalSavings / totalInvestment) + 1, 1 / timeHorizon) - 1) * 100;
  
  // Calculate net cash flow at the end of the analysis period
  const netCashFlow = finalSavings - totalInvestment;
  
  // Calculate annual fuel savings (average)
  const annualFuelSavings = finalSavings / timeHorizon;
  
  // Calculate CO2 emissions and reduction
  // Use the defined emission factors at the top of the file
  
  // Emission factors for vehicles (g CO2 per mile) - more precise calculation
  const VEHICLE_EMISSION_FACTORS = {
    light: {
      gasoline: 404, // g CO2 per mile for light-duty gasoline vehicles
      cng: 303       // g CO2 per mile for light-duty CNG vehicles
    },
    medium: {
      diesel: 690,   // g CO2 per mile for medium-duty diesel vehicles  
      cng: 520       // g CO2 per mile for medium-duty CNG vehicles
    },
    heavy: {
      diesel: 690,   // g CO2 per mile for heavy-duty diesel vehicles (updated to match medium-duty)
      cng: 520       // g CO2 per mile for heavy-duty CNG vehicles (updated to match medium-duty)
    }
  };

  // Calculate total emissions for conventional fuels vs CNG
  let totalConventionalEmissions = 0;
  let totalCngEmissions = 0;
  let yearlyEmissionsSaved: number[] = [];
  let cumulativeEmissionsSaved: number[] = [];
  let cumulativeEmissionsSavedToDate = 0;

  for (let year = 0; year < timeHorizon; year++) {
    // Calculate number of each vehicle type in operation this year (cumulative)
    let lightInOperation = 0;
    let mediumInOperation = 0;
    let heavyInOperation = 0;
    
    for (let i = 0; i <= year && i < ensuredDistribution.length; i++) {
      lightInOperation += ensuredDistribution[i].light || 0;
      mediumInOperation += ensuredDistribution[i].medium || 0;
      heavyInOperation += ensuredDistribution[i].heavy || 0;
    }

    // Calculate conventional emissions using g/mile emission factors (more accurate)
    const lightGasolineEmissions = lightInOperation * vehicleParams.lightDutyAnnualMiles * VEHICLE_EMISSION_FACTORS.light.gasoline / 1000; // convert g to kg
    const mediumDieselEmissions = mediumInOperation * vehicleParams.mediumDutyAnnualMiles * VEHICLE_EMISSION_FACTORS.medium.diesel / 1000;
    const heavyDieselEmissions = heavyInOperation * vehicleParams.heavyDutyAnnualMiles * VEHICLE_EMISSION_FACTORS.heavy.diesel / 1000;
    
    const yearConventionalEmissions = lightGasolineEmissions + mediumDieselEmissions + heavyDieselEmissions;
    
    // Calculate CNG emissions using g/mile emission factors
    const lightCngEmissions = lightInOperation * vehicleParams.lightDutyAnnualMiles * VEHICLE_EMISSION_FACTORS.light.cng / 1000; // convert g to kg
    const mediumCngEmissions = mediumInOperation * vehicleParams.mediumDutyAnnualMiles * VEHICLE_EMISSION_FACTORS.medium.cng / 1000;
    const heavyCngEmissions = heavyInOperation * vehicleParams.heavyDutyAnnualMiles * VEHICLE_EMISSION_FACTORS.heavy.cng / 1000;
    
    const yearCngEmissions = lightCngEmissions + mediumCngEmissions + heavyCngEmissions;
    
    // Calculate emissions savings for this year
    const yearEmissionsSaved = yearConventionalEmissions - yearCngEmissions;
    
    // Update totals
    totalConventionalEmissions += yearConventionalEmissions;
    totalCngEmissions += yearCngEmissions;
    
    // Track yearly and cumulative emissions saved
    yearlyEmissionsSaved.push(Math.round(yearEmissionsSaved));
    cumulativeEmissionsSavedToDate += yearEmissionsSaved;
    cumulativeEmissionsSaved.push(Math.round(cumulativeEmissionsSavedToDate));
  }
  
  // Calculate total CO2 reduction percentage
  const co2Reduction = totalConventionalEmissions > 0 
    ? ((totalConventionalEmissions - totalCngEmissions) / totalConventionalEmissions) * 100 
    : 0;
  
  // Calculate cost per mile metrics
  const costPerMileGasoline = fuelPrices.gasolinePrice / FUEL_EFFICIENCY.light.gasoline;
  
  // Calculate CNG price without business rate (electricity already included in base price)
  const costPerMileCNG = fuelPrices.cngPrice / FUEL_EFFICIENCY.light.cng;
  
  const costReduction = ((costPerMileGasoline - costPerMileCNG) / costPerMileGasoline) * 100;
  
  // Total emissions saved in kg (convert to metric tons for display)
  const totalEmissionsSaved = cumulativeEmissionsSaved.length > 0 
    ? cumulativeEmissionsSaved[cumulativeEmissionsSaved.length - 1] 
    : 0;

  return {
    totalInvestment,
    annualFuelSavings,
    yearlySavings,
    yearlyFuelSavings,
    yearlyMaintenanceSavings,
    yearlyTariffFees,
    cumulativeSavings,
    cumulativeInvestment,
    paybackPeriod,
    roi,
    annualRateOfReturn,
    netCashFlow,
    co2Reduction,
    yearlyEmissionsSaved,
    cumulativeEmissionsSaved,
    totalEmissionsSaved,
    costPerMileGasoline,
    costPerMileCNG,
    costReduction,
    vehicleDistribution: ensuredDistribution
  };
}
