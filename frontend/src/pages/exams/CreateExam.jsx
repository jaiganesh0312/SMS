import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Input,
    Select,
    SelectItem,
    Card,
    CardBody,
    CardHeader
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { academicService, examService } from '@/services';
import { motion } from "framer-motion";

const examSchema = z.object({
    name: z.string().min(3, "Exam name must be at least 3 characters"),
    classId: z.string().min(1, "Class is required"),
    type: z.enum(["UNIT_TEST", "HALF_YEARLY", "FINAL", "OTHER"], {
        errorMap: () => ({ message: "Invalid exam type" })
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
});

export default function CreateExam() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        resolver: zodResolver(examSchema),
        defaultValues: {
            type: "UNIT_TEST"
        }
    });

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const classRes = await academicService.getAllClasses();
            if (classRes.data?.success) setClasses(classRes.data.data.classes);
        } catch (error) {
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await examService.createExam(data);
            if (response.data?.success) {
                navigate('/exams');
            }
        } catch (error) {
            // Handle error notification here if needed
            alert(error.response?.data?.message || "Error creating exam");
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
            className="p-6 max-w-2xl mx-auto space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex items-center gap-4">
                <Button isIconOnly variant="light" onPress={() => navigate(-1)} className="text-default-500 hover:text-foreground">
                    <Icon icon="mdi:arrow-left" className="text-xl" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Create Exam</h1>
                    <p className="text-sm text-default-500">Schedule a new exam period</p>
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="shadow-md bg-content1 border border-default-200 dark:border-default-100">
                    <CardBody className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid gap-3">
                                <Input
                                    {...register('name')}
                                    label="Exam Name"
                                    placeholder="e.g. Midterm 2024"
                                    variant="bordered"
                                    isInvalid={!!errors.name}
                                    errorMessage={errors.name?.message}
                                    startContent={<Icon icon="mdi:format-title" className="text-default-400" />}
                                    classNames={{
                                        label: "text-default-500 group-data-[filled-within=true]:text-foreground",
                                        input: "text-foreground",
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Class"
                                    placeholder='Select Class'
                                    {...register('classId')}
                                    variant="bordered"
                                    isInvalid={!!errors.classId}
                                    errorMessage={errors.classId?.message}
                                    startContent={<Icon icon="mdi:google-classroom" className="text-default-400" />}
                                    classNames={{
                                        label: "text-default-500",
                                        value: "text-foreground",
                                    }}
                                >
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id} textValue={`${cls.name}-${cls.section}`}>
                                            {`${cls.name}-${cls.section}`}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Select
                                    label="Exam Type"
                                    {...register('type')}
                                    placeholder='Select Exam Type'
                                    variant="bordered"
                                    isInvalid={!!errors.type}
                                    errorMessage={errors.type?.message}
                                    defaultSelectedKeys={["UNIT_TEST"]}
                                    startContent={<Icon icon="mdi:shape-outline" className="text-default-400" />}
                                    classNames={{
                                        label: "text-default-500",
                                        value: "text-foreground",
                                    }}
                                >
                                    <SelectItem key="UNIT_TEST" value="UNIT_TEST">Unit Test</SelectItem>
                                    <SelectItem key="HALF_YEARLY" value="HALF_YEARLY">Half Yearly</SelectItem>
                                    <SelectItem key="FINAL" value="FINAL">Final</SelectItem>
                                    <SelectItem key="OTHER" value="OTHER">Other</SelectItem>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    {...register('startDate')}
                                    type="date"
                                    label="Start Date"
                                    variant="bordered"
                                    isInvalid={!!errors.startDate}
                                    errorMessage={errors.startDate?.message}
                                    startContent={<Icon icon="mdi:calendar-start" className="text-default-400" />}
                                    classNames={{
                                        label: "text-default-500 group-data-[filled-within=true]:text-foreground",
                                        input: "text-foreground",
                                    }}
                                />
                                <Input
                                    {...register('endDate')}
                                    type="date"
                                    label="End Date"
                                    variant="bordered"
                                    isInvalid={!!errors.endDate}
                                    errorMessage={errors.endDate?.message}
                                    startContent={<Icon icon="mdi:calendar-end" className="text-default-400" />}
                                    classNames={{
                                        label: "text-default-500 group-data-[filled-within=true]:text-foreground",
                                        input: "text-foreground",
                                    }}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button color="danger" variant="light" onPress={() => navigate(-1)}>
                                    Cancel
                                </Button>
                                <Button className="bg-primary-600 text-white shadow-md shadow-primary-500/20" type="submit" isLoading={isLoading} startContent={<Icon icon="mdi:check" />}>
                                    Create Exam
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </motion.div>
        </motion.div>
    );
}
