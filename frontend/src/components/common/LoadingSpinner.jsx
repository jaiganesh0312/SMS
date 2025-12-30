import React from 'react';
import { Spinner } from "@heroui/react";

export default function LoadingSpinner({ size = "lg", label = "Loading...", fullPage = false }) {
    if (fullPage) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Spinner size={size} color="primary" label={label} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
                <Spinner size={size} color="primary" label={label} />
            </div>
        </div>
    );
}
