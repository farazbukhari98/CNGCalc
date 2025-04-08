import { useCalculator } from "@/contexts/CalculatorContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPaybackPeriod } from "@/lib/utils";
import { useState } from "react";

export default function DeploymentTimeline() {
  const { 
    timeHorizon,
    deploymentStrategy,
    setDistributionStrategy,
    updateDeploymentStrategy,
    updateManualDistribution,
    vehicleDistribution,
    results
  } = useCalculator();

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
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
                const stationCost = isFirstYear ? (results.cumulativeInvestment[0] - vehicleInvestment) : 0;
                const totalYearInvestment = vehicleInvestment + (isFirstYear ? stationCost : 0);
                
                // Make sure we have savings data for this year
                const yearSavings = results.yearlySavings[year - 1] || 0;
                
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
                    
                    <div className="border-t pt-2">
                      {isFirstYear && stationCost > 0 && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Vehicles</span>
                            <span className="text-xs font-medium">{formatCurrency(vehicleInvestment)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Station</span>
                            <span className="text-xs font-medium">{formatCurrency(stationCost)}</span>
                          </div>
                          <div className="flex items-center justify-between border-t pt-1 mt-1">
                            <span className="text-xs text-gray-500 font-medium">Total Inv.</span>
                            <span className="text-xs font-medium">{formatCurrency(totalYearInvestment)}</span>
                          </div>
                        </>
                      )}
                      {(!isFirstYear || stationCost === 0) && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Investment</span>
                          <span className="text-xs font-medium">{formatCurrency(vehicleInvestment)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">Savings</span>
                        <span className="text-xs font-medium text-green-600">{formatCurrency(yearSavings)}</span>
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
