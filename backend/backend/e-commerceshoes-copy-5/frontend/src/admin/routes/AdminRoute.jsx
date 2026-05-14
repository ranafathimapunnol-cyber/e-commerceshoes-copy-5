import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {

    const isStaff = localStorage.getItem('is_staff');

    return isStaff === 'true'
        ? children
        : <Navigate to='/' />;
}

export default AdminRoute;