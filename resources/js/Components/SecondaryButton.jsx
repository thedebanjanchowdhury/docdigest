export default function SecondaryButton({
    type = "button",
    className = "",
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center border-2 border-industrial-grey bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-industrial-grey shadow-[2px_2px_0px_0px_rgba(42,42,42,1)] transition-all duration-0 hover:bg-industrial-grey hover:text-white focus:outline-none disabled:opacity-25 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
                    disabled && "opacity-25"
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
