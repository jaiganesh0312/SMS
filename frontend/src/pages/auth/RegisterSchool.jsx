import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { authService } from '@/services';
import { motion } from "framer-motion";

const registerSchoolSchema = z.object({
    schoolName: z.string().min(3, "School name must be at least 3 characters"),
    schoolAddress: z.string().min(5, "Address must be at least 5 characters"),
    schoolBoard: z.string().min(2, "Board must be at least 2 characters"),
    adminName: z.string().min(2, "Admin name is required"),
    adminEmail: z.string().email("Invalid email address"),
    adminPhone: z.string().min(10, "Phone number must be at least 10 digits"),
    adminPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.adminPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function RegisterSchool() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchoolSchema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registrationData } = data;

            const response = await authService.registerSchool(registrationData);

            if (response.data?.success) {
                navigate('/admin/schools', { // Redirect to school list or dashboard
                    state: { message: 'School registered successfully.' }
                });
            } else {
                setError(response.data?.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during registration.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:school" className="text-3xl text-primary" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Register New School
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    System Admin Panel
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl"
            >
                <Card className="shadow-xl">
                    <CardHeader className="flex gap-3 px-6 pt-6">
                        <div className="flex flex-col">
                            <p className="text-md font-bold">School Information</p>
                            <p className="text-small text-default-500">Create a new school and its admin</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="px-6 py-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="bg-danger-50 text-danger px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                    <Icon icon="mdi:alert-circle" className="text-lg" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">School Details</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <Input
                                        {...register('schoolName')}
                                        label="School Name"
                                        placeholder='Enter School Name'
                                        variant="bordered"
                                        isInvalid={!!errors.schoolName}
                                        errorMessage={errors.schoolName?.message}
                                        startContent={<Icon icon="mdi:domain" className="text-default-400" />}
                                    />

                                    <Input
                                        {...register('schoolAddress')}
                                        label="Address"
                                        placeholder='Enter Address'
                                        variant="bordered"
                                        isInvalid={!!errors.schoolAddress}
                                        errorMessage={errors.schoolAddress?.message}
                                        startContent={<Icon icon="mdi:map-marker" className="text-default-400" />}
                                    />

                                    <Input
                                        {...register('schoolBoard')}
                                        label="Board (e.g., CBSE, ICSE)"
                                        placeholder='Enter School Board'
                                        variant="bordered"
                                        isInvalid={!!errors.schoolBoard}
                                        errorMessage={errors.schoolBoard?.message}
                                        startContent={<Icon icon="mdi:book-education" className="text-default-400" />}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">School Admin Details</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <Input
                                        {...register('adminName')}
                                        label="Admin Name"
                                        placeholder='Enter Admin Name'
                                        variant="bordered"
                                        isInvalid={!!errors.adminName}
                                        errorMessage={errors.adminName?.message}
                                        startContent={<Icon icon="mdi:account" className="text-default-400" />}

                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        {...register('adminEmail')}
                                        type="email"
                                        label="Email Address"
                                        placeholder='Enter Admin Email'
                                        variant="bordered"
                                        isInvalid={!!errors.adminEmail}
                                        errorMessage={errors.adminEmail?.message}
                                        startContent={<Icon icon="mdi:email" className="text-default-400" />}
                                    />

                                    <Input
                                        {...register('adminPhone')}
                                        label="Phone Number"
                                        placeholder='Enter Admin Phone'
                                        variant="bordered"
                                        isInvalid={!!errors.adminPhone}
                                        errorMessage={errors.adminPhone?.message}
                                        startContent={<Icon icon="mdi:phone" className="text-default-400" />}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        {...register('adminPassword')}
                                        placeholder='Enter Password'
                                        type="password"
                                        label="Password"
                                        variant="bordered"
                                        isInvalid={!!errors.adminPassword}
                                        errorMessage={errors.adminPassword?.message}
                                        startContent={<Icon icon="mdi:lock" className="text-default-400" />}
                                    />
                                    <Input
                                        {...register('confirmPassword')}
                                        placeholder='Confirm Password'
                                        type="password"
                                        label="Confirm Password"
                                        variant="bordered"
                                        isInvalid={!!errors.confirmPassword}
                                        errorMessage={errors.confirmPassword?.message}
                                        startContent={<Icon icon="mdi:lock-check" className="text-default-400" />}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                color="primary"
                                className="w-full font-semibold"
                                size="lg"
                                isLoading={isLoading}
                                startContent={!isLoading && <Icon icon="mdi:check-circle" />}
                            >
                                {isLoading ? 'Registering School...' : 'Register School'}
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            </motion.div>
        </div>
    );
}
