import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, addToast, Spinner } from "@heroui/react";
import { Icon } from '@iconify/react';
import { galleryService } from '@/services';

const CreateGalleryModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [galleryData, setGalleryData] = useState({
        title: '',
        description: '',
        eventDate: ''
    });
    const [createdGalleryId, setCreatedGalleryId] = useState(null);
    const [files, setFiles] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setGalleryData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleCreateGallery = async () => {
        if (!galleryData.title || !galleryData.eventDate) {
            addToast({ title: "Validation Error", description: "Title and Date are required", color: "warning" });
            return;
        }

        setLoading(true);
        try {
            const response = await galleryService.createGallery(galleryData);
            if (response?.data?.success) {
                setCreatedGalleryId(response.data.data.gallery.id);
                setStep(2); // Move to upload step
            } else {
                addToast({ title: "Error", description: response?.data?.message || "Failed to create gallery", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An error occurred", color: "danger" });
        } finally {
            setLoading(false);
        }
    };

    const handleUploadImages = async () => {
        if (files.length === 0) {
            addToast({ title: "Validation Error", description: "Please select at least one image", color: "warning" });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });

            const response = await galleryService.addImages(createdGalleryId, formData);
            if (response?.data?.success) {
                addToast({ title: "Success", description: "Gallery created successfully", color: "success" });
                onSuccess();
                resetForm();
            } else {
                addToast({ title: "Error", description: response?.data?.message || "Failed to upload images", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An error occurred during upload", color: "danger" });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setGalleryData({ title: '', description: '', eventDate: '' });
        setFiles([]);
        setCreatedGalleryId(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={resetForm} size="2xl" backdrop="blur" classNames={{
            base: "bg-content1 border border-default-200",
            header: "border-b border-default-200",
            footer: "border-t border-default-200",
            closeButton: "hover:bg-default-100 active:bg-default-200 text-default-500",
        }}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="text-foreground">
                            {step === 1 ? "Create New Album" : "Upload Photos"}
                        </ModalHeader>
                        <ModalBody className="py-6">
                            {step === 1 ? (
                                <div className="space-y-4">
                                    <Input
                                        label="Album Title"
                                        placeholder="e.g., Annual Sports Day 2025"
                                        name="title"
                                        value={galleryData.title}
                                        onChange={handleInputChange}
                                        isRequired
                                        variant="bordered"
                                        classNames={{ inputWrapper: "bg-transparent" }}
                                    />
                                    <Input
                                        type="date"
                                        label="Event Date"
                                        name="eventDate"
                                        value={galleryData.eventDate}
                                        onChange={handleInputChange}
                                        isRequired
                                        variant="bordered"
                                        classNames={{ inputWrapper: "bg-transparent" }}
                                    />
                                    <Textarea
                                        label="Description"
                                        placeholder="Brief description of the event..."
                                        name="description"
                                        value={galleryData.description}
                                        onChange={handleInputChange}
                                        variant="bordered"
                                        classNames={{ inputWrapper: "bg-transparent" }}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4 text-center">
                                    <div className="border-2 border-dashed border-default-300 rounded-lg p-8 bg-default-50 hover:bg-default-100 transition-colors relative cursor-pointer group">
                                        <Icon icon="lucide:image-plus" className="mx-auto text-4xl text-default-400 mb-2 group-hover:text-primary transition-colors" />
                                        <p className="text-sm text-default-500 mb-4">Click or drag to select photos</p>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    {files.length > 0 && (
                                        <div className="flex items-center justify-center gap-2 text-success font-medium bg-success/10 py-2 rounded-medium">
                                            <Icon icon="lucide:check-circle" />
                                            <span>{files.length} images selected</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            {step === 1 ? (
                                <Button color="primary" onPress={handleCreateGallery} isLoading={loading} className="font-semibold shadow-md shadow-primary/20">
                                    Next: Upload Photos
                                </Button>
                            ) : (
                                <Button color="success" onPress={handleUploadImages} isLoading={loading} className="text-white font-semibold shadow-md shadow-success/20">
                                    Upload & Finish
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default CreateGalleryModal;
