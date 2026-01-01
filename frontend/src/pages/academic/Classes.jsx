import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Card,
    CardBody,
    CardHeader,
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
    Tooltip,
    Chip,
    Accordion,
    AccordionItem,
    Select,
    SelectItem,
    Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { academicService } from '@/services';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

const standardSchema = z.object({
    name: z.string().min(1, "Standard name is required"),
    section: z.string().min(1, "Initial section is required"),
    classTeacherId: z.string().optional()
});

const divisionSchema = z.object({
    section: z.string().min(1, "Section is required"),
    classTeacherId: z.string().optional()
});

export default function Classes() {
    const navigate = useNavigate();
    const [standards, setStandards] = useState([]);
    const [divisions, setDivisions] = useState({}); // Map standard -> divisions
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStandard, setSelectedStandard] = useState(null);

    // Modals
    const { isOpen: isStdOpen, onOpen: onStdOpen, onClose: onStdClose } = useDisclosure();
    const { isOpen: isDivOpen, onOpen: onDivOpen, onClose: onDivClose } = useDisclosure();

    // Forms
    const {
        register: registerStd,
        handleSubmit: handleSubmitStd,
        reset: resetStd,
        formState: { errors: errorsStd }
    } = useForm({ resolver: zodResolver(standardSchema) });

    const {
        register: registerDiv,
        handleSubmit: handleSubmitDiv,
        reset: resetDiv,
        formState: { errors: errorsDiv }
    } = useForm({ resolver: zodResolver(divisionSchema) });

    useEffect(() => {
        fetchStandards();
        fetchTeachers();
    }, []);

    const fetchStandards = async () => {
        try {
            const response = await academicService.getStandards();
            if (response.data?.success) {
                setStandards(response.data.data || []);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await academicService.getTeachers();
            if (response.data?.success) {
                setTeachers(response.data.data || []);
            }
        } catch (error) {
        }
    };

    const fetchDivisions = async (standard) => {
        if (divisions[standard]) return; // Already fetched
        try {
            const response = await academicService.getDivisions(standard);
            if (response.data?.success) {
                setDivisions(prev => ({ ...prev, [standard]: response.data.data }));
            }
        } catch (error) {
        }
    };

    const handleCreateStandard = async (data) => {
        try {
            // Create class (this creates standard + initial division)
            const response = await academicService.createClass(data);
            if (response.data?.success) {
                fetchStandards();
                onStdClose();
                resetStd();
            }
        } catch (error) {
        }
    };

    const handleCreateDivision = async (data) => {
        try {
            const payload = {
                name: selectedStandard,
                section: data.section,
                classTeacherId: data.classTeacherId
            };
            const response = await academicService.createClass(payload);
            if (response.data?.success) {
                // Refresh divisions for this standard
                const divResponse = await academicService.getDivisions(selectedStandard);
                if (divResponse.data?.success) {
                    setDivisions(prev => ({ ...prev, [selectedStandard]: divResponse.data.data }));
                }
                onDivClose();
                resetDiv();
            }
        } catch (error) {
        }
    };

    const handleAssignTeacher = async (classId, standard, teacherId) => {
        try {
            const response = await academicService.assignClassTeacher(classId, teacherId);
            if (response.data?.success) {
                // Refresh divisions to update UI
                const divResponse = await academicService.getDivisions(standard);
                if (divResponse.data?.success) {
                    setDivisions(prev => ({ ...prev, [standard]: divResponse.data.data }));
                }
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
            <motion.div variants={itemVariants} className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Management</h1>
                    <p className="text-sm text-gray-500">Manage Standards, Divisions and Class Teachers</p>
                </div>
                <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={onStdOpen}>
                    Add New Standard
                </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm">
                    <CardHeader className="px-6 pt-6">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:google-classroom" className="text-primary text-2xl" />
                            <h3 className="text-lg font-semibold">Standards Directory</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="px-6 pb-6 pt-2">
                        {isLoading ? (
                            <div className="flex justify-center p-4">
                                <Spinner />
                            </div>
                        ) : standards.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">No standards found. Add one to get started.</div>
                        ) : (
                            <Accordion selectionMode="multiple" variant="splitted">
                                {standards.map((std) => (
                                    <AccordionItem
                                        key={std}
                                        title={
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-lg">{std} Standard</span>
                                                <Chip size="sm" variant="flat" color="secondary">
                                                    {divisions[std] ? divisions[std].length : '?'} Sections
                                                </Chip>
                                            </div>
                                        }
                                        onPress={() => fetchDivisions(std)}
                                    >
                                        <div className="py-2">
                                            <div className="flex justify-between items-center mb-4 px-2">
                                                <h4 className="text-sm font-semibold text-gray-600">Divisions / Sections</h4>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    color="primary"
                                                    startContent={<Icon icon="mdi:plus" />}
                                                    onPress={() => { setSelectedStandard(std); onDivOpen(); }}
                                                >
                                                    Add Division
                                                </Button>
                                            </div>

                                            <Table removeWrapper aria-label={`${std} divisions table`}>
                                                <TableHeader>
                                                    <TableColumn>SECTION</TableColumn>
                                                    <TableColumn>CLASS TEACHER</TableColumn>
                                                    <TableColumn>STUDENTS</TableColumn>
                                                    <TableColumn>ACTIONS</TableColumn>
                                                </TableHeader>
                                                <TableBody
                                                    emptyContent={divisions[std] ? "No divisions found" : "Loading..."}
                                                    items={divisions[std] || []}
                                                >
                                                    {(cls) => (
                                                        <TableRow key={cls.id}>
                                                            <TableCell>
                                                                <Chip color="primary" variant="dot">{cls.section}</Chip>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Select
                                                                    aria-label="Assign Teacher"
                                                                    placeholder="Select Teacher"
                                                                    size="sm"
                                                                    className="max-w-xs"
                                                                    defaultSelectedKeys={cls.classTeacherId ? [cls.classTeacherId] : []}
                                                                    onChange={(e) => handleAssignTeacher(cls.id, std, e.target.value)}
                                                                >
                                                                    {teachers.map((t) => (
                                                                        <SelectItem key={t.id} value={t.id}>
                                                                            {t.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="primary"
                                                                    onPress={() => navigate(`/students?classId=${cls.id}`)}
                                                                >
                                                                    View Students
                                                                </Button>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    <Tooltip content="Delete">
                                                                        <Button isIconOnly size="sm" variant="light" color="danger">
                                                                            <Icon icon="mdi:delete" className="text-lg" />
                                                                        </Button>
                                                                    </Tooltip>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </CardBody>
                </Card>
            </motion.div>

            {/* Add Standard Modal */}
            <Modal isOpen={isStdOpen} onClose={onStdClose}>
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmitStd(handleCreateStandard)}>
                            <ModalHeader>Add New Standard</ModalHeader>
                            <ModalBody>
                                <div className="grid gap-4">
                                    <Input
                                        {...registerStd('name')}
                                        label="Standard Name"
                                        placeholder="e.g. 10th, XII"
                                        isInvalid={!!errorsStd.name}
                                        errorMessage={errorsStd.name?.message}
                                    />
                                    <Input
                                        {...registerStd('section')}
                                        label="Initial Section"
                                        placeholder="e.g. A"
                                        isInvalid={!!errorsStd.section}
                                        errorMessage={errorsStd.section?.message}
                                    />
                                    <Select
                                        label="Class Teacher (Optional)"
                                        placeholder="Select Teacher"
                                        {...registerStd('classTeacherId')}
                                    >
                                        {teachers.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
                                <Button color="primary" type="submit">Create Standard</Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>

            {/* Add Division Modal */}
            <Modal isOpen={isDivOpen} onClose={onDivClose}>
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmitDiv(handleCreateDivision)}>
                            <ModalHeader>Add Division to {selectedStandard}</ModalHeader>
                            <ModalBody>
                                <div className="grid gap-4">
                                    <Input
                                        {...registerDiv('section')}
                                        label="Section Name"
                                        placeholder="e.g. B, C"
                                        isInvalid={!!errorsDiv.section}
                                        errorMessage={errorsDiv.section?.message}
                                    />
                                    <Select
                                        label="Class Teacher (Optional)"
                                        placeholder="Select Teacher"
                                        {...registerDiv('classTeacherId')}
                                    >
                                        {teachers.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
                                <Button color="primary" type="submit">Add Division</Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </motion.div>
    );
}
