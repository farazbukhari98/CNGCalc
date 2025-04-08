import { 
  VehicleParameters, 
  StationConfig, 
  FuelPrices, 
  DeploymentStrategy, 
  VehicleDistribution, 
  CalculationResults 
} from "@/types/calculator";

// Vehicle costs (CNG conversion costs)
const VEHICLE_COSTS = {
  light: 15000, // CNG conversion cost for light duty vehicles
  medium: 15000, // CNG conversion cost for medium duty vehicles
  heavy: 50000   // CNG conversion cost for heavy duty vehicles
};

// Annual mileage assumptions
const ANNUAL_MILEAGE = {
  light: 15000,
  medium: 20000,
  heavy: 40000
};

// Vehicle lifespan in years
const VEHICLE_LIFESPAN = {
  light: 10,
  medium: 10,
  heavy: 15
};

// Fuel efficiency assumptions (miles per gallon)
const FUEL_EFFICIENCY = {
  light: { gasoline: 12, cng: 12 * (1 - 0.05) }, // 5% efficiency loss for light duty
  medium: { diesel: 10, cng: 10 * (1 - 0.075) }, // 7.5% efficiency loss for medium duty
  heavy: { diesel: 5, cng: 5 * (1 - 0.10) }     // 10% efficiency loss for heavy duty
};

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
  cgc: 0.192    // 19.2% for CGC
};

