import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Card,
    CardBody,
    CardFooter,
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
    Spinner,
    Chip,
    Pagination
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { studyMaterialService, academicService } from '@/services'; // You might need to add studyMaterialService to index.js
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';

const sectionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    classId: z.string().min(1, "Class is required"),
    sectionId: z.string().optional(), // Can be null for 'All Sections'
    subjectId: z.string().min(1, "Subject is required"),
    isPublished: z.boolean().default(false)
});

export default function StudyMaterials() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isTeacherOrAdmin = ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(user?.role);

    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filterClass, setFilterClass] = useState('');
    const [filterSubject, setFilterSubject] = useState('');

    const { isOpen, onOpen, onClose } = useDisclosure();

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(sectionSchema),
        defaultValues: {
            title: '',
            description: '',
            isPublished: true
        }
    });

    useEffect(() => {
        fetchInitialData();
        fetchSections();
    }, []);

    useEffect(() => {
        fetchSections();
    }, [filterClass, filterSubject]);

    const fetchInitialData = async () => {
        try {
            const [classesRes, subjectsRes] = await Promise.all([
                academicService.getAllClasses(),
                academicService.getAllSubjects()
            ]);

            if (classesRes.data?.success) setClasses(classesRes.data.data?.classes || []);
            if (subjectsRes.data?.success) setSubjects(subjectsRes.data.data?.subjects || []);
        } catch (error) {
        }
    };

    const fetchSections = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (filterClass) filters.classId = filterClass;
            if (filterSubject) filters.subjectId = filterSubject;

            const response = await studyMaterialService.getAllSections(filters);
            if (response.success) {
                setSections(response.data.sections);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            // Handle "all" sectionId
            const payload = { ...data };
            if (!payload.sectionId || payload.sectionId === 'all') {
                payload.sectionId = null;
            }

            const response = await studyMaterialService.createSection(payload);
            if (response.success) {
                fetchSections();
                onClose();
                reset();
            }
        } catch (error) {
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Materials</h1>
                    <p className="text-sm text-gray-500">Access and manage course contents</p>
                </div>

                <div className="flex gap-2">
                    <Select
                        placeholder="Filter Class"
                        size="sm"
                        className="w-40"
                        selectedKeys={filterClass ? [filterClass] : []}
                        onChange={(e) => setFilterClass(e.target.value)}
                    >
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.section}</SelectItem>)}
                    </Select>

                    <Select
                        placeholder="Filter Subject"
                        size="sm"
                        className="w-40"
                        selectedKeys={filterSubject ? [filterSubject] : []}
                        onChange={(e) => setFilterSubject(e.target.value)}
                    >
                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </Select>

                    {isTeacherOrAdmin && (
                        <Button color="primary" startContent={<Icon icon="mdi:folder-plus" />} onPress={onOpen}>
                            New Section
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Spinner size="lg" />
                </div>
            ) : sections.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Icon icon="mdi:folder-open-outline" className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No study material sections found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        {isTeacherOrAdmin
                            ? "Create a new section to start uploading videos and documents."
                            : "Your teachers haven't uploaded any materials for your class yet."}
                    </p>
                    {isTeacherOrAdmin && (
                        <Button color="primary" variant="flat" className="mt-4" onPress={onOpen}>
                            Create First Section
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sections.map((section) => (
                        <motion.div key={section.id} variants={itemVariants}>
                            <Card
                                isPressable
                                onPress={() => navigate(`/study-materials/sections/${section.id}`)}
                                className="h-full hover:scale-[1.02] transition-transform"
                            >
                                <CardBody className="p-0 overflow-hidden relative group">
                                    <div className="bg-gradient-to-br from-primary-500 to-primary-700 h-32 flex items-center justify-center p-6 text-white text-center">
                                        <Icon icon="mdi:book-open-page-variant" className="text-5xl opacity-80" />
                                    </div>
                                    {!section.isPublished && (
                                        <div className="absolute top-2 right-2">
                                            <Chip size="sm" color="warning" variant="solid">Draft</Chip>
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Chip size="sm" variant="flat" color="secondary" className="mb-2">
                                                {section.Subject?.name}
                                            </Chip>
                                            <span className="text-xs text-gray-500 font-medium border px-1.5 py-0.5 rounded">
                                                {section.Class?.name} {section.sectionId ? `- ${section.sectionId}` : ''}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={section.title}>
                                            {section.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[40px]">
                                            {section.description || "No description provided"}
                                        </p>
                                    </div>
                                </CardBody>
                                <CardFooter className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Icon icon="mdi:file-document-multiple-outline" />
                                        <span>{section.materials?.length || 0} items</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Icon icon="mdi:account-circle-outline" />
                                        <span>{section.creator?.name}</span>
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Section Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <ModalHeader>Create New Section</ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-full">
                                        <Input
                                            {...register('title')}
                                            label="Section Title"
                                            placeholder="e.g. Chapter 1: Laws of Motion"
                                            isInvalid={!!errors.title}
                                            errorMessage={errors.title?.message}
                                        />
                                    </div>
                                    <div className="col-span-full">
                                        <Input
                                            {...register('description')}
                                            label="Description"
                                            placeholder="What is this section about?"
                                        />
                                    </div>

                                    <Select
                                        label="Class"
                                        placeholder="Select Class"
                                        {...register('classId')}
                                        onChange={(e) => setValue('classId', e.target.value)}
                                        isInvalid={!!errors.classId}
                                        errorMessage={errors.classId?.message}
                                    >
                                        {classes.map(c => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name} {c.section && `(${c.section})`}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Subject"
                                        placeholder="Select Subject"
                                        {...register('subjectId')}
                                        onChange={(e) => setValue('subjectId', e.target.value)}
                                        isInvalid={!!errors.subjectId}
                                        errorMessage={errors.subjectId?.message}
                                    >
                                        {subjects.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </Select>

                                    <div className="col-span-full">
                                        <Input
                                            {...register('sectionId')}
                                            label="Specific Section (Optional)"
                                            placeholder="e.g. A (Leave empty for all sections)"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            If specified, only students in this specific section will see this material.
                                        </p>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit">
                                    Create Section
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </motion.div>
    );
}
