import { useState } from "react";
import { useCalculator } from "@/contexts/CalculatorContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { Info, BarChart3, Plus, Truck, Eye, EyeOff, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function GlobalSettings() {
  const { 
    timeHorizon,
    deploymentStrategy, 
    vehicleParameters,
    updateTimeHorizon,
    updateDeploymentStrategy,
    updateVehicleParameters,
    results,
    hideNegativeValues,
    toggleHideNegativeValues
  } = useCalculator();

  const { 
    addComparisonItem, 
    isInComparison,
    comparisonItems,
    canAddMoreComparisons
  } = useComparison();

  const [showCustomNameDialog, setShowCustomNameDialog] = useState(false);
  const [customName, setCustomName] = useState("");

  // Strategy descriptions
  const strategyDescriptions = {
    immediate: "All vehicles are purchased at the beginning of Year 1.",
    phased: "Evenly distributes vehicle purchases across the selected time horizon.",
    aggressive: "Front-loads the majority of purchases in the first few years.",
    deferred: "Back-loads the majority of purchases in the later years.",
    manual: "Manually distribute vehicles across the timeline."
  };

  const handleAddToComparison = () => {
    if (results && canAddMoreComparisons()) {
      addComparisonItem(deploymentStrategy, results);
    }
  };

  const handleAddWithCustomName = () => {
    if (results && canAddMoreComparisons() && customName.trim()) {
      addComparisonItem(deploymentStrategy, results, customName.trim());
      setCustomName("");
      setShowCustomNameDialog(false);
    }
  };

  // Count how many of the current strategy type are already in comparison
  const currentStrategyCount = comparisonItems.filter(item => item.strategy === deploymentStrategy).length;
  const canAddCurrentStrategy = canAddMoreComparisons() && (deploymentStrategy === 'manual' || !isInComparison(deploymentStrategy));

  // Check if manual deployment is selected
  const isManualMode = deploymentStrategy === 'manual';

  return (
    <div className="bg-white rounded-md p-3 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Calculation Settings</h3>
        
        <div className="flex flex-col gap-1">
          {/* Add to comparison button */}
          {results && canAddCurrentStrategy && (
            <>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddToComparison}
                  className="flex items-center gap-1 text-xs h-6 px-2 flex-1"
                >
                  <Plus className="h-3 w-3" />
                  <span className="hidden lg:inline">Add to Comparison</span>
                  <span className="lg:hidden">Compare</span>
                </Button>
                
                {/* Add with custom name for manual strategies or when multiple allowed */}
                {(deploymentStrategy === 'manual' || currentStrategyCount > 0) && (
                  <Dialog open={showCustomNameDialog} onOpenChange={setShowCustomNameDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1 text-xs h-6 px-2"
                        title="Add with custom name"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span className="hidden xl:inline">Add with Name</span>
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add to Comparison with Custom Name</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Name for this Strategy
                        </label>
                        <Input
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder={`Enter name for ${deploymentStrategy} strategy...`}
                          maxLength={50}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This helps identify different variations when comparing multiple {deploymentStrategy} strategies.
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCustomNameDialog(false)}
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddWithCustomName}
                          disabled={!customName.trim()}
                          size="sm"
                        >
                          Add to Comparison
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                )}
              </div>
            </>
          )}
          
          {/* Status indicators on second row */}
          <div className="flex items-center gap-1">
            {/* Already in comparison indicator - updated for multiple items */}
            {results && currentStrategyCount > 0 && (
              <Badge variant="outline" className="text-xs h-5 flex items-center gap-1 border-blue-500 text-blue-500 flex-1">
                <BarChart3 className="h-3 w-3" />
                <span className="truncate">
                  {currentStrategyCount === 1 ? 'In comparison' : `${currentStrategyCount} added`}
                </span>
              </Badge>
            )}
            
            {/* Max comparisons reached indicator */}
            {!canAddMoreComparisons() && (
              <Badge variant="outline" className="text-xs h-5 flex items-center gap-1 border-gray-400 text-gray-600 flex-1">
                <Info className="h-3 w-3" />
                <span className="truncate">Max (6)</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Counts Section */}
      <div className="border-b border-gray-200 pb-3">
        <div className="flex items-center mb-2">
          <Truck className="h-4 w-4 mr-1 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-700">Fleet Configuration</h4>
        </div>
        
        {/* Notice for manual mode */}
        {isManualMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mb-3">
            <p className="text-xs text-amber-700">
              In Manual Distribution Mode, vehicle counts are managed in the Deployment Timeline section.
            </p>
          </div>
        )}

        {/* Vehicle Counts - Hidden in manual mode */}
        {!isManualMode && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Light Duty
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  min="0"
                  value={vehicleParameters.lightDutyCount}
                  onChange={(e) => updateVehicleParameters({ 
                    ...vehicleParameters, 
                    lightDutyCount: parseInt(e.target.value) || 0 
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Medium Duty
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  min="0"
                  value={vehicleParameters.mediumDutyCount}
                  onChange={(e) => updateVehicleParameters({ 
                    ...vehicleParameters, 
                    mediumDutyCount: parseInt(e.target.value) || 0 
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Heavy Duty
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  min="0"
                  value={vehicleParameters.heavyDutyCount}
                  onChange={(e) => updateVehicleParameters({ 
                    ...vehicleParameters, 
                    heavyDutyCount: parseInt(e.target.value) || 0 
                  })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time Horizon */}
      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Time Horizon
        </label>
        <div className="flex space-x-2">
          {[10, 15].map((years) => (
            <Button
              key={years}
              variant={timeHorizon === years ? "default" : "outline"}
              className={timeHorizon === years 
                ? "px-3 py-1 text-sm bg-blue-600 text-white dark:bg-blue-500 dark:text-white rounded shadow hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800" 
                : "px-3 py-1 text-sm bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-100 rounded shadow hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"}
              onClick={() => updateTimeHorizon(years)}
            >
              {years} Years
            </Button>
          ))}
        </div>
      </div>

      {/* Deployment Strategy */}
      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Deployment Strategy
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 inline-block text-gray-500 dark:text-gray-400 cursor-help">
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
          className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          value={deploymentStrategy}
          onChange={(e) => updateDeploymentStrategy(e.target.value as any)}
        >
          <option value="immediate">Immediate Purchase</option>
          <option value="phased">Phased (Even Distribution)</option>
          <option value="aggressive">Aggressive Early</option>
          <option value="deferred">Deferred (Late Heavy)</option>
          <option value="manual">Manual Distribution</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {strategyDescriptions[deploymentStrategy]}
        </p>
      </div>

      {/* Chart Display Options */}
      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Chart Display Options
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 inline-block text-gray-500 dark:text-gray-400 cursor-help">
                  <Info size={16} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-60">
                <p className="text-xs">Toggle to hide negative values from all charts. This adjusts the Y-axis scale to focus only on positive ROI periods.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </label>
        <Button
          variant={hideNegativeValues ? "default" : "outline"}
          size="sm"
          onClick={toggleHideNegativeValues}
          className={`w-full flex items-center justify-center gap-2 text-sm ${
            hideNegativeValues 
              ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500"
          }`}
        >
          {hideNegativeValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {hideNegativeValues ? "Show All Values" : "Hide Negative Values"}
        </Button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {hideNegativeValues 
            ? "Charts show only positive values with adjusted scale"
            : "Charts show complete data including negative values"
          }
        </p>
      </div>

      {/* Tip for comparison */}
      {comparisonItems.length > 0 && (
        <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
          <p className="italic">
            Tip: You can compare up to 6 different strategies to analyze ROI and environmental benefits.
          </p>
        </div>
      )}
    </div>
  );
}