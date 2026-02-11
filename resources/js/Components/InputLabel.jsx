export default function InputLabel({
    value,
    className = "",
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-bold uppercase tracking-wider text-industrial-grey mb-1 ` +
                className
            }
            xmlns="http://www.w3.org/2000/svg"
        >
            {value ? value : children}
        </label>
    );
}
