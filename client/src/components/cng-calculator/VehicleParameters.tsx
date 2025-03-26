import { useCalculator } from "@/contexts/CalculatorContext";
import { Info, AlertCircle } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function VehicleParameters() {
  const { 
    vehicleParameters, 
    deploymentStrategy, 
    updateVehicleParameters
  } = useCalculator();

  // Check if manual deployment is selected
  const isManualMode = deploymentStrategy === 'manual';

  return (
    <div className="bg-white rounded-md p-3 space-y-3">
      {/* Notice for manual mode */}
      {isManualMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <div className="flex items-start">
            <AlertCircle className="text-amber-500 mt-0.5 mr-2" size={16} />
            <div>
              <p className="text-sm font-medium text-amber-800">Manual Distribution Mode</p>
              <p className="text-xs text-amber-700 mt-1">
                Vehicle counts are now managed in the Deployment Timeline section. 
                Please enter the specific number of vehicles for each year directly in the timeline.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Counts - Hidden in manual mode */}
      {!isManualMode && (
        <>
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
        </>
      )}
    </div>
  );
}
