import React from "react";
import {
    IconX,
    IconCheckbox,
    IconCopy,
    IconDownload,
    IconFileText,
    IconPdf,
} from "@tabler/icons-react";
import { Link } from "@inertiajs/react";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const SummaryModel = ({ show, summary, fileName, onClose, onNewUpload }) => {
    const [copied, setCopied] = useState(false);
    const [exporting, setExporting] = useState(false);
    const summaryRef = useRef < HTMLDivElement > null;

    if (!show || !summary) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([summary], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `${fileName?.replace(".pdf", "") || "summary"}_summary.txt`;
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
        const paragraphs = summary
            .split("\n\n")
            .map(
                (p) =>
                    `<p style="font-size:16px, margin: 0 0 16px 0;">${p}</p>`,
            )
            .join("");
        exportContainer.innerHTML = `
    <div style="padding:32px; background:white; font-family: 'Arial', sans-serif; color: #1f2937;">
    <h3 style="font-size:24px; font-weight:bold; color:#7c3aed; margin: 0 0 16px 0;">Summary</h3>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 16px 0;">${fileName || "Document"}</p>
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
            `${fileName?.replace(".pdf", "") || "summary"}_summary.pdf`,
        );
        document.body.removeChild(exportContainer);
        setExporting(false);
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justfy-center p-4 bg-black/60 backdrop-blur-sm">
                <div
                    className="relative w-full max-w-4xl max-h-[90vh] bg-white
         dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div
                        className="sticky top-0 z-10 bg-gradient-to-r from-violet-600
          to-purple-600 px-8 py-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <IconCheckbox className="w-6 h-6 text-white" />
                                <div className="">
                                    <h2 className="text-xl font-bold text-white">
                                        Summary
                                    </h2>
                                    <p className="text-sm text-white/80">
                                        {fileName}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <IconX className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <div
                            ref={summaryRef}
                            className="p-6 bg-white rounded-xl border border-gray-200"
                        >
                            <h3
                                className="text-xl font-bold text-violet-600 mb-4
              "
                            >
                                {summary.split("\n\n").map((p, i) => (
                                    <p key={i} className="text-slate-700 mb-4">
                                        {p}
                                    </p>
                                ))}
                            </h3>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t px-8 py-6">
                        <div className="flex flex-wrap gap-3 justify-between">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-3 px-6 py-3 rounded-xl bg-violet-100 text-violet-700"
                                >
                                    {copied ? (
                                        <>
                                            <IconCheckbox className="h-5 w-5" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <IconCopy className="h-5 w-5" />
                                            Copy
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-3 px-6 py-3 rounded-xl bg-violet-100 text-violet-700"
                                >
                                    <IconDownload className="h-5 w-5" />
                                    Download
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    disabled={exporting}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-100, text-red-700 font-medium hover:bg-red-200 disabled:opacity-50"
                                >
                                    {exporting ? (
                                        <>
                                            <IconFileText className="h-5 w-5" />
                                            Exporting
                                        </>
                                    ) : (
                                        <>
                                            <IconFileText className="h-5 w-5" />
                                            Export
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={onNewUpload}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600"
                                >
                                    Upload Another <IconPdf />
                                </button>
                                <Link
                                    href="/history"
                                    className="px-6 py-3 rounded-xl border-2 border-violet-600 font-medium hover:bg-violet-50"
                                >
                                    View History
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SummaryModel;
