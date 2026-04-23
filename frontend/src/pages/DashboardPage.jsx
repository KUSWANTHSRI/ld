import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { trainingsAPI, usersAPI, enrollmentsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981'];

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [trainings, setTrainings] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user.role === 'Admin') {
                    const [tStats, eStats, tr] = await Promise.all([
                        trainingsAPI.getStats(),
                        enrollmentsAPI.getStats(),
                        trainingsAPI.getAll()
                    ]);
                    setStats({ trainings: tStats.data, enrollments: eStats.data });
                    setTrainings(tr.data);
                } else if (user.role === 'Trainer') {
                    const tr = await trainingsAPI.getByTrainer(user.id);
                    setTrainings(tr.data);
                } else {
                    const [enr, tr] = await Promise.all([
                        enrollmentsAPI.getMy(),
                        trainingsAPI.getAll()
                    ]);
                    setMyEnrollments(enr.data);
                    setTrainings(tr.data);
                }
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading dashboard...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>
                    {user.role === 'Admin' ? '⚡ Admin Dashboard' : user.role === 'Trainer' ? '🎓 Trainer Dashboard' : '👤 My Dashboard'}
                </h1>
                <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                    Welcome back, <span style={{ color: '#818cf8', fontWeight: 600 }}>{user.email.split('@')[0]}</span>
                </p>
            </div>

            {/* ADMIN STATS */}
            {user.role === 'Admin' && stats && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <StatCard icon="🎓" label="Total Trainings" value={stats.trainings.total} color="#4f46e5" sub={`${stats.trainings.ongoing} Ongoing`} />
                        <StatCard icon="📅" label="Upcoming" value={stats.trainings.upcoming} color="#06b6d4" sub="Scheduled" />
                        <StatCard icon="✅" label="Completed" value={stats.trainings.completed} color="#10b981" sub="Programs" />
                        <StatCard icon="👥" label="Total Enrollments" value={stats.enrollments.total} color="#7c3aed" sub={`${stats.enrollments.completed} Completed`} />
                        <StatCard icon="📈" label="Avg Progress" value={`${stats.enrollments.avgProgress}%`} color="#f59e0b" sub="Across all programs" />
                    </div>

                    {/* Charts */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#e2e8f0' }}>Training Status Overview</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={[
                                        { name: 'Upcoming', value: stats.trainings.upcoming },
                                        { name: 'Ongoing', value: stats.trainings.ongoing },
                                        { name: 'Completed', value: stats.trainings.completed },
                                    ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                        {['Upcoming','Ongoing','Completed'].map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#e2e8f0' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#e2e8f0' }}>Enrollment Stats</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={[
                                    { name: 'Total', value: stats.enrollments.total },
                                    { name: 'In Progress', value: stats.enrollments.inProgress },
                                    { name: 'Completed', value: stats.enrollments.completed },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#e2e8f0' }} />
                                    <Bar dataKey="value" fill="#4f46e5" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {/* TRAINER: Assigned Trainings */}
            {user.role === 'Trainer' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <StatCard icon="📚" label="Assigned Trainings" value={trainings.length} color="#4f46e5" sub="Total" />
                        <StatCard icon="🟢" label="Ongoing" value={trainings.filter(t => t.status === 'Ongoing').length} color="#10b981" sub="Active now" />
                        <StatCard icon="📅" label="Upcoming" value={trainings.filter(t => t.status === 'Upcoming').length} color="#06b6d4" sub="Scheduled" />
                    </div>
                </>
            )}

            {/* EMPLOYEE: My Enrollments */}
            {user.role === 'Employee' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <StatCard icon="📚" label="Enrolled" value={myEnrollments.length} color="#4f46e5" sub="Trainings" />
                        <StatCard icon="✅" label="Completed" value={myEnrollments.filter(e => e.completed).length} color="#10b981" sub="Finished" />
                        <StatCard icon="🔄" label="In Progress" value={myEnrollments.filter(e => !e.completed).length} color="#f59e0b" sub="Ongoing" />
                    </div>
                    {myEnrollments.length > 0 && (
                        <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#e2e8f0' }}>My Training Progress</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {myEnrollments.map(enr => (
                                    <div key={enr._id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 500 }}>{enr.trainingTitle || 'Training'}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>{enr.progress}%</span>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div className="progress-bar-fill" style={{ width: `${enr.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Recent Trainings Table */}
            <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#e2e8f0' }}>
                    {user.role === 'Trainer' ? 'My Assigned Trainings' : 'Recent Trainings'}
                </h3>
                {trainings.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No trainings found.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Start Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainings.slice(0, 8).map(t => (
                                    <tr key={t._id}>
                                        <td style={{ fontWeight: 500, color: '#e2e8f0' }}>{t.title}</td>
                                        <td>{t.category}</td>
                                        <td>{new Date(t.startDate).toLocaleDateString()}</td>
                                        <td><span className={`badge badge-${t.status.toLowerCase()}`}>{t.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color, sub }) {
    return (
        <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value}</p>
                    {sub && <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>{sub}</p>}
                </div>
                <div style={{
                    width: '44px', height: '44px', borderRadius: '10px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                    background: `${color}22`
                }}>{icon}</div>
            </div>
        </div>
    );
}
