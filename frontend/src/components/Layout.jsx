import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    GraduationCap, 
    Users, 
    ClipboardCheck, 
    LogOut, 
    Bell, 
    Search,
    Menu,
    X,
    Settings,
    ChevronDown,
    MessageSquare
} from 'lucide-react';
import clsx from 'clsx';

import { io } from 'socket.io-client';

const navItems = [
    { label: 'Dashboard',   path: '/dashboard',  icon: LayoutDashboard, roles: ['Admin','Trainer','Employee'] },
    { label: 'Trainings',   path: '/trainings',  icon: GraduationCap,   roles: ['Admin','Trainer','Employee'] },
    { label: 'Live Polls',  path: '/polling',    icon: MessageSquare,   roles: ['Admin','Trainer','Employee'] },
    { label: 'Employees',   path: '/employees',  icon: Users,           roles: ['Admin','Trainer'] },
    { label: 'Attendance',  path: '/attendance', icon: ClipboardCheck,  roles: ['Admin','Trainer','Employee'] },
];

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!user) return;
        
        const socket = io('http://localhost:3005');
        
        socket.on('connect', () => {
            console.log('Connected to notification service');
            socket.emit('register', user.id);
        });

        socket.on('notification', (data) => {
            console.log('New notification received:', data);
            setUnreadNotifications(prev => prev + 1);
            // Optionally could use a toast notification library here
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const roleClass = {
        Admin: 'bg-purple-100 text-purple-700 border border-purple-200',
        Trainer: 'bg-blue-100 text-blue-700 border border-blue-200',
        Employee: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    }[user?.role] || 'bg-gray-100 text-gray-700';

    const visibleItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="flex h-screen bg-surface-50 overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-surface-900/50 backdrop-blur-sm lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside 
                className={clsx(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-surface-200 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-surface-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-md shadow-primary-500/20">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-surface-900 to-surface-700 bg-clip-text text-transparent">L&D System</h1>
                        </div>
                    </div>
                    <button 
                        className="ml-auto lg:hidden text-surface-400 hover:text-surface-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <p className="px-3 text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4">Menu</p>
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive 
                                        ? "bg-primary-50 text-primary-700" 
                                        : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                                )}
                            >
                                <Icon className={clsx("w-5 h-5", isActive ? "text-primary-600" : "text-surface-400")} />
                                {item.label}
                                {isActive && (
                                    <motion.div 
                                        layoutId="sidebar-active"
                                        className="absolute left-0 w-1 h-8 bg-primary-600 rounded-r-full"
                                    />
                                )}
                            </NavLink>
                        );
                    })}
                </div>

                {/* Bottom Profile Area */}
                <div className="p-4 border-t border-surface-200 bg-surface-50/50">
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-200 to-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 font-bold">
                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-surface-900 truncate">
                                {user?.name || user?.email?.split('@')[0]}
                            </p>
                            <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-8 z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            className="p-2 -ml-2 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 lg:hidden"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        
                        {/* Search Bar */}
                        <div className="hidden md:flex items-center relative group">
                            <Search className="w-4 h-4 text-surface-400 absolute left-3 group-focus-within:text-primary-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search trainings..." 
                                className="w-64 pl-10 pr-4 py-2 bg-surface-50 border border-transparent rounded-full text-sm outline-none transition-all focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-500/10 placeholder-surface-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            className="relative p-2 rounded-full text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
                            onClick={() => setUnreadNotifications(0)}
                        >
                            <Bell className="w-5 h-5" />
                            <AnimatePresence>
                                {unreadNotifications > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center text-[10px] font-bold text-[#ffffff] shadow-sm"
                                    >
                                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                        
                        <div className="h-6 w-px bg-surface-200 mx-1 hidden sm:block"></div>
                        
                        {/* Profile Dropdown Trigger */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
                            >
                                <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider", roleClass)}>
                                    {user?.role}
                                </span>
                                <ChevronDown className="w-4 h-4 text-surface-400" />
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {showProfileMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-surface-200 py-1 origin-top-right"
                                    >
                                        <div className="px-4 py-2 border-b border-surface-100">
                                            <p className="text-sm font-medium text-surface-900">Signed in as</p>
                                            <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                                        </div>
                                        <button className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 flex items-center gap-2">
                                            <Settings className="w-4 h-4" /> Settings
                                        </button>
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-surface-100"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-surface-50/50 relative">
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary-50/50 to-transparent pointer-events-none"></div>
                    <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-full relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
