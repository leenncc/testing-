import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, CheckCircle, ShoppingCart, Mail } from 'lucide-react';

export const Inventory = () => {
  const { inventory, addAlert } = useApp();

  const handleOrder = (itemName: string) => {
    alert(`Email sent to supplier for ${itemName}. Manager CC'd.`);
    addAlert(`Order placed for ${itemName}. Waiting for approval.`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-gray-900">Live Inventory Tracking</h2>
         <button className="text-purple-600 font-medium hover:underline">Download Report</button>
      </div>

      <div className="grid gap-4">
        {inventory.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${
                item.status === 'Critical' ? 'bg-red-100' : 
                item.status === 'Low Stock' ? 'bg-amber-100' : 'bg-green-100'
              }`}>
                {item.status === 'OK' ? (
                  <CheckCircle className={`w-6 h-6 text-green-600`} />
                ) : (
                  <AlertTriangle className={`w-6 h-6 ${item.status === 'Critical' ? 'text-red-600' : 'text-amber-600'}`} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">Threshold: {item.threshold} {item.unit}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {item.quantity} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block ${
                 item.status === 'Critical' ? 'bg-red-100 text-red-800' : 
                 item.status === 'Low Stock' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
              }`}>
                {item.status.toUpperCase()}
              </div>
            </div>

            {item.status !== 'OK' && (
              <button 
                onClick={() => handleOrder(item.name)}
                className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center shadow-sm"
              >
                <Mail className="w-4 h-4 mr-2" /> Approve Order
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Recent Activity Log Placeholder */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-800 mb-4">System Activity Log</h3>
        <ul className="space-y-3 text-sm text-gray-600">
           <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> 10:45 AM - Batch #B-2024-1001 Packed. Inventory deducted.</li>
           <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> 10:30 AM - Washing started for Batch #B-2024-1001.</li>
           <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span> 09:15 AM - Automated Alert: Packaging Tins below threshold.</li>
        </ul>
      </div>
    </div>
  );
};