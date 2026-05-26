import React, { useState } from 'react';
// Naya api instance import karein
import api from '../api'; 

const Register = ({ onRegisterSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("⏳ Registering account...");
        
        try {
            // Ab 'api.post' use karenge, localhost hat gaya
            const response = await api.post('/api/auth/register', { name, email, password });

            if (response.status === 201 || response.status === 200) {
                setMessage("✅ Account Created Successfully!");
                setLoading(false);
                setTimeout(() => {
                    if (onRegisterSuccess) onRegisterSuccess();
                }, 1500);
            }
        } catch (err) {
            setLoading(false);
            setMessage(err.response?.data?.message || "❌ Registration Failed.");
        }
    };

    return (
        <div className="text-left font-sans">
            <h3 className="text-xl font-black mb-4 text-slate-800">Create Account</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input 
                    type="text" 
                    required 
                    className="w-full p-3 bg-slate-100 rounded-xl outline-none font-bold text-slate-700" 
                    placeholder="Full Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                />
                <input 
                    type="email" 
                    required 
                    className="w-full p-3 bg-slate-100 rounded-xl outline-none font-bold text-slate-700" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                    type="password" 
                    required 
                    className="w-full p-3 bg-slate-100 rounded-xl outline-none font-bold text-slate-700" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="submit" disabled={loading} className="w-full text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-md">
                    {loading ? 'Processing...' : 'Register'}
                </button>
            </form>
            {message && <p className="mt-4 text-center text-xs font-black text-blue-600 uppercase tracking-wider">{message}</p>}
        </div>
    );
};

export default Register;