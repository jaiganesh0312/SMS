import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Button,
    Input,
    Select,
    SelectItem,
    Card,
    CardBody,
    Checkbox
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { studentService, parentService } from '@/services';
import { PageHeader } from '@/components/common';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

const parentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Valid phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    occupation: z.string().optional(),
    studentIds: z.array(z.string()).min(1, "Select at least one student"),
});

export default function CreateParent() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(parentSchema),
        defaultValues: {
            studentIds: []
        }
    });

    const selectedStudents = watch("studentIds");

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await studentService.getAllStudents();
            if (response.data?.success) {
                setStudents(response.data.data.students);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await parentService.registerParent(data);
            if (response.data?.success) {
                navigate('/students'); // Redirect back to student list or parent list
            }
        } catch (error) {
            console.error("Error creating parent:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStudentSelection = (e) => {
        // Select component returns a Set or comma separated string depending on mode.
        // For HeroUI Select with multiple, it usually deals with keys.
        // Let's assume standard behavior: e.target.value or just the selection change.
        // Actually HeroUI Select `onSelectionChange` gives a Set of keys.
        // But we are using native `register` or controlled `selectedKeys`?
        // Let's simplify: Use manual control for the array.

        const value = Array.from(e); // Convert Set to Array
        setValue("studentIds", value);
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
            className="max-w-3xl mx-auto space-y-6 p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <PageHeader
                    title="Register Parent"
                    description="Create a new parent account and link students"
                    showBack={true}
                />
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm">
                    <CardBody className="p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Guardian Name"
                                    placeholder="Enter guardian name"
                                    variant="bordered"
                                    {...register("name")}
                                    isInvalid={!!errors.name}
                                    errorMessage={errors.name?.message}
                                    startContent={<Icon icon="mdi:account" className="text-default-400" />}
                                />
                                <Input
                                    label="Occupation"
                                    placeholder="Enter occupation"
                                    variant="bordered"
                                    {...register("occupation")}
                                    startContent={<Icon icon="mdi:briefcase" className="text-default-400" />}
                                />
                                <Input
                                    label="Email"
                                    placeholder="Enter email"
                                    type="email"
                                    variant="bordered"
                                    {...register("email")}
                                    isInvalid={!!errors.email}
                                    errorMessage={errors.email?.message}
                                    startContent={<Icon icon="mdi:email" className="text-default-400" />}
                                />
                                <Input
                                    label="Phone"
                                    placeholder="Enter phone"
                                    variant="bordered"
                                    {...register("phone")}
                                    isInvalid={!!errors.phone}
                                    errorMessage={errors.phone?.message}
                                    startContent={<Icon icon="mdi:phone" className="text-default-400" />}
                                />
                                <Input
                                    label="Password"
                                    placeholder="Enter password"
                                    type="password"
                                    variant="bordered"
                                    {...register("password")}
                                    isInvalid={!!errors.password}
                                    errorMessage={errors.password?.message}
                                    startContent={<Icon icon="mdi:lock" className="text-default-400" />}
                                />

                                <Select
                                    label="Link Students"
                                    selectionMode="multiple"
                                    placeholder="Select students"
                                    // valid={!errors.studentIds} // Deprecated or incorrect prop? isInvalid is favored usually.
                                    isInvalid={!!errors.studentIds}
                                    errorMessage={errors.studentIds?.message}
                                    onSelectionChange={handleStudentSelection}
                                    startContent={<Icon icon="mdi:account-school" className="text-default-400" />}
                                >
                                    {students.map((student) => (
                                        <SelectItem key={student.id} textValue={student.name}>
                                            <div className="flex flex-col">
                                                <span className="text-small">{student.name}</span>
                                                <span className="text-tiny text-default-400">{student.admissionNumber}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button color="danger" variant="light" onPress={() => navigate(-1)}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit" isLoading={isLoading} startContent={<Icon icon="mdi:check" />}>
                                    Register Parent
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </motion.div>
        </motion.div>
    );
}
