import { Link, usePage } from "@inertiajs/react";
import {
    IconLayoutDashboard,
    IconHistory,
    IconCreditCard,
    IconLogout,
    IconFolder,
    IconBook,
    IconX,
    IconFile,
} from "@tabler/icons-react";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function DashboardLayout({ children, userStats = { pdf_count: 0, pdf_limit: 50, summary_count: 0 }, plan = { name: "Standard", price: 9.99 } }) {
    const user = usePage().props.auth.user;
    const { url } = usePage();

    return (
        <div className="flex h-screen bg-industrial-white font-sans text-industrial-grey selection:bg-industrial-grey selection:text-white">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r-4 border-industrial-grey flex flex-col fixed inset-y-0 left-0 z-10">
                <div className="p-8 border-b-4 border-industrial-grey">
                    <div className="flex items-center gap-3">
                        <div className="p-2 border-2 border-industrial-grey bg-white shadow-[2px_2px_0px_0px_rgba(42,42,42,1)]">
                             <IconFile size={24} strokeWidth={2.5} />
                        </div>
                        <span className="font-black text-xl uppercase tracking-tighter">DocDigest</span>
                    </div>
                </div>

                <div className="px-6 py-8 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        <p className="px-4 text-xs font-bold text-industrial-grey uppercase tracking-widest mb-4">Platform</p>
                        <Link
                            href={route("dashboard")}
                            className={`flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider border-2 transition-all duration-0 ${
                                route().current("dashboard")
                                    ? "bg-industrial-grey text-white border-industrial-grey translate-x-[2px] translate-y-[2px] shadow-none"
                                    : "bg-white text-industrial-grey border-transparent hover:border-industrial-grey hover:shadow-[4px_4px_0px_0px_rgba(42,42,42,1)]"
                            }`}
                        >
                            <IconLayoutDashboard size={20} strokeWidth={2} />
                            Dashboard
                        </Link>
                        <Link
                            href={route("history")}
                            className={`flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider border-2 transition-all duration-0 ${
                                route().current("history")
                                    ? "bg-industrial-grey text-white border-industrial-grey translate-x-[2px] translate-y-[2px] shadow-none"
                                    : "bg-white text-industrial-grey border-transparent hover:border-industrial-grey hover:shadow-[4px_4px_0px_0px_rgba(42,42,42,1)]"
                            }`}
                        >
                            <IconHistory size={20} strokeWidth={2} />
                            History
                        </Link>
                        {user.role === 'admin' && (
                            <Link
                                href={route("admin.dashboard")}
                                className={`flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-industrial-red border-2 border-transparent hover:border-industrial-red hover:bg-red-50`}
                            >
                                <IconLayoutDashboard size={20} strokeWidth={2} />
                                Admin Panel
                            </Link>
                        )}
                    </div>

                    <div className="mt-12 space-y-6">
                        <p className="px-4 text-xs font-bold text-industrial-grey uppercase tracking-widest">Current Plan</p>
                        
                        <div className="bg-white p-6 border-4 border-industrial-grey shadow-[6px_6px_0px_0px_rgba(42,42,42,1)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 border-2 border-industrial-grey">
                                    <IconCreditCard size={20} strokeWidth={2} />
                                </div>
                                <div>
                                    <h4 className="font-black text-lg uppercase leading-none">{plan.name}</h4>
                                    <p className="text-xs font-mono font-bold mt-1">${plan.price}/month</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                    <span>PDFs Used</span>
                                    <span className="font-mono">{userStats.pdf_count}/{userStats.pdf_limit}</span>
                                </div>
                                <div className="w-full border-2 border-industrial-grey h-3 p-0.5">
                                    <div 
                                        className="bg-industrial-grey h-full transition-all duration-500" 
                                        style={{ width: `${Math.min(100, (userStats.pdf_count / userStats.pdf_limit) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-industrial-red uppercase tracking-widest border-2 border-industrial-grey shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] hover:bg-white hover:text-industrial-red hover:border-industrial-red hover:shadow-[4px_4px_0px_0px_#8B0000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-0">
                            <IconX size={16} strokeWidth={3} />
                            Cancel Subscription
                        </button>
                    </div>
                </div>

                 <div className="p-6 border-t-4 border-industrial-grey bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-industrial-grey flex items-center justify-center text-industrial-grey uppercase font-black text-sm bg-gray-100">
                           {user.name.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold uppercase truncate">{user.name}</p>
                            <p className="text-xs font-mono font-medium text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button"
                            className="p-2 border-2 border-transparent hover:border-industrial-grey hover:bg-gray-100 transition-all duration-0"
                        >
                            <IconLogout size={20} strokeWidth={2} />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-10 overflow-y-auto industrial-grid">
                <div className="max-w-7xl mx-auto space-y-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
