import React, { useRef, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    IconArrowLeft,
    IconCopy,
    IconDownload,
    IconFileText,
    IconPdf,
    IconCheckbox,
} from "@tabler/icons-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";

export default function SummaryResult({ auth, summary }) {
    const [copied, setCopied] = useState(false);
    const [exporting, setExporting] = useState(false);
    const summaryRef = useRef(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(summary.summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([summary.summary], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `${summary.filename?.replace(".pdf", "") || "summary"}_summary.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleExportPDF = async () => {
        if (!summaryRef.current) return;
        setExporting(true);

        const exportContainer = document.createElement("div");
        exportContainer.style.cssText =
            "position: absolute; left: 0; top: 0; width: 800px; z-index:9999; background: white; padding: 20px; box-sizing: border-box; font-family: 'Arial', sans-serif; color: #1f2937;";
        const paragraphs = summary.summary
            .split("\n\n")
            .map(
                (p) =>
                    `<p style="font-size:16px, margin: 0 0 16px 0;">${p}</p>`,
            )
            .join("");
        exportContainer.innerHTML = `
    <div style="padding:32px; background:white; font-family: 'Arial', sans-serif; color: #1f2937;">
    <h3 style="font-size:24px; font-weight:bold; color:#2A2A2A; margin: 0 0 16px 0;">Summary</h3>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 16px 0;">${summary.filename || "Document"}</p>
    <div style="color:#334155; line-height:1.75;">${paragraphs}</div>
    </div>
    `;
        document.body.appendChild(exportContainer);

        await new Promise((r) => setTimeout(r, 100));

        const canvas = await html2canvas(exportContainer, {
            scale: 2,
            backgroundColor: "#fff",
        });
        const imgData = canvas.toDataURL("image/png");
        const pdfDoc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdfDoc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdfDoc.save(
            `${summary.filename?.replace(".pdf", "") || "summary"}_summary.pdf`,
        );
        document.body.removeChild(exportContainer);
        setExporting(false);
    };

    // Calculate dummy "stats" or details based on summary length just for visual flair
    const wordCount = summary.summary.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return (
        <DashboardLayout userStats={{ pdf_count: 0 }} plan={{ name: "Standard" }} header={
            <div className="flex items-center gap-4">
                 <Link href={route('dashboard')} className="p-2 border-2 border-industrial-grey hover:bg-industrial-grey hover:text-white transition-colors bg-white shadow-brutal active:shadow-none active:translate-x-[4px] active:translate-y-[4px]">
                    <IconArrowLeft size={24} />
                 </Link>
                 <h2 className="text-xl font-black text-industrial-grey uppercase tracking-tight">Summary Result</h2>
            </div>
        }>
            <Head title="Summary Result" />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Meta Header */}
                <div className="bg-white border-4 border-industrial-grey p-8 mb-8 shadow-[8px_8px_0px_0px_rgba(42,42,42,1)]">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-industrial-grey text-white text-xs font-bold uppercase px-3 py-1 tracking-widest">
                                    {summary.summary_type || 'Standard'} Analysis
                                </span>
                                <span className="border-2 border-industrial-grey text-industrial-grey text-xs font-bold uppercase px-3 py-1 tracking-widest bg-industrial-white">
                                    {readingTime} min read
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-industrial-grey uppercase mb-2 tracking-tighter loading-none">
                                {summary.filename}
                            </h1>
                            <p className="text-industrial-grey/60 font-mono text-sm uppercase tracking-wide">
                                Generated on {new Date(summary.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        
                        <div className="flex gap-3 w-full md:w-auto">
                             <button
                                onClick={handleDownload}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 border-2 border-industrial-grey font-bold hover:bg-industrial-white bg-white shadow-brutal active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
                            >
                                <IconDownload size={20} strokeWidth={2} />
                                <span className="hidden md:inline uppercase tracking-wider text-sm">TXT</span>
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 border-2 border-industrial-grey font-bold hover:bg-industrial-white bg-white shadow-brutal active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                <IconFileText size={20} strokeWidth={2} />
                                <span className="hidden md:inline uppercase tracking-wider text-sm">{exporting ? '...' : 'PDF'}</span>
                            </button>
                             <button
                                onClick={handleCopy}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-industrial-grey text-white font-bold border-2 border-industrial-grey hover:bg-white hover:text-industrial-grey shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-brutal active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all uppercase tracking-wider text-sm"
                            >
                                {copied ? <IconCheckbox size={20} /> : <IconCopy size={20} />}
                                <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                     </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Main Summary */}
                    <div className="lg:col-span-2">
                         <div className="bg-white border-4 border-industrial-grey p-8 min-h-[500px] shadow-[8px_8px_0px_0px_rgba(42,42,42,1)] relative">
                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 w-8 h-8 bg-industrial-grey"></div>
                            <div className="absolute top-2 right-2 w-4 h-4 bg-white"></div>

                            <div ref={summaryRef} className="prose prose-slate max-w-none pt-4">
                                <ReactMarkdown
                                    components={{
                                        h1: ({children}) => <h1 className="text-2xl font-black text-industrial-grey uppercase tracking-tight mb-4 border-b-4 border-industrial-grey pb-2">{children}</h1>,
                                        h2: ({children}) => <h2 className="text-xl font-black text-industrial-grey uppercase tracking-tight mb-3 mt-6">{children}</h2>,
                                        h3: ({children}) => <h3 className="text-lg font-bold text-industrial-grey mb-2 mt-4">{children}</h3>,
                                        p: ({children}) => <p className="mb-4 text-industrial-grey text-base leading-relaxed">{children}</p>,
                                        ul: ({children}) => <ul className="list-none space-y-2 mb-4 pl-0">{children}</ul>,
                                        li: ({children}) => <li className="flex items-start gap-2 text-industrial-grey"><span className="inline-block w-2 h-2 bg-industrial-grey mt-2 flex-shrink-0"></span><span>{children}</span></li>,
                                        strong: ({children}) => <strong className="font-black text-industrial-grey">{children}</strong>,
                                        em: ({children}) => <em className="italic text-industrial-grey/80">{children}</em>,
                                    }}
                                >
                                    {summary.summary}
                                </ReactMarkdown>
                            </div>
                         </div>
                    </div>

                    {/* Sidebar / Details / "Detailed Placeholder" */}
                    <div className="lg:col-span-1 space-y-8">
                         {/* Key Insights - Premium Feature */}
                        {summary.key_insights && summary.key_insights.length > 0 ? (
                            /* Premium User - Show Insights */
                            <div className="bg-white border-4 border-industrial-grey p-6 shadow-[4px_4px_0px_0px_rgba(42,42,42,1)]">
                                <h3 className="text-industrial-grey font-black uppercase mb-4 flex items-center gap-2 tracking-tight border-b-4 border-industrial-grey pb-2">
                                    <IconCheckSquare size={24} strokeWidth={2.5} /> Key Insights
                                    <span className="ml-auto text-xs bg-green-600 text-white px-2 py-0.5 font-bold uppercase tracking-wider">Premium</span>
                                </h3>
                                <ul className="space-y-3">
                                    {summary.key_insights.map((insight, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-industrial-grey text-sm">
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-industrial-grey text-white font-bold text-xs flex-shrink-0">{idx + 1}</span>
                                            <span className="leading-relaxed">{insight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            /* Non-Premium - Show Locked State */
                            <div className="bg-industrial-white border-4 border-dashed border-industrial-grey p-6 opacity-80 hover:opacity-100 transition-opacity relative overflow-hidden">
                                <h3 className="text-industrial-grey font-black uppercase mb-4 flex items-center gap-2 tracking-tight">
                                    <IconCheckSquare size={24} strokeWidth={2.5} /> Key Insights
                                </h3>
                                <div className="space-y-3 blur-sm select-none">
                                    <div className="flex items-start gap-3 text-industrial-grey/50 text-sm">
                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-300 text-white font-bold text-xs flex-shrink-0">1</span>
                                        <span>Key insight about document structure and main thesis...</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-industrial-grey/50 text-sm">
                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-300 text-white font-bold text-xs flex-shrink-0">2</span>
                                        <span>Critical finding regarding the data presented...</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-industrial-grey/50 text-sm">
                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-300 text-white font-bold text-xs flex-shrink-0">3</span>
                                        <span>Strategic implication that could affect decisions...</span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-industrial-white via-transparent to-transparent"></div>
                                <div className="mt-4 border-t-2 border-industrial-grey pt-4 text-center relative z-10">
                                    <Link href={route('checkout', 'premium')} className="inline-block bg-industrial-grey text-white text-xs font-bold uppercase px-4 py-2 tracking-widest hover:bg-industrial-red transition-colors">
                                        🔒 Upgrade to Premium
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Metadata Card */}
                         <div className="bg-white border-4 border-industrial-grey p-6 shadow-brutal">
                            <h3 className="font-black uppercase text-industrial-grey mb-4 border-b-4 border-industrial-grey pb-2 tracking-tight flex items-center gap-2">
                                <IconPdf size={20} /> Document Stats
                            </h3>
                            <dl className="space-y-3">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                    <dt className="text-industrial-grey font-bold uppercase text-xs tracking-wider">File Size</dt>
                                    <dd className="font-mono font-bold text-industrial-grey">{Math.round(summary.filesize / 1024)} KB</dd>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                    <dt className="text-industrial-grey font-bold uppercase text-xs tracking-wider">Word Count</dt>
                                    <dd className="font-mono font-bold text-industrial-grey">~{wordCount}</dd>
                                </div>
                                <div className="flex justify-between items-center">
                                    <dt className="text-industrial-grey font-bold uppercase text-xs tracking-wider">Processing Time</dt>
                                    <dd className="font-mono font-bold text-industrial-grey">3.2s</dd>
                                </div>
                            </dl>
                        </div>
                        
                         <Link 
                            href={route('dashboard')}
                            className="block w-full text-center py-4 bg-industrial-grey text-white font-black uppercase tracking-widest border-4 border-industrial-grey hover:bg-white hover:text-industrial-grey transition-all shadow-brutal active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                        >
                            Process New PDF
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* Background Grid Pattern */}
             <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" style={{ 
                    backgroundImage: 'linear-gradient(#2A2A2A 1px, transparent 1px), linear-gradient(90deg, #2A2A2A 1px, transparent 1px)', 
                    backgroundSize: '20px 20px' 
                }}>
            </div>
        </DashboardLayout>
    );
}

// Icon for placeholder
function IconCheckSquare({ size }) {
    return (
         <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3l8 -8" />
      <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" />
    </svg>
    )
}
