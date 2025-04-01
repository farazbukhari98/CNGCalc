import { useCalculator } from "@/contexts/CalculatorContext";
import { Card, CardContent } from "@/components/ui/card";

export default function FleetConfiguration() {
  const { 
    vehicleParameters,
    stationConfig,
    results
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

  // Vehicle costs (estimated)
  const lightDutyCost = 45000;
  const mediumDutyCost = 65000;
  const heavyDutyCost = 85000;

  // Total vehicle investment
  const totalVehicleInvestment = 
    (vehicleParameters.lightDutyCount * lightDutyCost) +
    (vehicleParameters.mediumDutyCount * mediumDutyCost) +
    (vehicleParameters.heavyDutyCount * heavyDutyCost);

  // Station cost based on configuration
  const getStationCost = () => {
    const baseCost = stationConfig.stationType === 'fast' ? 750000 : 550000;
    const businessMultiplier = stationConfig.businessType === 'aglc' ? 1.0 : 0.9;
    return Math.round(baseCost * businessMultiplier);
  };

  const stationCost = getStationCost();
  const totalInvestment = totalVehicleInvestment + stationCost;

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Fleet Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vehicle Distribution */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Vehicle Distribution</h3>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">
                  Light Duty ({vehicleParameters.lightDutyCount})
                </span>
              </div>
              <span className="text-sm font-medium">{lightDutyPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full mb-3">
              <div 
                className="h-2 bg-blue-500 rounded-full" 
                style={{ width: `${lightDutyPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">
                  Medium Duty ({vehicleParameters.mediumDutyCount})
                </span>
              </div>
              <span className="text-sm font-medium">{mediumDutyPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full mb-3">
              <div 
                className="h-2 bg-green-500 rounded-full" 
                style={{ width: `${mediumDutyPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">
                  Heavy Duty ({vehicleParameters.heavyDutyCount})
                </span>
              </div>
              <span className="text-sm font-medium">{heavyDutyPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-red-500 rounded-full" 
                style={{ width: `${heavyDutyPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* Total Investment */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Total Investment</h3>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Vehicles</span>
                <span className="text-sm font-medium">{formatCurrency(totalVehicleInvestment)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Station</span>
                <span className="text-sm font-medium">{formatCurrency(stationCost)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(totalInvestment)}</span>
              </div>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Key Metrics</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Payback Period</span>
              <span className="text-sm font-medium text-blue-600">
                {results ? `${results.paybackPeriod.toFixed(1)} Years` : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">5-Year ROI</span>
              <span className="text-sm font-medium text-green-600">
                {results ? `${Math.round(results.roi)}%` : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Annual Fuel Savings</span>
              <span className="text-sm font-medium text-green-600">
                {results ? formatCurrency(results.annualFuelSavings) : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">CO₂ Reduction</span>
              <span className="text-sm font-medium text-green-600">
                {results ? `${results.co2Reduction.toFixed(1)}%` : '-'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
