import React, { useState, useEffect } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Card,
    CardHeader,
    CardBody,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Spinner,
    Input,
    addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import teacherService from '@/services/teacherService';
import parentService from '@/services/parentService';
import studentService from '@/services/studentService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const parentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    occupation: z.string().optional()
});

export default function MyStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState({});

    const [photoStudent, setPhotoStudent] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Profile Picture Modal
    const {
        isOpen: isPhotoOpen,
        onOpen: onPhotoOpen,
        onOpenChange: onPhotoOpenChange
    } = useDisclosure();

    useEffect(() => {
        fetchMyStudents();
    }, []);

    const fetchMyStudents = async () => {
        setLoading(true);
        try {
            const response = await teacherService.getMyStudents();
            if (response.data?.success) {
                setStudents(response.data.data || []);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const openPhotoModal = (student) => {
        setPhotoStudent(student);
        setPhotoFile(null);
        setPhotoPreview(student.profilePicture ? `${import.meta.env.VITE_API_URL}/${student.profilePicture}` : '');
        onPhotoOpen();
    };


    const handlePhotoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                addToast({ title: "Error", description: "File size must be less than 2MB", color: "danger" });
                return;
            }
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                addToast({ title: "Error", description: "Only JPG and PNG are allowed", color: "danger" });
                return;
            }
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadPhoto = async () => {
        if (!photoFile || !photoStudent) return;

        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('profilePicture', photoFile);

        try {
            const response = await studentService.uploadProfilePicture(photoStudent.id, formData);
            if (response.data?.success) {
                addToast({ title: "Success", description: "Profile picture updated", color: "success" });
                onPhotoOpenChange(false);
            } else {
                addToast({ title: "Error", description: "Failed to upload profile picture", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "Error uploading profile picture", color: "danger" });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleDownloadIDCard = async (student) => {
        setDownloading((prev) => ({ ...prev, [student.id]: true }));
        try {
            const result = await studentService.getIDCard(student.id, student.name);
            if (result.success) {
                addToast({ title: "Success", description: "ID Card downloaded", color: "success" });
            } else {
                addToast({ title: "Error", description: "Failed to generate ID Card", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "Error generating ID Card", color: "danger" });
        } finally {
            setDownloading((prev) => ({ ...prev, [student.id]: false }));
        }
    };


    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">My Students</h1>
                    <p className="text-default-500">Manage students in your class</p>
                </div>
            </div>

            <Card className="shadow-sm bg-content1 border border-default-200">
                <CardBody className="px-0 pb-4">
                    <Table
                        aria-label="My Students Table"
                        removeWrapper
                        className="px-4"
                        classNames={{
                            th: "bg-default-100 text-default-500 font-medium",
                            td: "text-foreground group-hover:bg-default-50",
                        }}
                    >
                        <TableHeader>
                            <TableColumn>ADMISSION NO</TableColumn>
                            <TableColumn>NAME</TableColumn>
                            <TableColumn className="hidden sm:table-cell">GENDER</TableColumn>
                            <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody
                            emptyContent={"No students enrolled in your class."}
                            isLoading={loading}
                            items={students}
                        >
                            {(student) => (
                                <TableRow key={student.id} className="border-b border-default-100 last:border-none">
                                    <TableCell>{student.admissionNumber}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{student.gender}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="primary"
                                                onPress={() => handleDownloadIDCard(student)}
                                                isLoading={downloading[student.id]}
                                                startContent={<Icon icon="mdi:download" />}
                                                className="w-full sm:w-auto"
                                            >
                                                {downloading[student.id] ? "Downloading..." : "ID Card"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="secondary"
                                                onPress={() => openPhotoModal(student)}
                                                startContent={<Icon icon="mdi:upload" />}
                                                className="w-full sm:w-auto"
                                            >
                                                Profile Picture
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            <Modal isOpen={isPhotoOpen} onOpenChange={onPhotoOpenChange} backdrop="blur" classNames={{
                base: "bg-content1 border border-default-200",
                header: "border-b border-default-200 text-foreground",
                footer: "border-t border-default-200",
                closeButton: "hover:bg-default-100 active:bg-default-200 text-default-500",
            }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Upload Profile Picture</ModalHeader>
                            <ModalBody className="py-6">
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto border-2 border-dashed border-default-300 rounded-lg flex items-center justify-center overflow-hidden mb-4 bg-default-50">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Icon icon="mdi:account" className="text-4xl text-default-300" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        onChange={handlePhotoFileChange}
                                        className="block w-full text-sm text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary-700 hover:file:bg-primary/20"
                                    />
                                    <p className="text-xs text-default-400 mt-2">JPG, PNG (Max 2MB)</p>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleUploadPhoto} isLoading={uploadingPhoto} isDisabled={!photoFile} className="shadow-md shadow-primary/20">
                                    Upload
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
