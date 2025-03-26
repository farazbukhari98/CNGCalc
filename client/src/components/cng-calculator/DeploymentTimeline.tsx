import { useCalculator } from "@/contexts/CalculatorContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DeploymentTimeline() {
  const { 
    timeHorizon,
    deploymentStrategy,
    setDistributionStrategy,
    vehicleDistribution,
    results
  } = useCalculator();

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Only show years up to the selected time horizon
  const years = Array.from({ length: timeHorizon }, (_, i) => i + 1);

  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <h2 className="text-xl font-semibold">Deployment Timeline</h2>
          
          {/* Timeline Controls - Only show for non-immediate strategies */}
          {deploymentStrategy !== 'immediate' && (
            <div className="flex mt-3 sm:mt-0 space-x-2">
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
            </div>
          )}
        </div>
        
        {/* Timeline Visualization - Only show if we have results */}
        {results && vehicleDistribution && (
          <div className="timeline-scroll overflow-x-auto">
            <div className={`min-w-max grid grid-cols-${Math.min(timeHorizon, 5)} gap-3`}>
              {years.map((year) => {
                // Determine which vehicle type is dominant for this year
                const yearData = vehicleDistribution[year - 1];
                const { light, medium, heavy } = yearData;
                let borderClass = "vehicle-type-light";
                
                if (medium >= light && medium >= heavy) {
                  borderClass = "vehicle-type-medium";
                } else if (heavy >= light && heavy >= medium) {
                  borderClass = "vehicle-type-heavy";
                }
                
                // Calculate year's financial data
                const yearInvestment = yearData.investment;
                const yearSavings = results.yearlySavings[year - 1];
                
                return (
                  <div key={year} className={`year-block bg-white border rounded-lg shadow-sm p-3 ${borderClass}`}>
                    <div className="text-sm font-medium text-gray-700 mb-2">Year {year}</div>
                    
                    <div className="space-y-2 mb-3">
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
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Investment</span>
                        <span className="text-xs font-medium">{formatCurrency(yearInvestment)}</span>
                      </div>
                      <div className="flex items-center justify-between">
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
