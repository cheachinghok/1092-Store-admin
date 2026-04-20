import React, { useState, useEffect } from 'react';
import { get } from '../lib/apiClient';
import { toast } from 'sonner';

const ReportDashboard = () => {
  const [timeFilter, setTimeFilter] = useState('month');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await get('/api/analytics/profit', { period: timeFilter });
        setReportData(data.data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [timeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  const { summary, dailyProfit = [], topProducts = [] } = reportData;
  const revenue = summary?.totalRevenue || 0;
  const profit = summary?.totalProfit || 0;
  const cost = summary?.totalCost || 0;
  const orderCount = summary?.orderCount || 0;
  const profitMargin = parseFloat(summary?.profitMargin || '0');
  const avgOrderValue = summary?.averageOrderValue || 0;
  const expenseRatio = revenue > 0 ? ((cost / revenue) * 100).toFixed(1) : '0.0';

  const chartRevenues = dailyProfit.map((d) => d.revenue || 0);
  const chartLabels = dailyProfit.map((d) => d._id || '');
  const maxRevenue = Math.max(...chartRevenues, 1);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Report</h1>
            <p className="text-gray-600 mt-2">Track your business performance</p>
          </div>

          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              {['day', 'week', 'month', 'year'].map((filter) => (
                <button
                  key={filter}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    timeFilter === filter
                      ? 'bg-blue-500 text-white shadow'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setTimeFilter(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={revenue}
          format="currency"
          icon={<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><span className="text-2xl">💰</span></div>}
          color="green"
        />
        <MetricCard
          title="Net Profit"
          value={profit}
          format="currency"
          icon={<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><span className="text-2xl">📈</span></div>}
          color="blue"
        />
        <MetricCard
          title="Total Cost"
          value={cost}
          format="currency"
          icon={<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><span className="text-2xl">📊</span></div>}
          color="purple"
        />
        <MetricCard
          title="Orders"
          value={orderCount}
          format="number"
          icon={<div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><span className="text-2xl">💳</span></div>}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <span className="text-sm text-gray-500">Last {timeFilter}</span>
          </div>
          {chartRevenues.length > 0 ? (
            <div className="flex items-end justify-between h-48 space-x-1">
              {chartRevenues.map((value, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-gray-500 mb-1">${(value / 1000).toFixed(1)}k</div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${(value / maxRevenue) * 80}%`, minHeight: '4px' }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-1 truncate max-w-full">
                    {chartLabels[index]?.slice(5) || ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No data for this period
            </div>
          )}
        </div>

        {/* Profit & Loss */}
        <ProfitLossChart profit={profit} cost={cost} revenue={revenue} />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Profit Margin"
          value={profitMargin.toFixed(1)}
          suffix="%"
          description="Net profit as percentage of revenue"
          prefix={undefined}
        />
        <StatCard
          title="Avg. Transaction"
          value={avgOrderValue.toFixed(2)}
          prefix="$"
          description="Average revenue per transaction"
          suffix={undefined}
        />
        <StatCard
          title="Expense Ratio"
          value={expenseRatio}
          suffix="%"
          description="Costs as percentage of revenue"
          prefix={undefined}
        />
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.productName}</td>
                    <td className="px-4 py-3 text-gray-700">{p.totalSold}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      ${(p.totalRevenue || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-blue-600 font-medium">
                      ${(p.totalProfit || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.profitMargin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDashboard;

const MetricCard = ({ title, value, format, icon, color }) => {
  const colorClasses = {
    green: { trendBg: 'bg-green-100', text: 'text-green-700' },
    blue: { trendBg: 'bg-blue-100', text: 'text-blue-700' },
    purple: { trendBg: 'bg-purple-100', text: 'text-purple-700' },
    orange: { trendBg: 'bg-orange-100', text: 'text-orange-700' },
  };

  const formatValue = (val, fmt) => {
    if (fmt === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(val);
    }
    return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{formatValue(value, format)}</p>
      </div>
    </div>
  );
};

const ProfitLossChart = ({ profit, cost, revenue }) => {
  const items = [
    { label: 'Revenue', value: revenue, color: 'bg-green-500', type: 'revenue' },
    { label: 'Cost', value: cost, color: 'bg-red-500', type: 'cost' },
    { label: 'Net Profit', value: profit, color: 'bg-blue-500', type: 'profit' },
  ];
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Profit & Loss</h3>
        <span className="text-sm text-gray-500">Breakdown</span>
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span
                className={`font-semibold ${
                  item.type === 'profit'
                    ? 'text-blue-600'
                    : item.type === 'cost'
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {item.type === 'cost' ? '-' : item.type === 'profit' ? '+' : ''}$
                {(item.value / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${item.color} transition-all`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, prefix, suffix, description }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
    <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mb-2">
      {prefix && <span>{prefix}</span>}
      {value}
      {suffix && <span>{suffix}</span>}
    </p>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);
