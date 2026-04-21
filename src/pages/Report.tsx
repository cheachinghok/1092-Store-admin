import React, { useState, useEffect, useMemo } from 'react';
import { get } from '../lib/apiClient';
import { toast } from 'sonner';

const ReportDashboard = () => {
  const [activeTab, setActiveTab] = useState<'financial' | 'userOrders'>('financial');
  const [timeFilter, setTimeFilter] = useState('month');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // User orders report state
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

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

  useEffect(() => {
    if (activeTab !== 'userOrders' || allOrders.length > 0) return;
    const fetchAllOrders = async () => {
      try {
        setOrdersLoading(true);
        const data = await get('/api/orders');
        setAllOrders(data.data || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load orders');
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchAllOrders();
  }, [activeTab]);

  const userOrdersData = useMemo(() => {
    const map: Record<string, any> = {};
    allOrders.forEach((order) => {
      const uid = order.user?._id || order.user?.email || 'unknown';
      if (!map[uid]) {
        map[uid] = {
          userId: uid,
          name: order.user?.name || '—',
          email: order.user?.email || '—',
          orders: [],
          totalSpent: 0,
          statusCounts: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
        };
      }
      map[uid].orders.push(order);
      map[uid].totalSpent += order.totalAmount || 0;
      const s = order.orderStatus as string;
      if (s in map[uid].statusCounts) map[uid].statusCounts[s]++;
    });
    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [allOrders]);

  const filteredUserOrders = useMemo(() => {
    return userOrdersData
      .filter((u) => {
        const q = userSearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      })
      .filter((u) => statusFilter === 'all' || u.orders.some((o) => o.orderStatus === statusFilter));
  }, [userOrdersData, userSearch, statusFilter]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && activeTab === 'financial') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'financial' && !reportData) return null;

  const { summary, dailyProfit = [], topProducts = [] } = reportData || {};
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Track business performance and user orders</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'financial'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Financial Report
        </button>
        <button
          onClick={() => setActiveTab('userOrders')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'userOrders'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          User Orders Report
        </button>
      </div>

      {/* ── USER ORDERS REPORT ── */}
      {activeTab === 'userOrders' && (
        <div>
          {ordersLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading user orders...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{userOrdersData.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{allOrders.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(allOrders.reduce((s, o) => s + (o.totalAmount || 0), 0))}
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* User orders table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Users ({filteredUserOrders.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Breakdown</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUserOrders.map((u) => {
                        const avgOrder = u.orders.length > 0 ? u.totalSpent / u.orders.length : 0;
                        const lastOrder = u.orders.sort(
                          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        )[0];
                        const isExpanded = expandedUser === u.userId;
                        return (
                          <React.Fragment key={u.userId}>
                            <tr
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => setExpandedUser(isExpanded ? null : u.userId)}
                            >
                              <td className="px-6 py-4 text-gray-400">
                                <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{u.name}</div>
                                <div className="text-xs text-gray-500">{u.email}</div>
                              </td>
                              <td className="px-6 py-4 font-medium text-gray-900">{u.orders.length}</td>
                              <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(u.totalSpent)}</td>
                              <td className="px-6 py-4 text-gray-700">{formatCurrency(avgOrder)}</td>
                              <td className="px-6 py-4 text-gray-700">
                                {lastOrder?.createdAt ? formatDate(lastOrder.createdAt) : '—'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(u.statusCounts)
                                    .filter(([, count]) => (count as number) > 0)
                                    .map(([status, count]) => (
                                      <span key={status} className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                        {status} ({count as number})
                                      </span>
                                    ))}
                                </div>
                              </td>
                            </tr>
                            {/* Expanded order rows */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={7} className="bg-gray-50 px-6 py-4">
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Order History</p>
                                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                    <thead className="bg-white">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Order #</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Items</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Payment</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                      {u.orders
                                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                        .map((order) => (
                                          <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 font-mono text-xs text-gray-700">
                                              {order.orderNumber || order._id?.slice(-8)}
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">
                                              {order.createdAt ? formatDate(order.createdAt) : '—'}
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">{order.items?.length || 0} items</td>
                                            <td className="px-4 py-2 text-gray-600 capitalize">
                                              {order.paymentMethod?.replace('_', ' ') || '—'}
                                            </td>
                                            <td className="px-4 py-2">
                                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 font-semibold text-gray-900">
                                              {formatCurrency(order.totalAmount || 0)}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredUserOrders.length === 0 && (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    No users match your search criteria.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── FINANCIAL REPORT ── */}
      {activeTab === 'financial' && (
      <div>
      {/* Header controls */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Financial Report</h2>
            <p className="text-gray-600 mt-1">Track your business performance</p>
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
