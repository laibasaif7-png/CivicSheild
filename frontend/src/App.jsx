import { useState, useEffect } from 'react'
import api from './api' 

import { motion, AnimatePresence } from 'framer-motion'
import MapComponent from './components/MapComponent';
import Login from './components/Login';
import Register from './components/Register';

// --- FontAwesome Imports ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faThLarge, 
  faFileAlt, 
  faMapMarkedAlt, 
  faBell, 
  faHistory, 
  faUsers, 
  faUserCircle, 
  faCog,
  faExpand,
  faLock
} from '@fortawesome/free-solid-svg-icons'

// --- ✨ UI HELPER: PREMIUM STAT CARD ---
const StatCard = ({ title, value, trend, icon, colorClass, gradient }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -10, transition: { duration: 0.2 } }}
    className={`relative overflow-hidden bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border-2 border-blue-500/20 flex flex-col justify-between cursor-pointer group`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-bl-full transition-all group-hover:opacity-10`} />
    <div className="flex justify-between items-start mb-6 z-10">
      <div className={`p-4 rounded-2xl ${colorClass} text-2xl shadow-inner`}>{icon}</div>
      <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${trend.includes('+') || trend === 'Live' || trend === 'Active' || trend === 'Fixed' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
        {trend.includes('+') ? '↑' : ''} {trend}
      </div>
    </div>
    <div className="z-10">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{title}</p>
      <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{value.toLocaleString()}</p>
    </div>
  </motion.div>
);

function App() {
  const [formData, setFormData] = useState({ title: '', description: '', location: '', category: 'Safety', lat: null, lng: null })
  const [file, setFile] = useState(null)
  const [allReports, setAllReports] = useState([])
  const [status, setStatus] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  const [authView, setAuthView] = useState('login'); 
  const [user, setUser] = useState(null);
  
  // --- Admin Login Credentials State ---
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const fetchReports = async () => {
    try {
      // Puraana: await axios.get('http://localhost:5000/api/reports/all')
      // Naya:
      const response = await api.get('/api/reports/all')
      setAllReports(response.data)
    } catch (err) { 
      console.error(err) 
    }
  }

  useEffect(() => {
    // Load reports when the page opens and keep login state intact.
    fetchReports();
  }, []); 

  // --- Admin Login Logic ---
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setStatus("⏳ Verifying...");
      const res = await api.post('/api/admin/login', loginData);
      localStorage.setItem('adminToken', res.data.token);
      setIsAdmin(true);
      setShowLoginModal(false);
      setStatus("✅ Welcome, Admin");
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setStatus("❌ Invalid Credentials");
    }
  };

  const handleLogout = async () => {
    try {
      setStatus("⏳ Logging out...");
      await api.post('/api/auth/logout'); 
    } catch (err) {
      console.error("Backend logout error or session already cleared:", err);
    }

    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear(); 
    sessionStorage.clear();

    setIsAdmin(false);
    if (typeof setUser === 'function') {
      setUser(null);
    }

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setStatus("👋 Logged Out Completely");
    setActiveTab('Dashboard');

    setTimeout(() => {
      setStatus('');
      window.location.reload();
    }, 1000);
  };  

  // 1️⃣ RESOLVE FUNCTION
  const handleResolve = async (id) => {
    try {
      await api.put(`/api/reports/${id}/resolve`);
      fetchReports(); 
      alert("✅ Report Resolved!");
    } catch (err) {
      console.error(err);
      alert("❌ Could not resolve report");
    }
  };

  // 2️⃣ DELETE FUNCTION
  const handleDelete = async (id) => {
    if (!window.confirm("Kya aap waqai yeh report delete karna chahte hain?")) return;
    try {
      await api.delete(`/api/reports/${id}`);
      setAllReports(prev => prev.filter(report => report._id !== id)); 
      alert("🗑️ Report Deleted!");
    } catch (err) {
      console.error(err);
      alert("❌ Could not delete report");
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setStatus("📍 Accessing GPS...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({ ...formData, lat: pos.coords.latitude, lng: pos.coords.longitude });
          setStatus("✅ GPS Captured!");
          setTimeout(() => setStatus(''), 2000);
        },
        () => { setStatus("❌ GPS Denied"); }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setStatus("❌ Access Denied: Please Sign Up / Login first to send a report!");
      setTimeout(() => {
        setActiveTab('Log in/Sign up'); 
      }, 2500);
      return; 
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('image', file);
    
    try {
      setStatus("⏳ Processing...");
      await api.post('/api/reports/add', data);
      setStatus("✅ Success!");
      setFormData({ title: '', description: '', location: '', category: 'Safety', lat: null, lng: null });
      setFile(null); 
      fetchReports();
      setTimeout(() => setStatus(''), 3000);
    } catch (err) { 
      console.error("Report submit failed:", err);
      const serverMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setStatus(`❌ Failed: ${serverMessage}`);
    }
  };

  const menuItems = [
    { id: 'Dashboard', icon: <FontAwesomeIcon icon={faThLarge} /> },
    { id: 'Reports', icon: <FontAwesomeIcon icon={faFileAlt} /> },
    { id: 'Map', icon: <FontAwesomeIcon icon={faMapMarkedAlt} /> },
    { id: 'Alerts', icon: <FontAwesomeIcon icon={faBell} />, badge: 3 },
    { id: 'My Activity', icon: <FontAwesomeIcon icon={faHistory} /> },
    { id: 'Community', icon: <FontAwesomeIcon icon={faUsers} /> },
    { id: 'Profile', icon: <FontAwesomeIcon icon={faUserCircle} /> },
    { id: 'Settings', icon: <FontAwesomeIcon icon={faCog} /> },
    { id: 'Log in/Sign up', icon: <FontAwesomeIcon icon={faUserCircle} />  },
  ];

  return (
    <div className="flex min-h-screen bg-[#060912] font-sans text-slate-900 overflow-hidden relative">
      
      {/* --- 🌌 ANIMATED AURORA BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[140px] rounded-full"
        />
      </div>

      {/* --- 🔐 ADMIN LOGIN MODAL --- */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl p-10 rounded-[3rem] w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-2 border-blue-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl -rotate-12"><FontAwesomeIcon icon={faLock} /></div>
              <h3 className="text-3xl font-black mb-2 text-slate-800 tracking-tighter">Admin <span className="text-blue-600">Portal</span></h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Secure Authorization Required</p>
              
              <form onSubmit={handleAdminLogin} className="space-y-4 relative z-10">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-4 text-slate-500">Email Address</label>
                  <input type="email" required className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all font-bold text-slate-700" placeholder="admin@civicshield.com" onChange={(e) => setLoginData({...loginData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-4 text-slate-500">Access Key</label>
                  <input type="password" required className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all font-bold text-slate-700" placeholder="••••••••" onChange={(e) => setLoginData({...loginData, password: e.target.value})} />
                </div>
                <div className="pt-4 flex flex-col gap-3">
                  <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all uppercase">Authenticate</button>
                  <button type="button" onClick={() => setShowLoginModal(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">Dismiss</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #060912; }
        .premium-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(12px) saturate(180%) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; }
        .active-neon-glow { background: rgba(59, 130, 246, 0.1) !important; box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.05), 0 0 15px rgba(59, 130, 246, 0.1) !important; border: 1px solid rgba(59, 130, 246, 0.3) !important; }
        .sidebar-bg { background: linear-gradient(180deg, #060912 0%, #0B1120 100%) !important; }
        .main-glass { background: rgba(248, 250, 252, 0.9) !important; backdrop-filter: blur(25px); border-top-left-radius: 0; border-bottom-left-radius: 0; }
        .main-glass-desktop { border-top-left-radius: 3rem !important; border-bottom-left-radius: 3rem !important; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>

      {/* --- SIDEBAR --- */}
      <aside 
        style={{ fontFamily: '"Times New Roman", Times, serif' }} 
        className="w-72 sidebar-bg text-white hidden lg:flex flex-col sticky top-0 h-screen p-6 border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-20"
      >
        <div className="flex items-center gap-4 mt-10 mb-12 px-2">
          <div className="w-14 h-14 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl group-hover:bg-blue-500/40 transition-all"></div>
            <img src="/civiclogo.jpeg" alt="Logo" className="w-full h-full object-contain relative z-10" style={{ mixBlendMode: 'screen', filter: 'contrast(1.2) brightness(1.2)', transform: 'scale(1.4)' }} />
          </div>
          <div className="-mt-1 cursor-pointer" onClick={() => setShowLoginModal(true)}>
            <h1 className="text-3xl font-black tracking-tighter flex items-center leading-none">Civic <span className="text-blue-500 ml-1">Shield</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 hover:text-blue-400 transition-colors">Reporting Center</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scroll">
          {menuItems.map((item) => (
            <div key={item.id} onClick={() => setActiveTab(item.id)} className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 group ${activeTab === item.id ? 'active-neon-glow' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
              {activeTab === item.id && <motion.div layoutId="activeGlowLine" className="absolute left-0 w-1 h-6 bg-blue-500 rounded-full shadow-[0_0_12px_#3b82f6]"></motion.div>}
              <span className={`text-xl transition-all ${activeTab === item.id ? 'text-blue-400' : 'opacity-40 group-hover:opacity-100'}`}>{item.icon}</span>
              <span className={`text-[14px] font-bold tracking-tight ${activeTab === item.id ? 'text-white' : ''}`}>{item.id}</span>
              {item.badge && <span className={`ml-auto text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg ${activeTab === item.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-6" style={{ perspective: "1000px" }}>
          <motion.div whileHover={{ y: -5, rotateX: 5 }} className="premium-glass p-6 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 text-center">Community Safety Score</p>
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                  <motion.circle initial={{ strokeDashoffset: 251.2 }} animate={{ strokeDashoffset: 251.2 - (251.2 * 0.78) }} cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white leading-none">78</span>
                  <span className="text-[9px] font-bold text-emerald-500 uppercase mt-1">Good</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto h-screen p-8 lg:p-12 custom-scroll z-10 main-glass shadow-[-20px_0_50px_rgba(0,0,0,0.2)] main-glass-desktop pb-24 lg:pb-12">

        <header className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
          <div>
            <p className="text-slate-400 font-bold text-sm mb-1 italic">
              System Status: <span className={isAdmin ? "text-blue-600 font-black" : "text-green-600 font-black"}>
                {isAdmin ? "Admin Authority 🏛️" : (user ? "Verified Citizen 🟢" : "Live & Secure 👋")}
              </span>
            </p>

            <h3 className="text-sm md:text-xl font-extrabold text-slate-900 tracking-tight mb-3">
              {isAdmin 
                ? "WELCOME BACK, Administrator" 
                : `WELCOME BACK, ${user?.name || 'Guest User'}! 👋`}
            </h3>

            <h2 className="text-lg md:text-4xl font-black text-slate-800 tracking-tighter leading-[1.25]">
              Together, We Build 
              <br />
              <span className="text-blue-600">{isAdmin ? "Admin" : "Safer "}</span> Communities
            </h2>

            <p className="text-sm font-semibold text-slate-500 tracking-wide mt-2 max-w-md">
              {isAdmin 
                ? "Overviewing community-driven reports, managing active incidents, and maintaining regional safety protocols." 
                : "Report issues. Track Progress. Make a Difference!"}
            </p>
          </div>

          {/* --- PROFILE CARD SECTION (DESKTOP) --- */}
          <div className="relative group hidden md:block">
            <img 
              src="/bglogo.jpeg" 
              alt="Shield Background" 
              className="absolute -left-70 -top-35 object-contain pointer-events-none transition-transform duration-500 group-hover:scale-105"
              style={{ 
                width: '700px',       
                height: '550px',      
                mixBlendMode: 'color-dodge',
                filter: 'brightness(1.8) contrast(1.5) saturate(2.5)',
                opacity: '1.0',
              }} 
            />
            
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-2.5 pr-8 rounded-full shadow-lg border border-white relative z-10">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-md uppercase">
                {isAdmin ? "A" : (user?.name ? user.name.substring(0, 1) : 'G')}
              </div>
              
              <div className="text-left">
                <p className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight">
                  {isAdmin ? "Administrator" : (user?.name || 'Guest Citizen')}
                </p>
                
                {(user || isAdmin) ? (
                  <button 
                    onClick={handleLogout} 
                    className="text-[9px] font-black text-red-500 uppercase hover:underline opacity-70 block cursor-pointer"
                  >
                    Logout Session
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setActiveTab('Log in/Sign up'); 
                    }} 
                    className="text-[9px] font-black text-blue-500 uppercase hover:underline opacity-90 block cursor-pointer animate-pulse"
                  >
                    Citizen Login 🔑
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* --- MOBILE PROFILE CIRCLE (TOP RIGHT) --- */}
          <div className="md:hidden fixed top-6 right-6 z-50">
            <div 
              onClick={(user || isAdmin) ? handleLogout : () => setActiveTab('Log in/Sign up')}
              className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xl border-3 border-white shadow-lg cursor-pointer hover:shadow-xl hover:scale-110 transition-all uppercase"
              title={(user || isAdmin) ? "Click to logout" : "Click to login"}
            >
              {isAdmin ? "A" : (user?.name ? user.name.substring(0, 1) : "G")}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">

          {activeTab === 'Dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              
              {/* --- 📈 LIVE DASHBOARD STAT CARDS FROM MONGODB DATA --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard 
  title="Total Reports" 
  value={200 + allReports.length} // ✅ Base 200 + dynamic reports length
  trend={`+${allReports.length > 0 ? allReports.length : '0'}`} 
  icon={<FontAwesomeIcon icon={faFileAlt} />} 
  colorClass="bg-blue-50 text-blue-600" 
  gradient="from-blue-500" 
/>
                
                <StatCard 
  title="Pending" 
  value={85 + allReports.filter(r => r.status === 'Pending' || r.status === '⏳ Pending').length} // ✅ Base 85
  trend="Live" 
  icon="⏳" 
  colorClass="bg-amber-50 text-amber-600" 
  gradient="from-amber-500" 
/>
                <StatCard 
  title="In Progress" 
  value={45 + allReports.filter(r => r.status === 'In Progress' || r.status === '⚙️ In Progress').length} // ✅ Base 45
  trend="Active" 
  icon={<FontAwesomeIcon icon={faCog} />} 
  colorClass="bg-indigo-50 text-indigo-600" 
  gradient="from-indigo-500" 
/>

<StatCard 
  title="Resolved" 
  value={70 + allReports.filter(r => r.status === 'Resolved' || r.status === '✅ Resolved').length} // ✅ Base 70
  trend="Fixed" 
  icon="✅" 
  colorClass="bg-green-50 text-green-600" 
  gradient="from-green-500" 
/>
                

              </div>

              {/* --- MAIN SECTION: FORM (LEFT) & MAP + SAFETY RATINGS (RIGHT) --- */}
              <div className="flex flex-col xl:flex-row gap-8 items-stretch mb-8">
                
                {/* 📋 LEFT COLUMN: NEW INCIDENT FORM */}
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border-2 border-blue-500/40 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
                      <h3 className="text-xl font-black tracking-tight uppercase">New Incident</h3>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="What happened?" className="w-full p-4 bg-slate-50/50 rounded-2xl outline-none focus:bg-white border border-transparent focus:border-blue-100 text-sm font-medium transition-all" required />
                      <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe with details..." className="w-full p-4 bg-slate-50/50 rounded-2xl outline-none border border-transparent focus:border-blue-100 h-32 resize-none text-sm font-medium transition-all" required />
                      <div className="relative">
                        <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Location Name" className="w-full p-4 bg-slate-50/50 rounded-2xl outline-none text-sm font-medium" required />
                        <button type="button" onClick={getLocation} className="absolute right-3 top-3 bottom-3 px-4 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md text-sm">📍</button>
                      </div>
                      <div className="flex gap-4">
                         <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="flex-1 p-4 bg-slate-50/50 rounded-2xl outline-none font-bold text-slate-600 text-sm">
                           <option>Roads</option><option>Electricity</option><option>Water</option><option>Safety</option>
                         </select>
                         <div className="relative flex-1 group">
                           <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                           <div className="h-full p-4 bg-blue-50 rounded-2xl text-blue-600 font-bold text-center text-sm flex items-center justify-center border border-dashed border-blue-200 group-hover:bg-blue-100 transition-colors">📷 {file ? 'Ready' : 'Upload'}</div>
                         </div>
                      </div>
                      <button type="submit" className="w-full bg-gradient-to-r from-[#060912] to-[#0B1120] text-white py-5 rounded-[1.5rem] font-black text-sm tracking-[0.15em] shadow-xl border border-white/5 hover:border-blue-500/40 hover:scale-[1.01] transition-all duration-300">
                        SEND REPORT
                      </button>
                    </form>
                    {status && <p className="text-center mt-4 text-xs font-black text-blue-600 uppercase tracking-widest animate-pulse">{status}</p>}
                  </div>
                </div>

                {/* 🗺️ RIGHT COLUMN: MAP & LIVE SAFETY STATUS ANALYTICS */}
                <div className="flex-1 bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border-2 border-blue-500/40 shadow-xl overflow-hidden relative flex flex-col justify-between min-h-[580px]">
                   <div className="w-full relative shrink-0 rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner h-[280px]">
                     <div className="absolute top-4 left-4 z-10">
                        <div className="bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-white/10">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live Map
                        </div>
                     </div>
                     <button onClick={() => setActiveTab('Map')} className="absolute top-4 right-4 z-10 bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all scale-90 text-sm">
                        <FontAwesomeIcon icon={faExpand} />
                     </button>
                     <div className="w-full h-full">
                        <MapComponent reports={allReports} />
                     </div>
                   </div>

                   <div className="mt-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🛡️</span>
                            <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider">Safety Control Index</h4>
                          </div>
                          <span className="text-xs font-black text-emerald-600 uppercase bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">Secure Node</span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-slate-50/80 border border-slate-100/70 p-4 rounded-xl transition-all hover:bg-slate-100/50">
                            <div className="flex items-center gap-3">
                              <span className="text-sm p-2 bg-red-50 text-red-600 rounded-lg shadow-sm">📡</span>
                              <div>
                                <h5 className="text-base font-black text-slate-700 leading-tight">Threat Radar Pulse</h5>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mt-0.5">Active scans across regional nodes</p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-red-600 uppercase px-2.5 py-1 bg-red-50 rounded-md">Continuous</span>
                          </div>

                          <div className="flex items-center justify-between bg-slate-50/80 border border-slate-100/70 p-4 rounded-xl transition-all hover:bg-slate-100/50">
                            <div className="flex items-center gap-3">
                              <span className="text-sm p-2 bg-emerald-50 text-emerald-600 rounded-lg shadow-sm">🟢</span>
                              <div>
                                <h5 className="text-base font-black text-slate-700 leading-tight">Verified Secure Sectors</h5>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mt-0.5">Zero hazards reported in main grids</p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-emerald-600 uppercase px-2.5 py-1 bg-emerald-50 rounded-md">84% Optimal</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 pt-2 border-t border-slate-50">
                        <span>CivicShield Security Core v3.0</span>
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6] animate-pulse"></span>
                      </div>
                   </div>
                </div>
              </div>

              {/* ——— 📋 RECENT REPORTS (AUTOMATIC NO-BUTTONS DASHBOARD SLICE) ——— */}
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border-2 border-blue-500/40 shadow-xl w-full">
                <div className="flex justify-between items-center mb-5 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📋</span>
                    <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider">Recent Database Records</h4>
                  </div>
                  <button onClick={() => setActiveTab('Reports')} className="text-xs font-black text-blue-600 uppercase hover:underline">View All</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {allReports.length > 0 ? (
                    allReports.slice(0, 4).map((report, idx) => {
                      const currentId = report._id || report.id;
                      const isResolved = report.status === 'Resolved' || report.status === '✅ Resolved';
                      return (
                        <div key={currentId || idx} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[290px] group cursor-pointer hover:-translate-y-1.5">
                          
                          <div className="h-[140px] w-full bg-slate-100 relative overflow-hidden shrink-0">
                            {report.imageUrl || report.image ? (
                              <img 
                                src={report.imageUrl || report.image} 
                                alt="report-media" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-[#0B1120] flex items-center justify-center text-2xl">
                                ⚠️
                              </div>
                            )}
                            <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 text-[9px] rounded-md font-black text-white uppercase">{report.category || 'Other'}</div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h5 className="text-sm font-black text-slate-800 line-clamp-1 capitalize tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                                {report.title}
                              </h5>
                              <div className="flex items-center gap-1 text-slate-400 mt-1.5">
                                <span className="text-[11px]">📍</span>
                                <p className="text-[11px] font-bold uppercase tracking-tight truncate">
                                  {report.location || 'Faisalabad Grid Node'}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-4">
                              <span className="text-[10px] text-slate-400 font-bold">📡 Live Node</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                                isResolved
                                  ? 'text-green-600 bg-green-50 border-green-200/50'
                                  : 'text-amber-600 bg-amber-50 border-amber-200/50'
                              }`}>
                                {isResolved ? '✅ Resolved' : '⏳ Pending'}
                              </span>
                            </div>
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-10 text-center text-slate-300 font-black uppercase text-xs tracking-widest">No reports linked.</div>
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* --- 📋 MAIN REPORTS TAB WITH RESOLVE METHOD B ACTION PANEL --- */}
          {activeTab === 'Reports' && (
            <motion.div key="rep" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allReports.length > 0 ? allReports.map(report => {
                const currentId = report._id || report.id;
                const isResolved = report.status === 'Resolved' || report.status === '✅ Resolved';

                return (
                  <div key={currentId || report.title} className="bg-white/90 rounded-[2.5rem] p-4 border border-white shadow-md hover:shadow-xl transition-all group">
                    <div className="relative h-52 mb-5 overflow-hidden rounded-[2rem] bg-slate-100">
                      {report.imageUrl || report.image ? (
                        <img src={report.imageUrl || report.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={report.title} />
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-300 font-bold italic uppercase tracking-widest text-[10px]">No Visual Data</div>
                      )}
                      <div className="absolute top-4 left-4 backdrop-blur-md bg-black/40 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{report.category}</div>
                    </div>
                    
                    <h4 className="font-extrabold text-slate-800 text-xl px-2 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{report.title}</h4>
                    <div className="px-2 italic text-slate-400 font-bold text-[11px] mb-2">📍 {report.location || 'Faisalabad Grid Node'}</div>
                    
                    <div className="px-2 mb-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                        isResolved 
                          ? 'text-green-600 bg-green-50 border-green-200/50' 
                          : 'text-amber-600 bg-amber-50 border-amber-200/50'
                      }`}>
                        {isResolved ? '✅ Resolved' : '⏳ Pending / In Progress'}
                      </span>
                    </div>

                    {/* 🔒 ADMIN WORK PANEL */}
                    {isAdmin && (
                      <div className="mt-4 flex gap-2 pt-2 border-t border-slate-100/60">
                         <button 
                           onClick={async (e) => {
                             e.stopPropagation();
                             if (isResolved) return;
                             if (!currentId) {
                               alert("❌ Error: Report ID not found!");
                               return;
                             }
                             try {
                               await api.put(`/api/reports/resolve-pure/${currentId}`);
                               alert("🎉 Success: Status updated to RESOLVED in MongoDB!");
                               window.location.reload(); 
                             } catch (err) {
                               alert("❌ Error: " + (err.response?.data?.error || err.message));
                             }
                           }}
                           className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all text-center cursor-pointer uppercase ${
                             isResolved 
                               ? 'bg-green-100 text-green-600 cursor-not-allowed border border-green-200' 
                               : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white border border-green-200'
                           }`}
                         >
                           {isResolved ? "✓ Resolved" : "RESOLVE"}
                         </button>

                         <button 
                           onClick={async (e) => {
                             e.stopPropagation();
                             if (!currentId) {
                               alert("❌ Error: Report ID not found!");
                               return;
                             }
                             if (window.confirm("🗑️ Drop this report from CivicShield Database permanently?")) {
                               try {
                                 await api.delete(`/api/reports/${currentId}`);
                                 alert("🗑️ Success: Report dropped from MongoDB!");
                                 window.location.reload(); 
                               } catch (err) {
                                 alert("❌ Error: " + (err.response?.data?.error || err.message));
                               }
                             }
                           }}
                           className="flex-1 py-2 bg-red-50 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-600 hover:text-white border border-red-200 transition-all text-center cursor-pointer uppercase"
                         >
                           DELETE
                         </button>
                      </div>
                    )}
                  </div>
                );
              }) : <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase tracking-[0.3em]">No reports recorded yet.</div>}
            </motion.div>
          )}

          {activeTab === 'Map' && (
            <motion.div key="map" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <div className="w-full rounded-[3.5rem] overflow-hidden border-[6px] border-white shadow-2xl relative" style={{ height: '540px' }}>
                <MapComponent reports={allReports} />
              </div>

              <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-white shadow-lg">
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Safety Radar Index</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Regional Condition & Threat Assessment</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col justify-between bg-red-500/5 border border-red-500/10 p-4 rounded-2xl transition-all hover:bg-red-500/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse"></span>
                      <span className="text-[15px] font-black uppercase tracking-wider text-red-700">Critical Zone</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">High risk area with multiple reported safety or infrastructure hazards.</p>
                  </div>

                  <div className="flex flex-col justify-between bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl transition-all hover:bg-amber-500/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]"></span>
                      <span className="text-[15px] font-black uppercase tracking-wider text-amber-700">Warning Area</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Moderate issues reported. Precautionary monitoring is advised.</p>
                  </div>

                  <div className="flex flex-col justify-between bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl transition-all hover:bg-emerald-500/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                      <span className="text-[15px] font-black uppercase tracking-wider text-emerald-700">Secure Zone</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Zero critical alerts. Safe environment verified by community reports.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'My Activity' && (
            <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl bg-white/90 p-12 rounded-[3.5rem] shadow-sm">
              <h3 className="text-2xl font-black mb-10 text-slate-800 italic uppercase">Your History</h3>
              <div className="border-l-4 border-blue-50 pl-10 space-y-12">
                <div className="relative">
                  <div className="absolute -left-[54px] top-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  <h4 className="font-extrabold text-slate-800">New Incident Reported</h4>
                  <p className="text-sm text-slate-500">Trash collection issue at Main Market.</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase mt-2">Just Now</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Alerts' && (
            <motion.div key="alerts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 max-w-2xl">
              <div className="bg-white/90 p-8 rounded-[2.5rem] border-l-[12px] border-red-500 shadow-sm flex items-center gap-8">
                <div className="text-4xl bg-red-50 p-4 rounded-2xl"><FontAwesomeIcon icon={faBell} className="text-red-500" /></div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Heavy Rainfall Warning</h4>
                  <p className="text-sm text-slate-500 font-medium">Flash flood warnings in low-lying areas of Faisalabad and Toba Tek Singh.</p>
                </div>
              </div>
              <div className="bg-white/90 p-8 rounded-[2.5rem] border-l-[12px] border-blue-500 shadow-sm flex items-center gap-8">
                <div className="text-4xl bg-blue-50 p-4 rounded-2xl">💡</div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Infrastructure Update</h4>
                  <p className="text-sm text-slate-500 font-medium">Road maintenance on Canal Road scheduled for tonight.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Community' && (
            <motion.div key="comm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-900 p-16 rounded-[4rem] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12">
                <div>
                  <h3 className="text-5xl font-black mb-6 tracking-tighter">CivicShield <br/><span className="text-blue-300">Council</span></h3>
                  <p className="text-blue-100 font-medium max-w-md text-lg leading-relaxed">Join the discussion with other residents and community leaders to make Faisalabad safer.</p>
                </div>
                <button className="bg-white text-blue-600 px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-105 hover:shadow-2xl transition-all">Join Discussion</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'Profile' && (
            <motion.div key="prof" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center">
              <div className="bg-white/90 p-16 rounded-[4rem] shadow-2xl border border-white backdrop-blur-md">
                <div className={`w-40 h-40 rounded-full mx-auto mb-10 flex items-center justify-center text-6xl shadow-inner border-[6px] bg-gradient-to-tr from-slate-50 to-slate-100 ${
                  isAdmin ? 'border-blue-500/30 text-blue-500' : (user ? 'border-emerald-500/30 text-emerald-500' : 'border-slate-200 text-slate-300')
                }`}>
                  <FontAwesomeIcon icon={faUserCircle} />
                </div>
                
                <h3 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter">
                  {isAdmin ? "Administrator" : (user?.name || 'No Active Session')}
                </h3>
                
                <p className={`font-bold mb-12 text-[10px] uppercase tracking-[0.3em] italic ${
                  isAdmin ? "text-blue-600" : (user ? "text-emerald-600" : "text-slate-400")
                }`}>
                  {isAdmin ? "System Core Administrator" : (user ? "Verified Citizen Advocate" : "Guest Node / Unauthenticated")}
                </p>

                {(user || isAdmin) ? (
                  <button 
                    onClick={handleLogout} 
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-2xl font-black text-xs tracking-widest shadow-lg hover:scale-[1.02] transition-all cursor-pointer uppercase"
                  >
                    Terminate Session 🚪
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Please log in or register a safe citizen account to view personal metrics, track reported incidents, and access safety badges.
                    </p>
                    <button 
                      onClick={() => setActiveTab('Log in/Sign up')} 
                      className="w-full bg-gradient-to-r from-[#060912] to-[#0B1120] text-white py-4 rounded-2xl font-black text-xs tracking-widest shadow-lg hover:scale-[1.02] transition-all cursor-pointer uppercase"
                    >
                      Authenticate Profile 🔑
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'Settings' && (
            <motion.div key="sett" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-4">
              <div className="bg-white/90 p-10 rounded-[3rem] border border-slate-50 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-all">
                <div><h4 className="font-extrabold text-slate-800 text-lg">Push Notifications</h4><p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Instant alerts for new incidents</p></div>
                <div className="w-16 h-9 bg-blue-600 rounded-full relative p-1.5 cursor-pointer"><div className="w-6 h-6 bg-white rounded-full ml-auto shadow-md"></div></div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Log in/Sign up' && (
            <motion.div 
              key="auth" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className="max-w-md mx-auto bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100"
            >
              <div className="flex justify-center gap-4 mb-8">
                <button 
                  type="button" 
                  onClick={() => setAuthView('login')} 
                  className={`px-6 py-2.5 font-black text-xs uppercase tracking-widest rounded-xl transition-all ${authView === 'login' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                >
                  Login
                </button>
                <button 
                  type="button" 
                  onClick={() => setAuthView('register')} 
                  className={`px-6 py-2.5 font-black text-xs uppercase tracking-widest rounded-xl transition-all ${authView === 'register' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                >
                  Sign Up
                </button>
              </div>
              
              <hr className="border-slate-100 mb-8" />

              <div className="relative z-10">
                {authView === 'register' ? (
                  <Register onRegisterSuccess={() => setAuthView('login')} />
                ) : (
                  <Login onLoginSuccess={(name) => { setUser({ name }); setActiveTab('Dashboard'); }} />
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* --- MOBILE BOTTOM NAVBAR --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-white/10 z-40 shadow-2xl">
        <div className="flex justify-around items-center h-20">
          {[
            { id: 'Dashboard', icon: <FontAwesomeIcon icon={faThLarge} /> },
            { id: 'Reports', icon: <FontAwesomeIcon icon={faFileAlt} /> },
            { id: 'Map', icon: <FontAwesomeIcon icon={faMapMarkedAlt} /> },
            { id: 'Log in/Sign up', icon: <FontAwesomeIcon icon={faUserCircle} /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${
                activeTab === item.id
                  ? 'text-blue-400 bg-blue-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={item.id}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.id === 'Log in/Sign up' ? 'Login' : item.id}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App;
