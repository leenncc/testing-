import React from 'react';
import { useApp } from '../context/AppContext';
import { Wallet, AlertTriangle, Package, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const MetricCard = ({ title, value, subtext, icon: Icon, color, alert }: any) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      {subtext && (
        <p className={`text-sm mt-1 font-medium flex items-center ${alert ? 'text-red-600' : 'text-green-600'}`}>
          {alert && <AlertTriangle className="w-4 h-4 mr-1" />}
          {subtext}
        </p>
      )}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

export const Dashboard = () => {
  const { batches, alerts } = useApp();

  const totalInput = batches.reduce((acc, b) => acc + b.totalWeight, 0);
  const totalSpoilage = batches.reduce((acc, b) => acc + b.spoiledWeight, 0);
  const spoilageRate = totalInput > 0 ? ((totalSpoilage / totalInput) * 100).toFixed(1) : '0';
  const packedOutput = batches.filter(b => b.status === 'Packed' || b.status === 'Completed').length * 200; // Mock multiply
  const estimatedRev = batches.reduce((acc, b) => acc + (b.estimatedRevenue || 0), 0);

  const chartData = [
    { name: 'Mon', input: 150, output: 120 },
    { name: 'Tue', input: 180, output: 160 },
    { name: 'Wed', input: 120, output: 110 },
    { name: 'Thu', input: 200, output: 180 },
    { name: 'Fri', input: 170, output: 150 },
    { name: 'Sat', input: 140, output: 130 },
  ];

  const pieData = [
    { name: 'Spicy Chips', value: 400 },
    { name: 'Dried Shrooms', value: 300 },
    { name: 'Powder', value: 100 },
  ];

  const COLORS = ['#6d28d9', '#d97706', '#059669'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <div className="text-sm text-gray-500">Last updated: Just now</div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Attention Needed</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {alerts.map(alert => (
                    <li key={alert.id}>{alert.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Today's Input" 
          value={`${totalInput} kg`} 
          subtext="+12% from yesterday"
          icon={Package}
          color="bg-purple-600"
        />
        <MetricCard 
          title="Total Spoilage" 
          value={`${totalSpoilage} kg`} 
          subtext={`${spoilageRate}% Rate`}
          icon={AlertTriangle}
          color="bg-amber-500"
          alert={parseFloat(spoilageRate) > 3.0}
        />
        <MetricCard 
          title="Output Packed" 
          value={`${packedOutput} Tins`} 
          icon={Printer}
          color="bg-blue-600"
        />
        <MetricCard 
          title="Total Stock Value" 
          value={`$${estimatedRev.toFixed(2)}`} 
          icon={Wallet}
          color="bg-emerald-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Input vs Output (Weekly)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="input" fill="#6d28d9" radius={[4, 4, 0, 0]} name="Input (kg)" />
                <Bar dataKey="output" fill="#c4b5fd" radius={[4, 4, 0, 0]} name="Output (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Products Packed</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Batches Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Batch Profitability</h3>
          <button className="text-sm text-purple-600 font-medium hover:text-purple-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Batch ID</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Cost (Mat + Labor)</th>
                <th className="px-6 py-3">Est. Revenue</th>
                <th className="px-6 py-3">Margin</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{batch.id}</td>
                  <td className="px-6 py-4">{batch.recipe || 'N/A'}</td>
                  <td className="px-6 py-4">${batch.cost?.toFixed(2) || '-'}</td>
                  <td className="px-6 py-4">${batch.estimatedRevenue?.toFixed(2) || '-'}</td>
                  <td className={`px-6 py-4 font-bold ${batch.margin && batch.margin > 30 ? 'text-green-600' : 'text-amber-600'}`}>
                    {batch.margin ? `+${batch.margin}%` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      batch.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      batch.status === 'Received' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};