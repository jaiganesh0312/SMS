import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    Chip
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { academicService } from '@/services';
import { motion } from "framer-motion";

const subjectSchema = z.object({
    name: z.string().min(1, "Subject name is required"),
    code: z.string().min(1, "Subject code is required"),
});

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(subjectSchema)
    });

    const [searchParams] = useSearchParams();

    const fetchSubjects = async () => {
        try {
            const params = Object.fromEntries(searchParams.entries());
            const response = await academicService.getAllSubjects(params);
            if (response.data?.success) {
                // Backend returns { data: { subjects: [...] } }
                setSubjects(response.data.data?.subjects || []);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, [searchParams]);

    const onSubmit = async (data) => {
        try {
            const response = await academicService.createSubject(data);
            if (response.data?.success) {
                fetchSubjects();
                onClose();
                reset();
            }
        } catch (error) {
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <motion.div
            className="space-y-6 p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Subjects</h1>
                        <p className="text-sm text-default-500">Manage academic subjects</p>
                    </div>
                    <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={onOpen}>
                        Add Subject
                    </Button>
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardHeader className="flex justify-between items-center px-6 pt-6">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:book-open-variant" className="text-primary text-2xl" />
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Subject List</h3>
                                <p className="text-sm text-default-500 font-normal">
                                    {subjects.length} active subject{subjects.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="px-0 pb-4">
                        <Table aria-label="Subjects table" removeWrapper className="px-2" classNames={{
                            wrapper: "bg-content1 border border-default-200 shadow-sm",
                            th: "bg-default-100 text-default-500 font-medium"
                        }}>
                            <TableHeader>
                                <TableColumn>NAME</TableColumn>
                                <TableColumn>CODE</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent={"No subjects found"} isLoading={isLoading}>
                                {subjects.map((subject) => (
                                    <TableRow key={subject.id}>
                                        <TableCell className="font-medium">{subject.name}</TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="dot" color="primary">{subject.code}</Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button isIconOnly size="sm" variant="light">
                                                    <Icon icon="mdi:pencil" className="text-lg" />
                                                </Button>
                                                <Button isIconOnly size="sm" variant="light" color="danger">
                                                    <Icon icon="mdi:delete" className="text-lg" />
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

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <ModalHeader>Add New Subject</ModalHeader>
                            <ModalBody>
                                <div className="grid gap-3">
                                    <Input
                                        {...register('name')}
                                        label="Subject Name"
                                        placeholder="e.g. Mathematics"
                                        isInvalid={!!errors.name}
                                        errorMessage={errors.name?.message}
                                        variant="bordered"
                                    />
                                    <Input
                                        {...register('code')}
                                        label="Subject Code"
                                        placeholder="e.g. MATH101"
                                        isInvalid={!!errors.code}
                                        errorMessage={errors.code?.message}
                                        variant="bordered"
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit">
                                    Create Subject
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </motion.div>
    );
}
