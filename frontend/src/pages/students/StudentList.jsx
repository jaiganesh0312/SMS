import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Select,
    SelectItem,
    Chip,
    Card,
    CardBody,
    CardHeader,
    Avatar,
    Spinner,
    addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { studentService, academicService } from '@/services';
import { PageHeader } from '@/components/common';
import { motion } from "framer-motion";

const studentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    admissionNumber: z.string().min(1, "Admission Number is required"),
    dob: z.string().min(1, "Date of Birth is required"),
    gender: z.enum(["Male", "Female", "Other"]),
    classId: z.string().optional(),
});

export default function StudentList() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [searchParams] = useSearchParams();

    // Cascading Dropdown State
    const [standards, setStandards] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [selectedStandard, setSelectedStandard] = useState("");
    const [isDivisionsLoading, setIsDivisionsLoading] = useState(false);

    // All Classes (for filter/Edit) - kept for compatibility with existing bulk tools if needed
    const [allClasses, setAllClasses] = useState([]);

    // Add/Edit Student Modal
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // Bulk/Single Update Class Modal
    const {
        isOpen: isUpdateOpen,
        onOpen: onUpdateOpen,
        onOpenChange: onUpdateOpenChange
    } = useDisclosure();

    // Profile Picture Modal
    const {
        isOpen: isPhotoOpen,
        onOpen: onPhotoOpen,
        onOpenChange: onPhotoOpenChange
    } = useDisclosure();

    // State for updates
    const [targetClassId, setTargetClassId] = useState("");
    const [studentToUpdate, setStudentToUpdate] = useState(null);

    // State for Photo Upload
    const [photoStudent, setPhotoStudent] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // State for ID Card Generation
    const [generatingIdCardFor, setGeneratingIdCardFor] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(studentSchema)
    });

    useEffect(() => {
        fetchStudents();
        fetchStandards();
        fetchAllClasses();
    }, [searchParams]);

    useEffect(() => {
        const classIdParam = searchParams.get('classId');
        if (classIdParam) {
            setValue('classId', classIdParam);
        }
    }, [searchParams, setValue]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = Object.fromEntries(searchParams.entries());
            const response = await studentService.getAllStudents(params);
            if (response.data?.success) {
                let data = response.data.data.students;
                setStudents(data);
            }
        } catch (error) {
            addToast({ title: "Error", description: "Failed to fetch students", color: "danger" });
        } finally {
            setLoading(false);
        }
    };

    const fetchStandards = async () => {
        try {
            const response = await academicService.getStandards();
            if (response.data?.success) {
                setStandards(response.data.data || []);
            }
        } catch (error) {
        }
    };

    const fetchAllClasses = async () => {
        try {
            const response = await academicService.getAllClasses();
            if (response.data?.success) {
                setAllClasses(response.data.data?.classes || []);
            }
        } catch (error) {
        }
    };

    const handleStandardChange = async (std) => {
        setSelectedStandard(std);
        setDivisions([]);
        setValue('classId', ''); // Reset classId
        if (!std) return;

        setIsDivisionsLoading(true);
        try {
            const response = await academicService.getDivisions(std);
            if (response.data?.success) {
                setDivisions(response.data.data || []);
            }
        } catch (error) {
            addToast({ title: "Error", description: "Failed to fetch divisions", color: "danger" });
        } finally {
            setIsDivisionsLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const response = await studentService.createStudent(data);
            if (response.data?.success) {
                addToast({ title: "Success", description: "Student created successfully", color: "success" });
                fetchStudents();
                onOpenChange(false);
                reset();
                setSelectedStandard("");
                setDivisions([]);
            }
        } catch (error) {
            addToast({ title: "Error", description: "Failed to create student", color: "danger" });
        }
    };

    const handleBulkUpdate = async () => {
        if (!targetClassId) return;

        let idsToUpdate = [];
        if (studentToUpdate) {
            idsToUpdate = [studentToUpdate];
        } else {
            if (selectedKeys === "all") {
                idsToUpdate = students.map(s => s.id);
            } else {
                idsToUpdate = Array.from(selectedKeys);
            }
        }

        try {
            const response = await studentService.bulkUpdateStudents({
                studentIds: idsToUpdate,
                classId: targetClassId
            });

            if (response.data?.success) {
                addToast({ title: "Success", description: "Students updated successfully", color: "success" });
                fetchStudents();
                setSelectedKeys(new Set([]));
                setStudentToUpdate(null);
                setTargetClassId("");
                onUpdateOpenChange(false);
            }
        } catch (error) {
            addToast({ title: "Error", description: "Failed to update students", color: "danger" });
        }
    };

    const openSingleUpdateModal = (studentId) => {
        setStudentToUpdate(studentId);
        const student = students.find(s => s.id === studentId);
        if (student && student.classId) setTargetClassId(student.classId);
        else setTargetClassId("");

        onUpdateOpen();
    };

    // Profile Picture Logic
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
                fetchStudents(); // Refresh list to see new avatar
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
        setGeneratingIdCardFor(student.id);
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
            setGeneratingIdCardFor(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            className="space-y-6 p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <PageHeader
                    title="Students"
                    description="Manage student records"
                    className="p-0 mb-6"
                    action={
                        <div className="flex gap-2">
                            {(selectedKeys === "all" || selectedKeys.size > 0) && (
                                <Button
                                    color="warning"
                                    variant="flat"
                                    startContent={<Icon icon="mdi:arrow-up-bold-box-outline" />}
                                    onPress={() => { setStudentToUpdate(null); setTargetClassId(""); onUpdateOpen(); }}
                                >
                                    Move / Promote ({selectedKeys === "all" ? students.length : selectedKeys.size})
                                </Button>
                            )}
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<Icon icon="mdi:cloud-upload" />}
                                onPress={() => window.location.href = '/admin/bulk-upload/students'}
                            >
                                Bulk Upload
                            </Button>
                            <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={onOpen}>
                                Add Student
                            </Button>
                        </div>
                    }
                />
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardHeader className="flex justify-between items-center px-6 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/50">
                                <Icon icon="mdi:account-school" className="text-primary text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Student Directory</h3>
                                <p className="text-sm text-default-500 font-normal">
                                    {students.length} student{students.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="px-0 pb-4 overflow-x-auto">
                        <Table
                            aria-label="Students Table"
                            selectionMode="multiple"
                            selectedKeys={selectedKeys}
                            onSelectionChange={setSelectedKeys}
                            className="px-2"
                            removeWrapper
                        >
                            <TableHeader>
                                <TableColumn className="bg-default-100 text-default-500 font-semibold">STUDENT</TableColumn>
                                <TableColumn className="bg-default-100 text-default-500 font-semibold">ADMISSION NO</TableColumn>
                                <TableColumn className="bg-default-100 text-default-500 font-semibold">GENDER</TableColumn>
                                <TableColumn className="bg-default-100 text-default-500 font-semibold">CLASS</TableColumn>
                                <TableColumn className="bg-default-100 text-default-500 font-semibold">PARENT</TableColumn>
                                <TableColumn className="bg-default-100 text-default-500 font-semibold">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent={"No students found"} isLoading={loading}>
                                {students.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    src={student.profilePicture ? `${import.meta.env.VITE_API_URL}/${student.profilePicture}` : undefined}
                                                    name={student.name}
                                                    size="sm"
                                                    isBordered
                                                    className="uppercase"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-bold text-small">{student.name}</span>
                                                    <span className="text-tiny text-default-400">{student.dob}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{student.admissionNumber}</TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="flat" color={student.gender === 'Male' ? 'primary' : 'secondary'}>
                                                {student.gender}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <span className="capitalize">{student.Class?.name}-{student.Class?.section}</span>
                                        </TableCell>
                                        <TableCell>
                                            {student.Parent ? (
                                                <div className="flex flex-col">
                                                    <span className="text-small">{student.Parent.guardianName}</span>
                                                    <span className="text-tiny text-default-400">{student.Parent.occupation}</span>
                                                </div>
                                            ) : (
                                                <span className="text-default-400 italic">Not Linked</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    onPress={() => openPhotoModal(student)}
                                                    title="Upload Photo"
                                                >
                                                    <Icon icon="mdi:camera" className="text-lg text-primary" />
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    onPress={() => handleDownloadIDCard(student)}
                                                    title="Download ID Card"
                                                    isLoading={generatingIdCardFor === student.id}
                                                    color="secondary"
                                                >
                                                    <Icon icon="mdi:id-card" className="text-lg text-secondary" />
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    onPress={() => openSingleUpdateModal(student.id)}
                                                    title="Change Class"

                                                >
                                                    <Icon icon="mdi:school-outline" className="text-lg text-default" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Create Student Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <ModalHeader>Add New Student</ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Name"
                                        placeholder="John Doe"
                                        variant="bordered"
                                        {...register("name")}
                                        isInvalid={!!errors.name}
                                        errorMessage={errors.name?.message}
                                    />
                                    <Input
                                        label="Admission Number"
                                        placeholder="ADM-001"
                                        variant="bordered"
                                        {...register("admissionNumber")}
                                        isInvalid={!!errors.admissionNumber}
                                        errorMessage={errors.admissionNumber?.message}
                                    />
                                    <Input
                                        type="date"
                                        label="Date of Birth"
                                        variant="bordered"
                                        placeholder=" "
                                        {...register("dob")}
                                        isInvalid={!!errors.dob}
                                        errorMessage={errors.dob?.message}
                                    />
                                    <Select
                                        label="Gender"
                                        placeholder='Select gender'
                                        variant="bordered"
                                        {...register("gender")}
                                        isInvalid={!!errors.gender}
                                        errorMessage={errors.gender?.message}
                                    >
                                        <SelectItem key="Male" value="Male">Male</SelectItem>
                                        <SelectItem key="Female" value="Female">Female</SelectItem>
                                        <SelectItem key="Other" value="Other">Other</SelectItem>
                                    </Select>

                                    {/* Standard Selection */}
                                    <Select
                                        label="Standard"
                                        placeholder="Select Standard"
                                        variant="bordered"
                                        selectedKeys={selectedStandard ? [selectedStandard] : []}
                                        onChange={(e) => handleStandardChange(e.target.value)}
                                    >
                                        {standards.map((std) => (
                                            <SelectItem key={std} value={std}>{std} Standard</SelectItem>
                                        ))}
                                    </Select>

                                    {/* Division Selection */}
                                    <Select
                                        label="Division / Section"
                                        placeholder={selectedStandard ? "Select Division" : "Select Standard First"}
                                        variant="bordered"
                                        isDisabled={!selectedStandard || isDivisionsLoading}
                                        {...register("classId")}
                                        isInvalid={!!errors.classId}
                                        errorMessage={errors.classId?.message}
                                    >
                                        {divisions.map((div) => (
                                            <SelectItem key={div.id} value={div.id}>{div.section}</SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit">
                                    Create Student
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>

            {/* Update Class Modal */}
            <Modal isOpen={isUpdateOpen} onOpenChange={onUpdateOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                {studentToUpdate ? "Update Student Class" : "Move / Promote Students"}
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-sm text-gray-500 mb-4">
                                    {studentToUpdate
                                        ? "Select the new class for this student."
                                        : `Select the target class for ${selectedKeys === "all" ? students.length : selectedKeys.size} selected students.`
                                    }
                                </p>
                                <Select
                                    items={allClasses}
                                    label="Target Class"
                                    placeholder="Select a class"
                                    selectedKeys={targetClassId ? [targetClassId] : []}
                                    onChange={(e) => setTargetClassId(e.target.value)}
                                    renderValue={(items) => {
                                        return items.map((item) => (
                                            <div key={item.key} className="flex gap-2 items-center">
                                                <span>{item.data.name} - {item.data.section}</span>
                                            </div>
                                        ));
                                    }}
                                >
                                    {(cls) => <SelectItem key={cls.id} value={cls.id} textValue={`${cls.name}-${cls.section}`}>{`${cls.name} - ${cls.section}`}</SelectItem>}
                                </Select>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleBulkUpdate} isDisabled={!targetClassId}>
                                    {studentToUpdate ? "Update" : "Move Students"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Profile Picture Modal */}
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
        </motion.div>
    );
}
