import { useState, useRef, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import FileUploadModal from "@/Components/FileUploadModal";
import {
    IconCheck,
    IconSparkles,
    IconAdjustmentsUp,
    IconRocket,
    IconArrowRight,
    IconStar,
    IconFile,
    IconCloudUpload,
} from "@tabler/icons-react";
import FlashMessage from "@/Components/FlashMessage";
import axios from "axios";
import SummaryModel from "@/Components/SummaryModel";
import SummaryOptionsModel from "@/Components/SummaryOptionsModel";

const Welcome = ({ plans = [], canRegister, auth, userStats, flash }) => {
    const [pdf, setPdf] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState("");
    const [showSummary, setShowSummary] = useState(false);
    const [showSummaryOptions, setShowSummaryOptions] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const limitReached = !!(userStats && !userStats.canUpload);
    const userPlanSlug = auth?.user?.plan?.slug || "basic";

    const safePlans = Array.isArray(plans)
        ? plans.map((plan) => {
              const isCurrent = plan.slug === userPlanSlug;
              const isPopular = plan.is_popular;
              const isFree = plan.slug === "free";
              const isLegacy = plan.slug === "legacy";

              let features = [];
              if (Array.isArray(plan.features)) {
                  features = plan.features;
              } else if (typeof plan.features === "string") {
                  try {
                      const parsed = JSON.parse(plan.features);
                      if (Array.isArray(parsed)) {
                          features = parsed;
                      }
                  } catch (e) {
                      console.error("Failed to parse plan features:", e);
                      features = [];
                  }
              }

              return {
                  ...plan,
                  features,
                  isCurrent,
                  isPopular,
                  isFree,
                  isLegacy,
              };
          })
        : [];

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleFileSelect = (file) => {
        if (limitReached) {
            alert(
                `PDF Limit Reached (${userStats.pdf_count}/${userStats.pdf_limit})`,
            );
            router.visit(route("subscription.index"));
            return;
        }

        if (file && file.type === "application/pdf") {
            setPdf(file);
            setSelectedFile(file);
            setShowSummaryOptions(true);
        }
    };

    const handleSummaryTypeSelect = async (type) => {
        setShowSummaryOptions(false);
        if (!selectedFile || !auth?.user) return;

        setLoading(true);
        setSummary("");
        setShowSummary(true);

        const formData = new FormData();
        formData.append("pdf_file", selectedFile);
        formData.append("summary_type", type);

        const progressInterval = setInterval(() => {
            setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
        }, 200);

        try {
            const response = await axios.post("/pdf/summarize", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            clearInterval(progressInterval);

            const data = response.data;
            setProgress(100);

            let cleanSummary = data.summary || "";
            cleanSummary = cleanSummary.replace(/\n\n+/g, "\n\n");
            cleanSummary = cleanSummary.trim();
            setSummary(cleanSummary);

            setTimeout(() => {
                setLoading(false);
                setShowSummary(true);
            }, 1000);
        } catch (error) {
            clearInterval(progressInterval);
            console.error("Error generating summary:", error);
            setLoading(false);
            setProgress(0);
            alert("Error generating summary");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (auth?.user) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file?.type === "application/pdf") handleFileSelect(file);
    };

    const handleFileChange = (e) => {
        const file = e.target?.files[0];
        if (file?.type === "application/pdf") handleFileSelect(file);
    };

    const handleNewUpload = () => {
        setPdf(null);
        setSelectedFile(null);
        setShowSummary(false);
        setShowSummaryOptions(false);
        setProgress(0);
    };

    const getPlanIcon = (slug) => {
        if (slug === "standard") return <IconFile className="h-8 w-8" strokeWidth={2} />;
        if (slug === "premium") return <IconRocket className="h-8 w-8" strokeWidth={2} />;
        return <IconSparkles className="h-8 w-8" strokeWidth={2} />;
    };

    const handlePlanClick = (plan) => {
        router.visit(
            plan.slug === "basic" ? "/register" : `/checkout/${plan.slug}`,
        );
    };

    return (
        <>
            <Head title="DocDigest - Brutal Simplicity" />

            <div className="min-h-screen bg-industrial-white industrial-grid text-industrial-grey selection:bg-industrial-grey selection:text-white">
                <FlashMessage flash={flash} />

                {/* Modals */}
                <FileUploadModal
                    show={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    userStats={userStats}
                    onFileSelect={(file) => {
                        handleFileSelect(file);
                        setShowUploadModal(false);
                    }}
                />
                
                <SummaryOptionsModel
                    show={showSummaryOptions && !!selectedFile}
                    fileName={selectedFile?.name}
                    userPlanSlug={userPlanSlug}
                    onClose={() => {
                        setShowSummaryOptions(false);
                        setSelectedFile(null);
                        setPdf(null);
                    }}
                    onSelect={handleSummaryTypeSelect}
                />

                <SummaryModel
                    show={showSummary}
                    summary={summary}
                    fileName={pdf?.name}
                    onClose={() => setShowSummary(false)}
                    onNewUpload={handleNewUpload}
                />

                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-industrial-grey">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">
                            {/* Logo */}
                            <div className="flex items-center gap-2">
                                <Link href="/" className="flex items-center gap-2 group">
                                    <div className="p-2 border-2 border-industrial-grey bg-white shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all duration-0">
                                         <IconFile size={24} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-2xl font-black uppercase tracking-tighter text-industrial-grey">
                                        DocDigest
                                    </span>
                                </Link>
                            </div>

                            {/* Auth Buttons */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                         if (auth?.user) {
                                            setShowUploadModal(true);
                                         } else {
                                             router.visit(route('login'));
                                         }
                                    }}
                                    className="hidden md:flex items-center gap-2 px-6 py-2 text-sm font-bold uppercase tracking-wider text-industrial-grey hover:bg-industrial-grey hover:text-white transition-colors border-2 border-transparent hover:border-industrial-grey"
                                >
                                    <IconCloudUpload size={20} />
                                    Upload PDF
                                </button>

                                {auth?.user ? (
                                    <Link
                                        href={route("dashboard")}
                                        className="flex items-center gap-2 px-6 py-2 bg-industrial-grey text-white text-sm font-bold uppercase tracking-wider border-2 border-industrial-grey shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] hover:bg-white hover:text-industrial-grey hover:shadow-[4px_4px_0px_0px_#8B0000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-0"
                                    >
                                        Dashboard
                                        <IconArrowRight size={16} />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="text-industrial-grey text-sm font-bold uppercase tracking-wider hover:underline"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={route("register")}
                                                className="px-6 py-2 bg-industrial-grey text-white text-sm font-bold uppercase tracking-wider border-2 border-industrial-grey shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] hover:bg-white hover:text-industrial-grey hover:shadow-[4px_4px_0px_0px_#8B0000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-0"
                                            >
                                                Get Started
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Content Container */}
                <div className="relative z-10 pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div
                        className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                    >
                        <div className="text-center max-w-4xl mx-auto mb-20">
                            <div className="inline-flex items-center gap-2 px-4 py-1 border-2 border-industrial-grey bg-white text-industrial-grey text-xs font-bold uppercase tracking-widest mb-8 shadow-[4px_4px_0px_0px_rgba(42,42,42,1)]">
                                <IconSparkles size={14} />
                                <span>AI-Powered Analysis</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-industrial-grey mb-8 uppercase leading-none">
                                Understand <br />
                                <span className="text-stroke-2 text-transparent bg-clip-text bg-industrial-grey" style={{ WebkitTextStroke: "2px #2A2A2A", color: "transparent" }}>
                                    Documents
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-industrial-grey font-mono mb-12 max-w-2xl mx-auto uppercase">
                                No nonsense. Just results. Upload your PDF. get the facts.
                            </p>
                        </div>

                        {/* Upload Area */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className="max-w-2xl mx-auto"
                        >
                            <div
                                className={`group relative border-4 border-industrial-grey transition-all duration-0 
                ${
                    isDragging
                        ? "bg-white scale-[1.02] shadow-[8px_8px_0px_0px_#8B0000]"
                        : "bg-white hover:shadow-[8px_8px_0px_0px_rgba(42,42,42,1)]"
                }`}
                            >
                                <div className="p-16 text-center">
                                    <div className="w-24 h-24 mx-auto border-2 border-industrial-grey flex items-center justify-center mb-8 shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all duration-0 bg-white">
                                        <IconFile
                                            className="w-12 h-12 text-industrial-grey"
                                            strokeWidth={1.5}
                                        />
                                    </div>

                                    <h3 className="text-2xl font-black uppercase tracking-tight text-industrial-grey mb-2">
                                        {isDragging
                                            ? "Drop IT!"
                                            : "Upload PDF"}
                                    </h3>
                                    <p className="text-industrial-grey font-mono text-sm mb-10">
                                        Drag and drop or click below
                                    </p>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="application/pdf"
                                        className="hidden"
                                    />

                                    <button
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={loading}
                                        className="inline-flex items-center gap-3 px-10 py-4 bg-industrial-grey text-white font-bold uppercase tracking-widest hover:bg-white hover:text-industrial-grey border-2 border-industrial-grey shadow-[4px_4px_0px_0px_#8B0000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <IconRocket size={24} />
                                                <span>Select File</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Loading/Progress Overlay */}
                                {loading && (
                                    <div className="absolute inset-0 z-20 bg-white/90 flex flex-col items-center justify-center p-8 border-4 border-industrial-grey m-[-4px]">
                                        <div className="w-full max-w-xs space-y-6 text-center">
                                            <div className="mx-auto w-20 h-20 border-4 border-industrial-grey border-t-transparent animate-spin rounded-full"></div>
                                            <div>
                                                <h4 className="text-2xl font-black uppercase text-industrial-grey">
                                                    Analyzing
                                                </h4>
                                                <p className="text-sm font-mono text-industrial-grey mt-2">
                                                    Extracting data...
                                                </p>
                                            </div>
                                            <div className="w-full border-2 border-industrial-grey h-4 p-0.5">
                                                <div
                                                    className="h-full bg-industrial-grey transition-all duration-300 ease-out"
                                                    style={{
                                                        width: `${progress}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-40 grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <IconStar className="w-8 h-8" />,
                                title: "Smart Summaries",
                                description:
                                    "Concise. Accurate. Fast. AI cutting through the noise.",
                            },
                            {
                                icon: <IconAdjustmentsUp className="w-8 h-8" />,
                                title: "Key Insights",
                                description:
                                    "Extract dates, points, and actions automatically.",
                            },
                            {
                                icon: <IconCheck className="w-8 h-8" />,
                                title: "Secure",
                                description:
                                    "Processed securely. Deleted automatically.",
                            },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="p-8 border-4 border-industrial-grey bg-white hover:shadow-[8px_8px_0px_0px_rgba(42,42,42,1)] hover:-translate-y-1 transition-all duration-0"
                            >
                                <div className="w-16 h-16 border-2 border-industrial-grey flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(42,42,42,1)]">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-black uppercase text-industrial-grey mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-industrial-grey font-mono text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Section */}
                    {safePlans.length > 0 && (
                        <div className="mt-40">
                            <div className="text-center mb-20">
                                <h2 className="text-4xl md:text-5xl font-black text-industrial-grey uppercase mb-4">
                                    Pricing
                                </h2>
                                <p className="text-xl font-mono text-industrial-grey">
                                    Simple. Transparent. Rigid.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {safePlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`relative p-8 border-4 border-industrial-grey flex flex-col transition-all duration-0
                            ${
                                plan.isPopular
                                    ? "bg-white shadow-[12px_12px_0px_0px_#8B0000] z-10 scale-105"
                                    : "bg-white hover:shadow-[8px_8px_0px_0px_rgba(42,42,42,1)]"
                            }`}
                                    >
                                        {plan.isPopular && (
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-industrial-red text-white text-xs font-bold px-4 py-2 border-2 border-industrial-grey uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(42,42,42,1)]">
                                                Best Value
                                            </div>
                                        )}

                                        <div className="mb-8 text-center">
                                            <div className="w-16 h-16 mx-auto border-2 border-industrial-grey flex items-center justify-center mb-6 text-industrial-grey shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] bg-white">
                                                {getPlanIcon(plan.slug)}
                                            </div>
                                            <h3 className="text-2xl font-black text-industrial-grey uppercase mb-2">
                                                {plan.name}
                                            </h3>
                                            <div className="flex items-baseline justify-center gap-1 font-mono">
                                                <span className="text-5xl font-bold text-industrial-grey">
                                                    ${plan.price}
                                                </span>
                                                <span className="text-industrial-grey text-sm">
                                                    /mo
                                                </span>
                                            </div>
                                        </div>

                                        <ul className="space-y-4 mb-10 flex-1 border-t-2 border-b-2 border-industrial-grey py-8 border-dashed">
                                            {plan.features &&
                                                plan.features.map(
                                                    (feature, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex items-start gap-3 text-sm font-bold text-industrial-grey"
                                                        >
                                                            <IconCheck className="w-5 h-5 text-industrial-grey shrink-0 border border-industrial-grey p-0.5" />
                                                            <span className="uppercase text-xs tracking-wide">
                                                                {feature}
                                                            </span>
                                                        </li>
                                                    ),
                                                )}
                                        </ul>

                                        <button
                                            onClick={() =>
                                                handlePlanClick(plan)
                                            }
                                            className={`w-full py-4 text-sm font-bold uppercase tracking-widest border-2 border-industrial-grey transition-all duration-0 shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                    ${
                                        plan.isCurrent
                                            ? "bg-gray-200 text-gray-500 cursor-default shadow-none border-dashed"
                                            : "bg-industrial-grey text-white hover:bg-white hover:text-industrial-grey"
                                    }`}
                                        >
                                            {plan.isCurrent
                                                ? "Active Plan"
                                                : plan.price === 0
                                                  ? "Start Free"
                                                  : "Subscribe"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Welcome;
