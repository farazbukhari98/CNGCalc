import { useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import VehicleParameters from "./VehicleParameters";
import StationConfiguration from "./StationConfiguration";
import FuelPrices from "./FuelPrices";
import GlobalSettings from "./GlobalSettings";
import TimeHorizonSelector from "./TimeHorizonSelector";
import { Badge } from "@/components/ui/badge";
import { useCalculator } from "@/contexts/CalculatorContext";

export default function SidePanel() {
  
  const [openSections, setOpenSections] = useState({
    globalSettings: true,
    vehicleParams: true,
    stationConfig: false,
    fuelPrices: false,
    timeHorizon: true,
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
        {/* Global Settings Section */}
        <div className="mb-4">
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => toggleSection("globalSettings")}
            aria-expanded={openSections.globalSettings}
          >
            <span className="font-medium">Global Settings</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                openSections.globalSettings ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`mt-2 ${openSections.globalSettings ? "" : "hidden"}`}
          >
            <GlobalSettings />
          </div>
        </div>

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

        {/* Time Horizon Section */}
        <div className="mb-4">
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => toggleSection("timeHorizon")}
            aria-expanded={openSections.timeHorizon}
          >
            <span className="font-medium">Time Horizon</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                openSections.timeHorizon ? "rotate-180" : ""
              }`}
            />
          </button>
          <div className={`mt-2 ${openSections.timeHorizon ? "" : "hidden"}`}>
            <TimeHorizonSelector />
          </div>
        </div>

        {/* Auto-update indicator */}
        <div className="flex items-center justify-center gap-2 p-3 mt-4 bg-gray-100 rounded-lg">
          <RefreshCw size={18} className="text-green-600 animate-spin animate-once animate-duration-1000" />
          <span className="text-sm text-gray-600">Calculations update automatically</span>
        </div>
      </div>
    </div>
  );
}
