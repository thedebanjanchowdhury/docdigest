export default function PrimaryButton({
    className = "",
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center px-6 py-3 bg-industrial-grey border-2 border-industrial-grey font-bold text-sm text-white uppercase tracking-widest hover:bg-white hover:text-industrial-grey shadow-[4px_4px_0px_0px_#8B0000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-industrial-grey transition-all duration-0 disabled:opacity-50 ` +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
