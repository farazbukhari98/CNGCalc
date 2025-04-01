import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCalculator } from "@/contexts/CalculatorContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

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

export default function SensitivityAnalysis() {
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
    
    // Create 11 points from -50% to +50% (or the configured range)
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
        label: `${percentage > 0 ? '+' : ''}${percentage}%`
      });
    }
    
    setSensitivityData(dataPoints);
  }, [selectedVariable, variationPercentage, results]);

  // Calculate the modified value based on the selected variable and percentage
  const calculateModifiedValue = (variable: SensitivityVariable, percentage: number) => {
    // Different calculation based on variable type
    switch (variable) {
      case "gasolinePrice":
        return fuelPrices.gasolinePrice * (1 + percentage / 100);
      case "dieselPrice":
        return fuelPrices.dieselPrice * (1 + percentage / 100);
      case "cngPrice":
        return fuelPrices.cngPrice * (1 + percentage / 100);
      case "lightDutyCost":
      case "mediumDutyCost":
      case "heavyDutyCost":
      case "annualMiles":
        // These would need appropriate base values from the context
        return (1 + percentage / 100);
      default:
        return 0;
    }
  };

  // Simulate the modified result
  // In a real implementation, this would call the actual calculation functions
  const calculateModifiedResult = (variable: SensitivityVariable, modifiedValue: number) => {
    // This is a simplification - in reality, you would recalculate with modified inputs
    // A comprehensive implementation would need to update inputs and recalculate
    
    // For this prototype, we'll use a simplified model
    let basePayback = results?.paybackPeriod || 0;
    let baseRoi = results?.roi || 0;
    let baseNetCashFlow = results?.netCashFlow || 0;
    
    // Effects vary by variable type (simplified modeling)
    let paybackFactor = 1.0;
    let roiFactor = 1.0;
    let cashFlowFactor = 1.0;

    switch (variable) {
      case "gasolinePrice":
        // Higher gas price improves CNG financials
        paybackFactor = modifiedValue / fuelPrices.gasolinePrice > 1 ? 
          1 / (modifiedValue / fuelPrices.gasolinePrice) : modifiedValue / fuelPrices.gasolinePrice;
        roiFactor = modifiedValue / fuelPrices.gasolinePrice;
        cashFlowFactor = modifiedValue / fuelPrices.gasolinePrice;
        break;
      case "dieselPrice":
        // Higher diesel price improves CNG financials
        paybackFactor = modifiedValue / fuelPrices.dieselPrice > 1 ? 
          1 / (modifiedValue / fuelPrices.dieselPrice) : modifiedValue / fuelPrices.dieselPrice;
        roiFactor = modifiedValue / fuelPrices.dieselPrice;
        cashFlowFactor = modifiedValue / fuelPrices.dieselPrice;
        break;
      case "cngPrice":
        // Higher CNG price worsens financials
        paybackFactor = fuelPrices.cngPrice / modifiedValue > 1 ? 
          fuelPrices.cngPrice / modifiedValue : 1 / (fuelPrices.cngPrice / modifiedValue);
        roiFactor = fuelPrices.cngPrice / modifiedValue;
        cashFlowFactor = fuelPrices.cngPrice / modifiedValue;
        break;
      // For the simplified model, we'll use a basic linear relationship for other variables
      default:
        paybackFactor = 1 / modifiedValue;
        roiFactor = modifiedValue;
        cashFlowFactor = modifiedValue;
    }
    
    return {
      paybackPeriod: Math.max(0.5, basePayback * paybackFactor),
      roi: Math.max(0, baseRoi * roiFactor),
      netCashFlow: baseNetCashFlow * cashFlowFactor
    };
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Format for chart tooltips
  const formatTooltipValue = (value: number, name: string) => {
    if (name === "payback") {
      return `${value.toFixed(1)} Years`;
    } else if (name === "roi") {
      return `${Math.round(value)}%`;
    } else if (name === "netCashFlow") {
      return formatCurrency(value);
    }
    return value;
  };

  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Sensitivity Analysis</h2>
        
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
                    onValueChange={(values) => setVariationPercentage(values[0])}
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
                      <span className="text-xs font-medium">{results.paybackPeriod.toFixed(1)} Years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">ROI ({timeHorizon} Years)</span>
                      <span className="text-xs font-medium">{Math.round(results.roi)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Net Cash Flow</span>
                      <span className="text-xs font-medium">{formatCurrency(results.netCashFlow)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sensitivity Chart */}
              <div className="bg-gray-50 p-4 rounded-lg col-span-1 md:col-span-2">
                <Tabs defaultValue="payback" onValueChange={(value) => setActiveMetric(value as "payback" | "roi" | "netCashFlow")}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Sensitivity Impact</h3>
                    <TabsList className="bg-gray-200">
                      <TabsTrigger value="payback" className="text-xs">Payback</TabsTrigger>
                      <TabsTrigger value="roi" className="text-xs">ROI</TabsTrigger>
                      <TabsTrigger value="netCashFlow" className="text-xs">Cash Flow</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="payback" className="mt-0">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sensitivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis 
                            label={{ value: 'Payback Period (Years)', angle: -90, position: 'insideLeft' }} 
                            domain={['auto', 'auto']}
                          />
                          <RechartsTooltip formatter={formatTooltipValue} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="payback" 
                            name="Payback Period" 
                            stroke="#3b82f6" 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="roi" className="mt-0">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sensitivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis 
                            label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }} 
                            domain={['auto', 'auto']}
                          />
                          <RechartsTooltip formatter={formatTooltipValue} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="roi" 
                            name="ROI %" 
                            stroke="#10b981" 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="netCashFlow" className="mt-0">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sensitivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis 
                            label={{ value: 'Net Cash Flow ($)', angle: -90, position: 'insideLeft' }} 
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `$${(value / 1000)}k`}
                          />
                          <RechartsTooltip formatter={formatTooltipValue} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="netCashFlow" 
                            name="Net Cash Flow" 
                            stroke="#6366f1" 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
                
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