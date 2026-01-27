import React from "react";

import { IconCheckbox, IconX } from "@tabler/icons-react";

const FlashMessage = ({ type }) => {
    return (
        <>
            {type?.success && (
                <div className="">
                    <IconCheckbox />
                    <p>{type.success}</p>
                </div>
            )}

            {type?.error && (
                <div className="">
                    <IconX />
                    <p>{type.error}</p>
                </div>
            )}
        </>
    );
};

export default FlashMessage;
