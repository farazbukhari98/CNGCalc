import { useCalculator } from "@/contexts/CalculatorContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export default function StationConfiguration() {
  const { 
    stationConfig, 
    updateStationConfig,
    vehicleParameters
  } = useCalculator();

  // Calculate GGE (Gasoline Gallon Equivalent) per day
  // Light duty: 2.5 GGE/day, Medium duty: 6 GGE/day, Heavy duty: 15 GGE/day
  const dailyGGE = 
    (vehicleParameters.lightDutyCount * 2.5) + 
    (vehicleParameters.mediumDutyCount * 6) + 
    (vehicleParameters.heavyDutyCount * 15);
  
  // Max capacity reference points 
  const maxCapacity = stationConfig.stationType === 'fast' ? 1000 : 800; // in GGE per day
  const capacityPercentage = Math.min(Math.round((dailyGGE / maxCapacity) * 100), 100);
  
  // Get capacity tier for pricing
  const getCapacityTier = () => {
    if (dailyGGE < 200) return 'small';
    if (dailyGGE < 500) return 'medium';
    if (dailyGGE < 800) return 'large';
    return 'xlarge';
  };
  
  // Estimate station cost based on capacity tier, type and business model
  const getStationCost = () => {
    const tier = getCapacityTier();
    
    // Tiered pricing based on capacity
    const baseCosts = {
      fast: {
        small: 1800000,    // $1.8M for small fast-fill
        medium: 2200000,   // $2.2M for medium fast-fill
        large: 2700000,    // $2.7M for large fast-fill
        xlarge: 3100000    // $3.1M for extra large fast-fill
      },
      time: {
        small: 491000,     // $491K for small time-fill
        medium: 1200000,   // $1.2M for medium time-fill
        large: 2100000,    // $2.1M for large time-fill
        xlarge: 3500000    // $3.5M for extra large time-fill
      }
    };
    
    // Get base cost from the pricing tiers
    const baseCost = baseCosts[stationConfig.stationType][tier];
    
    // Apply business type adjustment
    const businessMultiplier = stationConfig.businessType === 'aglc' ? 1.0 : 0.95;
    
    return Math.round(baseCost * businessMultiplier);
  };

  return (
    <div className="bg-white rounded-md p-3 space-y-3">
      {/* Station Type */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">Station Type</Label>
        <RadioGroup 
          className="grid grid-cols-2 gap-3"
          value={stationConfig.stationType}
          onValueChange={(value) => updateStationConfig({...stationConfig, stationType: value as 'fast' | 'time'})}
        >
          <div className="relative">
            <RadioGroupItem value="fast" id="stationTypeFast" className="absolute opacity-0" />
            <Label 
              htmlFor="stationTypeFast" 
              className="flex flex-col items-center p-3 bg-gray-50 border rounded-md cursor-pointer hover:bg-blue-50 data-[state=checked]:bg-blue-50 data-[state=checked]:border-blue-500"
            >
              <span className="text-sm font-medium">Fast-Fill</span>
              <span className="text-xs text-gray-500 mt-1">Quick refueling, higher cost</span>
            </Label>
          </div>
          <div className="relative">
            <RadioGroupItem value="time" id="stationTypeTime" className="absolute opacity-0" />
            <Label 
              htmlFor="stationTypeTime" 
              className="flex flex-col items-center p-3 bg-gray-50 border rounded-md cursor-pointer hover:bg-blue-50 data-[state=checked]:bg-blue-50 data-[state=checked]:border-blue-500"
            >
              <span className="text-sm font-medium">Time-Fill</span>
              <span className="text-xs text-gray-500 mt-1">Overnight refueling, lower cost</span>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Business Type */}
      <div className="border-t pt-3 mt-3">
        <Label className="block text-sm font-medium text-gray-700 mb-2">GAS LDC</Label>
        <Select 
          value={stationConfig.businessType} 
          onValueChange={(value) => updateStationConfig({...stationConfig, businessType: value as 'aglc' | 'cgc' | 'vng'})}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select GAS LDC" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aglc">AGLC (Atlanta Gas Light Company)</SelectItem>
            <SelectItem value="cgc">CGC (Chattanooga Gas Company)</SelectItem>
            <SelectItem value="vng">VNG (Virginia Natural Gas)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Station Capacity */}
      <div className="border-t pt-3 mt-3">
        <div className="flex items-center justify-between">
          <Label className="block text-sm font-medium text-gray-700">Station Capacity</Label>
          <span className="text-sm font-medium text-blue-600">
            {Math.round(dailyGGE)} GGE/day ({getCapacityTier().toUpperCase()})
          </span>
        </div>
        <Progress value={capacityPercentage} className="h-2 mt-2" />
        <p className="text-xs text-gray-500 mt-1">
          Based on vehicle counts: Light (2.5 GGE/day), Medium (6 GGE/day), Heavy (15 GGE/day)
        </p>
      </div>
      
      {/* Turnkey Option */}
      <div className="border-t pt-3 mt-3">
        <Label className="block text-sm font-medium text-gray-700 mb-2">Turnkey Option</Label>
        <RadioGroup 
          className="grid grid-cols-2 gap-3"
          value={stationConfig.turnkey ? "yes" : "no"}
          onValueChange={(value) => updateStationConfig({...stationConfig, turnkey: value === "yes"})}
        >
          <div className="relative">
            <RadioGroupItem value="yes" id="turnkeyYes" className="absolute opacity-0" />
            <Label 
              htmlFor="turnkeyYes" 
              className="flex flex-col items-center p-3 bg-gray-50 border rounded-md cursor-pointer hover:bg-blue-50 data-[state=checked]:bg-blue-50 data-[state=checked]:border-blue-500"
            >
              <span className="text-sm font-medium">Yes</span>
              <span className="text-xs text-gray-500 mt-1">Pay cost upfront</span>
            </Label>
          </div>
          <div className="relative">
            <RadioGroupItem value="no" id="turnkeyNo" className="absolute opacity-0" />
            <Label 
              htmlFor="turnkeyNo" 
              className="flex flex-col items-center p-3 bg-gray-50 border rounded-md cursor-pointer hover:bg-blue-50 data-[state=checked]:bg-blue-50 data-[state=checked]:border-blue-500"
            >
              <span className="text-sm font-medium">No</span>
              <span className="text-xs text-gray-500 mt-1">Leveraging LDC investment tariff</span>
            </Label>
          </div>
        </RadioGroup>
        <p className="text-xs text-gray-500 mt-1">
          {stationConfig.turnkey 
            ? "Station cost is paid upfront as a single investment" 
            : `Station uses LDC investment tariff with monthly fee of ${stationConfig.businessType === 'aglc' ? '1.5%' : '1.6%'} over the analysis period`}
        </p>
      </div>

      {/* Cost Estimate */}
      <div className="border-t pt-3 mt-3">
        <div className="flex items-center justify-between">
          <Label className="block text-sm font-medium text-gray-700">Estimated Station Cost</Label>
          <span className="text-sm font-medium text-gray-900">${getStationCost().toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {stationConfig.turnkey 
            ? "Includes installation and equipment (paid upfront)" 
            : "Includes installation and equipment (LDC investment tariff)"}
        </p>
      </div>
    </div>
  );
}
