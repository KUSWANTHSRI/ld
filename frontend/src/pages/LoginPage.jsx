import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f1117 60%)', padding: '1rem'
        }}>
            {/* Decorative glow */}
            <div style={{
                position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                width: '600px', height: '300px',
                background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
                {/* Brand */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem'
                    }}>🎓</div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.25rem' }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>I&D Training Management System</p>
                </div>

                {/* Card */}
                <div className="glass" style={{ borderRadius: '1rem', padding: '2rem' }}>
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem',
                            color: '#f87171', fontSize: '0.875rem'
                        }}>{error}</div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="label">Email Address</label>
                            <input
                                id="login-email"
                                type="email"
                                className="input-field"
                                placeholder="you@company.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                        <button
                            id="login-submit"
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                        >
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.875rem' }}>
                        No account?{' '}
                        <Link to="/register" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
                            Register here
                        </Link>
                    </p>
                </div>

                {/* Demo credentials hint */}
                <div style={{
                    marginTop: '1rem', textAlign: 'center',
                    padding: '0.75rem', borderRadius: '0.5rem',
                    background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)'
                }}>
                    <p style={{ color: '#818cf8', fontSize: '0.75rem' }}>
                        Register first, then login with your credentials
                    </p>
                </div>
            </div>
        </div>
    );
}
