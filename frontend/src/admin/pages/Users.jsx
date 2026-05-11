// admin/pages/Users.jsx - DARKER UNIFIED CARDS
import { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import AdminLayout from '../components/AdminLayout';
import { showSuccess, showError } from '../../utils/toast';
import { Users as UsersIcon, ChevronLeft, ChevronRight, Shield, ShieldOff, Search, Mail, Calendar } from 'lucide-react';

// DARKER UNIFIED CARD
const GlassCard = ({ children }) => (
    <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        {children}
    </div>
);

// DARKER STAT CARD
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-white/40">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
                <Icon size={32} className="text-white/40" />
            </div>
        </div>
    </div>
);

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let filtered = users;
        if (searchTerm) {
            filtered = filtered.filter(
                (user) =>
                    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter((user) => (statusFilter === 'active' ? user.is_active : !user.is_active));
        }
        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, users]);

    // ✅ FIXED: Use the correct admin endpoint
    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('users/admin/users/');
            const usersData = response.data || [];
            setUsers(usersData);
            setFilteredUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
            showError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // ✅ FIXED: Use the correct admin endpoint for updating user status
    const toggleUserStatus = async (userId, currentStatus) => {
        setUpdatingId(userId);
        try {
            await axiosInstance.patch(`users/admin/users/${userId}/`, { is_active: !currentStatus });
            showSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
            setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u)));
        } catch (error) {
            console.error('Error updating user:', error);
            showError('Update failed');
        } finally {
            setUpdatingId(null);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
            </AdminLayout>
        );
    }

    const activeCount = users.filter((u) => u.is_active).length;
    const inactiveCount = users.length - activeCount;

    return (
        <AdminLayout>
            {/* Stats Overview - Darker Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <StatCard title="Total Users" value={users.length} icon={UsersIcon} />
                <StatCard title="Active Users" value={activeCount} icon={Shield} />
                <StatCard title="Inactive Users" value={inactiveCount} icon={ShieldOff} />
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1
                        className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                        Users
                    </h1>
                    <p className="text-white/40 text-sm">Manage your customer base • Total: {users.length}</p>
                </div>
                <div className="bg-black/30 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                    <span className="text-white/60 text-sm flex items-center gap-2">
                        <UsersIcon size={16} /> Total Users: {users.length}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-white/30"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-white">
                    <option value="all" className="bg-gray-900">
                        All Users
                    </option>
                    <option value="active" className="bg-gray-900">
                        Active Only
                    </option>
                    <option value="inactive" className="bg-gray-900">
                        Inactive Only
                    </option>
                </select>
            </div>

            {/* Users Table - Darker Card */}
            <GlassCard>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-black/20">
                            <tr className="border-b border-white/10">
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">
                                    Username
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">Joined</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition">
                                        <td className="px-6 py-4 text-sm text-white/50">#{user.id}</td>
                                        <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                                        <td className="px-6 py-4 text-sm text-white/50">{user.email || 'No email'}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    user.is_active
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/40">
                                            {new Date(user.date_joined).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                disabled={updatingId === user.id}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                                    user.is_active
                                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                                                } disabled:opacity-50`}>
                                                {updatingId === user.id ? (
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                ) : user.is_active ? (
                                                    <>
                                                        <ShieldOff size={14} /> Block
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield size={14} /> Unblock
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-white/40">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                        <p className="text-sm text-white/40">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of{' '}
                            {filteredUsers.length}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition">
                                <ChevronLeft size={18} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToPage(i + 1)}
                                    className={`px-3 py-1 rounded-lg transition ${
                                        currentPage === i + 1
                                            ? 'bg-white/20 text-white'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                    }`}>
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </GlassCard>
        </AdminLayout>
    );
}

export default AdminUsers;
