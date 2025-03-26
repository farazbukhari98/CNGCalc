import { useCalculator } from "@/contexts/CalculatorContext";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function VehicleParameters() {
  const { 
    vehicleParameters, 
    timeHorizon,
    deploymentStrategy, 
    updateVehicleParameters,
    updateTimeHorizon,
    updateDeploymentStrategy 
  } = useCalculator();

  // Strategy descriptions
  const strategyDescriptions = {
    immediate: "All vehicles are purchased at the beginning of Year 1.",
    phased: "Evenly distributes vehicle purchases across the selected time horizon.",
    aggressive: "Front-loads the majority of purchases in the first few years.",
    deferred: "Back-loads the majority of purchases in the later years.",
    manual: "Manually distribute vehicles across the timeline."
  };

  return (
    <div className="bg-white rounded-md p-3 space-y-3">
      {/* Vehicle Counts */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Light Duty Vehicles
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 text-gray-500 cursor-help">
                  <Info size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter the number of light duty vehicles to convert to CNG</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medium Duty Vehicles
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 text-gray-500 cursor-help">
                  <Info size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter the number of medium duty vehicles to convert to CNG</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Heavy Duty Vehicles
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 text-gray-500 cursor-help">
                  <Info size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter the number of heavy duty vehicles to convert to CNG</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Time Horizon */}
      <div className="border-t pt-3 mt-3">
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
      <div className="border-t pt-3 mt-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deployment Strategy
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
    </div>
  );
}
