import { useCalculator } from "@/contexts/CalculatorContext";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { MetricInfoTooltip } from "./MetricInfoTooltip";
import { formatPaybackPeriod } from "@/lib/utils";
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

interface AdditionalMetricsProps {
  showCashflow: boolean;
}

export default function AdditionalMetrics({ showCashflow }: AdditionalMetricsProps) {
  const { 
    results, 
    deploymentStrategy, 
    timeHorizon, 
    vehicleParameters, 
    stationConfig,
    fuelPrices 
  } = useCalculator();

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
    <div className="additional-metrics">
      {/* Emissions Chart */}
      <Card className="bg-white rounded-lg shadow mb-6 dark:bg-gray-800">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2">
            CO₂ Emissions Reduction
            <MetricInfoTooltip
              title="CO₂ Emissions Reduction"
              description="This chart visualizes the estimated reduction in carbon dioxide emissions over the analysis period. It shows both annual savings and the cumulative impact of your CNG fleet transition."
              calculation="Based on EPA emission factors: gasoline (8.887 kg CO₂/gallon), diesel (10.180 kg CO₂/gallon), CNG (5.511 kg CO₂/GGE). Annual emissions are calculated by multiplying fuel consumption by the appropriate emission factor."
              affectingVariables={[
                "Vehicle count by type",
                "Annual mileage assumptions",
                "Vehicle MPG values",
                "Deployment strategy timing"
              ]}
              simpleDescription="Visual representation of annual and cumulative CO₂ emission reductions from your CNG fleet."
            />
          </h2>
          <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
            Estimated reduction in carbon dioxide emissions over time
          </p>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total CO₂ Emissions Saved</span>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{formatEmissions(results.totalEmissionsSaved)}</div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500 dark:text-gray-400">CO₂ Reduction Percentage</span>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{results.co2Reduction.toFixed(1)}%</div>
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
            <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
              <div className="text-sm text-gray-500 mb-1 dark:text-gray-300">Equivalent Trees Planted</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                ~{Math.round(totalEmissionsTons * 16.5).toLocaleString()} trees
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
              <div className="text-sm text-gray-500 mb-1 dark:text-gray-300">Equivalent Forest Area</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                ~{Math.round(totalEmissionsTons / 7.5).toLocaleString()} acres
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Operational Metrics */}
        <Card className="bg-white rounded-lg shadow dark:bg-gray-800">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold mb-3">
              Operational Metrics
              <MetricInfoTooltip
                title="Operational Metrics"
                description="These metrics provide a detailed breakdown of your operational costs and savings on a per-mile basis. They show the direct financial impact of switching from conventional fuels to CNG for your fleet."
                calculation="Cost per Mile = Fuel Price ÷ Vehicle MPG. Cost Reduction = ((Gasoline Cost - CNG Cost) ÷ Gasoline Cost) × 100%. Annual Fuel Savings = Total fuel cost savings across all vehicles."
                affectingVariables={[
                  "Fuel prices (gasoline, diesel, CNG)",
                  "Vehicle MPG values by type",
                  "Annual mileage assumptions",
                  "Vehicle count by type"
                ]}
                simpleDescription="Key metrics showing how CNG reduces your cost per mile compared to conventional fuels."
              />
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Cost per Mile (Gasoline)</span>
                <span className="text-sm font-medium dark:text-gray-200">${results.costPerMileGasoline.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Cost per Mile (CNG)</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">${results.costPerMileCNG.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Cost Reduction</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">{results.costReduction.toFixed(1)}%</span>
              </div>
              {/* Annual fuel savings - only show when showCashflow is true */}
              {showCashflow && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Annual Fuel Savings</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">${results.annualFuelSavings.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t my-2 dark:border-gray-700"></div>
            </div>
          </CardContent>
        </Card>
        
        {/* Strategy Insights */}
        <Card className="bg-white rounded-lg shadow dark:bg-gray-800">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold mb-3">
              Personalized Strategy Insights
              <MetricInfoTooltip
                title="Personalized Strategy Insights"
                description="This section provides tailored guidance based on your specific fleet configuration, deployment strategy, station setup, and calculated financial outcomes."
                calculation="Analysis is based on a dynamic assessment of your input parameters and resulting projections, offering real-time strategic recommendations specific to your scenario."
                affectingVariables={[
                  "Selected deployment strategy (Immediate, Phased, Aggressive, Deferred, or Manual)",
                  "Fleet composition and vehicle parameters",
                  "Fuel price differentials",
                  "Station configuration and turnkey status",
                  "Projected ROI and payback period",
                  "Total investment and operational costs"
                ]}
                simpleDescription="Custom insights generated specifically for your fleet transition plan."
              />
            </h3>
            
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              {/* Dynamic Strategy Summary */}
              <p>
                <strong>Strategic Overview: </strong> 
                {(() => {
                  // Get total fleet size
                  const totalVehicles = vehicleParameters.lightDutyCount + vehicleParameters.mediumDutyCount + vehicleParameters.heavyDutyCount;
                  
                  // Get fleet composition breakdown
                  const lightPct = Math.round((vehicleParameters.lightDutyCount / totalVehicles) * 100);
                  const mediumPct = Math.round((vehicleParameters.mediumDutyCount / totalVehicles) * 100);
                  const heavyPct = Math.round((vehicleParameters.heavyDutyCount / totalVehicles) * 100);
                  
                  // Identify dominant vehicle type
                  const dominantType = 
                    lightPct >= mediumPct && lightPct >= heavyPct ? "light-duty" :
                    mediumPct >= lightPct && mediumPct >= heavyPct ? "medium-duty" : "heavy-duty";
                    
                  // Calculate cost per vehicle and investment spread
                  const avgVehicleCost = results.totalInvestment / totalVehicles;
                  
                  let insights = `Your fleet of ${totalVehicles} vehicles (${lightPct}% light-duty, ${mediumPct}% medium-duty, ${heavyPct}% heavy-duty) `;
                  
                  // Add strategy-specific insight
                  if (deploymentStrategy === 'immediate') {
                    insights += `will be converted immediately, requiring an upfront investment of ${results.totalInvestment.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})}. `;
                  } else if (deploymentStrategy === 'phased') {
                    insights += `will be converted evenly over ${timeHorizon} years, spreading your investment and operational adjustments. `;
                  } else if (deploymentStrategy === 'aggressive') {
                    insights += `will be front-loaded in the early years to accelerate your savings and emissions reduction. `;
                  } else if (deploymentStrategy === 'deferred') {
                    insights += `will be gradually converted with most vehicles converted in later years, minimizing near-term capital requirements. `;
                  } else { // manual
                    insights += `will follow your custom conversion schedule, tailored to your specific operational constraints. `;
                  }
                  
                  // Add insights based on financial results
                  if (results.paybackPeriod <= timeHorizon / 2) {
                    insights += `With a strong payback period of ${formatPaybackPeriod(results.paybackPeriod)}, your investment is recovered in the first half of the analysis period.`;
                  } else if (results.paybackPeriod <= timeHorizon) {
                    insights += `Your investment is projected to be recovered within the ${timeHorizon}-year analysis period, with a payback period of ${formatPaybackPeriod(results.paybackPeriod)}.`;
                  } else {
                    insights += `Your payback period extends beyond the ${timeHorizon}-year analysis window, indicating this may be a long-term strategic investment rather than a near-term cost saving measure.`;
                  }
                  
                  return insights;
                })()}
              </p>
              
              {/* Dynamic financial insights */}
              <p>
                <strong>Financial Insights: </strong> 
                {(() => {
                  let insights = "";
                  
                  // Add insights based on ROI
                  if (results.roi > 100) {
                    insights += `With a projected ROI of ${Math.round(results.roi)}%, this investment delivers exceptional returns. `;
                  } else if (results.roi > 50) {
                    insights += `The projected ROI of ${Math.round(results.roi)}% indicates a strong financial case for conversion. `;
                  } else if (results.roi > 0) {
                    insights += `Your projected ROI of ${Math.round(results.roi)}% shows a positive but moderate financial return. `;
                  } else {
                    insights += `The projected ROI of ${Math.round(results.roi)}% suggests this project may need adjustment to improve financial viability. `;
                  }
                  
                  // Add insights based on fuel price differential
                  const fuelDiff = ((fuelPrices.gasolinePrice - fuelPrices.cngPrice) / fuelPrices.gasolinePrice) * 100;
                  
                  if (fuelDiff > 40) {
                    insights += `The substantial price advantage of CNG (${Math.round(fuelDiff)}% lower than gasoline) is a key driver of your positive financial outcome. `;
                  } else if (fuelDiff > 20) {
                    insights += `CNG's moderate price advantage (${Math.round(fuelDiff)}% lower than gasoline) contributes to your savings projection. `;
                  } else {
                    insights += `The relatively small price differential between CNG and conventional fuel (${Math.round(fuelDiff)}%) limits the potential savings. `;
                  }
                  
                  // Add station configuration insight
                  if (stationConfig.turnkey) {
                    insights += `Your turnkey station purchase approach impacts cash flow initially but eliminates ongoing tariff payments.`;
                  } else {
                    insights += `Your tariff-based station approach reduces upfront costs but adds recurring charges to your operational expenses.`;
                  }
                  
                  return insights;
                })()}
              </p>
              
              <div className="border-t my-3 dark:border-gray-700"></div>
              
              <div className="flex items-center text-blue-800 dark:text-blue-400 mb-2">
                <CheckCircle className="h-5 w-5 mr-1" />
                <h4 className="font-medium">Key Advantages</h4>
              </div>
              
              <ul className="list-disc list-inside pl-1 text-xs space-y-1">
                {/* Dynamic advantages based on results and parameters */}
                {(() => {
                  const advantages = [];
                  
                  // Add advantage based on emissions
                  if (results.totalEmissionsSaved > 1000000) { // more than 1000 tons
                    advantages.push(`Major environmental impact with ${(results.totalEmissionsSaved/1000).toLocaleString()} metric tons of CO₂ reduced over ${timeHorizon} years`);
                  } else {
                    advantages.push(`Environmental benefit of ${(results.totalEmissionsSaved/1000).toLocaleString()} metric tons of CO₂ reduced over ${timeHorizon} years`);
                  }
                  
                  // Add advantage based on cost per mile reduction
                  // costReduction is already in percentage format in the results
                  advantages.push(`${results.costReduction.toFixed(1)}% reduction in cost per mile compared to conventional fuels`);
                  
                  // Add strategy-specific advantages
                  if (deploymentStrategy === 'immediate') {
                    if (results.paybackPeriod < timeHorizon / 2) {
                      advantages.push(`Maximizes savings with ${results.annualFuelSavings.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})} annual fuel cost reduction`);
                    }
                    if (stationConfig.turnkey) {
                      advantages.push(`Eliminates long-term station financing costs with upfront purchase`);
                    }
                  } else if (deploymentStrategy === 'phased') {
                    advantages.push(`Balanced approach spreading capital requirements of ${(results.totalInvestment / timeHorizon).toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})} annually`);
                    advantages.push(`Allows operational adjustments based on early deployment results`);
                  } else if (deploymentStrategy === 'aggressive') {
                    advantages.push(`Accelerates savings by front-loading vehicle conversion in early years`);
                    if (results.paybackPeriod < timeHorizon) {
                      advantages.push(`Achieves payback within ${Math.ceil(results.paybackPeriod)} years while maximizing remaining time for pure savings`);
                    }
                  } else if (deploymentStrategy === 'deferred') {
                    advantages.push(`Minimizes near-term capital requirements while building experience with CNG vehicles`);
                    if (!stationConfig.turnkey) {
                      advantages.push(`Well-matched with tariff-based station approach to minimize initial investment`);
                    }
                  } else { // manual
                    advantages.push(`Custom deployment schedule aligned with your specific operational needs`);
                  }
                  
                  return advantages.map((advantage, index) => (
                    <li key={index}>{advantage}</li>
                  ));
                })()}
              </ul>
              
              <div className="flex items-center text-amber-800 dark:text-amber-400 mt-3 mb-2">
                <AlertTriangle className="h-5 w-5 mr-1" />
                <h4 className="font-medium">Strategic Considerations</h4>
              </div>
              
              <ul className="list-disc list-inside pl-1 text-xs space-y-1">
                {/* Dynamic considerations based on results and parameters */}
                {(() => {
                  const considerations = [];
                  
                  // Add consideration based on payback period
                  if (results.paybackPeriod > timeHorizon) {
                    considerations.push(`Payback period extends beyond analysis timeframe, requiring long-term commitment (${formatPaybackPeriod(results.paybackPeriod)})`);
                  } else if (results.paybackPeriod > timeHorizon * 0.7) {
                    considerations.push(`Relatively long payback period of ${formatPaybackPeriod(results.paybackPeriod)} leaves limited time for net positive returns`);
                  }
                  
                  // Add consideration based on fuel price volatility
                  considerations.push(`Sensitivity to future CNG and conventional fuel price changes - consider price hedging strategies`);
                  
                  // Add station-specific considerations
                  if (stationConfig.stationType === "fast") {
                    considerations.push(`Fast-fill station requires higher upfront investment but provides operational flexibility`);
                  } else {
                    considerations.push(`Time-fill station requires vehicle downtime for overnight fueling but at lower infrastructure cost`);
                  }
                  
                  // Add strategy-specific considerations
                  if (deploymentStrategy === 'immediate') {
                    considerations.push(`Significant initial capital outlay of ${results.totalInvestment.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})}`);
                    considerations.push(`Consider potential operational challenges with simultaneous conversion of entire fleet`);
                  } else if (deploymentStrategy === 'phased') {
                    considerations.push(`Extended transition period requires managing dual-fuel fleet operations for ${timeHorizon} years`);
                  } else if (deploymentStrategy === 'aggressive') {
                    considerations.push(`Front-loaded investment requires ${(results.totalInvestment * 0.6).toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})} in the first 40% of the timeline`);
                  } else if (deploymentStrategy === 'deferred') {
                    considerations.push(`Delayed conversion reduces near-term savings by approximately ${(results.annualFuelSavings * 0.5).toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})} annually in early years`);
                  } else { // manual
                    considerations.push(`Custom schedule requires detailed planning and implementation tracking to ensure ROI targets are met`);
                  }
                  
                  return considerations.map((consideration, index) => (
                    <li key={index}>{consideration}</li>
                  ));
                })()}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
