import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-industrial-white industrial-grid">
            <nav className="bg-industrial-white border-b-4 border-industrial-grey">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-industrial-grey" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route("dashboard")}
                                    active={route().current("dashboard")}
                                    className="uppercase font-bold tracking-widest text-industrial-grey hover:bg-industrial-grey hover:text-industrial-white transition-colors duration-0 px-4 h-full flex items-center border-l-2 border-r-2 border-transparent hover:border-industrial-grey"
                                >
                                    Dashboard
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-4 py-2 border-2 border-industrial-grey bg-white text-sm font-bold leading-4 text-industrial-grey hover:bg-industrial-grey hover:text-white transition duration-0 shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                                            >
                                                {user.name.toUpperCase()}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content contentClasses="bg-white border-2 border-industrial-grey shadow-[4px_4px_0px_0px_rgba(42,42,42,1)] py-0">
                                        <Dropdown.Link href={route("profile.edit")} className="border-b-2 border-industrial-grey hover:bg-industrial-grey hover:text-white font-bold uppercase">
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route("logout")} method="post" as="button" className="hover:bg-industrial-red hover:text-white font-bold uppercase">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 text-industrial-grey hover:bg-industrial-grey hover:text-white border-2 border-industrial-grey transition duration-0"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? "inline-flex" : "hidden"}
                                        strokeLinecap="square"
                                        strokeLinejoin="miter"
                                        strokeWidth="3"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? "inline-flex" : "hidden"}
                                        strokeLinecap="square"
                                        strokeLinejoin="miter"
                                        strokeWidth="3"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? "block" : "hidden") + " sm:hidden border-t-4 border-industrial-grey"}>
                    <div className="space-y-0">
                        <ResponsiveNavLink href={route("dashboard")} active={route().current("dashboard")} className="border-b-2 border-industrial-grey">
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t-4 border-industrial-grey pb-1 pt-4 bg-gray-50">
                        <div className="px-4">
                            <div className="text-base font-bold text-industrial-grey uppercase">{user.name}</div>
                            <div className="text-sm font-medium text-gray-500 font-mono">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-0">
                            <ResponsiveNavLink href={route("profile.edit")} className="border-b-2 border-industrial-grey">Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route("logout")} as="button" className="border-b-2 border-industrial-grey hover:bg-industrial-red hover:text-white">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white border-b-4 border-industrial-grey">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-industrial-grey">
                            {header}
                        </h2>
                    </div>
                </header>
            )}

            <main className="py-12">{children}</main>
        </div>
    );
}
