import React, { useState } from 'react';
// Naya api instance import karein (Ensure path is correct, e.g., '../api')
import api from '../api'; 

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("⏳ CONNECTING...");

        try {
            // Ab 'api.post' use karenge, poora URL dene ki zaroorat nahi
            const response = await api.post('/api/auth/login', { email, password });
            
            console.log("Success Response Data:", response.data);

            const userObj = response.data?.user;
            const userName = userObj?.name || "Citizen User";

            if (response.data?.message === "Login successful" || userObj) {
                localStorage.setItem('token', response.data?.token || 'dummy-session-token');
                localStorage.setItem('userName', userName);
                
                setMessage("✅ LOGIN SUCCESSFUL!");
                setLoading(false);
                
                if (onLoginSuccess) onLoginSuccess(userName);
            } else {
                setLoading(false);
                setMessage("❌ Invalid Response from Server");
            }
        } catch (err) {
            setLoading(false);
            console.error("🚨 Full Error Object:", err);
            // Error handling jo aapne pehle likha tha, waisa hi rakha hai
            setMessage(err.response?.data?.message || "❌ Connection Failed / Invalid Credentials");
        }
    };

    return (
        <div className="text-left font-sans">
            <h3 className="text-xl font-black mb-4 text-slate-800">Login Portal</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input 
                    type="email" 
                    required 
                    className="w-full p-3 bg-slate-100 rounded-xl outline-none font-bold text-slate-700" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={loading}
                />
                <input 
                    type="password" 
                    required 
                    className="w-full p-3 bg-slate-100 rounded-xl outline-none font-bold text-slate-700" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={loading}
                />
                <button type="submit" disabled={loading} className="w-full text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-md transition-all">
                    {loading ? 'Processing...' : 'Sign In'}
                </button>
            </form>
            {message && <p className="mt-4 text-center text-xs font-black text-blue-600 uppercase tracking-wider">{message}</p>}
        </div>
    );
};

export default Login;