// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requireAdmin = true }) {
    const token = localStorage.getItem('access');
    const isAdmin = localStorage.getItem('isAdmin');
    
    // Check if user is logged in
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }
    
    // Check if admin (optional)
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }
    
    return children;
}

export default ProtectedRoute;