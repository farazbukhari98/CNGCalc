import { useCalculator } from "@/contexts/CalculatorContext";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function AdditionalMetrics() {
  const { results, deploymentStrategy } = useCalculator();

  // If no results yet, don't render anything
  if (!results) return null;

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Environmental Impact */}
      <Card className="bg-white rounded-lg shadow">
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold mb-3">Environmental Impact</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">CO₂ Reduction</span>
                <span className="text-sm font-medium text-green-600">{results.co2Reduction}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-green-500 rounded-full" 
                  style={{ width: `${results.co2Reduction}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">NOx Reduction</span>
                <span className="text-sm font-medium text-green-600">85%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Particulate Matter</span>
                <span className="text-sm font-medium text-green-600">90%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: "90%" }}></div>
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <div className="text-xs text-gray-500">Carbon Offset Equivalent</div>
              <div className="text-sm font-medium mt-1">~850 acres of forest per year</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
              <span className="text-sm text-gray-600">Extended Engine Life</span>
              <span className="text-sm font-medium text-green-600">~40%</span>
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
  );
}
