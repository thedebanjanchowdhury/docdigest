import { Head, Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    IconLayoutDashboard,
    IconCreditCard,
    IconFileText,
    IconChartBar,
    IconUpload,
    IconArrowRight,
} from "@tabler/icons-react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import FileUploadModal from "@/Components/FileUploadModal";
import SummaryOptionsModel from "@/Components/SummaryOptionsModel";

import axios from "axios";
import { router } from "@inertiajs/react";

export default function Dashboard({ userStats = { pdf_count: 0, pdf_limit: 50, summary_count: 0, canUpload: true }, plan = { name: "Standard", price: 9.99 } }) {
    const user = usePage().props.auth.user;
    
    // Modal States
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showSummaryOptions, setShowSummaryOptions] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    
    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setShowSummaryOptions(true); 
    };

    const handleSummaryTypeSelect = async (type) => {
        setShowSummaryOptions(false);
        if (!selectedFile) return;

        setLoading(true);
        
        const formData = new FormData();
        formData.append("pdf_file", selectedFile);
        formData.append("summary_type", type);

        try {
            const response = await axios.post("/pdf/summarize", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            // Redirect to the summary page using Inertia
            router.visit(route('pdf.show', { pdfSummary: response.data.id }));
            
        } catch (error) {
            console.error("Error generating summary:", error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert("Error generating summary. Please check the console or ensure the file is a valid PDF.");
            }
            // Only stop loading if error, otherwise the redirect will handle the page change
            setLoading(false); 
        } finally {
            // No cleanup needed if redirecting, but if error we need to stop loading
             /* setLoading(false) is handled in catch for errors, 
                and if success, we are redirecting so state update on unmounted component warning might happen if we do it here.
                Ideally only set loading false if we are NOT redirecting.
             */
        }
    };


    return (
        <DashboardLayout userStats={userStats} plan={plan}>
            <Head title="Dashboard" />

            {/* Modals */}
             <FileUploadModal 
                show={showUploadModal} 
                onClose={() => setShowUploadModal(false)}
                userStats={userStats}
                onFileSelect={handleFileSelect}
            />

            <SummaryOptionsModel
                show={showSummaryOptions}
                fileName={selectedFile?.name}
                userPlanSlug={user.plan?.slug || 'basic'} 
                onClose={() => {
                    setShowSummaryOptions(false);
                    setSelectedFile(null);
                }}
                onSelect={handleSummaryTypeSelect}
            />



            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/90 backdrop-blur-sm border-4 border-industrial-grey m-6">
                    <div className="bg-white p-8 border-4 border-industrial-grey flex flex-col items-center shadow-[8px_8px_0px_0px_rgba(42,42,42,1)]">
                        <div className="w-16 h-16 border-4 border-industrial-grey border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-industrial-grey font-bold uppercase tracking-widest">Generating Summary...</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex items-center gap-3 mb-10 border-b-4 border-industrial-grey pb-6">
                <IconLayoutDashboard className="text-industrial-grey" size={32} strokeWidth={2.5} />
                <h2 className="text-3xl font-black uppercase text-industrial-grey tracking-tighter">Dashboard</h2>
            </header>

            <div className="mb-12">
                <h1 className="text-5xl font-black text-industrial-grey uppercase mb-2">Metrics</h1>
                <p className="text-industrial-grey font-mono">Real-time usage statistics.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-8 border-4 border-industrial-grey shadow-[8px_8px_0px_0px_rgba(42,42,42,1)] flex items-start justify-between">
                    <div className="w-full">
                        <p className="text-sm font-bold uppercase tracking-wider text-industrial-grey mb-4">Current Plan</p>
                        <h3 className="text-4xl font-black text-industrial-grey uppercase mb-2">{plan.name}</h3>
                        <div className="w-full h-2 bg-gray-200 mt-4">
                            <div className="h-full bg-industrial-grey w-full"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 border-4 border-industrial-grey shadow-[8px_8px_0px_0px_rgba(42,42,42,1)] flex items-start justify-between">
                    <div className="w-full">
                        <p className="text-sm font-bold uppercase tracking-wider text-industrial-grey mb-4">PDFs Processed</p>
                        <div className="flex items-baseline gap-2 mb-2">
                                <h3 className="text-4xl font-black text-industrial-grey">{userStats.pdf_count}</h3>
                                <span className="text-gray-400 font-mono text-xl">/ {userStats.pdf_limit}</span>
                        </div>
                        
                        <div className="w-full h-2 bg-gray-200 mt-4 overflow-hidden">
                            <div 
                                className="bg-industrial-grey h-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, (userStats.pdf_count / userStats.pdf_limit) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 border-4 border-industrial-grey shadow-[8px_8px_0px_0px_rgba(42,42,42,1)] flex items-start justify-between">
                    <div className="w-full">
                        <p className="text-sm font-bold uppercase tracking-wider text-industrial-grey mb-4">Total Summaries</p>
                        <h3 className="text-4xl font-black text-industrial-grey">{userStats.summary_count}</h3>
                         <div className="w-full h-2 bg-gray-200 mt-4">
                            <div className="h-full bg-industrial-grey w-1/3"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Welcome Section */}
            <div className="bg-white rounded-none p-12 text-center border-4 border-industrial-grey shadow-[12px_12px_0px_0px_rgba(42,42,42,1)] relative overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto">
                    <IconUpload size={48} className="mx-auto text-industrial-grey mb-6" strokeWidth={1.5} />
                    <h2 className="text-4xl font-black text-industrial-grey uppercase mb-4 tracking-tight">
                        Ready to Analyze?
                    </h2>
                    <p className="text-xl text-industrial-grey font-mono mb-10">
                        Upload a new PDF to get started with extraction.
                    </p>
                    
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center gap-3 px-10 py-4 bg-industrial-grey text-white text-lg font-bold uppercase tracking-widest border-2 border-industrial-grey hover:bg-white hover:text-industrial-grey hover:shadow-[8px_8px_0px_0px_#8B0000] transition-all duration-0"
                    >
                        <IconUpload size={24} />
                        Upload PDF
                    </button>
                </div>
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 z-0 opacity-10" style={{ 
                        backgroundImage: 'linear-gradient(#2A2A2A 1px, transparent 1px), linear-gradient(90deg, #2A2A2A 1px, transparent 1px)', 
                        backgroundSize: '20px 20px' 
                    }}>
                </div>
            </div>
        </DashboardLayout>
    );
}
