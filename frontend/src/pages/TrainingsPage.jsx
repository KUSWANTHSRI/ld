import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { trainingsAPI, usersAPI } from '../services/api';

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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [filterStatus]);

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
            // Auto-fill trainerName if Admin selected a trainer
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
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>🎓 Training Programs</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage all training programs</p>
                </div>
                {canEdit && (
                    <button id="create-training-btn" className="btn-primary" onClick={openCreate}>+ New Training</button>
                )}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['', ...STATUS_OPTIONS].map(s => (
                    <button
                        key={s || 'all'}
                        onClick={() => setFilterStatus(s)}
                        style={{
                            padding: '0.4rem 1rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)',
                            background: filterStatus === s ? 'rgba(79,70,229,0.3)' : 'rgba(255,255,255,0.04)',
                            color: filterStatus === s ? '#818cf8' : '#94a3b8',
                            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500
                        }}
                    >{s || 'All'}</button>
                ))}
            </div>

            {/* Table */}
            <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>
                ) : trainings.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No trainings found. {canEdit && <span style={{ color: '#818cf8', cursor: 'pointer' }} onClick={openCreate}>Create one!</span>}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Trainer</th>
                                    <th>Category</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Capacity</th>
                                    <th>Status</th>
                                    {canEdit && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {trainings.map(t => (
                                    <tr key={t._id}>
                                        <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{t.title}</td>
                                        <td>{t.trainerName || '—'}</td>
                                        <td>{t.category}</td>
                                        <td>{new Date(t.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(t.endDate).toLocaleDateString()}</td>
                                        <td>{t.capacity}</td>
                                        <td><span className={`badge badge-${t.status.toLowerCase()}`}>{t.status}</span></td>
                                        {canEdit && (
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn-secondary" onClick={() => openEdit(t)}>Edit</button>
                                                    {isAdmin && <button className="btn-danger" onClick={() => handleDelete(t._id)}>Delete</button>}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '1.5rem' }}>
                            {editTarget ? 'Edit Training' : 'Create New Training'}
                        </h2>
                        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.85rem' }}>{error}</div>}
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">Title *</label>
                                    <input className="input-field" placeholder="Training title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">Description</label>
                                    <textarea className="input-field" rows={2} placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                                </div>
                                {isAdmin ? (
                                    <div>
                                        <label className="label">Trainer *</label>
                                        <select className="input-field" value={form.trainerId} onChange={e => setForm({ ...form, trainerId: e.target.value })} required>
                                            <option value="">Select trainer</option>
                                            {trainers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="label">Trainer ID</label>
                                        <input className="input-field" value={user.id} disabled />
                                    </div>
                                )}
                                <div>
                                    <label className="label">Category</label>
                                    <input className="input-field" placeholder="e.g. Safety, Tech" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
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
                                    <label className="label">Capacity</label>
                                    <input type="number" className="input-field" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} min={1} />
                                </div>
                                <div>
                                    <label className="label">Status</label>
                                    <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editTarget ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
