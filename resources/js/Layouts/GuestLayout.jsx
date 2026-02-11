import { Link } from "@inertiajs/react";
import { IconFile } from "@tabler/icons-react";

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-industrial-white industrial-grid text-industrial-grey">
            <div className="w-full sm:max-w-md mt-6 px-8 py-10 bg-white border-4 border-industrial-grey shadow-[8px_8px_0px_0px_rgba(42,42,42,1)]">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 border-2 border-industrial-grey bg-white shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all duration-0">
                             <IconFile size={32} strokeWidth={2.5} />
                        </div>
                        <span className="text-3xl font-black uppercase tracking-tighter text-industrial-grey">
                            DocDigest
                        </span>
                    </Link>
                </div>

                {children}
            </div>
        </div>
    );
}
