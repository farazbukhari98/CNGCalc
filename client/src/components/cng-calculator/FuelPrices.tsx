import { useCalculator } from "@/contexts/CalculatorContext";
import { Info } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function FuelPrices() {
  const { fuelPrices, updateFuelPrices } = useCalculator();

  // Calculate fuel savings percentages
  const cngVsGasolineSavings = Math.round(((fuelPrices.gasolinePrice - fuelPrices.cngPrice) / fuelPrices.gasolinePrice) * 100 * 10) / 10;
  const cngVsDieselSavings = Math.round(((fuelPrices.dieselPrice - fuelPrices.cngPrice) / fuelPrices.dieselPrice) * 100 * 10) / 10;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-3 space-y-3">
      {/* Gasoline Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Gasoline Price ($/gallon)
        </label>
        <div className="flex items-center">
          <input
            type="number"
            className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            min="0"
            step="0.01"
            value={fuelPrices.gasolinePrice}
            onChange={(e) => 
              updateFuelPrices({ 
                ...fuelPrices, 
                gasolinePrice: parseFloat(e.target.value) || 0 
              })
            }
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 text-gray-500 dark:text-gray-400 cursor-help">
                  <Info size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current gasoline price per gallon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Diesel Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Diesel Price ($/gallon)
        </label>
        <div className="flex items-center">
          <input
            type="number"
            className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            min="0"
            step="0.01"
            value={fuelPrices.dieselPrice}
            onChange={(e) => 
              updateFuelPrices({ 
                ...fuelPrices, 
                dieselPrice: parseFloat(e.target.value) || 0 
              })
            }
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 text-gray-500 dark:text-gray-400 cursor-help">
                  <Info size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current diesel price per gallon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* CNG Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          CNG Price ($/GGE)
        </label>
        <div className="flex items-center">
          <input
            type="number"
            className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            min="0"
            step="0.01"
            value={fuelPrices.cngPrice}
            onChange={(e) => 
              updateFuelPrices({ 
                ...fuelPrices, 
                cngPrice: parseFloat(e.target.value) || 0 
              })
            }
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 text-gray-500 dark:text-gray-400 cursor-help">
                  <Info size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>CNG price per gasoline gallon equivalent (GGE)</p>
                <p className="text-xs text-gray-400 mt-1">Note: Electricity costs are included in this price</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Annual Fuel Price Increase */}
      <div className="border-t pt-3 mt-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Annual Fuel Price Increase (%)
        </label>
        <div className="flex items-center">
          <input
            type="number"
            className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            min="0"
            max="20"
            step="0.1"
            value={fuelPrices.annualIncrease}
            onChange={(e) => 
              updateFuelPrices({ 
                ...fuelPrices, 
                annualIncrease: parseFloat(e.target.value) || 0 
              })
            }
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 text-gray-500 dark:text-gray-400 cursor-help">
                  <Info size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Estimated annual percentage increase in fuel prices</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Fuel Price Comparison */}
      <div className="border-t pt-3 mt-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fuel Price Comparison</h3>
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>CNG Savings vs. Gasoline</span>
            <span className="font-medium text-green-600 dark:text-green-400">{cngVsGasolineSavings}%</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>CNG Savings vs. Diesel</span>
            <span className="font-medium text-green-600 dark:text-green-400">{cngVsDieselSavings}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
