export default function InputError({ message, className = "", ...props }) {
    return message ? (
        <p
            {...props}
            className={"text-sm font-bold uppercase tracking-wide text-red-600 " + className}
        >
            {message}
        </p>
    ) : null;
}
