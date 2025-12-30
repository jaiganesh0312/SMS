import React, { useState, useEffect } from 'react';
import schoolService from '../../services/schoolService';
import {
    addToast,
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Image,
    Spinner,
    Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";

const SchoolSettings = () => {
    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logoFile, setLogoFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSchoolDetails();
    }, []);

    const fetchSchoolDetails = async () => {
        try {
            const data = await schoolService.getSchoolDetails();
            if (data.success) {
                setSchool(data.data);
            }
        } catch (error) {
            console.error('Error fetching school details:', error);
            addToast({
                title: "Error",
                description: "Failed to load school details",
                color: "danger"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!logoFile) {
            addToast({
                title: "Validation Error",
                description: "Please select a file first",
                color: "danger"
            });
            return;
        }

        const formData = new FormData();
        formData.append('logo', logoFile);

        setUploading(true);
        try {
            const response = await schoolService.uploadLogo(formData);
            if (response.success) {
                addToast({
                    title: "Success",
                    description: "School logo uploaded successfully",
                    color: "success"
                });
                setSchool({ ...school, logo: response.data.logo });
                setLogoFile(null);
                setPreview('');
            } else {
                addToast({
                    title: "Upload Failed",
                    description: response.message || "Upload failed",
                    color: "danger"
                });
            }
        } catch (error) {
            console.error('Upload logo error:', error);
            addToast({
                title: "Error",
                description: error.message || "An error occurred during upload",
                color: "danger"
            });
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Spinner size="lg" label="Loading settings..." />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">School Settings</h1>

            <Card className="w-full">
                <CardHeader className="flex gap-3 px-6 pt-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon icon="mdi:domain" className="text-2xl text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-md font-semibold text-gray-700 dark:text-gray-200">General Information</p>
                        <p className="text-small text-default-500">Basic details about your school</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="px-6 py-6">
                    {school ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">School Name</p>
                                <p className="font-medium text-lg text-gray-900 dark:text-gray-100">{school.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{school.address || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Board</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{school.board || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Academic Year</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{school.academicYear || 'N/A'}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No school details found.</p>
                    )}
                </CardBody>
            </Card>

            <Card className="w-full">
                <CardHeader className="flex gap-3 px-6 pt-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon icon="mdi:image-area" className="text-2xl text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-md font-semibold text-gray-700 dark:text-gray-200">School Logo</p>
                        <p className="text-small text-default-500">Upload and manage school branding</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="px-6 py-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-40 h-40 border-2 border-default-200 border-dashed rounded-xl flex items-center justify-center bg-default-50 overflow-hidden relative">
                            {preview ? (
                                <Image
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                    removeWrapper
                                />
                            ) : school?.logo ? (
                                <Image
                                    src={`${import.meta.env.VITE_API_URL}/${school.logo}`}
                                    alt="School Logo"
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Logo'; }}
                                    removeWrapper
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-default-400">
                                    <Icon icon="mdi:image-off-outline" className="text-3xl mb-1" />
                                    <span className="text-xs">No Logo</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Upload New Logo
                                </label>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleFileChange}
                                        classNames={{
                                            input: "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20",
                                        }}
                                    />
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <Icon icon="mdi:information-outline" />
                                        Supported formats: PNG, JPG (Max 2MB)
                                    </p>
                                </div>
                            </div>

                            {logoFile && (
                                <div className="flex gap-3">
                                    <Button
                                        color="primary"
                                        onPress={handleUpload}
                                        isLoading={uploading}
                                        startContent={!uploading && <Icon icon="mdi:cloud-upload" />}
                                    >
                                        {uploading ? 'Uploading...' : 'Save Logo'}
                                    </Button>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={() => { setLogoFile(null); setPreview(''); }}
                                        isDisabled={uploading}
                                    >
                                        Cancel
                                    </Button>

                                </div>
                            )}
                            {school?.logo && !logoFile && (
                                <div className="flex items-center gap-2 p-3 bg-warning/10 text-warning rounded-lg text-sm">
                                    <Icon icon="mdi:alert-circle-outline" className="text-lg" />
                                    Current logo is active. Uploading a new one will replace it.
                                </div>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default SchoolSettings;
