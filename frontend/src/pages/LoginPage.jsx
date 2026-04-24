import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 relative overflow-hidden selection:bg-primary-200 selection:text-primary-900">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-200/40 blur-3xl mix-blend-multiply pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-3xl mix-blend-multiply pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Brand */}
                <div className="text-center mb-8">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6"
                    >
                        <GraduationCap className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Welcome Back</h1>
                    <p className="text-surface-500 mt-2">Sign in to your L&D account to continue</p>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-surface-200/50 border border-white">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 border border-red-100"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">Email Address</label>
                            <div className="relative group">
                                <Mail className="w-5 h-5 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    id="login-email"
                                    type="email"
                                    className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 outline-none transition-all focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                    placeholder="you@company.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-surface-700">Password</label>
                                <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="w-5 h-5 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    id="login-password"
                                    type="password"
                                    className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 outline-none transition-all focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-surface-600 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline underline-offset-4">
                        Create one now
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
