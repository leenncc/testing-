import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { Lock, User as UserIcon, Mail, ArrowRight, ShieldCheck, AlertCircle, X, ExternalLink, Loader2 } from 'lucide-react';
// @ts-ignore
import emailjs from '@emailjs/browser';

// ==================================================================================
// 📧 REAL EMAIL CONFIGURATION (EmailJS)
// To make real emails work:
// 1. Go to https://www.emailjs.com/ -> Sign Up (Free)
// 2. Add "Gmail" as a Service.
// 3. Create an Email Template with variables: {{to_name}}, {{temp_password}}, {{to_email}}
// 4. Paste your keys below.
// ==================================================================================
const EMAILJS_SERVICE_ID = ""; // e.g. "service_x93sk2"
const EMAILJS_TEMPLATE_ID = ""; // e.g. "template_8d7s3d"
const EMAILJS_PUBLIC_KEY = ""; // e.g. "user_9S3kD9s"
// ==================================================================================

export const Login = () => {
  const { users, login, register, resetPasswordRequest, changePassword } = useApp();
  
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'change'>('login');
  
  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regId, setRegId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRole, setRegRole] = useState('Processing Worker');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Simulation State
  const [showSimulatedInbox, setShowSimulatedInbox] = useState(false);
  const [recoveredPassword, setRecoveredPassword] = useState('');

  // Change Password State
  const [cpId, setCpId] = useState('');
  const [cpOldPass, setCpOldPass] = useState('');
  const [cpNewPass, setCpNewPass] = useState('');
  const [cpMsg, setCpMsg] = useState({ type: '', text: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(loginId, loginPass);
    if (!result.success) {
      setLoginError(result.message || 'Login failed');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.endsWith('@gmail.com')) {
      setRegError('Only @gmail.com addresses are allowed for recovery.');
      return;
    }
    
    const newUser: User = {
      id: regId,
      name: regName,
      email: regEmail,
      password: regPass,
      role: regRole as any
    };

    const result = register(newUser);
    if (result.success) {
      setRegSuccess(true);
      setRegError('');
      setTimeout(() => {
        setRegSuccess(false);
        setView('login');
        setLoginId(regId);
      }, 2000);
    } else {
      setRegError(result.message || 'Registration failed');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingEmail(true);
    setForgotMsg({ type: '', text: '' });

    const result = resetPasswordRequest(forgotEmail);
    
    if (result.success && result.debugToken) {
      // Logic: If user provided keys, try EmailJS. If not, use Simulation.
      const hasApiKeys = EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY;

      if (hasApiKeys) {
        try {
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
              to_name: users.find(u => u.email === forgotEmail)?.name || 'User',
              to_email: forgotEmail,
              temp_password: result.debugToken, // NOTE: This is now the ORIGINAL password
              reply_to: 'admin@mushprocess.com'
            },
            EMAILJS_PUBLIC_KEY
          );
          setForgotMsg({ type: 'success', text: '✅ Real email sent successfully to ' + forgotEmail });
        } catch (error: any) {
          console.error("EmailJS Error:", error);
          setForgotMsg({ type: 'error', text: 'Failed to send real email. Check console/keys.' });
          // Fallback to simulation on error so user isn't stuck
          setRecoveredPassword(result.debugToken);
          setShowSimulatedInbox(true);
        }
      } else {
        // No keys provided -> Use Simulation
        await new Promise(r => setTimeout(r, 1500)); // Fake network delay
        setRecoveredPassword(result.debugToken);
        setShowSimulatedInbox(true);
        setForgotMsg({ type: 'success', text: 'Simulation Mode: Email intercepted.' });
      }
    } else {
      setForgotMsg({ type: 'error', text: result.message || 'Error' });
    }
    setIsSendingEmail(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const check = login(cpId, cpOldPass);
    if (check.success) {
      changePassword(cpId, cpNewPass);
      setCpMsg({ type: 'success', text: 'Password changed successfully! Please login.' });
      setTimeout(() => {
        setView('login');
        setCpMsg({ type: '', text: '' });
        setCpId('');
        setCpOldPass('');
        setCpNewPass('');
      }, 2000);
    } else {
      setCpMsg({ type: 'error', text: 'Invalid Old ID or Password.' });
    }
  };

  const handleUseRecoveredPassword = () => {
    const userId = users.find(u => u.email === forgotEmail)?.id || '';
    setLoginId(userId);
    setLoginPass(recoveredPassword);
    setShowSimulatedInbox(false);
    setView('login');
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4 relative">
      
      {/* --- SIMULATED GMAIL INBOX MODAL (FALLBACK) --- */}
      {showSimulatedInbox && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Fake Browser Header */}
              <div className="bg-gray-100 border-b p-3 flex items-center space-x-2">
                 <div className="flex space-x-1">
                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                   <div className="w-3 h-3 rounded-full bg-green-400"></div>
                 </div>
                 <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500 flex items-center justify-center shadow-sm">
                   <Lock className="w-3 h-3 mr-1" /> https://mail.google.com/mail/u/0/#inbox
                 </div>
              </div>

              {/* Fake Gmail Header */}
              <div className="p-4 border-b flex items-center justify-between bg-white">
                 <div className="flex items-center text-red-600 font-medium text-lg">
                   <Mail className="w-6 h-6 mr-2" /> Gmail <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-2 uppercase">Simulation Mode</span>
                 </div>
                 <button onClick={() => setShowSimulatedInbox(false)} className="text-gray-400 hover:text-gray-600">
                   <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Email Content */}
              <div className="p-6 overflow-y-auto bg-white flex-1">
                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-sm text-yellow-800 flex items-start">
                   <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                   <div>
                     <p className="font-bold">Why am I seeing this?</p>
                     <p>
                       The Admin has not configured the <strong>EmailJS API Keys</strong> in the code. 
                       The system has fallen back to "Simulation Mode" so you can still test the flow.
                     </p>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Password Recovery</h3>
                      <span className="text-xs text-gray-500">Just now</span>
                   </div>
                   
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">M</div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">MushProcess Security <span className="font-normal text-gray-500">&lt;noreply@mushprocess.com&gt;</span></p>
                        <p className="text-xs text-gray-500">to me</p>
                      </div>
                   </div>

                   <div className="py-4 text-gray-800 text-sm leading-relaxed space-y-4">
                     <p>Hello,</p>
                     <p>We received a request to recover your account password.</p>
                     <p>Your current password is:</p>
                     
                     <div className="bg-gray-100 p-4 rounded text-center border-2 border-dashed border-gray-300">
                       <span className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Current Password</span>
                       <span className="text-3xl font-mono font-bold text-blue-600 select-all cursor-text">{recoveredPassword}</span>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Footer Action */}
              <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                <button 
                  onClick={() => setShowSimulatedInbox(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg"
                >
                  Close
                </button>
                <button 
                  onClick={handleUseRecoveredPassword}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow flex items-center"
                >
                  Auto-Fill Login <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
           </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col z-10">
        
        {/* Header Graphic */}
        <div className="h-32 bg-purple-600 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="text-center z-10">
            <div className="w-12 h-12 bg-white rounded-xl mx-auto flex items-center justify-center text-purple-600 mb-2 shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-white font-bold text-xl tracking-wide">MushProcess Village</h1>
          </div>
        </div>

        {/* --- VIEW: LOGIN --- */}
        {view === 'login' && (
          <div className="p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>
            {loginError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> {loginError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="e.g. Village C"
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="••••••"
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => setView('forgot')} className="text-purple-600 hover:text-purple-800 font-medium">Forgot Password?</button>
                <button type="button" onClick={() => setView('change')} className="text-gray-500 hover:text-gray-700">Change Password</button>
              </div>

              <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-lg shadow transition-colors flex items-center justify-center">
                Sign In <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">Don't have an account?</p>
              <button onClick={() => setView('register')} className="mt-2 text-purple-700 font-bold hover:underline">Create New User</button>
            </div>
          </div>
        )}

        {/* --- VIEW: REGISTER --- */}
        {view === 'register' && (
          <div className="p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Create Account</h2>
            <p className="text-center text-gray-500 text-sm mb-6">Join the processing team</p>

            {regError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">{regError}</div>}
            {regSuccess && <div className="bg-green-50 text-green-600 text-sm p-3 rounded mb-4 font-bold">Account Created! Redirecting...</div>}

            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="User ID" required className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 outline-none" value={regId} onChange={e => setRegId(e.target.value)} />
                <input type="text" placeholder="Full Name" required className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 outline-none" value={regName} onChange={e => setRegName(e.target.value)} />
              </div>
              <input type="email" placeholder="Gmail Address (Required)" required className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 outline-none" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              <input type="password" placeholder="Password" required className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 outline-none" value={regPass} onChange={e => setRegPass(e.target.value)} />
              <select className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 outline-none" value={regRole} onChange={e => setRegRole(e.target.value)}>
                <option value="Processing Worker">Processing Worker</option>
                <option value="Packing Staff">Packing Staff</option>
                <option value="Finance Clerk">Finance Clerk</option>
                <option value="Manager">Manager</option>
              </select>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-4 shadow">Register</button>
            </form>
            <button onClick={() => setView('login')} className="w-full text-center text-gray-500 mt-4 text-sm hover:text-gray-800">Back to Login</button>
          </div>
        )}

        {/* --- VIEW: FORGOT PASSWORD --- */}
        {view === 'forgot' && (
          <div className="p-8 animate-fade-in text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your registered Gmail address to recover your account.</p>

            {forgotMsg.text && (
              <div className={`text-sm p-3 rounded mb-4 ${forgotMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {forgotMsg.text}
              </div>
            )}

            <form onSubmit={handleForgot}>
              <input 
                type="email" 
                placeholder="Enter Gmail..." 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={isSendingEmail}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow disabled:opacity-50 flex items-center justify-center"
              >
                {isSendingEmail ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
            <button onClick={() => setView('login')} className="mt-6 text-gray-500 text-sm hover:text-gray-800">Back to Login</button>
          </div>
        )}

        {/* --- VIEW: CHANGE PASSWORD --- */}
        {view === 'change' && (
          <div className="p-8 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Change Password</h2>
            
            {cpMsg.text && (
              <div className={`text-sm p-3 rounded mb-4 ${cpMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {cpMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <input 
                type="text" 
                placeholder="User ID" 
                required 
                className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 outline-none"
                value={cpId}
                onChange={e => setCpId(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Old Password" 
                required 
                className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 outline-none"
                value={cpOldPass}
                onChange={e => setCpOldPass(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="New Password" 
                required 
                className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500 outline-none"
                value={cpNewPass}
                onChange={e => setCpNewPass(e.target.value)}
              />
              <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-lg shadow mt-2">Update Password</button>
            </form>
            <button onClick={() => setView('login')} className="w-full text-center mt-6 text-gray-500 text-sm hover:text-gray-800">Back to Login</button>
          </div>
        )}

      </div>
    </div>
  );
};