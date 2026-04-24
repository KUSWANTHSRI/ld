import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, BookOpen, Users, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-surface-50 text-surface-900 font-sans flex flex-col">
            {/* Navigation */}
            <nav className="w-full px-6 py-4 flex justify-between items-center bg-surface-100/50 backdrop-blur-md border-b border-surface-200 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-surface-900 to-surface-600 bg-clip-text text-transparent">
                        L and D
                    </h1>
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="btn-secondary">
                        Login
                    </Link>
                    <Link to="/register" className="btn-primary">
                        Register
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl z-10"
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                        L and D Training <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300">
                            Management System
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-surface-400 mb-10 max-w-2xl mx-auto">
                        Empower your workforce with our enterprise-grade Learning & Development platform. Real-time attendance, comprehensive analytics, and seamless course management.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4">
                            Get Started <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/login" className="btn-secondary flex items-center justify-center text-lg px-8 py-4">
                            Sign In
                        </Link>
                    </div>
                </motion.div>

                {/* Features */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mt-24 z-10"
                >
                    <div className="glass-panel p-8 rounded-3xl card-hover text-left">
                        <div className="w-12 h-12 bg-primary-500/20 text-primary-400 rounded-2xl flex items-center justify-center mb-6">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Course Management</h3>
                        <p className="text-surface-400">Easily create, assign, and track training programs across your entire organization.</p>
                    </div>
                    
                    <div className="glass-panel p-8 rounded-3xl card-hover text-left">
                        <div className="w-12 h-12 bg-primary-500/20 text-primary-400 rounded-2xl flex items-center justify-center mb-6">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Live Attendance</h3>
                        <p className="text-surface-400">Real-time QR code scanning and instant WebSockets attendance tracking.</p>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl card-hover text-left">
                        <div className="w-12 h-12 bg-primary-500/20 text-primary-400 rounded-2xl flex items-center justify-center mb-6">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
                        <p className="text-surface-400">Deep insights into completion rates, performance scores, and ROI.</p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
