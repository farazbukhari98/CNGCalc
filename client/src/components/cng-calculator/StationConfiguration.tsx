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

  // Calculate station capacity based on vehicle counts
  const totalVehicles = 
    vehicleParameters.lightDutyCount + 
    vehicleParameters.mediumDutyCount + 
    vehicleParameters.heavyDutyCount;
  
  // Station capacity calculation (simplified version)
  const stationCapacity = stationConfig.stationType === 'fast' ? 50 : 40;
  const capacityPercentage = Math.min(Math.round((totalVehicles / stationCapacity) * 100), 100);
  
  // Estimate station cost based on type and business model
  const getStationCost = () => {
    const baseCost = stationConfig.stationType === 'fast' ? 750000 : 550000;
    const businessMultiplier = stationConfig.businessType === 'aglc' ? 1.0 : 0.9;
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
        <Label className="block text-sm font-medium text-gray-700 mb-2">Business Type</Label>
        <Select 
          value={stationConfig.businessType} 
          onValueChange={(value) => updateStationConfig({...stationConfig, businessType: value as 'aglc' | 'cgc'})}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aglc">AGLC (Atlanta Gas Light Company)</SelectItem>
            <SelectItem value="cgc">CGC (Chattanooga Gas Company)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Station Capacity */}
      <div className="border-t pt-3 mt-3">
        <div className="flex items-center justify-between">
          <Label className="block text-sm font-medium text-gray-700">Station Capacity</Label>
          <span className="text-sm font-medium text-blue-600">{stationCapacity} Vehicles</span>
        </div>
        <Progress value={capacityPercentage} className="h-2 mt-2" />
        <p className="text-xs text-gray-500 mt-1">Based on selected vehicle counts and types</p>
      </div>
      
      {/* Cost Estimate */}
      <div className="border-t pt-3 mt-3">
        <div className="flex items-center justify-between">
          <Label className="block text-sm font-medium text-gray-700">Estimated Station Cost</Label>
          <span className="text-sm font-medium text-gray-900">${getStationCost().toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Includes installation and equipment</p>
      </div>
    </div>
  );
}
