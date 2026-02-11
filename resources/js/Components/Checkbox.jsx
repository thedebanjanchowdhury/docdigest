export default function Checkbox({ className = "", ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                "rounded-none border-2 border-industrial-grey text-industrial-grey shadow-[2px_2px_0px_0px_rgba(42,42,42,1)] focus:ring-0 focus:ring-offset-0 focus:border-industrial-grey checked:bg-industrial-grey checked:focus:bg-industrial-grey " +
                className
            }
        />
    );
}
