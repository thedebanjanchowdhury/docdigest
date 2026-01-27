import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    IconCheck,
    IconArrowLeft,
    IconShieldLock,
    IconCreditCard,
    IconRocket,
} from "@tabler/icons-react";

export default function Checkout({ plan }) {
    const [processing, setProcessing] = useState(false);

    const safePlan = {
        ...plan,
        features:
            typeof plan.features === "string"
                ? JSON.parse(plan.features)
                : plan.features || [],
    };

    const handleSubscribe = () => {
        if (processing) return;

        setProcessing(true);

        router.post(
            `/subscription/create-checkout-session/${safePlan.slug}`,
            {},
            {
                onError: (errors) => {
                    alert(
                        "Payment failed: " +
                            (errors.message || "Please try again"),
                    );
                    setProcessing(false);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    return (
        <>
            <Head title={`Checkout - ${safePlan.name}`} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-violet-900 overflow-x-hidden selection:bg-violet-500 selection:text-white flex flex-col">
                {/* Dynamic Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl animate-pulse opacity-20"></div>
                    <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-20"></div>
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl opacity-20"></div>
                </div>

                {/* Navbar */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800 transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <IconArrowLeft size={20} />
                                <span className="font-medium">Back</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Content */}
                <div className="relative z-10 flex-1 flex items-center justify-center p-4 pt-24 pb-12">
                    <div className="w-full max-w-lg">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400">
                                    <IconRocket size={32} />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    Order Summary
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Review your subscription details before
                                    proceeding.
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-700/50">
                                <div className="flex justify-between items-baseline mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                                        {safePlan.name} Plan
                                    </h3>
                                    <div className="text-right">
                                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                            ${safePlan.price}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            /month
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    {Array.isArray(safePlan.features) &&
                                        safePlan.features.map((feature, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                                            >
                                                <IconCheck
                                                    size={18}
                                                    className="text-emerald-500 shrink-0 mt-0.5"
                                                />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSubscribe}
                                disabled={processing}
                                className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <IconCreditCard className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        <span>Proceed to Payment</span>
                                    </>
                                )}
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                                <IconShieldLock size={14} />
                                <span>
                                    Secure payment powered by Stripe. Cancel
                                    anytime.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}