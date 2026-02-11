import { Link, usePage } from "@inertiajs/react";
import {
    IconLayoutDashboard,
    IconUsers,
    IconLogout,
    IconFile,
    IconArrowLeft
} from "@tabler/icons-react";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function AdminLayout({ children }) {
    const user = usePage().props.auth.user;

    return (
         <div className="flex h-screen bg-industrial-white font-sans text-industrial-grey selection:bg-industrial-grey selection:text-white">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r-4 border-industrial-grey flex flex-col fixed inset-y-0 left-0 z-10">
                <div className="p-8 border-b-4 border-industrial-grey">
                    <div className="flex items-center gap-3">
                        <div className="p-2 border-2 border-industrial-grey bg-white shadow-[2px_2px_0px_0px_rgba(42,42,42,1)]">
                             <IconFile size={24} strokeWidth={2.5} />
                        </div>
                        <span className="font-black text-xl uppercase tracking-tighter">DocDigest Admin</span>
                    </div>
                </div>

                <div className="px-6 py-8 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        <p className="px-4 text-xs font-bold text-industrial-grey uppercase tracking-widest mb-4">Platform</p>
                        <Link
                            href={route("admin.dashboard")}
                            className={`flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider border-2 transition-all duration-0 ${
                                route().current("admin.dashboard")
                                    ? "bg-industrial-grey text-white border-industrial-grey translate-x-[2px] translate-y-[2px] shadow-none"
                                    : "bg-white text-industrial-grey border-transparent hover:border-industrial-grey hover:shadow-[4px_4px_0px_0px_rgba(42,42,42,1)]"
                            }`}
                        >
                            <IconLayoutDashboard size={20} strokeWidth={2} />
                            Dashboard
                        </Link>
                        <Link
                            href={route("admin.users")}
                            className={`flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider border-2 transition-all duration-0 ${
                                route().current("admin.users")
                                    ? "bg-industrial-grey text-white border-industrial-grey translate-x-[2px] translate-y-[2px] shadow-none"
                                    : "bg-white text-industrial-grey border-transparent hover:border-industrial-grey hover:shadow-[4px_4px_0px_0px_rgba(42,42,42,1)]"
                            }`}
                        >
                            <IconUsers size={20} strokeWidth={2} />
                            All Users
                        </Link>
                        
                        <div className="pt-8 mt-8 border-t-2 border-dashed border-industrial-grey">
                            <Link
                                href={route("dashboard")}
                                className="flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-industrial-grey border-2 border-transparent hover:border-industrial-grey hover:bg-gray-100"
                            >
                                <IconArrowLeft size={20} strokeWidth={2} />
                                Back to App
                            </Link>
                        </div>
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
