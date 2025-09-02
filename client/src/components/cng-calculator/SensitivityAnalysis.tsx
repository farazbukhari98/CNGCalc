import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCalculator } from "@/contexts/CalculatorContext";
import { formatPaybackPeriod } from "@/lib/utils";
import { MetricInfoTooltip } from "./MetricInfoTooltip";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

// Type for sensitivity variable
type SensitivityVariable = 
  | "gasolinePrice" 
  | "dieselPrice" 
  | "cngPrice" 
  | "lightDutyCost"
  | "mediumDutyCost"
  | "heavyDutyCost"
  | "annualMiles";

// Variable settings
const variableConfig = {
  gasolinePrice: {
    label: "Gasoline Price ($/gallon)",
    min: -50,
    max: 50,
    step: 5,
    defaultValue: 0,
  },
  dieselPrice: {
    label: "Diesel Price ($/gallon)",
    min: -50,
    max: 50,
    step: 5,
    defaultValue: 0,
  },
  cngPrice: {
    label: "CNG Price ($/GGE)",
    min: -50,
    max: 50,
    step: 5,
    defaultValue: 0,
  },
  lightDutyCost: {
    label: "Light Duty Vehicle Cost",
    min: -50,
    max: 50,
    step: 5,
    defaultValue: 0,
  },
  mediumDutyCost: {
    label: "Medium Duty Vehicle Cost",
    min: -50,
    max: 50,
    step: 5,
    defaultValue: 0,
  },
  heavyDutyCost: {
    label: "Heavy Duty Vehicle Cost",
    min: -50,
    max: 50,
    step: 5,
    defaultValue: 0,
  },
  annualMiles: {
    label: "Annual Miles Driven",
    min: -50,
    max: 50,
    step: 5,
    defaultValue: 0,
  }
};

