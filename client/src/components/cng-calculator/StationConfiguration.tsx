import { useCalculator } from "@/contexts/CalculatorContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { calculateStationCost } from "@/lib/calculator";

export default function StationConfiguration() {
  const { 
    stationConfig, 
    updateStationConfig,
    vehicleParameters,
    vehicleDistribution
  } = useCalculator();

  // Determine vehicle counts based on sizing method for display
  let vehicleCounts: { lightDutyCount: number, mediumDutyCount: number, heavyDutyCount: number };
  
  if (stationConfig.sizingMethod === 'peak' && vehicleDistribution) {
    // Use peak year vehicle counts from deployment strategy
    let maxLight = 0;
    let maxMedium = 0;
    let maxHeavy = 0;

    vehicleDistribution.forEach(year => {
      maxLight = Math.max(maxLight, year.light || 0);
      maxMedium = Math.max(maxMedium, year.medium || 0);
      maxHeavy = Math.max(maxHeavy, year.heavy || 0);
    });

    vehicleCounts = {
      lightDutyCount: maxLight,
      mediumDutyCount: maxMedium,
      heavyDutyCount: maxHeavy
    };
  } else {
    // Use total vehicle counts (default behavior)
    vehicleCounts = {
      lightDutyCount: vehicleParameters.lightDutyCount,
      mediumDutyCount: vehicleParameters.mediumDutyCount,
      heavyDutyCount: vehicleParameters.heavyDutyCount
    };
  }

  // Calculate annual GGE (Gasoline Gallon Equivalent) consumption for display
  // Formula: (Annual Miles / (MPG × CNG Efficiency Factor)) × Vehicle Count
  
  // CNG efficiency factors (fuel economy reduction)
  const cngEfficiencyFactors = {
    light: 0.95,    // 95% efficiency (5% reduction)
    medium: 0.925,  // 92.5% efficiency (7.5% reduction)  
    heavy: 0.90     // 90% efficiency (10% reduction)
  };
  
  // Calculate annual GGE per vehicle type
  const lightAnnualGGE = vehicleParameters.lightDutyAnnualMiles / (vehicleParameters.lightDutyMPG * cngEfficiencyFactors.light);
  const mediumAnnualGGE = vehicleParameters.mediumDutyAnnualMiles / (vehicleParameters.mediumDutyMPG * cngEfficiencyFactors.medium);
  const heavyAnnualGGE = vehicleParameters.heavyDutyAnnualMiles / (vehicleParameters.heavyDutyMPG * cngEfficiencyFactors.heavy);
  
  // Total annual GGE consumption for the fleet
  const annualGGE = 
    (vehicleCounts.lightDutyCount * lightAnnualGGE) + 
    (vehicleCounts.mediumDutyCount * mediumAnnualGGE) + 
    (vehicleCounts.heavyDutyCount * heavyAnnualGGE);
  
  // Max capacity reference points for annual consumption
  const maxCapacity = stationConfig.stationType === 'fast' ? 365000 : 292000; // in GGE per year (1000/800 daily × 365)
  const capacityPercentage = Math.min(Math.round((annualGGE / maxCapacity) * 100), 100);
  
  // Get capacity tier for pricing based on annual GGE consumption
  const getCapacityTier = () => {
    if (annualGGE < 73000) return 'small';        // < 200 GGE/day equivalent
    if (annualGGE < 182135) return 'medium';      // 200-499 GGE/day equivalent
    if (annualGGE < 291635) return 'large';       // 500-799 GGE/day equivalent
    return 'xlarge';                              // 800+ GGE/day equivalent
  };
  
  // Use centralized station cost calculation
  const getStationCost = () => {
    return calculateStationCost(stationConfig, vehicleParameters, vehicleDistribution);
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
            {Math.round(annualGGE).toLocaleString()} GGE/year ({getCapacityTier().toUpperCase()})
          </span>
        </div>
        <Progress value={capacityPercentage} className="h-2 mt-2" />
        <p className="text-xs text-gray-500 mt-1">
          {stationConfig.sizingMethod === 'peak' ? 
            `Peak year vehicles: ${vehicleCounts.lightDutyCount} Light, ${vehicleCounts.mediumDutyCount} Medium, ${vehicleCounts.heavyDutyCount} Heavy (w/ CNG efficiency: 95%/92.5%/90%)` :
            `Total vehicles: ${vehicleCounts.lightDutyCount} Light, ${vehicleCounts.mediumDutyCount} Medium, ${vehicleCounts.heavyDutyCount} Heavy (w/ CNG efficiency: 95%/92.5%/90%)`
          }
        </p>
      </div>
      
      {/* Station Sizing Method */}
      <div className="border-t pt-3 mt-3">
        <Label className="block text-sm font-medium text-gray-700 mb-2">Station Sizing Method</Label>
        <RadioGroup 
          className="grid grid-cols-1 gap-3"
          value={stationConfig.sizingMethod}
          onValueChange={(value) => updateStationConfig({...stationConfig, sizingMethod: value as 'total' | 'peak'})}
        >
          <div className="relative">
            <RadioGroupItem value="total" id="sizingTotal" className="absolute opacity-0" />
            <Label 
              htmlFor="sizingTotal" 
              className="flex flex-col items-start p-3 bg-gray-50 border rounded-md cursor-pointer hover:bg-blue-50 data-[state=checked]:bg-blue-50 data-[state=checked]:border-blue-500"
            >
              <span className="text-sm font-medium">Total Vehicle Count</span>
              <span className="text-xs text-gray-500 mt-1">Size station for all {vehicleParameters.lightDutyCount + vehicleParameters.mediumDutyCount + vehicleParameters.heavyDutyCount} vehicles from day one</span>
            </Label>
          </div>
          <div className="relative">
            <RadioGroupItem value="peak" id="sizingPeak" className="absolute opacity-0" />
            <Label 
              htmlFor="sizingPeak" 
              className="flex flex-col items-start p-3 bg-gray-50 border rounded-md cursor-pointer hover:bg-blue-50 data-[state=checked]:bg-blue-50 data-[state=checked]:border-blue-500"
            >
              <span className="text-sm font-medium">Peak Year Usage</span>
              <span className="text-xs text-gray-500 mt-1">Size station for peak year: {vehicleCounts.lightDutyCount + vehicleCounts.mediumDutyCount + vehicleCounts.heavyDutyCount} vehicles max</span>
            </Label>
          </div>
        </RadioGroup>
        <p className="text-xs text-gray-500 mt-1">
          {stationConfig.sizingMethod === 'total' 
            ? "Station will be sized for maximum capacity regardless of deployment timeline" 
            : "Station will be sized for the peak year of your deployment strategy"}
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
            : `Station uses LDC investment tariff with monthly fee of ${stationConfig.businessType === 'cgc' ? '1.6%' : '1.5%'} over the analysis period`}
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
