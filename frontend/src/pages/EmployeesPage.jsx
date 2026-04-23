import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

const emptyForm = { name: '', email: '', department: '', role: 'Employee' };

export default function EmployeesPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [filterRole, setFilterRole] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const isAdmin = user.role === 'Admin';

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = filterRole ? { role: filterRole } : {};
            const res = await usersAPI.getAll(params);
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [filterRole]);

    const openEdit = (u) => {
        setForm({ name: u.name, email: u.email, department: u.department || '', role: u.role });
        setEditTarget(u._id);
        setError('');
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await usersAPI.update(editTarget, form);
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user? This cannot be undone.')) return;
        try {
            await usersAPI.delete(id);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user.');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>👥 Employee Management</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage users and roles across the organization</p>
                </div>
            </div>

            {/* Search + Filter Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    className="input-field"
                    style={{ maxWidth: '280px' }}
                    placeholder="🔍 Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['', 'Admin', 'Trainer', 'Employee'].map(r => (
                        <button
                            key={r || 'all'}
                            onClick={() => setFilterRole(r)}
                            style={{
                                padding: '0.4rem 1rem', borderRadius: '9999px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: filterRole === r ? 'rgba(79,70,229,0.3)' : 'rgba(255,255,255,0.04)',
                                color: filterRole === r ? '#818cf8' : '#94a3b8',
                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500
                            }}
                        >{r || 'All Roles'}</button>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {['Admin', 'Trainer', 'Employee'].map(role => (
                    <div key={role} className="stat-card" style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>{role}s</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginTop: '0.25rem' }}>
                            {users.filter(u => u.role === role).length}
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No users found.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    {isAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0
                                                }}>
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#94a3b8' }}>{u.email}</td>
                                        <td>{u.department || '—'}</td>
                                        <td><span className={`badge badge-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                                        <td style={{ color: '#64748b' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        {isAdmin && (
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn-secondary" onClick={() => openEdit(u)}>Edit</button>
                                                    <button className="btn-danger" onClick={() => handleDelete(u._id)}>Delete</button>
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

            {/* Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '1.5rem' }}>Edit User</h2>
                        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.85rem' }}>{error}</div>}
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="label">Full Name</label>
                                    <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="label">Email</label>
                                    <input className="input-field" value={form.email} disabled style={{ opacity: 0.6 }} />
                                </div>
                                <div>
                                    <label className="label">Department</label>
                                    <input className="input-field" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Role</label>
                                    <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                        <option value="Employee">Employee</option>
                                        <option value="Trainer">Trainer</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Update User'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
