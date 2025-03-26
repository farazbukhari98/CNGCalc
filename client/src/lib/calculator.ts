import { 
  VehicleParameters, 
  StationConfig, 
  FuelPrices, 
  DeploymentStrategy, 
  VehicleDistribution, 
  CalculationResults 
} from "@/types/calculator";

// Vehicle costs (assumed averages)
const VEHICLE_COSTS = {
  light: 45000,
  medium: 65000,
  heavy: 85000
};

// Annual mileage assumptions
const ANNUAL_MILEAGE = {
  light: 15000,
  medium: 25000,
  heavy: 40000
};

// Fuel efficiency assumptions (miles per gallon)
const FUEL_EFFICIENCY = {
  light: { gasoline: 18, cng: 15.5 },
  medium: { diesel: 10, cng: 8.5 },
  heavy: { diesel: 6, cng: 5.1 }
};

// Station cost calculation
export function calculateStationCost(config: StationConfig): number {
  const baseCost = config.stationType === 'fast' ? 750000 : 550000;
  const businessMultiplier = config.businessType === 'aglc' ? 1.0 : 0.9;
  return Math.round(baseCost * businessMultiplier);
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
  } else {
    // Manual distribution - for now, just set to phased as default
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
  
  // Calculate station cost
  const stationCost = calculateStationCost(stationConfig);
  
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
    const adjustedCngPrice = fuelPrices.cngPrice * yearMultiplier;
    
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
    
    // Add in maintenance savings (estimated at 10% of fuel costs)
    const maintenanceSavings = (lightFuelSavings + mediumFuelSavings + heavyFuelSavings) * 0.1;
    
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
  
  // Calculate CO2 reduction
  // Very simplified: CNG produces about 25-30% less CO2 than gasoline/diesel
  const co2Reduction = 28;
  
  // Calculate cost per mile metrics
  const costPerMileGasoline = fuelPrices.gasolinePrice / FUEL_EFFICIENCY.light.gasoline;
  const costPerMileCNG = fuelPrices.cngPrice / FUEL_EFFICIENCY.light.cng;
  const costReduction = ((costPerMileGasoline - costPerMileCNG) / costPerMileGasoline) * 100;
  
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
    costPerMileGasoline,
    costPerMileCNG,
    costReduction,
    vehicleDistribution: ensuredDistribution
  };
}
