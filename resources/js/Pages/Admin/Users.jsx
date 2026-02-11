import { Head, router, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    IconUsers,
    IconTrash,
    IconSearch,
} from "@tabler/icons-react";
import { useState } from "react";

export default function Users({ users, plans }) {
    const [searchTerm, setSearchTerm] = useState("");

    const handleDelete = (userId) => {
        if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            router.delete(route("admin.users.delete", userId));
        }
    };

    const handlePlanChange = (userId, planId) => {
        if (confirm("Are you sure you want to change this user's plan?")) {
            router.patch(route("admin.users.update-plan", userId), {
                plan_id: planId,
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="All Users" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-10 pb-4 border-b-2 border-industrial-grey">
                <IconUsers className="text-industrial-grey" size={24} strokeWidth={2} />
                <h2 className="text-xl font-bold uppercase tracking-wider text-industrial-grey">
                    All Users
                </h2>
            </div>

            <div className="bg-white border-4 border-industrial-grey shadow-[8px_8px_0px_0px_rgba(42,42,42,1)]">
                <div className="p-6 border-b-4 border-industrial-grey flex justify-between items-center flex-wrap gap-4 bg-gray-50">
                    <h3 className="text-lg font-black text-industrial-grey uppercase">
                        User Management
                    </h3>
                    
                    {/* Search */}
                    <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-industrial-grey" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH USERS..."
                            className="pl-10 pr-4 py-2 bg-white border-2 border-industrial-grey text-industrial-grey text-sm font-bold uppercase tracking-wide focus:ring-0 focus:shadow-[4px_4px_0px_0px_#8B0000] focus:border-industrial-grey outline-none transition-all w-64 placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-industrial-grey text-white text-xs font-bold uppercase tracking-widest">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Current Plan</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-industrial-grey/10">
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 border-b border-industrial-grey/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 border-2 border-industrial-grey bg-white text-industrial-grey flex items-center justify-center font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(42,42,42,1)]">
                                                    {user.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-bold uppercase text-industrial-grey text-sm">{user.name}</div>
                                                    <div className="text-xs font-mono text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-b border-industrial-grey/20">
                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-bold uppercase border-2 tracking-wide ${
                                                user.role === 'admin' 
                                                ? 'bg-industrial-grey text-white border-industrial-grey'
                                                : 'bg-white text-industrial-grey border-industrial-grey'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-industrial-grey/20">
                                            <select
                                                value={user.plan_id || ""}
                                                onChange={(e) => handlePlanChange(user.id, e.target.value)}
                                                className="bg-white border-2 border-industrial-grey text-industrial-grey text-xs font-bold uppercase tracking-wide focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(42,42,42,1)] focus:border-industrial-grey block w-full p-2 cursor-pointer"
                                            >
                                                {plans.map((plan) => (
                                                    <option key={plan.id} value={plan.id}>
                                                        {plan.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-industrial-grey font-bold border-b border-industrial-grey/20">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right border-b border-industrial-grey/20">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-white bg-red-600 hover:bg-white hover:text-red-600 border-2 border-red-600 p-2 shadow-[2px_2px_0px_0px_#8B0000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                                                title="Delete User"
                                            >
                                                <IconTrash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-industrial-grey">
                                        <div className="flex flex-col items-center justify-center">
                                            <IconUsers size={64} className="text-gray-300 mb-6" strokeWidth={1} />
                                            <p className="text-xl font-black uppercase mb-1">No users found</p>
                                            <p className="text-sm font-mono">There are no registered users (excluding admins) yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (Simplified) */}
                {users.links && (
                    <div className="p-4 border-t-4 border-industrial-grey flex justify-center gap-2 bg-gray-50">
                        {users.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-4 py-2 text-xs font-bold uppercase border-2 border-industrial-grey transition-all duration-0 ${
                                        link.active
                                            ? "bg-industrial-grey text-white shadow-[2px_2px_0px_0px_rgba(42,42,42,1)]"
                                            : "bg-white text-industrial-grey hover:bg-industrial-grey hover:text-white"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-4 py-2 text-xs font-bold uppercase border-2 border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
