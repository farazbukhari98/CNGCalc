import { useState } from "react";
import { useCalculator } from "@/contexts/CalculatorContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPaybackPeriod } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { X, Plus, BarChart2, TrendingUp, Zap, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StrategyComparison() {
  const { results, deploymentStrategy, calculateResults } = useCalculator();
  const { 
    comparisonItems, 
    addComparisonItem, 
    removeComparisonItem, 
    clearComparisonItems, 
    isInComparison 
  } = useComparison();
  
  const [activeTab, setActiveTab] = useState("roi");

  // If there are no items to compare, don't render
  if (comparisonItems.length === 0) {
    return null;
  }

  // Prepare comparison data for ROI chart
  const prepareROIData = () => {
    const data = [];

    // Find the max time horizon among all strategies
    const maxTimeHorizon = Math.max(
      ...comparisonItems.map(item => item.results.cumulativeSavings.length)
    );

    for (let i = 0; i < maxTimeHorizon; i++) {
      const yearData: any = { year: `Year ${i + 1}` };
      
      comparisonItems.forEach(item => {
        // Add ROI data for each strategy
        if (i < item.results.cumulativeSavings.length) {
          const netCashFlow = item.results.cumulativeSavings[i] - item.results.cumulativeInvestment[i];
          yearData[item.strategyName] = netCashFlow;
        } else {
          yearData[item.strategyName] = null; // Use null for missing data points
        }
      });
      
      data.push(yearData);
    }

    return data;
  };

  // Prepare comparison data for CO2 emissions
  const prepareEmissionsData = () => {
    const data = [];

    // Find the max time horizon among all strategies
    const maxTimeHorizon = Math.max(
      ...comparisonItems.map(item => item.results.cumulativeEmissionsSaved.length)
    );

    for (let i = 0; i < maxTimeHorizon; i++) {
      const yearData: any = { year: `Year ${i + 1}` };
      
      comparisonItems.forEach(item => {
        // Add emissions data for each strategy (convert to metric tons)
        if (i < item.results.cumulativeEmissionsSaved.length) {
          yearData[item.strategyName] = item.results.cumulativeEmissionsSaved[i] / 1000;
        } else {
          yearData[item.strategyName] = null; // Use null for missing data points
        }
      });
      
      data.push(yearData);
    }

    return data;
  };

  // Prepare comparison data for investment timeline
  const prepareInvestmentData = () => {
    const data = [];

    // Find the max time horizon among all strategies
    const maxTimeHorizon = Math.max(
      ...comparisonItems.map(item => item.results.cumulativeInvestment.length)
    );

    for (let i = 0; i < maxTimeHorizon; i++) {
      const yearData: any = { year: `Year ${i + 1}` };
      
      comparisonItems.forEach(item => {
        // Add cumulative investment data for each strategy
        if (i < item.results.cumulativeInvestment.length) {
          yearData[item.strategyName] = item.results.cumulativeInvestment[i];
        } else {
          yearData[item.strategyName] = null; // Use null for missing data points
        }
      });
      
      data.push(yearData);
    }

    return data;
  };

  // Prepare comparison data for savings
  const prepareSavingsData = () => {
    const data = [];

    // Find the max time horizon among all strategies
    const maxTimeHorizon = Math.max(
      ...comparisonItems.map(item => item.results.cumulativeSavings.length)
    );

    for (let i = 0; i < maxTimeHorizon; i++) {
      const yearData: any = { year: `Year ${i + 1}` };
      
      comparisonItems.forEach(item => {
        // Add cumulative savings data for each strategy
        if (i < item.results.cumulativeSavings.length) {
          yearData[item.strategyName] = item.results.cumulativeSavings[i];
        } else {
          yearData[item.strategyName] = null; // Use null for missing data points
        }
      });
      
      data.push(yearData);
    }

    return data;
  };

  // Generate color for each strategy
  const getStrategyColor = (index: number) => {
    const colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6'];
    return colors[index % colors.length];
  };

  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border shadow-sm rounded-md">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <p className="text-xs">
                <span className="font-medium">{entry.name}: </span>
                {activeTab === 'emissions' 
                  ? `${entry.value?.toFixed(1)} metric tons CO₂` 
                  : `$${entry.value?.toLocaleString()}`
                }
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format Y axis labels
  const formatYAxis = (value: number) => {
    if (activeTab === 'emissions') {
      return `${value} tons`;
    }
    
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <Card className="mt-6 bg-white rounded-lg shadow mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Strategy Comparison</h2>
          <div className="flex space-x-2">
            {/* Add current strategy button if not already added */}
            {results && !isInComparison(deploymentStrategy) && comparisonItems.length < 4 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addComparisonItem(deploymentStrategy, results)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Current</span>
              </Button>
            )}
            
            {/* Clear all button */}
            {comparisonItems.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearComparisonItems}
                className="text-gray-500"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Strategy badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {comparisonItems.map((item, index) => (
            <Badge 
              key={item.id} 
              variant="outline" 
              className="pl-2 flex items-center gap-1 border-2"
              style={{ borderColor: getStrategyColor(index) }}
            >
              <span style={{ color: getStrategyColor(index) }}>{item.strategyName}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 ml-1 text-gray-400 hover:text-gray-700"
                onClick={() => removeComparisonItem(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>

        {/* Comparison Tabs */}
        <Tabs defaultValue="roi" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="roi" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Net Cash Flow</span>
            </TabsTrigger>
            <TabsTrigger value="investment" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Investment</span>
            </TabsTrigger>
            <TabsTrigger value="savings" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Savings</span>
            </TabsTrigger>
            <TabsTrigger value="emissions" className="flex items-center gap-1">
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline">Emissions</span>
            </TabsTrigger>
          </TabsList>

          {/* ROI Tab */}
          <TabsContent value="roi" className="pt-2">
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={prepareROIData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatYAxis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {comparisonItems.map((item, index) => (
                    <Line
                      key={item.id}
                      type="monotone"
                      dataKey={item.strategyName}
                      stroke={getStrategyColor(index)}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                    />
                  ))}
                  <ReferenceLine y={0} stroke="#000" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Comparison of cumulative net cash flow (total savings minus total investment) over time for different strategies. 
              The point where a line crosses above zero represents the payback period.
            </p>
          </TabsContent>

          {/* Investment Tab */}
          <TabsContent value="investment" className="pt-2">
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={prepareInvestmentData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatYAxis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {comparisonItems.map((item, index) => (
                    <Area
                      key={item.id}
                      type="monotone"
                      dataKey={item.strategyName}
                      stroke={getStrategyColor(index)}
                      fill={`${getStrategyColor(index)}33`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Comparison of cumulative investment over time for different strategies.
              Immediate deployment requires higher upfront investment, while phased approaches spread costs over time.
            </p>
          </TabsContent>

          {/* Savings Tab */}
          <TabsContent value="savings" className="pt-2">
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={prepareSavingsData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatYAxis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {comparisonItems.map((item, index) => (
                    <Area
                      key={item.id}
                      type="monotone"
                      dataKey={item.strategyName}
                      stroke={getStrategyColor(index)}
                      fill={`${getStrategyColor(index)}33`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Comparison of cumulative savings over time for different strategies.
              Strategies with more vehicles deployed earlier will accumulate savings faster.
            </p>
          </TabsContent>

          {/* Emissions Tab */}
          <TabsContent value="emissions" className="pt-2">
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={prepareEmissionsData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatYAxis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {comparisonItems.map((item, index) => (
                    <Area
                      key={item.id}
                      type="monotone"
                      dataKey={item.strategyName}
                      stroke={getStrategyColor(index)}
                      fill={`${getStrategyColor(index)}33`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Comparison of cumulative CO₂ emissions saved (in metric tons) over time for different strategies.
              Strategies with more vehicles deployed earlier will have greater environmental benefits.
            </p>
          </TabsContent>
        </Tabs>

        {/* Comparison Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {comparisonItems.map((item, index) => (
            <div 
              key={item.id} 
              className="bg-gray-50 p-4 rounded-lg border-t-4" 
              style={{ borderColor: getStrategyColor(index) }}
            >
              <div className="text-sm font-medium mb-2" style={{ color: getStrategyColor(index) }}>
                {item.strategyName}
              </div>
              <div className="space-y-2 text-xs">
                {/* Vehicle Counts - First show total counts */}
                <div className="border-b border-gray-200 pb-1 mb-1">
                  <div className="font-medium text-gray-700 mb-1">Vehicle Counts:</div>
                  <div className="grid grid-cols-3 gap-1">
                    <div>
                      <span className="text-gray-500">Light:</span>
                      <span className="font-medium ml-1">
                        {item.results.vehicleDistribution.reduce((sum, year) => sum + year.light, 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Med:</span>
                      <span className="font-medium ml-1">
                        {item.results.vehicleDistribution.reduce((sum, year) => sum + year.medium, 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Heavy:</span>
                      <span className="font-medium ml-1">
                        {item.results.vehicleDistribution.reduce((sum, year) => sum + year.heavy, 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Strategy-specific parameters if available */}
                {item.strategy === 'phased' && (
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Phased:</span>
                    <span className="font-medium">25% per year</span>
                  </div>
                )}
                {item.strategy === 'aggressive' && (
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Aggressive:</span>
                    <span className="font-medium">50% year 1</span>
                  </div>
                )}
                {item.strategy === 'deferred' && (
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Deferred:</span>
                    <span className="font-medium">Starts year 3</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-500">Payback:</span>
                  <span className="font-medium">{formatPaybackPeriod(item.results.paybackPeriod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ROI:</span>
                  <span className="font-medium">{item.results.roi.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Investment:</span>
                  <span className="font-medium">${item.results.totalInvestment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CO₂ Saved:</span>
                  <span className="font-medium">{(item.results.totalEmissionsSaved / 1000).toFixed(1)} tons</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}