// Emission factors in kg CO2 per gallon
const EMISSION_FACTORS = {
  gasoline: 8.887,    // kg CO₂/gallon for light duty
  dieselMedium: 10.180, // kg CO₂/gallon for medium duty
  dieselHeavy: 10.210,  // kg CO₂/gallon for heavy duty
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

// Station cost calculation
export function calculateStationCost(config: StationConfig, vehicleParams?: VehicleParameters): number {
  // Calculate estimated daily GGE (gasoline gallon equivalent) consumption
  let estimatedAnnualGGE = 0;
  
  if (vehicleParams) {
    // Light-duty vehicles (gasoline to CNG)
    estimatedAnnualGGE += vehicleParams.lightDutyCount * 
                          ANNUAL_MILEAGE.light / 
                          FUEL_EFFICIENCY.light.cng;
    
    // Medium-duty vehicles (diesel to CNG) 
    estimatedAnnualGGE += vehicleParams.mediumDutyCount * 
                          ANNUAL_MILEAGE.medium / 
                          FUEL_EFFICIENCY.medium.cng;
    
    // Heavy-duty vehicles (diesel to CNG)
    estimatedAnnualGGE += vehicleParams.heavyDutyCount * 
                          ANNUAL_MILEAGE.heavy / 
                          FUEL_EFFICIENCY.heavy.cng;
  } else {
    // Default to a station that can handle 50 vehicles if no params provided
    estimatedAnnualGGE = 50 * 20000 / 10; // 50 vehicles * 20k miles / 10 MPG average
  }
  
  // Calculate daily GGE
  const dailyGGE = estimatedAnnualGGE / 365;
  
  // Select appropriate station size based on capacity needs
  const stations = config.stationType === 'fast' ? FAST_FILL_STATIONS : TIME_FILL_STATIONS;
  
  // Find the smallest station that can handle our capacity
  let selectedStation = stations[0]; // Default to smallest
  
  for (const station of stations) {
    if (station.capacity >= dailyGGE) {
      selectedStation = station;
      break;
    }
  }
  
  // If no station is big enough, use the largest available
  if (selectedStation.capacity < dailyGGE && stations.length > 0) {
    selectedStation = stations[stations.length - 1];
  }
  
  // Apply business type adjustment (AGLC stations have higher costs due to different standards)
  const businessMultiplier = config.businessType === 'aglc' ? 1.0 : 0.9;
  
  return Math.round(selectedStation.cost * businessMultiplier);
}

// Distribute vehicles across years based on strategy
export function distributeVehicles(
  vehicleParams: VehicleParameters,
  timeHorizon: number,
  strategy: DeploymentStrategy
): VehicleDistribution[] {
  const { lightDutyCount, mediumDutyCount, heavyDutyCount } = vehicleParams;
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
      (lightDutyCount * VEHICLE_COSTS.light) + 
      (mediumDutyCount * VEHICLE_COSTS.medium) + 
      (heavyDutyCount * VEHICLE_COSTS.heavy);
    
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
        (lightThisYear * VEHICLE_COSTS.light) + 
        (mediumThisYear * VEHICLE_COSTS.medium) + 
        (heavyThisYear * VEHICLE_COSTS.heavy);
      
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
      (firstYearLight * VEHICLE_COSTS.light) + 
      (firstYearMedium * VEHICLE_COSTS.medium) + 
      (firstYearHeavy * VEHICLE_COSTS.heavy);
    
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
          (lightThisYear * VEHICLE_COSTS.light) + 
          (mediumThisYear * VEHICLE_COSTS.medium) + 
          (heavyThisYear * VEHICLE_COSTS.heavy);
        
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
          (lightThisYear * VEHICLE_COSTS.light) + 
          (mediumThisYear * VEHICLE_COSTS.medium) + 
          (heavyThisYear * VEHICLE_COSTS.heavy);
        
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
      (finalYearLight * VEHICLE_COSTS.light) + 
      (finalYearMedium * VEHICLE_COSTS.medium) + 
      (finalYearHeavy * VEHICLE_COSTS.heavy);
    
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
        (lightThisYear * VEHICLE_COSTS.light) + 
        (mediumThisYear * VEHICLE_COSTS.medium) + 
        (heavyThisYear * VEHICLE_COSTS.heavy);
      
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
  // Calculate total vehicle investment
  const totalVehicleInvestment = 
    (vehicleParams.lightDutyCount * VEHICLE_COSTS.light) + 
    (vehicleParams.mediumDutyCount * VEHICLE_COSTS.medium) + 
    (vehicleParams.heavyDutyCount * VEHICLE_COSTS.heavy);
  
  // Calculate station cost based on vehicle parameters
  const stationCost = calculateStationCost(stationConfig, vehicleParams);
  
  // Total investment
  const totalInvestment = totalVehicleInvestment + stationCost;
  
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
  const cumulativeSavings: number[] = [];
  const cumulativeInvestment: number[] = [];
  let cumulativeInvestmentToDate = stationCost; // Station cost is applied on year 1
  
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
    
    // Calculate CNG price with electricity cost and business rate
    const ELECTRICITY_COST_PER_GGE = 0.08; // $0.08 per GGE
    const businessRate = stationConfig.businessType === 'aglc' ? BUSINESS_RATES.aglc : BUSINESS_RATES.cgc;
    const baseCngPrice = fuelPrices.cngPrice;
    const cngWithElectricity = baseCngPrice + ELECTRICITY_COST_PER_GGE;
    const cngWithBusinessRate = cngWithElectricity * (1 + businessRate);
    const adjustedCngPrice = cngWithBusinessRate * yearMultiplier;
    
    // Calculate fuel savings for each vehicle type
    const lightFuelSavings = 
      lightInOperation * 
      ANNUAL_MILEAGE.light * 
      ((adjustedGasolinePrice / FUEL_EFFICIENCY.light.gasoline) - 
      (adjustedCngPrice / FUEL_EFFICIENCY.light.cng));
    
    const mediumFuelSavings = 
      mediumInOperation * 
      ANNUAL_MILEAGE.medium * 
      ((adjustedDieselPrice / FUEL_EFFICIENCY.medium.diesel) - 
      (adjustedCngPrice / FUEL_EFFICIENCY.medium.cng));
    
    const heavyFuelSavings = 
      heavyInOperation * 
      ANNUAL_MILEAGE.heavy * 
      ((adjustedDieselPrice / FUEL_EFFICIENCY.heavy.diesel) - 
      (adjustedCngPrice / FUEL_EFFICIENCY.heavy.cng));
    
    // Calculate maintenance savings based on miles driven
    const lightMilesDriven = lightInOperation * ANNUAL_MILEAGE.light;
    const mediumMilesDriven = mediumInOperation * ANNUAL_MILEAGE.medium;
    const heavyMilesDriven = heavyInOperation * ANNUAL_MILEAGE.heavy;
    
    // Light vehicles: gasoline vs CNG maintenance
    const lightMaintenanceSavings = lightMilesDriven * (MAINTENANCE_COST.gasoline - MAINTENANCE_COST.cng);
    
    // Medium and heavy vehicles: diesel vs CNG maintenance
    const mediumMaintenanceSavings = mediumMilesDriven * (MAINTENANCE_COST.diesel - MAINTENANCE_COST.cng);
    const heavyMaintenanceSavings = heavyMilesDriven * (MAINTENANCE_COST.diesel - MAINTENANCE_COST.cng);
    
    const maintenanceSavings = lightMaintenanceSavings + mediumMaintenanceSavings + heavyMaintenanceSavings;
    
    // Total savings for the year
    const yearSavings = lightFuelSavings + mediumFuelSavings + heavyFuelSavings + maintenanceSavings;
    
    yearlySavings.push(Math.round(yearSavings));
    
    // Update cumulative savings
    const prevCumulativeSavings = year > 0 ? cumulativeSavings[year - 1] : 0;
    cumulativeSavings.push(Math.round(prevCumulativeSavings + yearSavings));
    
    // Update cumulative investment
    const yearInvestment = year < ensuredDistribution.length ? ensuredDistribution[year].investment : 0;
    cumulativeInvestmentToDate += yearInvestment;
    cumulativeInvestment.push(Math.round(cumulativeInvestmentToDate));
  }
  
  // Calculate payback period - find when cumulative savings exceeds investment
  let paybackPeriod = timeHorizon; // Default to max
  
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
      diesel: 1550,  // g CO2 per mile for heavy-duty diesel vehicles
      cng: 1170      // g CO2 per mile for heavy-duty CNG vehicles
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
    const lightGasolineEmissions = lightInOperation * ANNUAL_MILEAGE.light * VEHICLE_EMISSION_FACTORS.light.gasoline / 1000; // convert g to kg
    const mediumDieselEmissions = mediumInOperation * ANNUAL_MILEAGE.medium * VEHICLE_EMISSION_FACTORS.medium.diesel / 1000;
    const heavyDieselEmissions = heavyInOperation * ANNUAL_MILEAGE.heavy * VEHICLE_EMISSION_FACTORS.heavy.diesel / 1000;
    
    const yearConventionalEmissions = lightGasolineEmissions + mediumDieselEmissions + heavyDieselEmissions;
    
    // Calculate CNG emissions using g/mile emission factors
    const lightCngEmissions = lightInOperation * ANNUAL_MILEAGE.light * VEHICLE_EMISSION_FACTORS.light.cng / 1000; // convert g to kg
    const mediumCngEmissions = mediumInOperation * ANNUAL_MILEAGE.medium * VEHICLE_EMISSION_FACTORS.medium.cng / 1000;
    const heavyCngEmissions = heavyInOperation * ANNUAL_MILEAGE.heavy * VEHICLE_EMISSION_FACTORS.heavy.cng / 1000;
    
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
  
  // Calculate full CNG price with electricity and business rate
  const ELECTRICITY_COST_PER_GGE = 0.08; // $0.08 per GGE
  const businessRate = stationConfig.businessType === 'aglc' ? BUSINESS_RATES.aglc : BUSINESS_RATES.cgc;
  const fullCngPrice = (fuelPrices.cngPrice + ELECTRICITY_COST_PER_GGE) * (1 + businessRate);
  const costPerMileCNG = fullCngPrice / FUEL_EFFICIENCY.light.cng;
  
  const costReduction = ((costPerMileGasoline - costPerMileCNG) / costPerMileGasoline) * 100;
  
  // Total emissions saved in kg (convert to metric tons for display)
  const totalEmissionsSaved = cumulativeEmissionsSaved.length > 0 
    ? cumulativeEmissionsSaved[cumulativeEmissionsSaved.length - 1] 
    : 0;

  return {
    totalInvestment,
    annualFuelSavings,
    yearlySavings,
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
