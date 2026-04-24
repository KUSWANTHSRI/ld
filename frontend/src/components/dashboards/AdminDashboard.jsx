import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Users, GraduationCap, Clock, CheckCircle2, Activity, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/stats/admin')
            .then(res => setStats(res.data))
            .catch(err => {
                console.error("Backend not available, using mock stats.");
                setStats({
                    users: { total: 145, employees: 120, trainers: 20, admins: 5 },
                    trainings: { total: 24, upcoming: 8, ongoing: 5, completed: 11 },
                    enrollments: [
                        { name: "React Basics", enrollments: 45 },
                        { name: "Node.js Adv", enrollments: 32 },
                        { name: "Leadership", enrollments: 56 },
                        { name: "Cloud Native", enrollments: 28 },
                    ],
                    recentActivity: [
                        { id: 1, action: "John enrolled in React Basics", time: "2 hours ago" },
                        { id: 2, action: "New training 'Cloud Native' created", time: "5 hours ago" },
                        { id: 3, action: "Attendance marked for Leadership", time: "1 day ago" }
                    ]
                });
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-surface-200 animate-pulse rounded-2xl"></div>
                ))}
            </div>
        );
    }

    if (!stats) return <div className="text-surface-500 flex items-center justify-center h-64">Failed to load stats.</div>;

    const { users, trainings, enrollments, recentActivity } = stats;

    const pieData = [
        { name: 'Upcoming', value: trainings.upcoming },
        { name: 'Ongoing', value: trainings.ongoing },
        { name: 'Completed', value: trainings.completed },
    ];

    const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-surface-100 hover:shadow-md transition-shadow relative overflow-hidden group"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-surface-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-surface-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="flex items-center text-sm font-medium text-emerald-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>12% from last month</span>
            </div>
            {/* Decorative background element */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${colorClass.replace('text-', 'bg-').replace('bg-', '')}`}></div>
        </motion.div>
    );

    return (
        <div className="space-y-8 pb-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900">Admin Overview</h2>
                    <p className="text-surface-500 mt-1">Here's what's happening in your L&D system today.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-surface-200 rounded-xl text-sm font-medium shadow-sm hover:bg-surface-50">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={users.total} icon={Users} colorClass="bg-blue-50 text-blue-600" delay={0.1} />
                <StatCard title="Total Trainings" value={trainings.total} icon={GraduationCap} colorClass="bg-indigo-50 text-indigo-600" delay={0.2} />
                <StatCard title="Active Trainings" value={trainings.ongoing} icon={Activity} colorClass="bg-emerald-50 text-emerald-600" delay={0.3} />
                <StatCard title="Completed" value={trainings.completed} icon={CheckCircle2} colorClass="bg-purple-50 text-purple-600" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-surface-100"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-surface-900">Training Enrollments</h3>
                        <select className="bg-surface-50 border border-surface-200 text-sm rounded-lg px-3 py-1.5 outline-none">
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={enrollments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="enrollments" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Pie Chart & Recent Activity */}
                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-surface-100"
                    >
                        <h3 className="text-lg font-bold text-surface-900 mb-6">Training Status</h3>
                        <div className="h-48 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-surface-900">{trainings.total}</span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            {pieData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center text-xs text-surface-600 font-medium">
                                    <div className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: COLORS[index] }}></div>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-surface-100"
                    >
                        <h3 className="text-lg font-bold text-surface-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div key={activity.id} className="flex gap-3 relative">
                                    {index !== recentActivity.length - 1 && (
                                        <div className="absolute left-4 top-8 bottom-[-16px] w-px bg-surface-200"></div>
                                    )}
                                    <div className="w-8 h-8 rounded-full bg-surface-50 border border-surface-200 flex items-center justify-center flex-shrink-0 z-10">
                                        <Clock className="w-4 h-4 text-surface-400" />
                                    </div>
                                    <div className="pt-1.5">
                                        <p className="text-sm font-medium text-surface-800">{activity.action}</p>
                                        <p className="text-xs text-surface-400 mt-0.5">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button 
                            className="w-full mt-6 text-sm font-medium text-primary-600 hover:text-primary-700"
                            onClick={() => alert("Activity Log: \n1. John enrolled in React Basics\n2. New training 'Cloud Native' created\n3. Attendance marked for Leadership")}
                        >
                            View All Activity
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
