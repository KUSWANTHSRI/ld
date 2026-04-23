import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Employee', department: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await register(form);
            setSuccess('Account created! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f1117 60%)', padding: '1rem'
        }}>
            <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem'
                    }}>✨</div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.25rem' }}>Create Account</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Join the I&D Training Platform</p>
                </div>

                <div className="glass" style={{ borderRadius: '1rem', padding: '2rem' }}>
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#f87171', fontSize: '0.875rem' }}>{error}</div>
                    )}
                    {success && (
                        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#4ade80', fontSize: '0.875rem' }}>{success}</div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className="label">Full Name</label>
                                <input id="reg-name" type="text" className="input-field" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="label">Department</label>
                                <input id="reg-dept" type="text" className="input-field" placeholder="R&D" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="label">Email Address</label>
                            <input id="reg-email" type="email" className="input-field" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="label">Password</label>
                            <input id="reg-password" type="password" className="input-field" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">Role</label>
                            <select id="reg-role" className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                <option value="Employee">Employee</option>
                                <option value="Trainer">Trainer</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <button id="reg-submit" type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                            {loading ? 'Creating account...' : 'Create Account →'}
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.875rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
