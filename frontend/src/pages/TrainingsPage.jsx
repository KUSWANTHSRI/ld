import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { trainingsAPI, usersAPI } from '../services/api';
import { Plus, Search, Filter, Edit2, Trash2, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_OPTIONS = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

const emptyForm = {
    title: '', description: '', trainerId: '', trainerName: '',
    startDate: '', endDate: '', capacity: 30, status: 'Upcoming', category: 'General'
};

export default function TrainingsPage() {
    const { user } = useAuth();
    const [trainings, setTrainings] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const canEdit = ['Admin', 'Trainer'].includes(user.role);
    const isAdmin = user.role === 'Admin';

    const fetchData = async () => {
        setLoading(true);
        try {
            let params = filterStatus ? { status: filterStatus } : {};
            const [trRes, usersRes] = await Promise.all([
                user.role === 'Trainer' ? trainingsAPI.getByTrainer(user.id) : trainingsAPI.getAll(params),
                isAdmin ? usersAPI.getAll({ role: 'Trainer' }) : Promise.resolve({ data: [] })
            ]);
            setTrainings(trRes.data);
            setTrainers(usersRes.data);
        } catch (err) {
            console.error("Backend offline, using mock data.", err);
            // Mock Fallback
            const mockTrainings = [
                { _id: '1', title: 'Advanced React Patterns', description: 'Deep dive into hooks and performance.', trainerName: 'Demo Admin', category: 'Frontend', startDate: '2024-11-01', endDate: '2024-11-05', status: 'Ongoing', capacity: 30 },
                { _id: '2', title: 'Kubernetes for Beginners', description: 'Container orchestration basics.', trainerName: 'John Doe', category: 'DevOps', startDate: '2024-12-10', endDate: '2024-12-15', status: 'Upcoming', capacity: 50 },
                { _id: '3', title: 'Leadership 101', description: 'Management training.', trainerName: 'Demo Admin', category: 'Soft Skills', startDate: '2024-01-01', endDate: '2024-01-05', status: 'Completed', capacity: 20 },
            ];
            
            if (filterStatus) {
                setTrainings(mockTrainings.filter(t => t.status === filterStatus));
            } else {
                setTrainings(mockTrainings);
            }
            
            setTrainers([
                { _id: 'admin_id', name: 'Demo Admin', email: 'admin@demo.com' },
                { _id: 't_id', name: 'John Doe', email: 'trainer@demo.com' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [filterStatus]);

    const filteredTrainings = trainings.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openCreate = () => {
        setForm(emptyForm);
        setEditTarget(null);
        setError('');
        setShowModal(true);
    };

    const openEdit = (t) => {
        setForm({
            title: t.title, description: t.description, trainerId: t.trainerId,
            trainerName: t.trainerName, startDate: t.startDate?.slice(0, 10),
            endDate: t.endDate?.slice(0, 10), capacity: t.capacity,
            status: t.status, category: t.category
        });
        setEditTarget(t._id);
        setError('');
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const payload = { ...form };
            if (!payload.trainerId && user.role === 'Trainer') payload.trainerId = user.id;

            const selectedTrainer = trainers.find(t => t._id === form.trainerId);
            if (selectedTrainer) payload.trainerName = selectedTrainer.name;

            if (editTarget) {
                await trainingsAPI.update(editTarget, payload);
            } else {
                await trainingsAPI.create(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save training.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this training?')) return;
        try {
            await trainingsAPI.delete(id);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete.');
        }
    };

    return (
        <div className="pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
                        <GraduationCap className="w-8 h-8 text-primary-600" />
                        Training Programs
                    </h1>
                    <p className="text-surface-500 mt-1">Manage and track all training sessions across the organization.</p>
                </div>
                {canEdit && (
                    <button className="btn-primary" onClick={openCreate}>
                        <Plus className="w-4 h-4" /> New Training
                    </button>
                )}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                    <button
                        onClick={() => setFilterStatus('')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            filterStatus === '' ? 'bg-primary-100 text-primary-700' : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'
                        }`}
                    >
                        All Trainings
                    </button>
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                filterStatus === s ? 'bg-primary-100 text-primary-700' : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search trainings..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none w-full sm:w-64"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-surface-500 flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                        Loading trainings...
                    </div>
                ) : filteredTrainings.length === 0 ? (
                    <div className="p-12 text-center text-surface-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mb-4">
                            <GraduationCap className="w-8 h-8 text-surface-400" />
                        </div>
                        <p className="text-lg font-medium text-surface-900 mb-1">No trainings found</p>
                        <p className="text-sm">Try adjusting your filters or create a new one.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-50/50 border-b border-surface-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Trainer</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Schedule</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                                    {canEdit && <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {filteredTrainings.map((t, index) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        key={t._id} 
                                        className="hover:bg-surface-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-surface-900">{t.title}</p>
                                            <p className="text-xs text-surface-500 mt-0.5 line-clamp-1 max-w-[250px]">{t.description}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-surface-600">{t.trainerName || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-100 text-surface-700">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-surface-600">
                                            <div className="flex flex-col">
                                                <span>{new Date(t.startDate).toLocaleDateString()}</span>
                                                <span className="text-xs text-surface-400">to {new Date(t.endDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                t.status === 'Upcoming' ? 'bg-amber-100 text-amber-700' :
                                                t.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' :
                                                t.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        {canEdit && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(t)} className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    {isAdmin && (
                                                        <button onClick={() => handleDelete(t._id)} className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-surface-100">
                                <h2 className="text-xl font-bold text-surface-900">
                                    {editTarget ? 'Edit Training' : 'Create New Training'}
                                </h2>
                            </div>
                            
                            <div className="p-6 overflow-y-auto">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
                                        {error}
                                    </div>
                                )}
                                
                                <form id="training-form" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="label">Training Title *</label>
                                        <input className="input-field" placeholder="e.g. Advanced React Patterns" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="label">Description</label>
                                        <textarea className="input-field min-h-[100px]" placeholder="What will they learn?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                    </div>
                                    
                                    {isAdmin ? (
                                        <div>
                                            <label className="label">Assign Trainer *</label>
                                            <select className="input-field" value={form.trainerId} onChange={e => setForm({ ...form, trainerId: e.target.value })} required>
                                                <option value="">Select trainer</option>
                                                {trainers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="label">Trainer</label>
                                            <input className="input-field bg-surface-50 text-surface-500 cursor-not-allowed" value={user.name || user.email} disabled />
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="label">Category</label>
                                        <input className="input-field" placeholder="e.g. Technical, Soft Skills" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                                    </div>
                                    
                                    <div>
                                        <label className="label">Start Date *</label>
                                        <input type="date" className="input-field" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                                    </div>
                                    
                                    <div>
                                        <label className="label">End Date *</label>
                                        <input type="date" className="input-field" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                                    </div>
                                    
                                    <div>
                                        <label className="label">Capacity (Students)</label>
                                        <input type="number" className="input-field" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} min={1} />
                                    </div>
                                    
                                    <div>
                                        <label className="label">Status</label>
                                        <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="p-6 border-t border-surface-100 flex justify-end gap-3 bg-surface-50 rounded-b-2xl">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" form="training-form" className="btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Create Training'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
