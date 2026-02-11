import { Head, Link } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { IconFileText, IconLayoutDashboard, IconArrowRight, IconEye, IconCalendar, IconFileDescription } from "@tabler/icons-react";

export default function History({ userStats, plan, summaries = [] }) {
    return (
        <DashboardLayout userStats={userStats} plan={plan}>
            <Head title="History" />

            {/* Header */}
            <div className="flex items-center gap-2 text-sm text-industrial-grey font-mono uppercase font-bold mb-10 pb-4 border-b-2 border-industrial-grey">
                <Link href={route('dashboard')} className="hover:underline flex items-center gap-1">
                    <IconLayoutDashboard size={16} />
                    <span>Dashboard</span>
                </Link>
                <span>/</span>
                <span className="text-industrial-red">History</span>
            </div>

            <div className="mb-12">
                <h1 className="text-5xl font-black text-industrial-grey uppercase mb-2">Upload History</h1>
                <p className="text-industrial-grey font-mono">
                    View and manage your PDF summaries ({summaries.length} total)
                </p>
            </div>

            {summaries.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 border-4 border-industrial-grey bg-white shadow-[8px_8px_0px_0px_rgba(42,42,42,1)] relative overflow-hidden">
                    <div className="w-24 h-24 bg-white border-2 border-industrial-grey shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] flex items-center justify-center mb-6 z-10">
                        <IconFileText size={40} className="text-industrial-grey" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-black text-industrial-grey uppercase mb-2 z-10">
                        No summaries yet
                    </h3>
                    <p className="text-industrial-grey font-mono mb-8 font-bold text-sm max-w-xs text-center z-10">
                        Upload your first PDF to get started with extraction.
                    </p>
                    <Link
                        href={route('dashboard')}
                        className="z-10 flex items-center gap-2 px-8 py-3 bg-industrial-grey text-white font-bold uppercase tracking-widest border-2 border-industrial-grey shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] hover:bg-white hover:text-industrial-grey hover:shadow-[4px_4px_0px_0px_#8B0000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-0"
                    >
                        <IconArrowRight size={20} />
                        Upload PDF
                    </Link>

                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 z-0 opacity-10" style={{ 
                            backgroundImage: 'linear-gradient(#2A2A2A 1px, transparent 1px), linear-gradient(90deg, #2A2A2A 1px, transparent 1px)', 
                            backgroundSize: '20px 20px' 
                        }}>
                    </div>
                </div>
            ) : (
                /* Summaries List */
                <div className="space-y-4">
                    {summaries.map((summary) => (
                        <Link
                            key={summary.id}
                            href={route('pdf.show', summary.id)}
                            className="block bg-white border-4 border-industrial-grey p-6 shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(42,42,42,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-industrial-grey flex items-center justify-center flex-shrink-0">
                                            <IconFileDescription size={20} className="text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-black text-industrial-grey uppercase tracking-tight truncate">
                                                {summary.filename}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-industrial-grey/60 font-mono">
                                                <span className="flex items-center gap-1">
                                                    <IconCalendar size={14} />
                                                    {new Date(summary.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="uppercase text-xs bg-industrial-grey/10 px-2 py-0.5 font-bold">
                                                    {summary.summary_type || 'Standard'}
                                                </span>
                                                <span>{Math.round(summary.filesize / 1024)} KB</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-industrial-grey/70 text-sm line-clamp-2 mt-3 pl-13">
                                        {summary.summary.substring(0, 200)}...
                                    </p>
                                </div>
                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-10 h-10 border-2 border-industrial-grey flex items-center justify-center bg-industrial-grey text-white group-hover:bg-white group-hover:text-industrial-grey transition-colors">
                                        <IconEye size={20} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
