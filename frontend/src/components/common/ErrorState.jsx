import React from 'react';
import { Icon } from "@iconify/react";
import { Button, Card, CardBody } from "@heroui/react";

/**
 * ErrorState Component
 * Displays when API calls fail or errors occur
 * @param {Object} props
 * @param {string} props.icon - Icon to display (default: mdi:alert-circle)
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message/description
 * @param {string} props.actionLabel - Label for retry/action button
 * @param {Function} props.onAction - Callback for retry/action button
 */
export default function ErrorState({
    icon = "mdi:alert-circle",
    title = "Something went wrong",
    message = "We encountered an error while loading this data. Please try again.",
    actionLabel = "Try Again",
    onAction
}) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <Card className="max-w-md border-2 border-danger-200 bg-danger-50/50">
                <CardBody className="p-8">
                    <div className="w-20 h-20 rounded-full bg-danger-100 flex items-center justify-center mb-4 mx-auto">
                        <Icon icon={icon} className="text-5xl text-danger-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-danger-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-danger-700 mb-6">
                        {message}
                    </p>
                    {actionLabel && onAction && (
                        <Button
                            color="danger"
                            variant="flat"
                            onPress={onAction}
                            startContent={<Icon icon="mdi:refresh" />}
                        >
                            {actionLabel}
                        </Button>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
