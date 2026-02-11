import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    IconLayoutDashboard,
    IconUsers,
    IconCreditCard,
    IconFileText,
} from "@tabler/icons-react";

export default function Dashboard({ stats, plans }) {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-10 pb-4 border-b-2 border-industrial-grey">
                <IconLayoutDashboard className="text-industrial-grey" size={24} strokeWidth={2} />
                <h2 className="text-xl font-bold uppercase tracking-wider text-industrial-grey">
                    Admin Dashboard
                </h2>
            </div>

            <div className="mb-12">
                <h1 className="text-5xl font-black text-industrial-grey uppercase mb-2">
                    System Overview
                </h1>
                <p className="text-industrial-grey font-mono">
                    Manage users and monitor system statistics.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-8 border-4 border-industrial-grey shadow-[8px_8px_0px_0px_rgba(42,42,42,1)] flex items-start justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] transition-all duration-0">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-industrial-grey mb-4">
                            Total Users
                        </p>
                        <h3 className="text-4xl font-black text-industrial-grey">
                            {stats.total_users}
                        </h3>
                    </div>
                    <div className="p-3 border-2 border-industrial-grey bg-white text-industrial-grey">
                        <IconUsers size={24} strokeWidth={2} />
                    </div>
                </div>

                <div className="bg-white p-8 border-4 border-industrial-grey shadow-[8px_8px_0px_0px_rgba(42,42,42,1)] flex items-start justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] transition-all duration-0">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-industrial-grey mb-4">
                            Active Subs
                        </p>
                        <h3 className="text-4xl font-black text-industrial-grey">
                            {stats.active_subscriptions}
                        </h3>
                    </div>
                    <div className="p-3 border-2 border-industrial-grey bg-white text-industrial-grey">
                        <IconCreditCard size={24} strokeWidth={2} />
                    </div>
                </div>

                <div className="bg-white p-8 border-4 border-industrial-grey shadow-[8px_8px_0px_0px_rgba(42,42,42,1)] flex items-start justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] transition-all duration-0">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-industrial-grey mb-4">
                            Total PDFs
                        </p>
                        <h3 className="text-4xl font-black text-industrial-grey">
                            {stats.total_pdfs}
                        </h3>
                    </div>
                    <div className="p-3 border-2 border-industrial-grey bg-white text-industrial-grey">
                        <IconFileText size={24} strokeWidth={2} />
                    </div>
                </div>
            </div>

            {/* Plans Overview */}
            <div>
                <h2 className="text-2xl font-black text-industrial-grey uppercase mb-8">
                    Plans Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-white p-8 border-4 border-industrial-grey flex flex-col"
                        >
                            <h3 className="text-xl font-bold text-industrial-grey uppercase mb-4">
                                {plan.name}
                            </h3>
                            <div className="mb-6 border-b-2 border-dashed border-industrial-grey pb-6">
                                <span className="text-4xl font-black text-industrial-grey">
                                    ${plan.price}
                                </span>
                                <span className="text-industrial-grey text-xs font-bold uppercase tracking-wider">
                                    /mo
                                </span>
                            </div>
                            <div className="text-sm font-bold uppercase tracking-wide text-industrial-grey">
                                {plan.user_count}{" "}
                                {plan.user_count === 1 ? "user" : "users"}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
