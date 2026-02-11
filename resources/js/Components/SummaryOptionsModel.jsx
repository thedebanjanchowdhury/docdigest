import React from "react";
import {
    IconX,
    IconAlignLeft2,
    IconList,
    IconBulb,
    IconFileText,
    IconLock,
} from "@tabler/icons-react";
import { router } from "@inertiajs/react";

const summaryOptions = [
    {
        type: "default",
        icon: IconAlignLeft2,
        title: "Standard",
        description: "Balanced Executive Abstract",
        requiredPlan: "basic",
    },
    {
        type: "bullets",
        icon: IconList,
        title: "Bullets",
        description: "Key Statistics & Data Extraction",
        requiredPlan: "basic",
    },
    {
        type: "insights",
        icon: IconBulb,
        title: "Insight",
        description: "Deep Analysis & Strategy",
        requiredPlan: "standard",
    },
    {
        type: "detailed",
        icon: IconFileText,
        title: "Detailed",
        description: "Comprehensive Research Review",
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
            if (confirm(`This feature requires a ${option.requiredPlan.toUpperCase()} plan. Go to checkout?`)) {
                 // In a real app, route to specific plan checkout or pricing
                 router.visit("/dashboard"); 
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-industrial-white opacity-90" onClick={onClose}></div>
            
            <div className="relative w-full max-w-4xl bg-white border-4 border-industrial-grey shadow-[12px_12px_0px_0px_rgba(42,42,42,1)] p-8">
                <div className="flex items-start justify-between mb-8 pb-8 border-b-4 border-industrial-grey">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="bg-industrial-grey text-white p-1 text-xs font-bold uppercase tracking-widest">
                                 Selection Required
                             </div>
                        </div>
                        <h1 className="text-4xl font-black text-industrial-grey uppercase mb-2">
                            Select Output Format
                        </h1>
                        <p className="text-industrial-grey font-mono text-sm border-l-4 border-industrial-red pl-3">
                            Target: <span className="font-bold">{fileName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 border-2 border-industrial-grey hover:bg-industrial-grey hover:text-white transition-colors duration-0"
                    >
                        <IconX className="h-8 w-8" strokeWidth={2.5} />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {summaryOptions.map((option) => {
                        const isLocked = !canAccess(option.requiredPlan);
                        
                        return (
                            <button
                                key={option.type}
                                onClick={() => handleClick(option)}
                                className={`group relative flex flex-col items-start p-6 border-4 text-left transition-all duration-0 h-full ${
                                    isLocked 
                                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-70" 
                                        : "border-industrial-grey bg-white hover:bg-industrial-grey hover:text-white"
                                }`}
                            >
                                {isLocked && (
                                    <div className="absolute top-4 right-4 text-gray-400">
                                        <IconLock size={24} />
                                    </div>
                                )}
                                
                                <div className={`mb-4 p-3 border-2 ${
                                    isLocked
                                        ? "border-gray-300 text-gray-400"
                                        : "border-industrial-grey text-industrial-grey bg-white group-hover:border-white group-hover:text-industrial-grey"
                                }`}>
                                    <option.icon size={32} strokeWidth={2} />
                                </div>

                                <h3 className={`text-xl font-black uppercase mb-2 ${
                                    isLocked ? "text-gray-400" : "text-industrial-grey group-hover:text-white"
                                }`}>
                                    {option.title}
                                </h3>
                                
                                <p className={`font-mono text-xs mb-4 ${
                                    isLocked ? "text-gray-400" : "text-gray-600 group-hover:text-gray-300"
                                }`}>
                                    {option.description}
                                </p>

                                {isLocked && (
                                    <div className="mt-auto inline-block bg-gray-200 text-gray-500 text-xs font-bold uppercase px-2 py-1">
                                        Requires {option.requiredPlan}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SummaryOptionsModel;
