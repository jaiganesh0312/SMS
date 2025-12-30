import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Chip,
    Card,
    CardBody
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { examService } from '@/services';
import { format } from 'date-fns';
import { motion } from "framer-motion";

export default function ExamList() {
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchExams();
    }, [searchParams]);

    const fetchExams = async () => {
        try {
            const params = Object.fromEntries(searchParams.entries());
            const response = await examService.getExams(params);
            if (response.data?.success) {
                setExams(response.data.data?.exams || []);
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setIsLoading(false);
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
            className="p-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exams</h1>
                    <p className="text-sm text-gray-500">Manage school exams and assessments</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/admin/bulk-upload/exams">
                        <Button color="secondary" variant="flat" startContent={<Icon icon="mdi:cloud-upload" />}>
                            Bulk Upload
                        </Button>
                    </Link>
                    <Link to="/exams/new">
                        <Button color="primary" startContent={<Icon icon="mdi:plus" />}>
                            Create Exam
                        </Button>
                    </Link>
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>

                <Table aria-label="Exams table" shadow="none">
                    <TableHeader>
                        <TableColumn>EXAM TITLE</TableColumn>
                        <TableColumn>CLASS</TableColumn>
                        <TableColumn>DATE</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"No exams found"} isLoading={isLoading}>
                        {exams.map((exam) => (
                            <TableRow key={exam.id}>
                                <TableCell className="font-medium">{exam.name}</TableCell>
                                <TableCell>{exam.Class?.name}</TableCell>
                                <TableCell>{format(new Date(exam.startDate), 'PPP')}</TableCell>
                                <TableCell>
                                    <Chip size="sm" variant="flat" color={new Date(exam.startDate) > new Date() ? "primary" : "success"}>
                                        {new Date(exam.startDate) > new Date() ? "Upcoming" : "Completed"}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button isIconOnly size="sm" variant="light">
                                            <Icon icon="mdi:pencil" className="text-lg" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </motion.div>
        </motion.div>
    );
}
