import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { Search, Filter, Edit2, Trash2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
                        <Users className="w-8 h-8 text-primary-600" />
                        Employee Management
                    </h1>
                    <p className="text-surface-500 mt-1">Manage users and roles across the organization</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {['Admin', 'Trainer', 'Employee'].map((role, idx) => {
                    const count = users.filter(u => u.role === role).length;
                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                            key={role} 
                            className="bg-white rounded-2xl p-5 shadow-sm border border-surface-200"
                        >
                            <p className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-1">{role}s</p>
                            <h3 className="text-3xl font-bold text-surface-900">{count}</h3>
                        </motion.div>
                    );
                })}
            </div>

            {/* Search + Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none w-full"
                    />
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                    {['', 'Admin', 'Trainer', 'Employee'].map(r => (
                        <button
                            key={r || 'all'}
                            onClick={() => setFilterRole(r)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                filterRole === r ? 'bg-primary-100 text-primary-700' : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'
                            }`}
                        >
                            {r || 'All Roles'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-surface-500 flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                        Loading users...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-surface-500">
                        <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-surface-400" />
                        </div>
                        <p className="text-lg font-medium text-surface-900 mb-1">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-50/50 border-b border-surface-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Joined</th>
                                    {isAdmin && <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {filteredUsers.map((u, index) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        key={u._id} 
                                        className="hover:bg-surface-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-primary-100 flex items-center justify-center text-primary-700 font-bold flex-shrink-0">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-surface-900">{u.name}</p>
                                                    <p className="text-xs text-surface-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-surface-600">{u.department || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                                u.role === 'Trainer' ? 'bg-blue-100 text-blue-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-surface-600">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(u)} className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(u._id)} className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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

            {/* Edit Modal */}
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
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-surface-100">
                                <h2 className="text-xl font-bold text-surface-900">Edit User Role</h2>
                            </div>
                            
                            <div className="p-6">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
                                        {error}
                                    </div>
                                )}
                                
                                <form id="user-form" onSubmit={handleSave} className="space-y-4">
                                    <div>
                                        <label className="label">Full Name</label>
                                        <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="label">Email</label>
                                        <input className="input-field bg-surface-50 text-surface-500 cursor-not-allowed" value={form.email} disabled />
                                    </div>
                                    <div>
                                        <label className="label">Department</label>
                                        <input className="input-field" placeholder="e.g. Engineering" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">Role</label>
                                        <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                            <option value="Employee">Employee</option>
                                            <option value="Trainer">Trainer</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="p-6 border-t border-surface-100 flex justify-end gap-3 bg-surface-50">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" form="user-form" className="btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Update User'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
