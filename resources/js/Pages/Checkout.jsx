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

            <div className="min-h-screen bg-industrial-white industrial-grid text-industrial-grey flex flex-col">
                {/* Navbar */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-industrial-grey">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-industrial-grey hover:underline decoration-2 font-bold uppercase tracking-wider"
                            >
                                <IconArrowLeft size={24} strokeWidth={2.5} />
                                <span>Go Back</span>
                            </Link>
                            <div className="font-black uppercase tracking-tighter text-xl">DocDigest Checkout</div>
                        </div>
                    </div>
                </nav>

                {/* Content */}
                <div className="relative z-10 flex-1 flex items-center justify-center p-4 pt-32 pb-12">
                    <div className="w-full max-w-lg">
                        <div className="bg-white border-4 border-industrial-grey shadow-[12px_12px_0px_0px_rgba(42,42,42,1)] p-12">
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 mx-auto border-2 border-industrial-grey flex items-center justify-center mb-6 text-industrial-grey shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] bg-white">
                                    <IconRocket size={40} strokeWidth={1.5} />
                                </div>
                                <h1 className="text-3xl font-black text-industrial-grey uppercase mb-2">
                                    Order Summary
                                </h1>
                                <p className="text-industrial-grey font-mono text-sm">
                                    Finalize your subscription.
                                </p>
                            </div>

                            <div className="bg-white border-2 border-industrial-grey p-6 mb-10">
                                <div className="flex justify-between items-baseline mb-6 pb-6 border-b-2 border-dashed border-industrial-grey">
                                    <h3 className="text-xl font-black text-industrial-grey uppercase">
                                        {safePlan.name}
                                    </h3>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-industrial-grey">
                                            ${safePlan.price}
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-industrial-grey">
                                            /month
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {Array.isArray(safePlan.features) &&
                                        safePlan.features.map((feature, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 text-sm font-bold text-industrial-grey"
                                            >
                                                <IconCheck
                                                    size={18}
                                                    className="text-industrial-grey shrink-0 border border-industrial-grey p-0.5"
                                                    strokeWidth={3}
                                                />
                                                <span className="uppercase tracking-wide">{feature}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSubscribe}
                                disabled={processing}
                                className="w-full py-4 bg-industrial-grey text-white font-bold text-lg uppercase tracking-widest border-2 border-industrial-grey shadow-[4px_4px_0px_0px_#8B0000] hover:bg-white hover:text-industrial-grey hover:shadow-[6px_6px_0px_0px_rgba(42,42,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-0 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <IconCreditCard className="w-6 h-6" />
                                        <span>Pay Now</span>
                                    </>
                                )}
                            </button>

                            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-mono text-industrial-grey uppercase tracking-tighter">
                                <IconShieldLock size={16} />
                                <span>
                                    Secured by Stripe
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}