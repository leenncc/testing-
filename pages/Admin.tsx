import React, { useState } from 'react';
import { Users, Share2, Copy, Check, Mail, Smartphone, Shield, QrCode } from 'lucide-react';

export const Admin = () => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const handleCopy = () => {
    // Simulates copying the URL
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setEmail('');
    }, 3000);
  };

  const roles = [
    { name: 'John Doe', role: 'Processing Manager', status: 'Active', access: 'Full Admin' },
    { name: 'Sarah Smith', role: 'Finance Clerk', status: 'Active', access: 'Dashboard Only' },
    { name: 'Mike Johnson', role: 'Packing Staff', status: 'Offline', access: 'Packing Station' },
    { name: 'Station 1 Tablet', role: 'Processing Worker', status: 'Active', access: 'Receiving & Processing' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-500">Manage access and share the prototype with your team.</p>
        </div>
      </div>

      {/* Share Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-purple-600" /> Share Prototype
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Share this link with stakeholders (Finance Clerk, Manager) to access the dashboard.
          </p>
          
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 truncate font-mono">
              https://mushroom-village-proto.app/v1/dashboard
            </div>
            <button 
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              title="Copy Link"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
             <div className="text-center">
                <QrCode className="w-16 h-16 text-gray-800 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-500">Scan for Mobile View</p>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-purple-600" /> Invite Team Member
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Send an email invitation to add new staff to the system.
          </p>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="colleague@mushroomvillage.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                <option>Processing Worker</option>
                <option>Packing Staff</option>
                <option>Finance Clerk</option>
                <option>Manager</option>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              {inviteSent ? <span className="flex items-center"><Check className="w-4 h-4 mr-2" /> Invite Sent</span> : 'Send Invitation'}
            </button>
          </form>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-gray-600" /> Active Users
          </h3>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">3 Online</span>
        </div>
        <div className="divide-y divide-gray-100">
          {roles.map((user, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                  {user.access}
                </span>
                <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};