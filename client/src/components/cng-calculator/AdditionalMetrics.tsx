import { useCalculator } from "@/contexts/CalculatorContext";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { 
  ResponsiveContainer, 
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
  ReferenceLine
} from 'recharts';

export default function AdditionalMetrics() {
  const { results, deploymentStrategy, timeHorizon } = useCalculator();

  // If no results yet, don't render anything
  if (!results) return null;

  // Format emissions value (convert kg to metric tons)
  const formatEmissions = (value: number) => {
    const tons = value / 1000; // Convert kg to metric tons
    return `${tons.toLocaleString(undefined, { maximumFractionDigits: 1 })} tons`;
  };

  // Prepare data for emissions chart
  const emissionsChartData = Array.from({ length: timeHorizon }, (_, i) => {
    return {
      year: `Year ${i + 1}`,
      emissionsSaved: results.yearlyEmissionsSaved[i] / 1000 || 0, // Convert to metric tons
      cumulative: results.cumulativeEmissionsSaved[i] / 1000 || 0 // Convert to metric tons
    };
  });

  // Strategy advantages and considerations
  const strategyInsights = {
    immediate: {
      advantages: [
        "Maximizes immediate fuel savings",
        "Simplifies implementation timeline",
        "Lowest total project cost overall",
        "Faster breakeven and higher ROI"
      ],
      considerations: [
        "Requires significant upfront capital",
        "May strain operational resources",
        "Less flexibility to adjust based on results",
        "Higher financial risk if benefits not realized"
      ]
    },
    phased: {
      advantages: [
        "Reduces initial capital requirements",
        "Allows for operational adjustments",
        "Creates predictable annual budgeting",
        "Spreads maintenance and training needs"
      ],
      considerations: [
        "Delays maximum fuel savings potential",
        "May extend total project timeline",
        "Requires sustained organizational commitment"
      ]
    },
    aggressive: {
      advantages: [
        "Captures savings potential earlier",
        "Accelerates ROI timeline compared to phased",
        "Demonstrates organizational commitment",
        "Reduces long-term exposure to fuel price increases"
      ],
      considerations: [
        "Higher initial capital requirements",
        "Potential operational challenges during rapid transition",
        "Less flexibility compared to phased approach"
      ]
    },
    deferred: {
      advantages: [
        "Minimal initial capital outlay",
        "Allows time for technology maturation",
        "Provides learning opportunities with initial vehicles",
        "Better suited for organizations with limited immediate funds"
      ],
      considerations: [
        "Significantly delays fuel cost savings",
        "May miss near-term fuel price advantages",
        "Extends total project timeline",
        "Lower overall ROI in early years"
      ]
    },
    manual: {
      advantages: [
        "Fully customized to organizational needs",
        "Can align with other capital planning cycles",
        "Flexibility to address specific operational constraints",
        "Accommodates detailed vehicle replacement schedules"
      ],
      considerations: [
        "Requires detailed planning and expertise",
        "May be less optimal than algorithmically-determined strategies",
        "Requires rigorous timeline management"
      ]
    }
  };

  // Calculate total emissions saved in tons
  const totalEmissionsTons = results.totalEmissionsSaved / 1000;
  
  // Custom tooltip for the emissions chart
  const EmissionsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border shadow-sm rounded-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-green-700">
            <span className="font-medium">Annual: </span> 
            {payload[0].value.toFixed(1)} metric tons CO₂
          </p>
          <p className="text-xs text-blue-700">
            <span className="font-medium">Cumulative: </span> 
            {payload[1].value.toFixed(1)} metric tons CO₂
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Emissions Chart */}
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2">CO₂ Emissions Reduction</h2>
          <p className="text-sm text-gray-500 mb-4">
            Estimated reduction in carbon dioxide emissions over time
          </p>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm text-gray-500">Total CO₂ Emissions Saved</span>
              <div className="text-3xl font-bold text-green-600">{formatEmissions(results.totalEmissionsSaved)}</div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">CO₂ Reduction Percentage</span>
              <div className="text-3xl font-bold text-blue-600">{results.co2Reduction.toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={emissionsChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis 
                  tickFormatter={(value) => `${value.toFixed(0)}`}
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Metric Tons CO₂', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: '12px' }
                  }}
                />
                <Tooltip content={<EmissionsTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="emissionsSaved" 
                  stackId="1"
                  name="Annual Emissions Saved"
                  stroke="#22c55e" 
                  fill="rgba(34, 197, 94, 0.2)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulative"
                  name="Cumulative Emissions Saved" 
                  stroke="#3b82f6" 
                  fill="rgba(59, 130, 246, 0.2)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Equivalent Trees Planted</div>
              <div className="text-lg font-bold text-green-600">
                ~{Math.round(totalEmissionsTons * 16.5).toLocaleString()} trees
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Equivalent Forest Area</div>
              <div className="text-lg font-bold text-green-600">
                ~{Math.round(totalEmissionsTons / 7.5).toLocaleString()} acres
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Operational Metrics */}
        <Card className="bg-white rounded-lg shadow">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold mb-3">Operational Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cost per Mile (Gasoline)</span>
                <span className="text-sm font-medium">${results.costPerMileGasoline.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cost per Mile (CNG)</span>
                <span className="text-sm font-medium text-green-600">${results.costPerMileCNG.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cost Reduction</span>
                <span className="text-sm font-medium text-green-600">{results.costReduction.toFixed(1)}%</span>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Maintenance Savings</span>
                <span className="text-sm font-medium text-green-600">10-15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total CO₂ Reduction</span>
                <span className="text-sm font-medium text-green-600">{results.co2Reduction.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Strategy Insights */}
        <Card className="bg-white rounded-lg shadow">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold mb-3">Strategy Insights</h3>
            
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                The <strong>{deploymentStrategy.charAt(0).toUpperCase() + deploymentStrategy.slice(1)} {deploymentStrategy === 'immediate' ? 'Purchase' : 'Deployment'}</strong> strategy 
                {deploymentStrategy === 'immediate' 
                  ? ' involves purchasing all vehicles upfront, maximizing immediate savings but requiring higher initial capital.'
                  : deploymentStrategy === 'phased'
                    ? ' distributes your investment over time, reducing upfront capital requirements while allowing for steady cost savings.'
                    : deploymentStrategy === 'aggressive'
                      ? ' front-loads your investment to accelerate savings in the early years of the project.'
                      : deploymentStrategy === 'deferred'
                        ? ' back-loads your investment, minimizing initial capital needs but delaying maximum savings.'
                        : ' allows you to customize the deployment schedule to your specific needs and constraints.'}
              </p>
              
              <div className="border-t my-3"></div>
              
              <div className="flex items-center text-blue-800 mb-2">
                <CheckCircle className="h-5 w-5 mr-1" />
                <h4 className="font-medium">Advantages</h4>
              </div>
              
              <ul className="list-disc list-inside pl-1 text-xs space-y-1">
                {strategyInsights[deploymentStrategy].advantages.map((advantage, index) => (
                  <li key={index}>{advantage}</li>
                ))}
              </ul>
              
              <div className="flex items-center text-amber-800 mt-3 mb-2">
                <AlertTriangle className="h-5 w-5 mr-1" />
                <h4 className="font-medium">Considerations</h4>
              </div>
              
              <ul className="list-disc list-inside pl-1 text-xs space-y-1">
                {strategyInsights[deploymentStrategy].considerations.map((consideration, index) => (
                  <li key={index}>{consideration}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
