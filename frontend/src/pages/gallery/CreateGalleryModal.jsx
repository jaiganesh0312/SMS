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
        <Modal isOpen={isOpen} onClose={resetForm} size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            {step === 1 ? "Create New Album" : "Upload Photos"}
                        </ModalHeader>
                        <ModalBody>
                            {step === 1 ? (
                                <div className="space-y-4">
                                    <Input
                                        label="Album Title"
                                        placeholder="e.g., Annual Sports Day 2025"
                                        name="title"
                                        value={galleryData.title}
                                        onChange={handleInputChange}
                                        isRequired
                                    />
                                    <Input
                                        type="date"
                                        label="Event Date"
                                        name="eventDate"
                                        value={galleryData.eventDate}
                                        onChange={handleInputChange}
                                        isRequired
                                    />
                                    <Textarea
                                        label="Description"
                                        placeholder="Brief description of the event..."
                                        name="description"
                                        value={galleryData.description}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4 text-center">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                                        <Icon icon="lucide:image-plus" className="mx-auto text-4xl text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500 mb-4">Click to select photos</p>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-primary-50 file:text-primary-700
                                                hover:file:bg-primary-100"
                                        />
                                    </div>
                                    {files.length > 0 && (
                                        <p className="text-success font-semibold">{files.length} images selected</p>
                                    )}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            {step === 1 ? (
                                <Button color="primary" onPress={handleCreateGallery} isLoading={loading}>
                                    Next: Upload Photos
                                </Button>
                            ) : (
                                <Button color="success" onPress={handleUploadImages} isLoading={loading} className="text-white">
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
