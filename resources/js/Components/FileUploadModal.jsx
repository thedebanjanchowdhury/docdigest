import React, { useRef, useState } from 'react';
import Modal from '@/Components/Modal';
import { IconCloudUpload, IconX, IconFile } from '@tabler/icons-react';
import { router } from '@inertiajs/react';

export default function FileUploadModal({ show, onClose, userStats, onFileSelect }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const processFile = (file) => {
        if (!file) return;

        if (userStats && !userStats.canUpload) {
            alert(`PDF Limit Reached (${userStats.pdf_count}/${userStats.pdf_limit})`);
             // We might want to close or redirect here
             // Using inertia router to redirect if needed, but alert is fine for now
            return;
        }

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }

        onFileSelect(file);
        onClose(); // Close upload modal, enabling parent to show options modal
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Document</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <IconX size={24} />
                    </button>
                </div>

                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-gray-50 dark:bg-gray-700/50 ${
                        isDragging
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-violet-400'
                    }`}
                    onClick={() => {
                    if (fileInputRef.current) {
                        fileInputRef.current.value = null;
                        fileInputRef.current.click();
                    }
                }}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="application/pdf"
                        className="hidden"
                    />

                    <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconCloudUpload size={32} />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Click or drag file to upload
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        PDF up to 10MB
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        By uploading, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
