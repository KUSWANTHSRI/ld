import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Briefcase, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Employee', department: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 relative overflow-hidden selection:bg-primary-200 selection:text-primary-900">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-200/40 blur-3xl mix-blend-multiply pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-3xl mix-blend-multiply pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10 my-8"
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
                    <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Create an Account</h1>
                    <p className="text-surface-500 mt-2">Join the L&D platform to enhance your skills</p>
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name</label>
                            <div className="relative group">
                                <User className="w-5 h-5 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 outline-none transition-all focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">Email Address</label>
                            <div className="relative group">
                                <Mail className="w-5 h-5 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                                <input
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
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
                            <div className="relative group">
                                <Lock className="w-5 h-5 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="password"
                                    className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 outline-none transition-all focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1.5">Role</label>
                                <select 
                                    className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 outline-none transition-all focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 appearance-none"
                                    value={form.role} 
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                >
                                    <option value="Employee">Employee</option>
                                    <option value="Trainer">Trainer</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1.5">Department</label>
                                <div className="relative group">
                                    <Briefcase className="w-5 h-5 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="text"
                                        className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 outline-none transition-all focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                        placeholder="e.g. IT"
                                        value={form.department}
                                        onChange={e => setForm({ ...form, department: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Create Account <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-surface-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline underline-offset-4">
                        Sign in here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
