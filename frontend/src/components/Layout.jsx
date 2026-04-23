import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { label: 'Dashboard',   path: '/dashboard',  icon: '📊', roles: ['Admin','Trainer','Employee'] },
    { label: 'Trainings',   path: '/trainings',  icon: '🎓', roles: ['Admin','Trainer','Employee'] },
    { label: 'Employees',   path: '/employees',  icon: '👥', roles: ['Admin','Trainer'] },
    { label: 'Attendance',  path: '/attendance', icon: '📋', roles: ['Admin','Trainer','Employee'] },
];

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const roleClass = {
        Admin: 'badge-admin',
        Trainer: 'badge-trainer',
        Employee: 'badge-employee',
    }[user?.role] || 'badge-employee';

    const visibleItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '240px', flexShrink: 0, background: '#13151f',
                borderRight: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem'
            }}>
                {/* Logo */}
                <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(135deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        I&D Training
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>Management System</div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {visibleItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User info */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <div style={{ padding: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>
                            {user?.email?.split('@')[0]}
                        </div>
                        <span className={`badge ${roleClass}`}>{user?.role}</span>
                    </div>
                    <button onClick={handleLogout} className="btn-danger" style={{ width: '100%', textAlign: 'center' }}>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto', background: '#0f1117' }}>
                {children}
            </main>
        </div>
    );
}
