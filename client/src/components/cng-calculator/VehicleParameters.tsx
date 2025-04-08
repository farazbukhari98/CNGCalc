import { useCalculator } from "@/contexts/CalculatorContext";
import { Info, DollarSign } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function VehicleParameters() {
  const { 
    vehicleParameters, 
    updateVehicleParameters
  } = useCalculator();

  // Format cost input with dollar sign and commas
  const formatCost = (cost: number): string => {
    return cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Parse cost input removing non-numeric characters
  const parseCost = (value: string): number => {
    return parseInt(value.replace(/[^0-9]/g, "")) || 0;
  };

  return (
    <div className="bg-white rounded-md p-3 space-y-3">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-700">Vehicle Costs</h3>
        <p className="text-xs text-gray-500 mt-1">
          Adjust the default cost for converting each type of vehicle to CNG
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Light Duty Vehicle Cost
        </label>
        <div className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm pl-8"
              value={formatCost(vehicleParameters.lightDutyCost)}
              onChange={(e) => updateVehicleParameters({ 
                ...vehicleParameters, 
                lightDutyCost: parseCost(e.target.value)
              })}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 text-gray-500 cursor-help">
                  <Info size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter the cost to convert each light duty vehicle to CNG</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medium Duty Vehicle Cost
        </label>
        <div className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm pl-8"
              value={formatCost(vehicleParameters.mediumDutyCost)}
              onChange={(e) => updateVehicleParameters({ 
                ...vehicleParameters, 
                mediumDutyCost: parseCost(e.target.value) 
              })}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 text-gray-500 cursor-help">
                  <Info size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter the cost to convert each medium duty vehicle to CNG</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Heavy Duty Vehicle Cost
        </label>
        <div className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm pl-8"
              value={formatCost(vehicleParameters.heavyDutyCost)}
              onChange={(e) => updateVehicleParameters({ 
                ...vehicleParameters, 
                heavyDutyCost: parseCost(e.target.value) 
              })}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 text-gray-500 cursor-help">
                  <Info size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter the cost to convert each heavy duty vehicle to CNG</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
