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
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">School Settings</h1>
                <p className="text-default-500">Manage your school's profile and configuration</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Logo Section */}
                <Card className="md:col-span-1 h-fit bg-content1 border border-default-200 shadow-sm">
                    <CardHeader className="pb-0 pt-6 px-4 flex-col items-center">
                        <h4 className="font-bold text-large mb-4 text-foreground">School Logo</h4>
                        <div className="relative group cursor-pointer w-48 h-48 rounded-full overflow-hidden border-4 border-default-100 shadow-sm">
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
                                <div className="flex flex-col items-center justify-center text-default-400 w-full h-full bg-default-50">
                                    <Icon icon="mdi:image-off-outline" className="text-3xl mb-1" />
                                    <span className="text-xs">No Logo</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 w-full space-y-4 mt-6">
                            <div>
                                <label className="block text-sm font-medium text-default-700 mb-2">
                                    Upload New Logo
                                </label>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleFileChange}
                                        classNames={{
                                            input: "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-default-500",
                                            inputWrapper: "bg-default-50 hover:bg-default-100 transition-colors"
                                        }}
                                        variant="flat"
                                    />
                                    <p className="text-xs text-default-400 mt-2 flex items-center gap-1">
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
                                        fullWidth
                                    >
                                        {uploading ? 'Uploading...' : 'Save Logo'}
                                    </Button>
                                    <Button
                                        color="danger"
                                        variant="flat"
                                        onPress={() => { setLogoFile(null); setPreview(''); }}
                                        isDisabled={uploading}
                                        isIconOnly
                                    >
                                        <Icon icon="mdi:close" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 pb-6">
                        {school?.logo && !logoFile && (
                            <div className="flex items-center gap-2 p-3 bg-warning/10 text-warning-600 rounded-lg text-sm border border-warning-200">
                                <Icon icon="mdi:alert-circle-outline" className="text-lg shrink-0" />
                                <span>Current logo is active. Upload to replace.</span>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Details Section */}
                <Card className="md:col-span-2 bg-content1 border border-default-200 shadow-sm">
                    <CardHeader className="flex gap-3 px-6 pt-6">
                        <div className="flex flex-col">
                            <p className="text-md font-bold text-foreground">School Information</p>
                            <p className="text-small text-default-500">Update your school's basic details</p>
                        </div>
                    </CardHeader>
                    <Divider className="my-2 bg-default-100" />
                    <CardBody className="px-6 py-4">
                        {school ? (
                            <div className="flex flex-col gap-4">
                                <Input
                                    label="School Name"
                                    placeholder="Enter school name"
                                    variant="bordered"
                                    value={school.name || ''}
                                    isReadOnly
                                    description="Contact support to change school name"
                                    classNames={{
                                        inputWrapper: "bg-default-50/50"
                                    }}
                                />

                                <Input
                                    label="Address"
                                    placeholder="Enter school address"
                                    variant="bordered"
                                    value={school.address || ''}
                                    onChange={(e) => setSchool({ ...school, address: e.target.value })}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Board"
                                        placeholder="e.g. CBSE"
                                        variant="bordered"
                                        value={school.board || ''}
                                        onChange={(e) => setSchool({ ...school, board: e.target.value })}
                                    />
                                    <Input
                                        label="Academic Year"
                                        placeholder="e.g. 2023-2024"
                                        variant="bordered"
                                        value={school.academicYear || ''}
                                        onChange={(e) => setSchool({ ...school, academicYear: e.target.value })}
                                    />
                                </div>

                                <Divider className="my-2 bg-default-100" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Phone Number"
                                        placeholder="Enter phone number"
                                        variant="bordered"
                                        value={school.phone || ''}
                                        onChange={(e) => setSchool({ ...school, phone: e.target.value })}
                                        startContent={
                                            <Icon icon="mdi:phone" className="text-default-400 text-xl" />
                                        }
                                    />
                                    <Input
                                        label="Email Address"
                                        placeholder="Enter email address"
                                        variant="bordered"
                                        value={school.email || school.adminEmail || ''}
                                        onChange={(e) => setSchool({ ...school, email: e.target.value })}
                                        startContent={
                                            <Icon icon="mdi:email" className="text-default-400 text-xl" />
                                        }
                                    />
                                </div>

                                <Input
                                    label="Website"
                                    placeholder="Enter website URL"
                                    variant="bordered"
                                    value={school.website || ''}
                                    onChange={(e) => setSchool({ ...school, website: e.target.value })}
                                    startContent={
                                        <Icon icon="mdi:web" className="text-default-400 text-xl" />
                                    }
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center py-8 text-default-500">
                                No school details available.
                            </div>
                        )}

                        <div className="flex justify-end mt-8">
                            <Button
                                color="primary"
                                className="font-semibold shadow-md"
                                // Note: Save functionality is a placeholder here as per original file structure/services
                                onPress={() => addToast({ title: "Note", description: "Save functionality to be implemented in backend integration", color: "warning" })}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default SchoolSettings;
