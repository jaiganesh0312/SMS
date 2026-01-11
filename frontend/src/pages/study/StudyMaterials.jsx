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
import { studyMaterialService, academicService } from '@/services';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common';

const sectionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    classId: z.string().min(1, "Class is required"),
    sectionId: z.string().optional(), // Can be null for 'All Sections'
    subjectId: z.string().min(1, "Subject is required"),
    isPublished: z.boolean().default(false)
});

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function StudyMaterials() {
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isTeacherOrAdmin = ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(user?.role);

    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [filterSubject, setFilterSubject] = useState('');
    const [currentSection, setCurrentSection] = useState(null); // Metadata for the current section (division)

    const { isOpen, onOpen, onClose } = useDisclosure();

    // We need to fetch classId and section metadata. 
    // Since we don't have a direct "getSectionById" service handy that returns full details easily without context,
    // we might fetch all sections or rely on what we have.
    // For creating new material section, we need classId.

    // Simplification: We will fetch all class/section info or just rely on what we have.
    // Ideally update `academicService` to get specific section details.

    const [allClasses, setAllClasses] = useState([]); // Needed for form

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(sectionSchema),
        defaultValues: {
            title: '',
            description: '',
            isPublished: true,
            sectionId: sectionId // Pre-fill sectionId
        }
    });

    useEffect(() => {
        fetchInitialData();
        fetchSections();
    }, [sectionId]); // Re-fetch if sectionId changes

    useEffect(() => {
        fetchSections();
    }, [filterSubject]);

    const fetchInitialData = async () => {
        try {
            const [classesRes, subjectsRes, sectionsRes] = await Promise.all([
                academicService.getAllClasses(),
                academicService.getAllSubjects(),
                academicService.getAllSections() // To find current section details
            ]);

            if (classesRes.data?.success) setAllClasses(classesRes.data.data?.classes || []);
            if (subjectsRes.data?.success) setSubjects(subjectsRes.data.data?.subjects || []);

            if (sectionsRes.data?.success && sectionId) {
                const foundSection = (sectionsRes.data.data || []).find(s => s.id === sectionId);
                if (foundSection) {
                    setCurrentSection(foundSection);
                    // Pre-fill form if found
                    setValue('classId', foundSection.classId);
                    setValue('sectionId', foundSection.id); // Explicitly set specific section
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSections = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (sectionId) filters.sectionId = sectionId; // This might need backend support to filter strictly by sectionId column in StudyMaterialSection
            // The existing backend `getAllSections` (studyMaterialService) filters by `classId` and `sectionId`.
            // If we pass `sectionId` it should return materials for that section.

            if (filterSubject) filters.subjectId = filterSubject;

            const response = await studyMaterialService.getAllSections(filters);
            if (response.success) {
                setSections(response.data.sections);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const payload = { ...data };
            // Ensure we are creating for this specific section
            if (sectionId) payload.sectionId = sectionId;

            const response = await studyMaterialService.createSection(payload);
            if (response.success) {
                fetchSections();
                onClose();
                reset();
                // Reset form with correct defaults again
                if (currentSection) {
                    setValue('classId', currentSection.classId);
                    setValue('sectionId', currentSection.id);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Link to={currentSection ? `/study-materials/class/${currentSection.classId}` : "/study-materials"} className="text-default-500 hover:text-primary text-sm flex items-center gap-1 w-fit">
                        <Icon icon="mdi:arrow-left" /> Back to Sections
                    </Link>
                    <div className="text-center sm:text-left">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                            {currentSection ? `Study Materials - ${currentSection.Class?.name} ${currentSection.name}` : "Study Materials"}
                        </h1>
                        <p className="text-xs sm:text-sm text-default-500 mt-1">Access and manage course contents</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Select
                        placeholder="Filter Subject"
                        size="sm"
                        className="w-full sm:flex-1 sm:max-w-[200px]"
                        selectedKeys={filterSubject ? [filterSubject] : []}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        variant="bordered"
                    >
                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </Select>

                    {isTeacherOrAdmin && (
                        <Button
                            color="primary"
                            startContent={<Icon icon="mdi:folder-plus" />}
                            onPress={onOpen}
                            className="shadow-md shadow-primary/20 w-full sm:w-auto"
                            size="sm"
                        >
                            <span className="hidden sm:inline">New Chapter</span>
                            <span className="sm:hidden">New</span>
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : sections.length === 0 ? (
                <div className="text-center py-16 bg-content1 rounded-lg border border-dashed border-default-200">
                    <Icon icon="mdi:folder-open-outline" className="text-6xl text-default-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No study material sections found</h3>
                    <p className="text-default-500 max-w-sm mx-auto mt-2">
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
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-y-3 sm:gap-4 md:gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {sections.map((section) => (
                        <motion.div key={section.id} variants={itemVariants} className="w-full">
                            <Card
                                isPressable
                                onPress={() => navigate(`/study-materials/sections/${section.id}`)}
                                className="h-full hover:scale-[1.02] transition-transform bg-content1 border border-default-200 shadow-sm hover:shadow-md w-full"
                            >
                                <CardBody className="p-0 overflow-hidden relative group">
                                    <div className="bg-primary/10 h-24 sm:h-32 flex items-center justify-center p-4 sm:p-6 text-primary text-center group-hover:bg-primary/20 transition-colors">
                                        <Icon icon="mdi:book-open-page-variant" className="text-4xl sm:text-5xl opacity-80" />
                                    </div>
                                    {!section.isPublished && (
                                        <div className="absolute top-2 right-2">
                                            <Chip size="sm" color="warning" variant="solid" className="shadow-sm text-xs">Draft</Chip>
                                        </div>
                                    )}
                                    <div className="p-3 sm:p-4">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <Chip size="sm" variant="flat" color="secondary" className="text-xs">
                                                {section.Subject?.name}
                                            </Chip>
                                            <Chip size="sm" variant="bordered" className="text-xs border-default-300">
                                                {section.Class?.name} {section.ClassSection ? `- ${section.ClassSection.name}` : ''}
                                            </Chip>
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-1 mb-1" title={section.title}>
                                            {section.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-default-500 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                                            {section.description || "No description provided"}
                                        </p>
                                    </div>
                                </CardBody>
                                <CardFooter className="px-3 sm:px-4 py-2 sm:py-3 bg-default-50 border-t border-default-100 flex flex-wrap justify-between items-center text-xs text-default-500 gap-2">
                                    <div className="flex items-center gap-1">
                                        <Icon icon="mdi:file-document-multiple-outline" className="text-sm" />
                                        <span className="text-xs">{section.materials?.length || 0} items</span>
                                    </div>
                                    <div className="flex items-center gap-1 truncate max-w-[140px]">
                                        <Icon icon="mdi:account-circle-outline" className="text-sm flex-shrink-0" />
                                        <span className="text-xs truncate">{section.creator?.name}</span>
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Create Section Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl" backdrop="blur" classNames={{
                base: "bg-content1 border border-default-200",
                header: "border-b border-default-200 text-foreground",
                footer: "border-t border-default-200",
                closeButton: "hover:bg-default-100 active:bg-default-200 text-default-500",
            }}>
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <ModalHeader>Create New Section</ModalHeader>
                            <ModalBody className="py-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-full">
                                        <Input
                                            {...register('title')}
                                            label="Section Title"
                                            placeholder="e.g. Chapter 1: Laws of Motion"
                                            isInvalid={!!errors.title}
                                            errorMessage={errors.title?.message}
                                            variant="bordered"
                                        />
                                    </div>
                                    <div className="col-span-full">
                                        <Input
                                            {...register('description')}
                                            label="Description"
                                            placeholder="What is this section about?"
                                            variant="bordered"
                                        />
                                    </div>

                                    <Select
                                        label="Class"
                                        placeholder="Select Class"
                                        {...register('classId')}
                                        onChange={(e) => setValue('classId', e.target.value)}
                                        isInvalid={!!errors.classId}
                                        errorMessage={errors.classId?.message}
                                        variant="bordered"
                                    >
                                        {allClasses.map(c => (
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
                                        variant="bordered"
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
                                            variant="bordered"
                                        />
                                        <p className="text-xs text-default-400 mt-1">
                                            If specified, only students in this specific section will see this material.
                                        </p>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit" className="shadow-md shadow-primary/20">
                                    Create Section
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
