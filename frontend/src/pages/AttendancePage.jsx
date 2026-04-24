import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { trainingsAPI, enrollmentsAPI, attendanceAPI, usersAPI } from '../services/api';
import { motion } from 'framer-motion';
import { ClipboardCheck, CalendarCheck, UserPlus, TrendingUp, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
    const [tab, setTab] = useState('mark'); // 'mark' | 'enroll' | 'progress' | 'report' | 'my' | 'myatt'
    const [enrollForm, setEnrollForm] = useState({ userId: '', trainingId: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const canManage = ['Admin', 'Trainer'].includes(user.role);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const trRes = await trainingsAPI.getAll();
                setTrainings(trRes.data);

                if (canManage) {
                    const [empRes, enrRes] = await Promise.all([
                        usersAPI.getAll({ role: 'Employee' }),
                        enrollmentsAPI.getAll()
                    ]);
                    setEmployees(empRes.data);
                    setEnrollments(enrRes.data);
                    setTab('mark');
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
                console.error("Backend offline, using mock data.", err);
                setTrainings([
                    { _id: '1', title: 'Advanced React Patterns' },
                    { _id: '2', title: 'Communication Skills' }
                ]);
                if (canManage) {
                    setEmployees([{ _id: 'e1', name: 'John Doe', email: 'employee@demo.com' }]);
                    setEnrollments([{ _id: 'en1', userId: 'e1', userName: 'John Doe', trainingId: '1', trainingTitle: 'Advanced React Patterns', progress: 45, completed: false }]);
                    setTab('mark');
                } else {
                    setEnrollments([
                        { _id: '1', trainingTitle: 'Communication Skills', progress: 100, completed: true, enrolledAt: '2024-01-10' },
                        { _id: '2', trainingTitle: 'Advanced React', progress: 45, completed: false, enrolledAt: '2024-10-15' },
                    ]);
                    setMyAttendance([
                        { _id: 'a1', trainingId: 'Advanced React', date: '2024-10-16', present: true },
                        { _id: 'a2', trainingId: 'Communication Skills', date: '2024-01-11', present: true },
                        { _id: 'a3', trainingId: 'Advanced React', date: '2024-10-17', present: false },
                    ]);
                    setTab('my');
                }
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [canManage]);

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
        setMsg({ text: '', type: '' });
        try {
            const emp = employees.find(e => e._id === enrollForm.userId);
            const tr = trainings.find(t => t._id === enrollForm.trainingId);
            await enrollmentsAPI.enroll({
                userId: enrollForm.userId,
                userName: emp?.name || '',
                trainingId: enrollForm.trainingId,
                trainingTitle: tr?.title || ''
            });
            setMsg({ text: 'Employee enrolled successfully!', type: 'success' });
            const enrRes = await enrollmentsAPI.getAll();
            setEnrollments(enrRes.data);
            setEnrollForm({ userId: '', trainingId: '' });
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Enrollment failed.', type: 'error' });
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
        try {
            await enrollmentsAPI.unenroll(id);
            const enrRes = await enrollmentsAPI.getAll();
            setEnrollments(enrRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const TABS = canManage
        ? [
            { id: 'mark', label: 'Mark Attendance', icon: CalendarCheck }, 
            { id: 'qr', label: 'Live QR Attendance', icon: ClipboardCheck },
            { id: 'enroll', label: 'Enroll', icon: UserPlus }, 
            { id: 'progress', label: 'Progress', icon: TrendingUp }, 
            { id: 'report', label: 'Report', icon: FileText }
          ]
        : [
            { id: 'my', label: 'My Enrollments', icon: TrendingUp }, 
            { id: 'myatt', label: 'My Attendance', icon: CalendarCheck }
          ];

    if (loading) return (
        <div className="p-12 text-center text-surface-500 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            Loading data...
        </div>
    );

    return (
        <div className="pb-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
                    <ClipboardCheck className="w-8 h-8 text-primary-600" />
                    Attendance & Progress
                </h1>
                <p className="text-surface-500 mt-1">Track attendance, manage enrollments, and monitor completion.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar border-b border-surface-200">
                {TABS.map(t => {
                    const Icon = t.icon;
                    return (
                        <button 
                            key={t.id} 
                            onClick={() => setTab(t.id)} 
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                tab === t.id 
                                    ? 'border-primary-600 text-primary-600 bg-primary-50/50' 
                                    : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    )
                })}
            </div>

            {/* ── MARK ATTENDANCE ── */}
            {tab === 'mark' && canManage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200 flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="label">Select Training Session</label>
                            <select className="input-field" value={selectedTraining} onChange={e => setSelectedTraining(e.target.value)}>
                                <option value="">-- Choose Training --</option>
                                {trainings.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                            </select>
                        </div>
                        <div className="w-full md:w-64">
                            <label className="label">Date</label>
                            <input type="date" className="input-field" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
                        </div>
                    </div>

                    {selectedTraining && (
                        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                            <div className="p-4 border-b border-surface-200 bg-surface-50/50">
                                <h3 className="font-semibold text-surface-900">
                                    Enrolled Participants — {new Date(attendanceDate).toDateString()}
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface-50/50 border-b border-surface-200">
                                            <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Participant</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase text-center">Attendance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-100">
                                        {getTrainingEnrollments().length === 0 ? (
                                            <tr><td colSpan={2} className="px-6 py-8 text-center text-surface-500">No one enrolled in this training yet.</td></tr>
                                        ) : getTrainingEnrollments().map(enr => (
                                            <tr key={enr._id} className="hover:bg-surface-50/50">
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-surface-900">{enr.userName || enr.userId}</p>
                                                    <p className="text-xs text-surface-500">{enr.userId}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => toggleAttendance(enr)}
                                                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                                            isPresent(enr.userId) 
                                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                                                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                                        }`}
                                                    >
                                                        {isPresent(enr.userId) ? <><CheckCircle2 className="w-4 h-4" /> Present</> : <><XCircle className="w-4 h-4" /> Absent</>}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ── LIVE QR ATTENDANCE ── */}
            {tab === 'qr' && canManage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200">
                        <h3 className="text-lg font-bold text-surface-900 mb-6">Live QR Code Session</h3>
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1 w-full space-y-4">
                                <div>
                                    <label className="label">Select Training to Start Live Session</label>
                                    <select className="input-field" value={selectedTraining} onChange={e => setSelectedTraining(e.target.value)}>
                                        <option value="">-- Choose Training --</option>
                                        {trainings.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                                    </select>
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="text-sm text-blue-700 font-medium mb-2">Instructions:</p>
                                    <ul className="text-sm text-blue-600 list-disc list-inside space-y-1">
                                        <li>Select a training to generate the live QR code.</li>
                                        <li>Project this screen to the employees in the room.</li>
                                        <li>Employees can scan it from their dashboards to mark themselves present instantly.</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="w-full md:w-80 flex flex-col items-center justify-center p-8 border-2 border-dashed border-surface-300 rounded-2xl bg-surface-50">
                                {selectedTraining ? (
                                    <div className="bg-white p-4 rounded-xl shadow-sm">
                                        <QRCodeSVG 
                                            value={JSON.stringify({ trainingId: selectedTraining, date: attendanceDate })} 
                                            size={200}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center text-surface-400">
                                        <ClipboardCheck className="w-16 h-16 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Select a training to generate QR</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── ENROLL ── */}
            {tab === 'enroll' && canManage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200">
                            <h3 className="text-lg font-bold text-surface-900 mb-6">Enroll Employee</h3>
                            {msg.text && (
                                <div className={`p-4 rounded-xl text-sm mb-6 ${
                                    msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                    {msg.text}
                                </div>
                            )}
                            <form onSubmit={handleEnroll} className="space-y-4">
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
                                <button type="submit" className="btn-primary w-full mt-2" disabled={saving}>
                                    {saving ? 'Enrolling...' : 'Enroll Employee'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                            <div className="p-5 border-b border-surface-200 bg-surface-50/50 flex justify-between items-center">
                                <h3 className="font-semibold text-surface-900">Recent Enrollments</h3>
                                <span className="text-xs font-medium bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full">{enrollments.length} Total</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface-50/50 border-b border-surface-200">
                                            <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Employee</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Training</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-100">
                                        {enrollments.slice(0, 10).map(enr => (
                                            <tr key={enr._id} className="hover:bg-surface-50/50">
                                                <td className="px-6 py-4 font-medium text-surface-900">{enr.userName || enr.userId}</td>
                                                <td className="px-6 py-4 text-sm text-surface-600">{enr.trainingTitle}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        enr.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {enr.completed ? 'Completed' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleUnenroll(enr._id)} className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-200">
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── PROGRESS ── */}
            {tab === 'progress' && canManage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                    <div className="p-5 border-b border-surface-200 bg-surface-50/50">
                        <h3 className="font-semibold text-surface-900">Update Student Progress</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-50/50 border-b border-surface-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Employee</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Training</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase w-1/3">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {enrollments.map(enr => (
                                    <tr key={enr._id} className="hover:bg-surface-50/50">
                                        <td className="px-6 py-4 font-medium text-surface-900">{enr.userName || enr.userId}</td>
                                        <td className="px-6 py-4 text-sm text-surface-600">{enr.trainingTitle}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range" min="0" max="100" defaultValue={enr.progress}
                                                    className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                                    onMouseUp={e => handleProgressUpdate(enr._id, e.target.value)}
                                                    onTouchEnd={e => handleProgressUpdate(enr._id, e.target.value)}
                                                />
                                                <span className="text-sm font-bold text-primary-600 w-12">{enr.progress}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* ── REPORT ── */}
            {tab === 'report' && canManage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200 max-w-md">
                        <label className="label">Select Training for Report</label>
                        <select className="input-field" value={selectedTraining} onChange={e => setSelectedTraining(e.target.value)}>
                            <option value="">-- Choose Training --</option>
                            {trainings.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                        </select>
                    </div>

                    {report && (
                        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                            <div className="p-6 border-b border-surface-200 bg-surface-50/50 grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Total Days</p>
                                    <p className="text-3xl font-bold text-surface-900">{report.totalDays}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Participants</p>
                                    <p className="text-3xl font-bold text-surface-900">{report.report?.length || 0}</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface-50/50 border-b border-surface-200">
                                            <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Employee</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase text-center">Days Present</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase text-center">Attendance Rate</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-100">
                                        {report.report?.length === 0 ? (
                                            <tr><td colSpan={4} className="px-6 py-8 text-center text-surface-500">No report data available.</td></tr>
                                        ) : report.report?.map((r, i) => (
                                            <tr key={i} className="hover:bg-surface-50/50">
                                                <td className="px-6 py-4 font-medium text-surface-900">{r.userName || r.userId}</td>
                                                <td className="px-6 py-4 text-center text-surface-600">{r.daysPresent} / {r.totalDays}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm ${
                                                        r.attendancePercent >= 75 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                                                    }`}>
                                                        {r.attendancePercent}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        r.completed ? 'bg-blue-100 text-blue-700' : 'bg-surface-100 text-surface-600'
                                                    }`}>
                                                        {r.completed ? 'Completed' : 'In Progress'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ── MY ENROLLMENTS (Employee) ── */}
            {tab === 'my' && !canManage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {enrollments.length === 0 ? (
                        <div className="bg-white p-12 text-center text-surface-500 rounded-2xl border border-surface-200 shadow-sm">
                            You are not enrolled in any trainings yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {enrollments.map(enr => (
                                <div key={enr._id} className="bg-white rounded-2xl p-6 shadow-sm border border-surface-200 hover:border-primary-300 transition-colors group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-bold text-lg text-surface-900 group-hover:text-primary-600 transition-colors">{enr.trainingTitle}</h3>
                                            <p className="text-sm text-surface-500 mt-1">Enrolled: {new Date(enr.enrolledAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                            enr.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {enr.completed ? 'Completed' : 'In Progress'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm font-semibold text-surface-700 mb-2">
                                            <span>Course Progress</span>
                                            <span className="text-primary-600">{enr.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-surface-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${enr.completed ? 'bg-emerald-500' : 'bg-primary-500'}`}
                                                style={{ width: `${enr.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* ── MY ATTENDANCE (Employee) ── */}
            {tab === 'myatt' && !canManage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-50/50 border-b border-surface-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Training ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {myAttendance.length === 0 ? (
                                    <tr><td colSpan={3} className="px-6 py-8 text-center text-surface-500">No attendance records found.</td></tr>
                                ) : myAttendance.map(a => (
                                    <tr key={a._id} className="hover:bg-surface-50/50">
                                        <td className="px-6 py-4 font-mono text-xs text-surface-500">{a.trainingId}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-surface-900">{new Date(a.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                a.present ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                            }`}>
                                                {a.present ? <><CheckCircle2 className="w-3.5 h-3.5"/> Present</> : <><XCircle className="w-3.5 h-3.5"/> Absent</>}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* ── SCAN QR CODE (Employee) ── */}
            {tab === 'qrscan' && !canManage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-surface-200 max-w-md mx-auto text-center">
                        <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-primary-600" />
                        <h3 className="text-xl font-bold text-surface-900 mb-2">Scan Live QR Code</h3>
                        <p className="text-sm text-surface-500 mb-6">Point your camera at the QR code on the trainer's screen to instantly mark your attendance.</p>
                        
                        {msg.text && (
                            <div className={`p-4 rounded-xl text-sm mb-6 ${
                                msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {msg.text}
                            </div>
                        )}

                        <div className="w-full h-64 bg-surface-100 border-2 border-dashed border-surface-300 rounded-xl flex items-center justify-center mb-6">
                            <p className="text-surface-400 font-medium">Camera Feed (Mocked)</p>
                        </div>
                        
                        <button 
                            className="btn-primary w-full"
                            onClick={() => {
                                setMsg({ text: 'Attendance marked successfully via QR!', type: 'success' });
                            }}
                        >
                            Simulate Scan
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
