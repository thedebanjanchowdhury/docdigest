import React from "react";
import {
    IconX,
    IconAlignLeft2,
    IconList,
    IconBulb,
    IconFileText,
} from "@tabler/icons-react";
import { router } from "@inertiajs/react";

const summaryOptions = [
    {
        type: "default",
        icon: IconAlignLeft2,
        title: "Standard Summary",
        description: "Concise Overview",
        color: "violet",
        requiredPlan: "basic",
    },
    {
        type: "bullets",
        icon: IconList,
        title: "Bullet Point Summary",
        description: "Key Points with Bullet Points",
        color: "indigo",
        requiredPlan: "basic",
    },
    {
        type: "insights",
        icon: IconBulb,
        title: "Insight Summary",
        description: "Deep Insights and Analysis",
        color: "blue",
        requiredPlan: "standard",
    },
    {
        type: "detailed",
        icon: IconFileText,
        title: "Detailed Summary",
        description: "Comprehensive Analysis",
        color: "green",
        requiredPlan: "premium",
    },
];

const planHierarchy = {
    basic: 1,
    standard: 2,
    premium: 3,
};

const SummaryOptionsModel = ({
    show,
    fileName,
    userPlanSlug,
    onClose,
    onSelect,
}) => {
    if (!show) return null;

    const canAccess = (requiredPlan) => {
        const userLevel = planHierarchy[userPlanSlug] || 1;
        const requiredLevel = planHierarchy[requiredPlan] || 1;
        return userLevel >= requiredLevel;
    };

    const handleClick = (option) => {
        if (canAccess(option.requiredPlan)) {
            onSelect(option.type);
        } else {
            alert(`This feature requires a ${option.requiredPlan} plan.`);
            router.visit("/dashboard");
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="">
                                <h1 className="text-2xl font-bold text-white">
                                    Choose Summary Type
                                </h1>
                                <p className="text-sm text-white/80">
                                    {fileName}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 roundedn-lg hover:bg-white/20"
                            >
                                <IconX className="h-6 w-6 text-white" />
                            </button>
                        </div>
                    </div>
                    <div className="p-8 grid md:grid-cols-2 gap-4">
                        {summaryOptions.map((option) => {
                            const isLocked = !canAccess(option.requiredPlan);
                            return (
                                <button
                                    key={option.type}
                                    onClick={() => handleClick(option)}
                                    className="flex flex-col items-center gap-2 p-6 rounded-xl border border-gray-200 hover:border-violet-600 transition-colors"
                                >
                                    <option.icon className="w-12 h-12 text-violet-600" />
                                    <h3 className="text-lg font-semibold">
                                        {option.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {option.description}
                                    </p>
                                    {isLocked && (
                                        <p className="text-sm text-gray-600">
                                            Unlock this feature with a{" "}
                                            {option.requiredPlan} plan.
                                        </p>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SummaryOptionsModel;
