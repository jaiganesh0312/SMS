import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

/**
 * Reusable confirmation modal component
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when modal is closed/cancelled
 * @param {function} onConfirm - Called when user confirms the action
 * @param {string} title - Modal title
 * @param {string} message - Confirmation message
 * @param {string} confirmText - Text for confirm button (default: "Confirm")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 * @param {string} confirmColor - Color variant for confirm button (default: "danger")
 * @param {string} icon - Iconify icon name (default: "mdi:alert-circle")
 * @param {boolean} isLoading - Shows loading state on confirm button
 */
export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'danger',
    icon = 'mdi:alert-circle',
    isLoading = false,
}) {
    const handleConfirm = async () => {
        if (onConfirm) {
            await onConfirm();
        }
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            e.preventDefault();
            handleConfirm();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            backdrop="blur"

            onKeyDown={handleKeyDown}
        >
            <ModalContent>
                {(onModalClose) => (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmColor === 'danger'
                                    ? 'bg-danger-100 dark:bg-danger-900/30'
                                    : confirmColor === 'warning'
                                        ? 'bg-warning-100 dark:bg-warning-900/30'
                                        : 'bg-primary-100 dark:bg-primary-900/30'
                                    }`}>
                                    <Icon
                                        icon={icon}
                                        className={`text-xl ${confirmColor === 'danger'
                                            ? 'text-danger'
                                            : confirmColor === 'warning'
                                                ? 'text-warning'
                                                : 'text-primary'
                                            }`}
                                    />
                                </div>
                                <h3 className="text-lg font-semibold">{title}</h3>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <p className="text-gray-600 dark:text-gray-400">
                                {message}
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={onModalClose}
                                isDisabled={isLoading}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                color={confirmColor}
                                onPress={handleConfirm}
                                isLoading={isLoading}
                            >
                                {confirmText}
                            </Button>
                        </ModalFooter>
                    </motion.div>
                )}
            </ModalContent>
        </Modal>
    );
}
