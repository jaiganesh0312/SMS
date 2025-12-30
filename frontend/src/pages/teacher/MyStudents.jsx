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
            console.error("Error fetching my students:", error);
        } finally {
            setLoading(false);
        }
    };

    const openPhotoModal = (student) => {
        console.log("preview", student.profilePicture);
        setPhotoStudent(student);
        setPhotoFile(null);
        setPhotoPreview(student.profilePicture ? `${import.meta.env.VITE_API_URL}/${student.profilePicture}` : '');
        onPhotoOpen();
    };

    console.log(photoPreview);

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
            console.error(error);
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
            console.error(error);
            addToast({ title: "Error", description: "Error generating ID Card", color: "danger" });
        } finally {
            setDownloading((prev) => ({ ...prev, [student.id]: false }));
        }
    };


    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Students</h1>
                    <p className="text-gray-500">Manage students in your class</p>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardBody className="px-0 pb-4">
                    <Table
                        aria-label="My Students Table"
                        removeWrapper
                        className="px-4"
                    >
                        <TableHeader>
                            <TableColumn>ADMISSION NO</TableColumn>
                            <TableColumn>NAME</TableColumn>
                            <TableColumn>GENDER</TableColumn>
                            <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody
                            emptyContent={"No students enrolled in your class."}
                            isLoading={loading}
                            items={students}
                        >
                            {(student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.admissionNumber}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.gender}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="primary"
                                                onPress={() => handleDownloadIDCard(student)}
                                                isLoading={downloading[student.id]}
                                                startContent={<Icon icon="mdi:download" />}
                                            >
                                                {downloading[student.id] ? "Downloading..." : "ID Card"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="secondary"
                                                onPress={() => openPhotoModal(student)}
                                                startContent={<Icon icon="mdi:upload" />}
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

            <Modal isOpen={isPhotoOpen} onOpenChange={onPhotoOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Upload Profile Picture</ModalHeader>
                            <ModalBody>
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Icon icon="mdi:account" className="text-4xl text-gray-300" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        onChange={handlePhotoFileChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">JPG, PNG (Max 2MB)</p>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleUploadPhoto} isLoading={uploadingPhoto} isDisabled={!photoFile}>
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
