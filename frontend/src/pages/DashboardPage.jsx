import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import TrainerDashboard from '../components/dashboards/TrainerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';

export default function DashboardPage() {
    const { user } = useAuth();

    if (user?.role === 'Admin') return <AdminDashboard />;
    if (user?.role === 'Trainer') return <TrainerDashboard />;
    return <EmployeeDashboard />;
}
