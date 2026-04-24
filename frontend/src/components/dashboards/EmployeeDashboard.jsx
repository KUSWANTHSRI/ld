import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Trophy, Clock, CheckCircle2, PlayCircle, ClipboardCheck, CalendarCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function EmployeeDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/stats/employee')
            .then(res => setStats(res.data))
            .catch(err => {
                console.error("Backend not available, using mock stats.");
                setStats({
                    enrolledCount: 3,
                    completedCourses: 1,
                    enrolled: [
                        { _id: '1', title: 'Communication Skills', category: 'Soft Skills', status: 'Completed', progress: 100 },
                        { _id: '2', title: 'Advanced React', category: 'Technical', status: 'In Progress', progress: 45 },
                        { _id: '3', title: 'System Design', category: 'Technical', status: 'In Progress', progress: 10 }
                    ],
                    upcomingSessions: []
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

    const { enrolledCount, completedCourses, enrolled, upcomingSessions } = stats;

    const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay }}
            className={`rounded-2xl p-6 shadow-sm border ${colorClass.border} bg-white flex items-center gap-5 relative overflow-hidden`}
        >
            <div className={`p-4 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm ${colorClass.text}`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <p className={`text-sm font-semibold mb-1 ${colorClass.text}`}>{title}</p>
                <h3 className="text-3xl font-bold text-surface-900">{value}</h3>
            </div>
            {/* Decorative circles */}
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full ${colorClass.text.replace('text', 'bg')}/10 pointer-events-none`}></div>
            <div className={`absolute -right-4 top-4 w-16 h-16 rounded-full ${colorClass.text.replace('text', 'bg')}/10 pointer-events-none`}></div>
        </motion.div>
    );

    const inProgress = enrolled.filter(c => c.status !== 'Completed');
    const completed = enrolled.filter(c => c.status === 'Completed');

    const CourseCard = ({ course, index }) => (
        <motion.div 
            key={course._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-surface-200 hover:border-primary-300 hover:shadow-md transition-all group cursor-pointer flex flex-col"
            onClick={() => navigate('/trainings')}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-1">{course.title}</h4>
                        <p className="text-sm font-medium text-surface-500 mt-0.5">{course.category}</p>
                    </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    course.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                    {course.status}
                </span>
            </div>

            <div className="mt-auto pt-4">
                <div className="flex justify-between text-sm font-medium text-surface-700 mb-2">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${course.status === 'Completed' ? 'bg-emerald-500' : 'bg-primary-500'}`}
                        style={{ width: `${course.progress}%` }}
                    ></div>
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <span className="text-xs font-medium text-surface-500 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Next class: Tomorrow
                    </span>
                    <button 
                        className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            alert(course.status === 'Completed' ? 'Downloading Certificate: ' + course.title : 'Resuming Course: ' + course.title);
                        }}
                    >
                        {course.status === 'Completed' ? (
                            <><CheckCircle2 className="w-4 h-4" /> Certificate</>
                        ) : (
                            <><PlayCircle className="w-4 h-4" /> Resume</>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900">Welcome Back!</h2>
                    <p className="text-surface-500 mt-1">Ready to learn something new today?</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/trainings')}>
                    Browse Trainings
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Enrolled Courses" 
                    value={enrolledCount} 
                    icon={BookOpen} 
                    colorClass={{ bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600' }} 
                    delay={0.1} 
                />
                <StatCard 
                    title="Completed" 
                    value={completedCourses} 
                    icon={Trophy} 
                    colorClass={{ bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' }} 
                    delay={0.2} 
                />
                <StatCard 
                    title="Hours Learned" 
                    value="24" 
                    icon={Clock} 
                    colorClass={{ bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' }} 
                    delay={0.3} 
                />
            </div>

            {/* Quick Actions / QR Scan */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-1 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 shadow-md text-white relative overflow-hidden flex flex-col items-center justify-center text-center group cursor-pointer" onClick={() => alert("Simulating Camera Access... QR Scanned Successfully!")}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h-2v2h2v-2zm-2 2h-2v2h2v-2zm2 2h-2v2h2v-2zm-2 2h-2v2h2v-2zm2 2h-2v2h2v-2z" /></svg>
                    </div>
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                        <ClipboardCheck className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 z-10">Scan Live QR</h3>
                    <p className="text-sm text-primary-100 z-10">Point camera at Trainer's screen to mark your attendance instantly.</p>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-surface-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-surface-900 mb-1">Upcoming Live Session</h3>
                        <p className="text-surface-500 text-sm">You have a session scheduled for today at 2:00 PM.</p>
                        <div className="mt-4 flex gap-2">
                            <span className="px-3 py-1 bg-surface-100 text-surface-700 text-xs font-bold rounded-lg">Advanced React</span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1"><Clock className="w-3 h-3" /> In 2 hours</span>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center border border-primary-100">
                            <CalendarCheck className="w-8 h-8 text-primary-600" />
                        </div>
                    </div>
                </div>
            </div>

            {inProgress.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-lg font-bold text-surface-900 mb-6">Continue Learning</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {inProgress.map((course, index) => <CourseCard key={course._id} course={course} index={index} />)}
                    </div>
                </div>
            )}

            {completed.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-lg font-bold text-surface-900 mb-6">Completed Courses</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {completed.map((course, index) => <CourseCard key={course._id} course={course} index={index} />)}
                    </div>
                </div>
            )}
        </div>
    );
}
