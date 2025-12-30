import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function PageHeader({ title, description, action, showBack = false }) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                {showBack && (
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => navigate(-1)}
                        className="min-w-10 w-10 h-10"
                    >
                        <Icon icon="mdi:arrow-left" className="text-xl" />
                    </Button>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    {description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                    )}
                </div>
            </div>
            {action && (
                <div className="flex-shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}
