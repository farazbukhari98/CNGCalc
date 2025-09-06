import { useCalculator } from "@/contexts/CalculatorContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPaybackPeriod } from "@/lib/utils";
import { useState } from "react";
import { MetricInfoTooltip } from "./MetricInfoTooltip";
import { calculateStationCost } from "@/lib/calculator";

export default function DeploymentTimeline() {
  const { 
    timeHorizon,
    deploymentStrategy,
    setDistributionStrategy,
    updateDeploymentStrategy,
    updateManualDistribution,
    vehicleDistribution,
    results,
    stationConfig,
    vehicleParameters
  } = useCalculator();

  // State for tracking which cards are flipped
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Only show years up to the selected time horizon
  const years = Array.from({ length: timeHorizon }, (_, i) => i + 1);

  // Function to handle input change for manual distribution
  const handleInputChange = (year: number, vehicleType: 'light' | 'medium' | 'heavy', value: string) => {
    // Convert input to number
    const numValue = parseInt(value) || 0;
    
    // Update the distribution
    updateManualDistribution(year, {
      [vehicleType]: numValue
    });
  };

  // Function to toggle card flip
  const toggleCardFlip = (year: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  return (
    <Card className="bg-white rounded-lg shadow mb-6 deployment-timeline">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <h2 className="text-xl font-semibold">Deployment Timeline</h2>
          
          {/* Timeline Controls */}
          <div className="flex flex-wrap mt-3 sm:mt-0 gap-2">
            <Button
              size="sm"
              variant={deploymentStrategy === 'manual' ? 'default' : 'outline'}
              className={deploymentStrategy === 'manual' 
                ? "px-3 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                : "px-3 py-1 text-xs rounded bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"}
              onClick={() => updateDeploymentStrategy('manual')}
            >
              Manual Distribution
            </Button>
            
            {deploymentStrategy !== 'immediate' && (
              <>
                <Button
                  size="sm"
                  variant={deploymentStrategy === 'phased' ? 'default' : 'outline'}
                  className={deploymentStrategy === 'phased' 
                    ? "px-3 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    : "px-3 py-1 text-xs rounded bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"}
                  onClick={() => setDistributionStrategy('phased')}
                >
                  Even Distribution
                </Button>
                <Button
                  size="sm"
                  variant={deploymentStrategy === 'aggressive' ? 'default' : 'outline'}
                  className={deploymentStrategy === 'aggressive' 
                    ? "px-3 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    : "px-3 py-1 text-xs rounded bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"}
                  onClick={() => setDistributionStrategy('aggressive')}
                >
                  Front-Loaded
                </Button>
                <Button
                  size="sm"
                  variant={deploymentStrategy === 'deferred' ? 'default' : 'outline'}
                  className={deploymentStrategy === 'deferred' 
                    ? "px-3 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    : "px-3 py-1 text-xs rounded bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"}
                  onClick={() => setDistributionStrategy('deferred')}
                >
                  Back-Loaded
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Timeline Visualization - Only show if we have results */}
        {results && vehicleDistribution && (
          <div className="timeline-scroll overflow-x-auto">
            <div className="min-w-max grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {years.map((year) => {
                // Make sure we have data for this year, default to empty values if not
                const yearData = vehicleDistribution[year - 1] || { light: 0, medium: 0, heavy: 0, investment: 0 };
                const { light, medium, heavy } = yearData;
                let borderClass = "vehicle-type-light";
                
                if (medium >= light && medium >= heavy) {
                  borderClass = "vehicle-type-medium";
                } else if (heavy >= light && heavy >= medium) {
                  borderClass = "vehicle-type-heavy";
                }
                
                // Calculate year's financial data
                const vehicleInvestment = yearData.investment || 0;
                
                // For year 1, also show station cost separately
                const isFirstYear = year === 1;
                // Calculate station cost properly using the calculator function
                const calculatedStationCost = calculateStationCost(stationConfig, vehicleParameters);
                // Station cost logic: 
                // - Turnkey: Show full station cost in Year 1 only
                // - Non-turnkey: Show annual tariff fee in every year
                let stationCost = 0;
                if (stationConfig.turnkey) {
                  stationCost = isFirstYear ? calculatedStationCost : 0;
                } else {
                  // Non-turnkey: Show annual tariff fee (available from results.yearlyTariffFees)
                  stationCost = results.yearlyTariffFees[year - 1] || 0;
                }
                const totalYearInvestment = vehicleInvestment + stationCost;
                
                // Calculate cumulative savings up to this year
                let cumulativeFuelSavings = 0;
                let cumulativeMaintenanceSavings = 0;
                let cumulativeTotalSavings = 0;
                
                for (let i = 0; i < year; i++) {
                  cumulativeFuelSavings += results.yearlyFuelSavings[i] || 0;
                  cumulativeMaintenanceSavings += results.yearlyMaintenanceSavings[i] || 0;
                  cumulativeTotalSavings += results.yearlySavings[i] || 0;
                }
                
                return (
                  <div key={year} className={`year-block bg-white border rounded-lg shadow-sm p-3 ${borderClass}`}>
                    <div className="text-sm font-medium text-gray-700 mb-2">Year {year}</div>
                    
                    <div className="space-y-2 mb-3">
                      {deploymentStrategy === 'manual' ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Light Duty</span>
                            <Input
                              type="number"
                              min="0"
                              value={light}
                              onChange={(e) => handleInputChange(year, 'light', e.target.value)}
                              className="text-xs w-16 h-6 p-1"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Medium Duty</span>
                            <Input
                              type="number"
                              min="0"
                              value={medium}
                              onChange={(e) => handleInputChange(year, 'medium', e.target.value)}
                              className="text-xs w-16 h-6 p-1"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Heavy Duty</span>
                            <Input
                              type="number"
                              min="0"
                              value={heavy}
                              onChange={(e) => handleInputChange(year, 'heavy', e.target.value)}
                              className="text-xs w-16 h-6 p-1"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Light Duty</span>
                            <span className="text-xs font-medium">{light}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Medium Duty</span>
                            <span className="text-xs font-medium">{medium}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Heavy Duty</span>
                            <span className="text-xs font-medium">{heavy}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="border-t pt-3">
                      {/* Always show investment breakdown in hierarchical format */}
                      {(vehicleInvestment > 0 || stationCost > 0) && (
                        <>
                          {/* Investment header */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700 font-medium">Investment</span>
                            <span></span>
                          </div>
                          {/* Investment breakdown - indented */}
                          <div className="flex items-center justify-between ml-4 mb-1.5">
                            <span className="text-xs text-gray-500">
                              Vehicles (Inc)
                              <MetricInfoTooltip
                                title="Vehicle Investment"
                                description={`This is the total cost for ${light} light-duty, ${medium} medium-duty, and ${heavy} heavy-duty vehicles converted in Year ${year}.`}
                                calculation={`Vehicle Investment = (${light} light-duty × $${(vehicleInvestment / (light || 1)).toLocaleString()}) + (${medium} medium-duty × $${(vehicleInvestment / (medium || 1)).toLocaleString()}) + (${heavy} heavy-duty × $${(vehicleInvestment / (heavy || 1)).toLocaleString()})`}
                                affectingVariables={[
                                  "Vehicle counts (light, medium, heavy)",
                                  "Incremental cost per vehicle type",
                                  "Deployment strategy"
                                ]}
                                simpleDescription="Cost of CNG vehicle conversion for this year"
                              />
                            </span>
                            <span className="text-xs font-medium">{formatCurrency(vehicleInvestment)}</span>
                          </div>
                          <div className="flex items-center justify-between ml-4 mb-2">
                            <span className="text-xs text-gray-500">
                              Station
                              <MetricInfoTooltip
                                title={stationConfig.turnkey ? "Station Investment" : "Station Tariff Fee"}
                                description={stationConfig.turnkey 
                                  ? "The upfront cost of building your CNG station. This is a one-time cost in Year 1 and includes all equipment, installation, and setup."
                                  : `Annual tariff fee for non-turnkey station option. This is ${stationConfig.businessType === 'cgc' ? '1.6%' : '1.5%'} of the total station cost, charged annually.`
                                }
                                calculation={stationConfig.turnkey 
                                  ? "Based on station type (Fast-Fill or Time-Fill), business type (AGLC, CGC, VNG), and required capacity to support your fleet's daily fuel consumption."
                                  : `Annual Tariff = Total Station Cost (${formatCurrency(calculatedStationCost)}) × ${stationConfig.businessType === 'cgc' ? '1.6%' : '1.5%'} × 12 months`
                                }
                                affectingVariables={[
                                  "Station type (Fast-Fill or Time-Fill)",
                                  "Business type (AGLC, CGC, VNG)",
                                  "Total fleet size and composition",
                                  stationConfig.turnkey ? "Turnkey option (Yes = upfront cost)" : "Non-turnkey annual tariff rate"
                                ]}
                                simpleDescription={stationConfig.turnkey ? "Cost of building the CNG fueling station" : "Annual fee for non-turnkey station financing"}
                              />
                            </span>
                            <span className="text-xs font-medium">{formatCurrency(stationCost)}</span>
                          </div>
                        </>
                      )}
                      
                      {/* Savings Section */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700 font-medium">Savings</span>
                        <span></span>
                      </div>
                      {/* Savings breakdown - indented */}
                      <div className="flex items-center justify-between ml-4 mb-1.5">
                        <span className="text-xs text-gray-500">
                          Fuel
                          <MetricInfoTooltip
                            title="Cumulative Fuel Savings"
                            description={`Total fuel cost savings accumulated from Year 1 through Year ${year} from switching to CNG instead of gasoline/diesel.`}
                            calculation="Cumulative Fuel Savings = Sum of annual fuel savings from Year 1 to current year"
                            affectingVariables={[
                              "Number of converted vehicles in operation each year",
                              "Annual mileage per vehicle type",
                              "Fuel prices (gasoline, diesel, CNG)",
                              "Vehicle fuel efficiency (MPG)"
                            ]}
                            simpleDescription="Total fuel cost reduction from CNG to date"
                          />
                        </span>
                        <span className="text-xs font-medium text-green-600">{formatCurrency(cumulativeFuelSavings)}</span>
                      </div>
                      <div className="flex items-center justify-between ml-4 mb-2">
                        <span className="text-xs text-gray-500">
                          Maintenance
                          <MetricInfoTooltip
                            title="Cumulative Maintenance Savings"
                            description={`Total maintenance cost savings accumulated from Year 1 through Year ${year} from reduced maintenance needs of CNG vehicles.`}
                            calculation="Cumulative Maintenance Savings = Sum of annual maintenance savings from Year 1 to current year ($0.05 per mile for diesel vehicles)"
                            affectingVariables={[
                              "Number of converted diesel vehicles in operation each year",
                              "Annual mileage per vehicle type",
                              "Deployment timing and vehicle rollout schedule"
                            ]}
                            simpleDescription="Total maintenance cost reduction to date"
                          />
                        </span>
                        <span className="text-xs font-medium text-green-600">{formatCurrency(cumulativeMaintenanceSavings)}</span>
                      </div>
                      {/* Total Savings */}
                      <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                        <span className="text-sm text-gray-700 font-medium">
                          Total Savings
                          <MetricInfoTooltip
                            title="Total Cumulative Savings"
                            description={`Total savings accumulated from Year 1 through Year ${year} including fuel and maintenance savings, minus any operational costs.`}
                            calculation={`Total Cumulative Savings = Cumulative Fuel Savings (${formatCurrency(cumulativeFuelSavings)}) + Cumulative Maintenance Savings (${formatCurrency(cumulativeMaintenanceSavings)}) - Station Operational Costs`}
                            simpleDescription="Combined operating cost reduction to date"
                          />
                        </span>
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(cumulativeTotalSavings)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
