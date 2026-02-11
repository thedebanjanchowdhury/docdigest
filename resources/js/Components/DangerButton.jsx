export default function DangerButton({
    className = "",
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center border-2 border-red-600 bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all duration-0 hover:bg-white hover:text-red-600 shadow-[2px_2px_0px_0px_rgba(139,0,0,1)] focus:outline-none active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
                    disabled && "opacity-25"
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
