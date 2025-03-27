import { useCalculator } from "@/contexts/CalculatorContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { Info, BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export default function GlobalSettings() {
  const { 
    timeHorizon,
    deploymentStrategy, 
    updateTimeHorizon,
    updateDeploymentStrategy,
    results
  } = useCalculator();

  const { 
    addComparisonItem, 
    isInComparison,
    comparisonItems
  } = useComparison();

  // Strategy descriptions
  const strategyDescriptions = {
    immediate: "All vehicles are purchased at the beginning of Year 1.",
    phased: "Evenly distributes vehicle purchases across the selected time horizon.",
    aggressive: "Front-loads the majority of purchases in the first few years.",
    deferred: "Back-loads the majority of purchases in the later years.",
    manual: "Manually distribute vehicles across the timeline."
  };

  const handleAddToComparison = () => {
    if (results && !isInComparison(deploymentStrategy)) {
      addComparisonItem(deploymentStrategy, results);
    }
  };

  return (
    <div className="bg-white rounded-md p-3 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Calculation Settings</h3>
        
        {/* Add to comparison button */}
        {results && !isInComparison(deploymentStrategy) && comparisonItems.length < 4 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddToComparison}
            className="flex items-center gap-1 text-xs h-7 px-2"
          >
            <Plus className="h-3 w-3" />
            <span className="hidden sm:inline">Add to Comparison</span>
            <span className="sm:hidden">Compare</span>
          </Button>
        )}
        
        {/* Already in comparison indicator */}
        {results && isInComparison(deploymentStrategy) && (
          <Badge variant="outline" className="text-xs h-7 flex items-center gap-1 border-blue-500 text-blue-500">
            <BarChart3 className="h-3 w-3" />
            <span>In comparison</span>
          </Badge>
        )}
      </div>

      {/* Time Horizon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Horizon
        </label>
        <div className="flex space-x-2">
          {[5, 10, 15].map((years) => (
            <Button
              key={years}
              variant={timeHorizon === years ? "default" : "outline"}
              className={timeHorizon === years 
                ? "px-3 py-1 text-sm bg-blue-600 text-white rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                : "px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"}
              onClick={() => updateTimeHorizon(years)}
            >
              {years} Years
            </Button>
          ))}
        </div>
      </div>

      {/* Deployment Strategy */}
      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deployment Strategy
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 inline-block text-gray-500 cursor-help">
                  <Info size={16} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-60">
                <p className="text-xs">Choose how to distribute vehicle purchases over time. Select "Manual Distribution" to enter your own quantities in the timeline below.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </label>
        <select
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          value={deploymentStrategy}
          onChange={(e) => updateDeploymentStrategy(e.target.value as any)}
        >
          <option value="immediate">Immediate Purchase</option>
          <option value="phased">Phased (Even Distribution)</option>
          <option value="aggressive">Aggressive Early</option>
          <option value="deferred">Deferred (Late Heavy)</option>
          <option value="manual">Manual Distribution</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {strategyDescriptions[deploymentStrategy]}
        </p>
      </div>

      {/* Tip for comparison */}
      {comparisonItems.length > 0 && (
        <div className="pt-2 text-xs text-gray-500">
          <p className="italic">
            Tip: You can compare up to 4 different strategies to analyze ROI and environmental benefits.
          </p>
        </div>
      )}
    </div>
  );
}