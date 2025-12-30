import React from 'react';
import { Icon } from "@iconify/react";
import { Button } from "@heroui/react";

export default function EmptyState({
    icon = "mdi:inbox",
    title = "No data found",
    description = "There are no items to display at the moment.",
    actionLabel,
    onAction
}) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Icon icon={icon} className="text-5xl text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button
                    color="primary"
                    variant="flat"
                    onPress={onAction}
                    startContent={<Icon icon="mdi:plus" />}
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
