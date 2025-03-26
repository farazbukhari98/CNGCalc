import { useState } from "react";
import { ChevronDown } from "lucide-react";
import VehicleParameters from "./VehicleParameters";
import StationConfiguration from "./StationConfiguration";
import FuelPrices from "./FuelPrices";
import { Button } from "@/components/ui/button";
import { useCalculator } from "@/contexts/CalculatorContext";

export default function SidePanel() {
  const { calculateResults } = useCalculator();
  
  const [openSections, setOpenSections] = useState({
    vehicleParams: true,
    stationConfig: false,
    fuelPrices: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-full md:w-80 bg-white shadow-lg md:h-full overflow-y-auto">
      {/* Side Panel Header */}
      <div className="p-4 bg-blue-800 text-white">
        <h1 className="text-xl font-bold">CNG Fleet Calculator</h1>
        <p className="text-sm text-blue-100 mt-1">Optimize your fleet conversion strategy</p>
      </div>

      {/* Collapsible Sections */}
      <div className="p-4 space-y-4">
        {/* Vehicle Parameters Section */}
        <div className="mb-4">
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => toggleSection("vehicleParams")}
            aria-expanded={openSections.vehicleParams}
          >
            <span className="font-medium">Vehicle Parameters</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                openSections.vehicleParams ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`mt-2 ${openSections.vehicleParams ? "" : "hidden"}`}
          >
            <VehicleParameters />
          </div>
        </div>

        {/* Station Configuration Section */}
        <div className="mb-4">
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => toggleSection("stationConfig")}
            aria-expanded={openSections.stationConfig}
          >
            <span className="font-medium">Station Configuration</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                openSections.stationConfig ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`mt-2 ${openSections.stationConfig ? "" : "hidden"}`}
          >
            <StationConfiguration />
          </div>
        </div>

        {/* Fuel Prices Section */}
        <div className="mb-4">
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => toggleSection("fuelPrices")}
            aria-expanded={openSections.fuelPrices}
          >
            <span className="font-medium">Fuel Prices</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                openSections.fuelPrices ? "rotate-180" : ""
              }`}
            />
          </button>
          <div className={`mt-2 ${openSections.fuelPrices ? "" : "hidden"}`}>
            <FuelPrices />
          </div>
        </div>

        {/* Calculate Button */}
        <Button 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-4"
          onClick={calculateResults}
        >
          Calculate ROI
        </Button>
      </div>
    </div>
  );
}
