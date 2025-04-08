import { useCalculator } from "@/contexts/CalculatorContext";
import { Card, CardContent } from "@/components/ui/card";
import { formatPaybackPeriod } from "@/lib/utils";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

type FinancialAnalysisProps = {
  showCashflow: boolean;
};

export default function FinancialAnalysis({ showCashflow }: FinancialAnalysisProps) {
  const { results, timeHorizon, stationConfig } = useCalculator();

  // If no results yet, don't render anything
  if (!results) return null;

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Prepare cash flow chart data
  const cashFlowData = Array.from({ length: timeHorizon }, (_, i) => {
    return {
      year: `Year ${i + 1}`,
      cumulativeInvestment: results.cumulativeInvestment[i],
      cumulativeSavings: results.cumulativeSavings[i]
    };
  });

  // Prepare cost vs savings chart data
  const costSavingsData = Array.from({ length: timeHorizon }, (_, i) => {
    const vehicleInvestment = results.vehicleDistribution[i]?.investment || 0;
    
    // For turnkey=yes: show station cost in first year only
    // For turnkey=no: don't show station cost upfront (it's financed)
    const stationCost = (i === 0 && stationConfig.turnkey) ? 
      (results.cumulativeInvestment[0] - vehicleInvestment) : 0;
    
    // For turnkey=no: calculate annual financing rate to display
    const monthlyFinancingRate = stationConfig.businessType === 'aglc' ? 0.015 : 0.016;
    const annualFinancingRate = monthlyFinancingRate * 12;
    
    // Get the calculated station cost (even though we don't use it upfront for turnkey=no)
    const calculatedStationCost = (i === 0 && results.cumulativeInvestment[0] > vehicleInvestment) ? 
      results.cumulativeInvestment[0] - vehicleInvestment : 0;
    
    // For turnkey=no: calculate annual financing cost
    const financingCost = !stationConfig.turnkey && calculatedStationCost > 0 ? 
      calculatedStationCost * annualFinancingRate : 0;
    
    return {
      year: `Year ${i + 1}`,
      vehicleInvestment: vehicleInvestment,
      stationInvestment: stationCost,
      financingCost: financingCost,
      savings: results.yearlySavings[i]
    };
  });

  // Format for Recharts tooltips
  const currencyFormatter = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Cash Flow Chart */}
      {showCashflow && (
        <Card className="bg-white rounded-lg shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cash Flow Analysis</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={currencyFormatter} />
                  <RechartsTooltip formatter={currencyFormatter} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeInvestment" 
                    name="Cumulative Investment"
                    stroke="#ef4444" 
                    fill="rgba(239, 68, 68, 0.1)" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeSavings" 
                    name="Cumulative Savings"
                    stroke="#10b981" 
                    fill="rgba(16, 185, 129, 0.1)" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Payback Period</div>
                <div className="text-lg font-bold text-blue-600">{formatPaybackPeriod(results.paybackPeriod)}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Net Cash Flow ({timeHorizon}yr)</div>
                <div className="text-lg font-bold text-green-600">{formatCurrency(results.netCashFlow)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Cost vs Savings Analysis */}
      <Card className="bg-white rounded-lg shadow">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Cost vs. Savings</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costSavingsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={currencyFormatter} />
                <RechartsTooltip formatter={currencyFormatter} />
                <Legend />
                <Bar 
                  dataKey="vehicleInvestment" 
                  name="Vehicle Investment"
                  fill="rgba(239, 68, 68, 0.7)" 
                  stackId="investment"
                />
                <Bar 
                  dataKey="stationInvestment" 
                  name="Station Investment"
                  fill="rgba(59, 130, 246, 0.7)" 
                  stackId="investment"
                />
                {!stationConfig.turnkey && (
                  <Bar 
                    dataKey="financingCost" 
                    name="Financing Cost"
                    fill="rgba(234, 88, 12, 0.7)" 
                    stackId="expenses"
                  />
                )}
                <Bar 
                  dataKey="savings" 
                  name={stationConfig.turnkey ? "Savings" : "Net Savings"}
                  fill="rgba(16, 185, 129, 0.7)" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">{timeHorizon}-Year ROI</div>
              <div className="text-lg font-bold text-green-600">{Math.round(results.roi)}%</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Annual Rate of Return</div>
              <div className="text-lg font-bold text-blue-600">{results.annualRateOfReturn.toFixed(1)}%</div>
            </div>
            
            {!stationConfig.turnkey && (
              <div className="col-span-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <div className="text-sm font-medium text-amber-800 mb-1">
                  Financing Information (Non-TurnKey Option)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-amber-700">Monthly Rate:</span>
                    <span className="text-sm font-semibold ml-1">
                      {(stationConfig.businessType === 'aglc' ? 1.5 : 1.6).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-amber-700">Annual Cost:</span>
                    <span className="text-sm font-semibold ml-1">
                      {formatCurrency(costSavingsData[0].financingCost)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-amber-600 mt-1">
                  Note: Station costs are not paid upfront but financed at monthly percentage rates.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
