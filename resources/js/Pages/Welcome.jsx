import { useState, useRef, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    IconCheck,
    IconSparkles,
    IconAdjustmentsUp,
    IconRocket,
    IconArrowRight,
    IconStar,
    IconFile,
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

        // Ensure we use the correct CSRF token if not handled automatically by axios
        // In Laravel + Axios (bootstrap.js), XSRF is usually handled.
        // However, if we need to manually pass it:
        const csrfToken =
            document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || "";

        try {
            // Assuming axios is globally available as window.axios or we might need to import it.
            // If the project uses standard laravel setup, window.axios is usually available.
            // But standard 'import' is better if we can.
            // I'll use window.axios if available, or just axios if it assumes global
            // The original code used 'axios', let's assume it's available or should be imported.
            // I'll check if I should add import later, but for now let's fix logic.
            const response = await axios.post("/pdf/summarize", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    // 'X-XSRF-TOKEN': decodeURIComponent(csrfToken), // Axios usually does this
                },
            });

            clearInterval(progressInterval);

            // Axios throws on non-2xx usually. If we are here, it's likely success.
            // But we can check status if we want.

            const data = response.data;
            setProgress(100);

            let cleanSummary = data.summary || "";
            cleanSummary = cleanSummary.replace(/\n\n+/g, "\n\n");
            cleanSummary = cleanSummary.trim();
            setSummary(cleanSummary);

            setTimeout(() => {
                setLoading(false);
                setShowSummary(true);
            }, 1500);
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
        if (slug === "standard") return <IconFile className="h-8 w-8" />;
        if (slug === "premium") return <IconRocket className="h-8 w-8" />;
        return <IconSparkles className="h-8 w-8" />;
    };

    const handlePlanClick = (plan) => {
        router.visit(
            plan.slug === "basic" ? "/register" : `/checkout/${plan.slug}`,
        );
    };

    return (
        <>
            <Head title="DocDigest - AI Powered PDF Summarizer" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-violet-900 overflow-x-hidden selection:bg-violet-500 selection:text-white">
                <FlashMessage flash={flash} />

                {/* Dynamic Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl animate-pulse opacity-20"></div>
                    <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-20"></div>
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl opacity-20"></div>
                </div>

                {/* Modals */}
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
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800 transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Logo */}
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-violet-500/20">
                                    <IconFile size={24} />
                                </div>
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                                    DocDigest
                                </span>
                            </div>

                            {/* Auth Buttons */}
                            <div className="flex items-center gap-4">
                                {auth?.user ? (
                                    <Link
                                        href={route("dashboard")}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                    >
                                        Dashboard
                                        <IconArrowRight size={16} />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="text-slate-600 dark:text-slate-400 font-medium text-sm hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={route("register")}
                                                className="px-5 py-2.5 rounded-full font-medium text-sm text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 active:scale-95"
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
                <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div
                        className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                    >
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 text-xs font-semibold uppercase tracking-wide mb-6">
                                <IconSparkles size={14} />
                                <span>AI-Powered Analysis</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                                Understand Documents <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                                    in Seconds
                                </span>
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                                Stop wasting hours reading long PDFs. Upload
                                your document and get instant, accurate
                                summaries powered by advanced AI.
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
                                className={`group relative rounded-3xl border-2 border-dashed transition-all duration-300 ease-out
                ${
                    isDragging
                        ? "border-violet-500 bg-violet-50/50 dark:bg-violet-900/20 scale-105 shadow-2xl shadow-violet-500/10"
                        : "border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:border-violet-400 hover:bg-white dark:hover:bg-slate-800 shadow-xl"
                }`}
                            >
                                <div className="p-12 text-center">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                        <IconFile
                                            className={`w-10 h-10 ${isDragging ? "text-violet-600" : "text-slate-500 dark:text-slate-400"} transition-colors`}
                                        />
                                    </div>

                                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                        {isDragging
                                            ? "Drop your PDF here"
                                            : "Upload your PDF"}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                                        Drag and drop or browse to choose a file
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
                                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <IconRocket size={20} />
                                                <span>Choose File</span>
                                            </>
                                        )}
                                    </button>

                                    <p className="mt-4 text-xs text-slate-400">
                                        Up to 10MB PDF files supported
                                    </p>
                                </div>

                                {/* Loading/Progress Overlay */}
                                {loading && (
                                    <div className="absolute inset-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8">
                                        <div className="w-full max-w-xs space-y-4 text-center">
                                            <div className="mx-auto w-16 h-16 relative">
                                                <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
                                                <div className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin"></div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    Analyzing Document
                                                </h4>
                                                <p className="text-sm text-slate-500">
                                                    Extracting key insights...
                                                </p>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-violet-600 transition-all duration-300 ease-out"
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
                    <div className="mt-32 grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: (
                                    <IconStar className="w-6 h-6 text-amber-500" />
                                ),
                                title: "Smart Summaries",
                                description:
                                    "Get concise, accurate summaries of complex documents in seconds using advanced AI.",
                            },
                            {
                                icon: (
                                    <IconAdjustmentsUp className="w-6 h-6 text-violet-500" />
                                ),
                                title: "Key Insights",
                                description:
                                    "Automatically extract important points, dates, and actionable items from your files.",
                            },
                            {
                                icon: (
                                    <IconCheck className="w-6 h-6 text-emerald-500" />
                                ),
                                title: "Secure & Private",
                                description:
                                    "Your documents are processed securely and deleted automatically after analysis.",
                            },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Section */}
                    {safePlans.length > 0 && (
                        <div className="mt-32">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                    Simple, Transparent Pricing
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Choose the plan that fits your needs
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                {safePlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col
                            ${
                                plan.isPopular
                                    ? "border-violet-500 bg-white dark:bg-slate-800 shadow-2xl shadow-violet-500/10 z-10 scale-105"
                                    : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800"
                            }`}
                                    >
                                        {plan.isPopular && (
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                Most Popular
                                            </div>
                                        )}

                                        <div className="mb-8">
                                            <div className="w-12 h-12 rounded-xl bg-violet-100/50 dark:bg-slate-700 flex items-center justify-center mb-6 text-violet-600 dark:text-violet-400">
                                                {getPlanIcon(plan.slug)}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize mb-2">
                                                {plan.name}
                                            </h3>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                                    ${plan.price}
                                                </span>
                                                <span className="text-slate-500">
                                                    /month
                                                </span>
                                            </div>
                                        </div>

                                        <ul className="space-y-4 mb-8 flex-1">
                                            {plan.features &&
                                                plan.features.map(
                                                    (feature, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                                                        >
                                                            <IconCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                                                            <span>
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
                                            className={`w-full py-3 rounded-full font-bold text-sm transition-all
                                    ${
                                        plan.isCurrent
                                            ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-default"
                                            : plan.isPopular
                                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-lg hover:scale-[1.02]"
                                              : "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white hover:border-slate-900 dark:hover:border-slate-400"
                                    }`}
                                        >
                                            {plan.isCurrent
                                                ? "Current Plan"
                                                : plan.price === 0
                                                  ? "Get Started Free"
                                                  : "Subscribe Now"}
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
