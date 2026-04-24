import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { BookOpen, Calendar, Activity, Users, MoreHorizontal, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrainerDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/stats/trainer')
            .then(res => setStats(res.data))
            .catch(err => {
                console.error("Backend not available, using mock stats.");
                setStats({
                    assigned: 5,
                    upcoming: 2,
                    ongoing: 3,
                    trainings: [
                        { _id: '1', title: 'React Basics', status: 'Ongoing', capacity: 30, startDate: '2026-04-20' },
                        { _id: '2', title: 'Node.js Advanced', status: 'Upcoming', capacity: 25, startDate: '2026-05-01' },
                        { _id: '3', title: 'MongoDB for Developers', status: 'Ongoing', capacity: 40, startDate: '2026-04-15' }
                    ],
                    performance: [
                        { name: "React Basics", score: 85 },
                        { name: "Node.js Advanced", score: 92 },
                        { name: "MongoDB for Developers", score: 78 }
                    ]
                });
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-surface-200 animate-pulse rounded-2xl"></div>
                ))}
            </div>
        );
    }

    if (!stats) return <div className="text-surface-500 flex items-center justify-center h-64">Failed to load stats.</div>;

    const { assigned, upcoming, ongoing, trainings, performance } = stats;

    const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-surface-100 flex items-center gap-5 hover:shadow-md transition-shadow group"
        >
            <div className={`p-4 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-sm font-medium text-surface-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-surface-900">{value}</h3>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-8 pb-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900">Trainer Dashboard</h2>
                    <p className="text-surface-500 mt-1">Manage your classes and track student performance.</p>
                </div>
                <button className="btn-primary">
                    <Calendar className="w-4 h-4" /> Schedule Session
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Assigned Trainings" value={assigned} icon={BookOpen} colorClass="bg-blue-50 text-blue-600" delay={0.1} />
                <StatCard title="Upcoming Sessions" value={upcoming} icon={Calendar} colorClass="bg-amber-50 text-amber-600" delay={0.2} />
                <StatCard title="Ongoing Classes" value={ongoing} icon={Activity} colorClass="bg-emerald-50 text-emerald-600" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-surface-100"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-surface-900">Average Class Performance</h3>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke="#4f46e5" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Upcoming Schedule */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-surface-100 flex flex-col"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-surface-900">My Trainings</h3>
                        <button className="text-surface-400 hover:text-surface-700">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {trainings.length === 0 ? (
                            <p className="text-sm text-surface-500 text-center py-8">No trainings assigned yet.</p>
                        ) : trainings.map((training, i) => (
                            <div key={training._id} className="p-4 rounded-xl border border-surface-100 hover:border-primary-200 hover:shadow-sm transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">{training.title}</h4>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                        training.status === 'Upcoming' ? 'bg-amber-100 text-amber-700' :
                                        training.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' :
                                        'bg-surface-100 text-surface-600'
                                    }`}>
                                        {training.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium text-surface-500 mt-3">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{training.capacity} Capacity</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{new Date(training.startDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
