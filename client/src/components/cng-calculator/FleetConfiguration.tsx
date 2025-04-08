import { useCalculator } from "@/contexts/CalculatorContext";
import { Card, CardContent } from "@/components/ui/card";
import { formatPaybackPeriod } from "@/lib/utils";

interface FleetConfigurationProps {
  showCashflow: boolean;
}

export default function FleetConfiguration({ showCashflow }: FleetConfigurationProps) {
  const { 
    vehicleParameters,
    stationConfig,
    results,
    timeHorizon
  } = useCalculator();

  // Calculate vehicle distribution percentages
  const totalVehicles = 
    vehicleParameters.lightDutyCount + 
    vehicleParameters.mediumDutyCount + 
    vehicleParameters.heavyDutyCount;
  
  const lightDutyPercentage = totalVehicles > 0 
    ? Math.round((vehicleParameters.lightDutyCount / totalVehicles) * 100) 
    : 0;
  
  const mediumDutyPercentage = totalVehicles > 0 
    ? Math.round((vehicleParameters.mediumDutyCount / totalVehicles) * 100) 
    : 0;
  
  const heavyDutyPercentage = totalVehicles > 0 
    ? Math.round((vehicleParameters.heavyDutyCount / totalVehicles) * 100) 
    : 0;

  // Vehicle costs (CNG conversion costs)
  const lightDutyCost = 15000;
  const mediumDutyCost = 15000;
  const heavyDutyCost = 50000;

  // Total vehicle investment
  const totalVehicleInvestment = 
    (vehicleParameters.lightDutyCount * lightDutyCost) +
    (vehicleParameters.mediumDutyCount * mediumDutyCost) +
    (vehicleParameters.heavyDutyCount * heavyDutyCost);

  // Calculate GGE (Gasoline Gallon Equivalent) per day for station sizing
  const dailyGGE = 
    (vehicleParameters.lightDutyCount * 2.5) + 
    (vehicleParameters.mediumDutyCount * 6) + 
    (vehicleParameters.heavyDutyCount * 15);
  
  // Get capacity tier for pricing
  const getCapacityTier = () => {
    if (dailyGGE < 200) return 'small';
    if (dailyGGE < 500) return 'medium';
    if (dailyGGE < 800) return 'large';
    return 'xlarge';
  };
  
  const tier = getCapacityTier();
  
  // Tiered pricing based on capacity
  const getStationCost = () => {
    const baseCosts = {
      fast: {
        small: 1800000,    // $1.8M for small fast-fill
        medium: 2200000,   // $2.2M for medium fast-fill
        large: 2700000,    // $2.7M for large fast-fill
        xlarge: 3100000    // $3.1M for extra large fast-fill
      },
      time: {
        small: 491000,     // $491K for small time-fill
        medium: 1200000,   // $1.2M for medium time-fill
        large: 2100000,    // $2.1M for large time-fill
        xlarge: 3500000    // $3.5M for extra large time-fill
      }
    };
    
    // Get base cost from the pricing tiers
    const baseCost = baseCosts[stationConfig.stationType][tier];
    
    // Apply business type adjustment
    const businessMultiplier = stationConfig.businessType === 'aglc' ? 1.0 : 0.95;
    
    return Math.round(baseCost * businessMultiplier);
  };

  const stationCost = getStationCost();
  const totalInvestment = totalVehicleInvestment + stationCost;

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <Card className="bg-white rounded-lg shadow mb-6 dark:bg-gray-800">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Fleet Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vehicle Distribution */}
          <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
            <h3 className="text-sm font-medium text-gray-700 mb-3 dark:text-gray-200">Vehicle Distribution</h3>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Light Duty ({vehicleParameters.lightDutyCount})
                </span>
              </div>
              <span className="text-sm font-medium dark:text-gray-200">{lightDutyPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full mb-3">
              <div 
                className="h-2 bg-blue-500 rounded-full" 
                style={{ width: `${lightDutyPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Medium Duty ({vehicleParameters.mediumDutyCount})
                </span>
              </div>
              <span className="text-sm font-medium dark:text-gray-200">{mediumDutyPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full mb-3">
              <div 
                className="h-2 bg-green-500 rounded-full" 
                style={{ width: `${mediumDutyPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Heavy Duty ({vehicleParameters.heavyDutyCount})
                </span>
              </div>
              <span className="text-sm font-medium dark:text-gray-200">{heavyDutyPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
              <div 
                className="h-2 bg-red-500 rounded-full" 
                style={{ width: `${heavyDutyPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* Total Investment */}
          <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
            <h3 className="text-sm font-medium text-gray-700 mb-3 dark:text-gray-200">Total Investment</h3>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Vehicles</span>
                <span className="text-sm font-medium dark:text-gray-200">{formatCurrency(totalVehicleInvestment)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Station</span>
                <span className="text-sm font-medium dark:text-gray-200">{formatCurrency(stationCost)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t dark:border-gray-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Total</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(totalInvestment)}</span>
              </div>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
            <h3 className="text-sm font-medium text-gray-700 mb-3 dark:text-gray-200">Key Metrics</h3>
            {/* Payback Period - always show */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Payback Period</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {results ? formatPaybackPeriod(results.paybackPeriod) : '-'}
              </span>
            </div>
            
            {/* ROI - only show when showCashflow is true */}
            {showCashflow && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">{timeHorizon}-Year ROI</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {results ? `${Math.round(results.roi)}%` : '-'}
                </span>
              </div>
            )}
            
            {/* Annual Fuel Savings - only show when showCashflow is true */}
            {showCashflow && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Annual Fuel Savings</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {results ? formatCurrency(results.annualFuelSavings) : '-'}
                </span>
              </div>
            )}
            
            {/* CO2 Reduction - always show */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">CO₂ Reduction</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {results ? `${results.co2Reduction.toFixed(1)}%` : '-'}
              </span>
            </div>
            
            {/* Total Vehicles - show when showCashflow is false */}
            {!showCashflow && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Vehicles</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {totalVehicles}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
