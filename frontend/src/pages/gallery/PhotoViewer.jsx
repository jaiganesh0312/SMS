import React from 'react';
import { Modal, ModalContent, ModalBody, Button } from "@heroui/react";
import { Icon } from '@iconify/react';

// Define the baseURL for images - assuming backend serves uploads from root or similar
// Adjust based on your actual backend static file serving configuration
// If backend is localhost:4000, and images are /uploads/..., then we need the full URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const PhotoViewer = ({ isOpen, onClose, imageUrl, title }) => {
    if (!imageUrl) return null;

    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_URL}${imageUrl}`;

    const handleDownload = async () => {
        try {
            const response = await fetch(fullImageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = title || "downloaded-image.jpg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="full"
            classNames={{
                base: "bg-black/90 text-white",
                closeButton: "text-white hover:bg-white/20"
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <ModalBody className="flex items-center justify-center h-screen relative p-0 overflow-hidden">
                        <Button
                            isIconOnly
                            variant="flat"
                            className="absolute top-4 right-16 text-white bg-white/20 hover:bg-white/30 z-50"
                            onPress={handleDownload}
                        >
                            <Icon icon="lucide:download" width={24} />
                        </Button>

                        <img
                            src={fullImageUrl}
                            alt={title}
                            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                        />
                    </ModalBody>
                )}
            </ModalContent>
        </Modal>
    );
};

export default PhotoViewer;
