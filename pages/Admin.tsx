import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Share2, Copy, Check, Mail, Lock, Database, UploadCloud, DownloadCloud, Loader2, Save } from 'lucide-react';

export const Admin = () => {
  const { currentUser, changePassword, dbConfig, updateDbConfig, pushToCloud, pullFromCloud } = useApp();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  // Change Password State
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  // Sync State
  const [isSyncing, setIsSyncing] = useState<'push' | 'pull' | null>(null);
  const [syncMsg, setSyncMsg] = useState('');

  const handleCopy = () => {
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

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    changePassword(currentUser.id, newPass);
    setPassMsg('Password updated successfully.');
    setNewPass('');
    setTimeout(() => setPassMsg(''), 3000);
  };

  const handlePush = async () => {
    setIsSyncing('push');
    setSyncMsg('');
    const res = await pushToCloud();
    setSyncMsg(res.message);
    setIsSyncing(null);
  };

  const handlePull = async () => {
    setIsSyncing('pull');
    setSyncMsg('');
    const res = await pullFromCloud();
    setSyncMsg(res.message);
    setIsSyncing(null);
  };

  const roles = [
    { name: currentUser?.name || 'User', role: currentUser?.role || 'Staff', status: 'Active', access: 'Current Session' },
    { name: 'Sarah Smith', role: 'Finance Clerk', status: 'Active', access: 'Dashboard Only' },
    { name: 'Mike Johnson', role: 'Packing Staff', status: 'Offline', access: 'Packing Station' },
    { name: 'Station 1 Tablet', role: 'Processing Worker', status: 'Active', access: 'Receiving & Processing' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-500">Manage database connections, access control, and security.</p>
        </div>
      </div>

      {/* --- DATABASE CONNECTION SECTION --- */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center text-white">
            <Database className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-bold">Central Database Connection</h2>
          </div>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Google Sheets Integration</span>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Link your system to the Central Master Log (Google Sheet). This allows synchronization with <strong>Village A</strong> and <strong>Village B</strong> to receive harvest notifications automatically.
          </p>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">1. Google Apps Script Web App URL</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                placeholder="https://script.google.com/macros/s/..."
                value={dbConfig.scriptUrl}
                onChange={(e) => updateDbConfig({ scriptUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2. Google Spreadsheet ID</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE..."
                value={dbConfig.sheetId}
                onChange={(e) => updateDbConfig({ sheetId: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">Found in your Google Sheet URL: docs.google.com/spreadsheets/d/<strong>[ID]</strong>/edit</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-700">
              <Save className="w-4 h-4 mr-2" /> Save Settings
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-1">Data Synchronization</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Last Sync: {dbConfig.lastSync ? dbConfig.lastSync.toLocaleString() : 'Never'}
                </p>
                {syncMsg && <p className="text-sm font-bold text-green-600 animate-fade-in">{syncMsg}</p>}
             </div>
             
             <div className="flex gap-4 w-full md:w-auto">
               <button 
                  onClick={handlePush}
                  disabled={!!isSyncing}
                  className="flex-1 md:flex-none flex items-center justify-center px-4 py-3 bg-blue-100 text-blue-800 font-bold rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {isSyncing === 'push' ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5 mr-2" />}
                  Push to Cloud
               </button>
               <button 
                  onClick={handlePull}
                  disabled={!!isSyncing}
                  className="flex-1 md:flex-none flex items-center justify-center px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 shadow transition-colors"
                >
                  {isSyncing === 'pull' ? <Loader2 className="w-5 h-5 animate-spin" /> : <DownloadCloud className="w-5 h-5 mr-2" />}
                  Pull from Cloud
               </button>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-purple-600" /> Share Prototype
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Share this link with stakeholders (Finance Clerk, Manager) to access the dashboard.
          </p>
          
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 truncate font-mono">
              {window.location.origin}/dashboard
            </div>
            <button 
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              title="Copy Link"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-purple-600" /> Account Security
          </h2>
          <p className="text-sm text-gray-600 mb-4">Update password for <strong>{currentUser?.id}</strong></p>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <input 
              type="password" 
              placeholder="New Password" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
            />
            {passMsg && <p className="text-green-600 text-sm font-bold">{passMsg}</p>}
            <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-700">
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Invite Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-purple-600" /> Invite Team Member
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Send an email invitation to add new staff to the system.
          </p>

          <form onSubmit={handleInvite} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="colleague@mushroomvillage.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="w-48">
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
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors h-11"
            >
              {inviteSent ? <span className="flex items-center"><Check className="w-4 h-4 mr-2" /> Sent</span> : 'Invite'}
            </button>
          </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-gray-600" /> Active Users
          </h3>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Online</span>
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
