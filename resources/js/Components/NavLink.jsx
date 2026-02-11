import { Link } from "@inertiajs/react";

export default function NavLink({
    active = false,
    className = "",
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                "inline-flex items-center pt-1 text-sm font-bold uppercase tracking-wider leading-5 transition duration-0 ease-in-out focus:outline-none border-b-4 " +
                (active
                    ? "border-industrial-grey text-industrial-grey"
                    : "border-transparent text-gray-400 hover:text-industrial-grey hover:border-gray-300 focus:text-industrial-grey focus:border-gray-300") +
                className
            }
        >
            {children}
        </Link>
    );
}
