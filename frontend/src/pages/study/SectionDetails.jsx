import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    Card,
    CardBody,
    Button,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Chip,
    Progress,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Checkbox
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { studyMaterialService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { motion } from "framer-motion";

export default function SectionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isTeacherOrAdmin = ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(user?.role);

    const [section, setSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            isPublished: true
        }
    });

    const file = watch('file');

    useEffect(() => {
        fetchSection();
    }, [id]);

    const fetchSection = async () => {
        setLoading(true);
        try {
            const response = await studyMaterialService.getSectionById(id);
            if (response.success) {
                setSection(response.data.section);
            }
        } catch (error) {
            // navigate('/study-materials'); // Redirect if not found
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (data) => {
        if (!data.file || data.file.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', data.file[0]);
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        formData.append('isPublished', data.isPublished);

        try {
            const response = await studyMaterialService.uploadMaterial(id, formData, (percent) => {
                setUploadProgress(percent);
            });

            if (response.success) {
                fetchSection();
                onClose();
                reset();
                setUploadProgress(0);
            }
        } catch (error) {
            alert("Upload failed: " + (error.message || "Unknown error"));
        } finally {
            setIsUploading(false);
        }
    };

    const handleMaterialClick = (material) => {
        if (material.type === 'VIDEO') {
            navigate(`/study-materials/video/${material.id}`);
        } else {
            // Download document
            studyMaterialService.downloadDocument(material.id, material.originalFileName)
                .catch(err => alert("Download failed: " + err.message));
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (!confirm("Are you sure you want to delete this material?")) return;
        try {
            await studyMaterialService.deleteMaterial(materialId);
            fetchSection();
        } catch (error) {
        }
    };

    const handleTogglePublish = async (materialId) => {
        try {
            await studyMaterialService.toggleMaterialPublish(materialId);
            fetchSection();
        } catch (error) {
        }
    };

    // Helper to get icon based on type
    const getFileIcon = (type) => {
        switch (type) {
            case 'VIDEO': return "mdi:video-box";
            case 'PDF': return "mdi:file-pdf-box";
            case 'PPT': return "mdi:file-powerpoint-box";
            default: return "mdi:file";
        }
    };

    // Helper to get color based on type
    // Helper to get color based on type
    const getFileColor = (type, status = 'COMPLETED') => {
        if (status === 'PROCESSING') return "text-yellow-500";
        if (status === 'FAILED') return "text-red-500";
        switch (type) {
            case 'VIDEO': return "text-red-500";
            case 'PDF': return "text-red-600";
            case 'PPT': return "text-orange-500";
            default: return "text-gray-500";
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading section contents...</p>
            </div>
        </div>
    );

    if (!section) return (
        <div className="text-center py-20 text-red-500">
            Section not found.
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-zinc-800">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onPress={() => navigate('/study-materials')}
                            >
                                <Icon icon="mdi:arrow-left" className="text-xl" />
                            </Button>
                            <Chip size="sm" color="primary" variant="flat">{section.Subject?.name}</Chip>
                            <Chip size="sm" variant="bordered">{section.Class?.name} {section.sectionId || ''}</Chip>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{section.title}</h1>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl">{section.description}</p>
                    </div>

                    {isTeacherOrAdmin && (
                        <div className="flex gap-2 items-start">
                            <Button color="primary" startContent={<Icon icon="mdi:upload" />} onPress={onOpen}>
                                Add Material
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content List */}
            <div className="grid gap-4">
                {section.materials?.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed">
                        <Icon icon="mdi:folder-open-outline" className="text-5xl text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No materials in this section yet.</p>
                        {isTeacherOrAdmin && (
                            <Button color="primary" variant="flat" className="mt-4" onPress={onOpen}>
                                Add Material
                            </Button>
                        )}
                    </div>
                ) : (
                    section.materials.map((material) => (
                        <motion.div
                            key={material.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center gap-4 group"
                        >
                            {/* Icon / Thumbnail Box */}
                            <div
                                className={`w-14 h-14 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-zinc-800 cursor-pointer ${getFileColor(material.type, material.status)}`}
                                onClick={() => {
                                    if (material.status !== 'PROCESSING' && material.status !== 'FAILED') {
                                        handleMaterialClick(material);
                                    }
                                }}
                            >
                                <Icon icon={getFileIcon(material.type)} className="text-3xl" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleMaterialClick(material)}>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                        {material.title}
                                    </h3>
                                    {!material.isPublished && (
                                        <Chip size="sm" color="warning" variant="flat" className="h-5 text-xs">Unpublished</Chip>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Icon icon={material.type === 'VIDEO' ? "mdi:clock-outline" : "mdi:file-outline"} />
                                        {material.type === 'VIDEO'
                                            ? `${Math.floor((material.duration || 0) / 60)}:${String((material.duration || 0) % 60).padStart(2, '0')} min`
                                            : `${(material.fileSize / 1024 / 1024).toFixed(1)} MB`
                                        }
                                    </span>
                                    <span>•</span>
                                    <span>Added by {material.uploader?.name}</span>
                                    <span>•</span>
                                    <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                                </div>
                                {material.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{material.description}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color={material.type === 'VIDEO' ? "primary" : "secondary"}
                                    startContent={<Icon icon={material.type === 'VIDEO' ? "mdi:play" : "mdi:download"} />}
                                    onPress={() => handleMaterialClick(material)}
                                    isDisabled={material.status === 'PROCESSING' || material.status === 'FAILED'}
                                >
                                    {material.type === 'VIDEO' ? "Watch" : "Download"}
                                </Button>


                                {material.status === 'PROCESSING' && (
                                    <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg text-sm">
                                        Processing...
                                    </div>
                                )}

                                {material.status === 'FAILED' && (
                                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm">
                                        <Icon icon="mdi:alert" />
                                        Failed
                                    </div>
                                )}

                                {isTeacherOrAdmin && (
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button isIconOnly size="sm" variant="light">
                                                <Icon icon="mdi:dots-vertical" className="text-lg" />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu aria-label="Material actions">
                                            <DropdownItem
                                                startContent={<Icon icon={material.isPublished ? "mdi:eye-off" : "mdi:eye"} />}
                                                onPress={() => handleTogglePublish(material.id)}
                                            >
                                                {material.isPublished ? "Unpublish" : "Publish"}
                                            </DropdownItem>
                                            <DropdownItem
                                                startContent={<Icon icon="mdi:delete" />}
                                                className="text-danger"
                                                color="danger"
                                                onPress={() => handleDeleteMaterial(material.id)}
                                            >
                                                Delete
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            <Modal
                isOpen={isOpen}
                onClose={() => { if (!isUploading) onClose(); }}
                isDismissable={!isUploading}
                hideCloseButton={isUploading}
                size="2xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit(handleUpload)}>
                            <ModalHeader>Upload Material</ModalHeader>
                            <ModalBody>
                                {isUploading ? (
                                    <div className="py-10 text-center space-y-4">
                                        <div className="flex justify-center mb-4">
                                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
                                        </div>
                                        <h3 className="text-xl font-semibold">Uploading...</h3>
                                        <p className="text-gray-500">Please wait while your file is being uploaded.</p>
                                        <Progress
                                            value={uploadProgress}
                                            showValueLabel={true}
                                            className="max-w-md mx-auto"
                                            color="primary"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
                                            <input
                                                type="file"
                                                {...register('file', { required: "File is required" })}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                accept=".mp4,.webm,.pdf,.ppt,.pptx"
                                            />
                                            {file && file.length > 0 ? (
                                                <div className="flex flex-col items-center">
                                                    <Icon icon="mdi:file-check" className="text-4xl text-green-500 mb-2" />
                                                    <p className="font-semibold text-gray-700">{file[0].name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{(file[0].size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <Icon icon="mdi:cloud-upload" className="text-4xl text-gray-400 mb-2" />
                                                    <p className="font-semibold text-gray-700">Click or Drag file to upload</p>
                                                    <p className="text-xs text-gray-500 mt-1">Supports MP4, PDF, PPT</p>
                                                </div>
                                            )}
                                        </div>
                                        {errors.file && <p className="text-xs text-red-500">{errors.file.message}</p>}

                                        <Input
                                            {...register('title', { required: "Title is required" })}
                                            label="Title"
                                            placeholder="e.g. Lecture 1: Introduction"
                                            isInvalid={!!errors.title}
                                            errorMessage={errors.title?.message}
                                        />

                                        <Input
                                            {...register('description')}
                                            label="Description (Optional)"
                                            placeholder="Brief description of the content"
                                        />

                                        <Checkbox
                                            defaultSelected
                                            {...register('isPublished')}
                                        >
                                            Publish Immediately
                                        </Checkbox>

                                        <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg flex items-start gap-2">
                                            <Icon icon="mdi:information-outline" className="text-lg flex-shrink-0" />
                                            <p>Videos will be converted for secure streaming. This may take some time depending on video length. Downloads are disabled for videos.</p>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                {!isUploading && (
                                    <>
                                        <Button color="danger" variant="light" onPress={onClose}>
                                            Cancel
                                        </Button>
                                        <Button color="primary" type="submit" isLoading={isUploading}>
                                            Upload
                                        </Button>
                                    </>
                                )}
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
