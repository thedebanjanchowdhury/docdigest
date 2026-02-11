import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export default forwardRef(function TextInput(
    { type = "text", className = "", isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                "border-2 border-industrial-grey shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] focus:border-industrial-grey focus:ring-0 focus:shadow-[4px_4px_0px_0px_#8B0000] transition-all duration-0 bg-white text-industrial-grey placeholder-gray-400 font-mono text-sm px-4 py-3 " +
                className
            }
            ref={localRef}
        />
    );
});