export default function SensitivityAnalysis({ hideNegativeValues = false }: { hideNegativeValues?: boolean }) {
  const { 
    vehicleParameters, 
    stationConfig, 
    fuelPrices, 
    timeHorizon, 
    deploymentStrategy,
    results,
  } = useCalculator();

  // State for selected variable and its variation percentage
  const [selectedVariable, setSelectedVariable] = useState<SensitivityVariable>("gasolinePrice");
  const [variationPercentage, setVariationPercentage] = useState(0);
  const [sensitivityData, setSensitivityData] = useState<any[]>([]);
  const [activeMetric, setActiveMetric] = useState<"payback" | "roi" | "netCashFlow">("payback");

  // Labels for the metrics
  const metricLabels = {
    payback: "Payback Period (Years)",
    roi: "ROI (%)",
    netCashFlow: "Net Cash Flow ($)"
  };

  // Calculate sensitivity data whenever selected variable or variation changes
  useEffect(() => {
    if (!results) return;

    // Generate data points for sensitivity analysis
    const dataPoints = [];
    
    // Create points from min to max based on step size
    const config = variableConfig[selectedVariable];
    const steps = Math.floor((config.max - config.min) / config.step) + 1;
    
    for (let i = 0; i < steps; i++) {
      const percentage = config.min + (i * config.step);
      const modifiedValue = calculateModifiedValue(selectedVariable, percentage);
      const result = calculateModifiedResult(selectedVariable, modifiedValue);
      
      dataPoints.push({
        percentage,
        payback: result.paybackPeriod,
        roi: result.roi,
        netCashFlow: result.netCashFlow,
        // Calculate scaled cash flow for visualization on the same chart
        netCashFlowScaled: result.netCashFlow / 10000,
        label: `${percentage > 0 ? '+' : ''}${percentage}%`
      });
    }
    
    setSensitivityData(dataPoints);
    
    // Highlight the current selected variation
    setVariationPercentage(Math.min(Math.max(variationPercentage, config.min), config.max));
    
  }, [selectedVariable, results, vehicleParameters, stationConfig, fuelPrices, timeHorizon, deploymentStrategy]);

  // Calculate the modified value based on the selected variable and percentage
  const calculateModifiedValue = (variable: SensitivityVariable, percentage: number) => {
    // Convert percentage to ratio for calculations
    const modificationRatio = 1 + percentage / 100;
    
    // Different calculation based on variable type
    switch (variable) {
      case "gasolinePrice":
        return fuelPrices.gasolinePrice * modificationRatio;
      case "dieselPrice":
        return fuelPrices.dieselPrice * modificationRatio;
      case "cngPrice":
        return fuelPrices.cngPrice * modificationRatio;
      case "lightDutyCost":
      case "mediumDutyCost":
      case "heavyDutyCost":
      case "annualMiles":
        // For vehicle costs and annual miles, we just return the ratio
        // The calculation logic in calculateModifiedResult will handle these appropriately
        return modificationRatio;
      default:
        return 1.0; // Default to no change
    }
  };

  // Simulate the modified result
  // In a real implementation, this would call the actual calculation functions
  const calculateModifiedResult = (variable: SensitivityVariable, modifiedValue: number) => {
    // This is a simplified model but with corrected business logic
    // A comprehensive implementation would need to update inputs and recalculate completely
    
    let basePayback = results?.paybackPeriod || 0;
    let baseRoi = results?.roi || 0;
    let baseNetCashFlow = results?.netCashFlow || 0;
    
    // Effects vary by variable type based on business logic
    let paybackFactor = 1.0;
    let roiFactor = 1.0;
    let cashFlowFactor = 1.0;
    
    // Calculate the ratio for proper scaling
    let ratio = 1.0;

    switch (variable) {
      case "gasolinePrice":
        // Higher gas price improves CNG financials (shorter payback, higher ROI, better cash flow)
        ratio = modifiedValue / fuelPrices.gasolinePrice;
        // Payback period is inversely proportional - higher gas prices = shorter payback
        paybackFactor = 1 / ratio;
        // ROI and cash flow are directly proportional
        roiFactor = ratio; 
        cashFlowFactor = ratio;
        break;
        
      case "dieselPrice":
        // Higher diesel price improves CNG financials (shorter payback, higher ROI, better cash flow)
        ratio = modifiedValue / fuelPrices.dieselPrice;
        // Payback period is inversely proportional
        paybackFactor = 1 / ratio;
        // ROI and cash flow are directly proportional
        roiFactor = ratio;
        cashFlowFactor = ratio;
        break;
        
      case "cngPrice":
        // Higher CNG price worsens financials (longer payback, lower ROI, worse cash flow)
        ratio = modifiedValue / fuelPrices.cngPrice;
        // Payback period is directly proportional - higher CNG prices = longer payback
        paybackFactor = ratio;
        // ROI and cash flow are inversely proportional
        roiFactor = 1 / ratio;
        cashFlowFactor = 1 / ratio;
        break;
        
      case "lightDutyCost":
      case "mediumDutyCost":
      case "heavyDutyCost":
        // Higher vehicle costs worsen financials (longer payback, lower ROI, worse cash flow)
        ratio = modifiedValue; // Already a ratio in this case (percentage change)
        // Payback period is directly proportional - higher costs = longer payback
        paybackFactor = ratio;
        // ROI and cash flow are inversely proportional
        roiFactor = 1 / ratio;
        cashFlowFactor = 1 / ratio;
        break;
        
      case "annualMiles":
        // More miles driven improves financials (shorter payback, higher ROI, better cash flow)
        ratio = modifiedValue; // Already a ratio in this case
        // Payback period is inversely proportional - more miles = more savings = shorter payback
        paybackFactor = 1 / ratio;
        // ROI and cash flow are directly proportional
        roiFactor = ratio;
        cashFlowFactor = ratio;
        break;
        
      default:
        // Shouldn't reach here, but keep as fallback
        paybackFactor = 1.0;
        roiFactor = 1.0;
        cashFlowFactor = 1.0;
    }
    
    return {
      paybackPeriod: Math.max(0.5, basePayback * paybackFactor),
      roi: Math.max(0, baseRoi * roiFactor),
      netCashFlow: baseNetCashFlow * cashFlowFactor
    };
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format for chart tooltips
  const formatTooltipValue = (value: number, name: string) => {
    if (name === "payback") {
      return formatPaybackPeriod(value);
    } else if (name === "roi") {
      return `${Math.round(value)}%`;
    } else if (name === "netCashFlow") {
      return formatCurrency(value);
    } else if (name === "netCashFlowScaled") {
      // Convert scaled value back to original for display
      return formatCurrency(value * 10000);
    }
    return value;
  };
  
  // Get the calculated values at current variation
  const getCurrentValueForVariable = () => {
    if (!results) return null;
    
    // For exact calculation at the current variation percentage
    if (variationPercentage !== 0) {
      // Calculate the exact modified value and result for the current percentage
      const modifiedValue = calculateModifiedValue(selectedVariable, variationPercentage);
      const result = calculateModifiedResult(selectedVariable, modifiedValue);
      
      return {
        payback: formatPaybackPeriod(result.paybackPeriod),
        roi: Math.round(result.roi) + "%",
        netCashFlow: formatCurrency(result.netCashFlow)
      };
    }
    
    // For baseline (0% variation), use the original results
    return {
      payback: formatPaybackPeriod(results.paybackPeriod),
      roi: Math.round(results.roi) + "%",
      netCashFlow: formatCurrency(results.netCashFlow)
    };
  }
  
  // State to store impact values
  const [variationImpact, setVariationImpact] = useState<{ payback: string; roi: string; netCashFlow: string } | null>(null);
  
  // Update impact values when variables change
  useEffect(() => {
    if (!results) return;
    setVariationImpact(getCurrentValueForVariable());
  }, [variationPercentage, selectedVariable, results, fuelPrices, vehicleParameters, stationConfig]);

  return (
    <Card className="bg-white rounded-lg shadow mb-6 sensitivity-analysis">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Sensitivity Analysis
          <MetricInfoTooltip
            title="Sensitivity Analysis"
            description="This analysis allows you to visualize how changes in key variables affect your financial outcomes. Adjust the slider to see how modifications to the selected variable impact payback period, ROI, and net cash flow."
            calculation="The chart plots how payback period (left axis) and ROI/cash flow (right axis) change when the selected variable is adjusted up or down by a percentage."
            affectingVariables={[
              "Selected variable (fuel prices, vehicle costs, or annual mileage)",
              "Baseline project configuration",
              "Time horizon for analysis"
            ]}
            simpleDescription="See how changes to key variables affect your financial results."
          />
        </h2>
        
        {results ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Variable Selection */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Variable Selection</h3>
                <div className="mb-4">
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Select Variable</Label>
                  <Select 
                    value={selectedVariable} 
                    onValueChange={(value) => setSelectedVariable(value as SensitivityVariable)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select variable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasolinePrice">Gasoline Price ($/gallon)</SelectItem>
                      <SelectItem value="dieselPrice">Diesel Price ($/gallon)</SelectItem>
                      <SelectItem value="cngPrice">CNG Price ($/GGE)</SelectItem>
                      <SelectItem value="lightDutyCost">Light Duty Vehicle Cost</SelectItem>
                      <SelectItem value="mediumDutyCost">Medium Duty Vehicle Cost</SelectItem>
                      <SelectItem value="heavyDutyCost">Heavy Duty Vehicle Cost</SelectItem>
                      <SelectItem value="annualMiles">Annual Miles Driven</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Variable Slider */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="block text-sm font-medium text-gray-700">Variation (%)</Label>
                    <span className="text-sm font-medium">{variationPercentage > 0 ? '+' : ''}{variationPercentage}%</span>
                  </div>
                  <Slider
                    value={[variationPercentage]}
                    min={variableConfig[selectedVariable].min}
                    max={variableConfig[selectedVariable].max}
                    step={variableConfig[selectedVariable].step}
                    onValueChange={(values) => {
                      const newPercentage = values[0];
                      setVariationPercentage(newPercentage);
                      
                      // Immediately update the impact values for responsive UI
                      if (results) {
                        const modifiedValue = calculateModifiedValue(selectedVariable, newPercentage);
                        const result = calculateModifiedResult(selectedVariable, modifiedValue);
                        setVariationImpact({
                          payback: formatPaybackPeriod(result.paybackPeriod),
                          roi: Math.round(result.roi) + "%",
                          netCashFlow: formatCurrency(result.netCashFlow)
                        });
                      }
                    }}
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{variableConfig[selectedVariable].min}%</span>
                    <span>0%</span>
                    <span>+{variableConfig[selectedVariable].max}%</span>
                  </div>
                </div>
                
                {/* Base Value Display */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Base Values</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Payback Period</span>
                      <span className="text-xs font-medium">{formatPaybackPeriod(results.paybackPeriod)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{timeHorizon}-Year ROI</span>
                      <span className="text-xs font-medium">{Math.round(results.roi)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Net Cash Flow</span>
                      <span className="text-xs font-medium">{formatCurrency(results.netCashFlow)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sensitivity Chart - Combined Metrics */}
              <div className="bg-gray-50 p-4 rounded-lg col-span-1 md:col-span-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Sensitivity Impact</h3>
                </div>
                
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensitivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis 
                        yAxisId="payback"
                        label={{ value: 'Payback (Years)', angle: -90, position: 'insideLeft' }} 
                        domain={hideNegativeValues ? [0, 'dataMax'] : ['auto', 'auto']}
                      />
                      <YAxis 
                        yAxisId="roi"
                        orientation="right"
                        label={{ value: 'ROI & Cash Flow', angle: 90, position: 'insideRight' }} 
                        domain={hideNegativeValues ? [0, 'dataMax'] : ['auto', 'auto']}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <RechartsTooltip formatter={formatTooltipValue} />
                      <Legend />
                      
                      {/* Payback Line */}
                      <Line 
                        yAxisId="payback"
                        type="monotone" 
                        dataKey="payback" 
                        name="Payback Period" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }} 
                      />
                      
                      {/* ROI Line */}
                      <Line 
                        yAxisId="roi"
                        type="monotone" 
                        dataKey="roi" 
                        name="ROI %" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }} 
                      />
                      
                      {/* Cash Flow Line - scaled to fit on ROI axis */}
                      <Line 
                        yAxisId="roi"
                        type="monotone" 
                        dataKey="netCashFlowScaled" 
                        name="Cash Flow (scaled)" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                      
                      <ReferenceLine 
                        yAxisId="payback"
                        x={variationPercentage > 0 ? `+${variationPercentage}%` : `${variationPercentage}%`} 
                        stroke="red" 
                        strokeDasharray="3 3" 
                        label={{ value: "Selected", position: "top", fill: "red", fontSize: 10 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex justify-center mt-2 text-xs text-gray-500">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                    <span>Payback Period</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span>ROI %</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                    <span>Cash Flow (scaled)</span>
                  </div>
                </div>
                
                {/* Impact Values Display */}
                {variationImpact && variationPercentage !== 0 && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-md border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                      Impact at {variationPercentage > 0 ? '+' : ''}{variationPercentage}% {variableConfig[selectedVariable].label}
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-gray-600">Payback Period</div>
                        <div className="font-medium text-blue-600">{variationImpact.payback}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">{timeHorizon}-Year ROI</div>
                        <div className="font-medium text-green-600">{variationImpact.roi}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Net Cash Flow</div>
                        <div className="font-medium text-purple-600">{variationImpact.netCashFlow}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-gray-500 leading-relaxed">
                  <p>This analysis shows how changes in {variableConfig[selectedVariable].label} affect your financial outcomes. The current position (0%) represents your baseline scenario.</p>
                  <p>Drag the slider to see how different percentage variations impact the key metrics.</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Complete your fleet configuration to view sensitivity analysis.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}