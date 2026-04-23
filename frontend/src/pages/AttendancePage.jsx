import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { trainingsAPI, enrollmentsAPI, attendanceAPI, usersAPI } from '../services/api';

export default function AttendancePage() {
    const { user } = useAuth();
    const [trainings, setTrainings] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [myAttendance, setMyAttendance] = useState([]);
    const [selectedTraining, setSelectedTraining] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('mark'); // 'mark' | 'enroll' | 'report' | 'my'
    const [enrollForm, setEnrollForm] = useState({ userId: '', trainingId: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const canManage = ['Admin', 'Trainer'].includes(user.role);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const [trRes] = await Promise.all([
                    canManage ? trainingsAPI.getAll() : trainingsAPI.getAll()
                ]);
                setTrainings(trRes.data);

                if (canManage) {
                    const [empRes, enrRes] = await Promise.all([
                        usersAPI.getAll({ role: 'Employee' }),
                        enrollmentsAPI.getAll()
                    ]);
                    setEmployees(empRes.data);
                    setEnrollments(enrRes.data);
                } else {
                    const [enrRes, attRes] = await Promise.all([
                        enrollmentsAPI.getMy(),
                        attendanceAPI.getMy()
                    ]);
                    setEnrollments(enrRes.data);
                    setMyAttendance(attRes.data);
                    setTab('my');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchAttendanceForDate = async () => {
        if (!selectedTraining) return;
        try {
            const res = await attendanceAPI.getByTraining(selectedTraining, attendanceDate);
            setAttendanceRecords(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (selectedTraining && tab === 'mark') fetchAttendanceForDate();
        if (selectedTraining && tab === 'report') fetchReport();
    }, [selectedTraining, attendanceDate, tab]);

    const fetchReport = async () => {
        try {
            const res = await attendanceAPI.getReport(selectedTraining);
            setReport(res.data);
        } catch (err) { console.error(err); }
    };

    const getTrainingEnrollments = () =>
        enrollments.filter(e => e.trainingId === selectedTraining);

    const isPresent = (userId) =>
        attendanceRecords.find(a => a.userId === userId)?.present || false;

    const toggleAttendance = async (emp) => {
        const current = isPresent(emp.userId || emp._id);
        try {
            await attendanceAPI.mark({
                userId: emp.userId || emp._id,
                trainingId: selectedTraining,
                date: attendanceDate,
                present: !current
            });
            fetchAttendanceForDate();
        } catch (err) {
            alert(err.response?.data?.message || 'Error marking attendance');
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg('');
        try {
            const emp = employees.find(e => e._id === enrollForm.userId);
            const tr = trainings.find(t => t._id === enrollForm.trainingId);
            await enrollmentsAPI.enroll({
                userId: enrollForm.userId,
                userName: emp?.name || '',
                trainingId: enrollForm.trainingId,
                trainingTitle: tr?.title || ''
            });
            setMsg('Employee enrolled successfully!');
            const enrRes = await enrollmentsAPI.getAll();
            setEnrollments(enrRes.data);
            setEnrollForm({ userId: '', trainingId: '' });
        } catch (err) {
            setMsg(err.response?.data?.message || 'Enrollment failed.');
        } finally {
            setSaving(false);
        }
    };

    const handleProgressUpdate = async (enrollmentId, progress) => {
        try {
            await enrollmentsAPI.updateProgress(enrollmentId, Number(progress));
            const enrRes = canManage ? await enrollmentsAPI.getAll() : await enrollmentsAPI.getMy();
            setEnrollments(enrRes.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update progress');
        }
    };

    const handleUnenroll = async (id) => {
        if (!window.confirm('Remove this enrollment?')) return;
        await enrollmentsAPI.unenroll(id);
        const enrRes = await enrollmentsAPI.getAll();
        setEnrollments(enrRes.data);
    };

    const TABS = canManage
        ? [{ id: 'mark', label: '📋 Mark Attendance' }, { id: 'enroll', label: '➕ Enroll' }, { id: 'progress', label: '📈 Progress' }, { id: 'report', label: '📊 Report' }]
        : [{ id: 'my', label: '📚 My Enrollments' }, { id: 'myatt', label: '🗓 My Attendance' }];

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>📋 Attendance & Progress</h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Track attendance, enrollments, and completion</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0.5rem' }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                        padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none',
                        background: tab === t.id ? 'rgba(79,70,229,0.25)' : 'transparent',
                        color: tab === t.id ? '#818cf8' : '#64748b',
                        cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                        borderBottom: tab === t.id ? '2px solid #818cf8' : '2px solid transparent'
                    }}>{t.label}</button>
                ))}
            </div>

            {/* ── MARK ATTENDANCE ── */}
            {tab === 'mark' && canManage && (
                <div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label className="label">Select Training</label>
                            <select className="input-field" value={selectedTraining} onChange={e => setSelectedTraining(e.target.value)}>
                                <option value="">-- Choose Training --</option>
                                {trainings.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Date</label>
                            <input type="date" className="input-field" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
                        </div>
                    </div>
                    {selectedTraining && (
                        <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0' }}>
                                    Enrolled participants — {new Date(attendanceDate).toDateString()}
                                </span>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table>
                                    <thead><tr><th>Name</th><th>User ID</th><th>Attendance</th></tr></thead>
                                    <tbody>
                                        {getTrainingEnrollments().length === 0 ? (
                                            <tr><td colSpan={3} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No one enrolled in this training yet.</td></tr>
                                        ) : getTrainingEnrollments().map(enr => (
                                            <tr key={enr._id}>
                                                <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{enr.userName || enr.userId}</td>
                                                <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{enr.userId}</td>
                                                <td>
                                                    <button
                                                        onClick={() => toggleAttendance(enr)}
                                                        style={{
                                                            padding: '0.35rem 1rem', borderRadius: '9999px', border: 'none',
                                                            background: isPresent(enr.userId) ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.1)',
                                                            color: isPresent(enr.userId) ? '#4ade80' : '#f87171',
                                                            cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                                                        }}
                                                    >{isPresent(enr.userId) ? '✅ Present' : '❌ Absent'}</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── ENROLL ── */}
            {tab === 'enroll' && canManage && (
                <div style={{ maxWidth: '520px' }}>
                    <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Enroll Employee into Training</h3>
                        {msg && (
                            <div style={{
                                background: msg.includes('success') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                border: `1px solid ${msg.includes('success') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem',
                                color: msg.includes('success') ? '#4ade80' : '#f87171', fontSize: '0.85rem'
                            }}>{msg}</div>
                        )}
                        <form onSubmit={handleEnroll}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="label">Employee</label>
                                    <select className="input-field" value={enrollForm.userId} onChange={e => setEnrollForm({ ...enrollForm, userId: e.target.value })} required>
                                        <option value="">-- Select Employee --</option>
                                        {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.email})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Training</label>
                                    <select className="input-field" value={enrollForm.trainingId} onChange={e => setEnrollForm({ ...enrollForm, trainingId: e.target.value })} required>
                                        <option value="">-- Select Training --</option>
                                        {trainings.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                                    {saving ? 'Enrolling...' : 'Enroll Employee'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* All Enrollments */}
                    <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>All Enrollments ({enrollments.length})</span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table>
                                <thead><tr><th>Employee</th><th>Training</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {enrollments.slice(0, 20).map(enr => (
                                        <tr key={enr._id}>
                                            <td style={{ fontWeight: 500 }}>{enr.userName || enr.userId}</td>
                                            <td style={{ color: '#94a3b8' }}>{enr.trainingTitle}</td>
                                            <td style={{ minWidth: '120px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div className="progress-bar-bg" style={{ flex: 1 }}>
                                                        <div className="progress-bar-fill" style={{ width: `${enr.progress}%` }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>{enr.progress}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${enr.completed ? 'badge-completed' : 'badge-ongoing'}`}>
                                                    {enr.completed ? 'Done' : 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-danger" onClick={() => handleUnenroll(enr._id)}>Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PROGRESS ── */}
            {tab === 'progress' && canManage && (
                <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Update Employee Progress</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead><tr><th>Employee</th><th>Training</th><th>Progress</th><th>Update</th></tr></thead>
                            <tbody>
                                {enrollments.map(enr => (
                                    <tr key={enr._id}>
                                        <td style={{ fontWeight: 500 }}>{enr.userName || enr.userId}</td>
                                        <td style={{ color: '#94a3b8' }}>{enr.trainingTitle}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div className="progress-bar-bg" style={{ width: '100px' }}>
                                                    <div className="progress-bar-fill" style={{ width: `${enr.progress}%` }} />
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>{enr.progress}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="range" min="0" max="100" defaultValue={enr.progress}
                                                    style={{ accentColor: '#4f46e5', width: '100px' }}
                                                    onMouseUp={e => handleProgressUpdate(enr._id, e.target.value)}
                                                    onTouchEnd={e => handleProgressUpdate(enr._id, e.target.value)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── REPORT ── */}
            {tab === 'report' && canManage && (
                <div>
                    <div style={{ marginBottom: '1.5rem', maxWidth: '300px' }}>
                        <label className="label">Select Training</label>
                        <select className="input-field" value={selectedTraining} onChange={e => setSelectedTraining(e.target.value)}>
                            <option value="">-- Choose Training --</option>
                            {trainings.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                        </select>
                    </div>
                    {report && (
                        <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '2rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Session Days</span>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>{report.totalDays}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Participants</span>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>{report.report?.length}</div>
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table>
                                    <thead><tr><th>Employee</th><th>Days Present</th><th>Attendance %</th><th>Progress</th><th>Completed</th></tr></thead>
                                    <tbody>
                                        {report.report?.map((r, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 500 }}>{r.userName || r.userId}</td>
                                                <td>{r.daysPresent} / {r.totalDays}</td>
                                                <td>
                                                    <span style={{ color: r.attendancePercent >= 75 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                                                        {r.attendancePercent}%
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div className="progress-bar-bg" style={{ width: '80px' }}>
                                                            <div className="progress-bar-fill" style={{ width: `${r.progress}%` }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>{r.progress}%</span>
                                                    </div>
                                                </td>
                                                <td>{r.completed ? <span className="badge badge-completed">✅ Yes</span> : <span className="badge badge-upcoming">No</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── MY ENROLLMENTS (Employee) ── */}
            {tab === 'my' && !canManage && (
                <div>
                    {enrollments.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>You are not enrolled in any trainings yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {enrollments.map(enr => (
                                <div key={enr._id} className="glass card-hover" style={{ borderRadius: '1rem', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '0.25rem' }}>{enr.trainingTitle}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Enrolled: {new Date(enr.enrolledAt).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ minWidth: '200px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Progress</span>
                                            <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>{enr.progress}%</span>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div className="progress-bar-fill" style={{ width: `${enr.progress}%` }} />
                                        </div>
                                    </div>
                                    <span className={`badge ${enr.completed ? 'badge-completed' : 'badge-ongoing'}`}>
                                        {enr.completed ? '✅ Completed' : '🔄 In Progress'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── MY ATTENDANCE (Employee) ── */}
            {tab === 'myatt' && !canManage && (
                <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead><tr><th>Training ID</th><th>Date</th><th>Status</th></tr></thead>
                            <tbody>
                                {myAttendance.length === 0 ? (
                                    <tr><td colSpan={3} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No attendance records yet.</td></tr>
                                ) : myAttendance.map(a => (
                                    <tr key={a._id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>{a.trainingId}</td>
                                        <td>{new Date(a.date).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                                                background: a.present ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)',
                                                color: a.present ? '#4ade80' : '#f87171'
                                            }}>{a.present ? 'Present' : 'Absent'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
