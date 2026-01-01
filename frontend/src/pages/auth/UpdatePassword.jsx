import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardBody, CardHeader, Divider, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { authService } from '@/services';
import { motion } from "framer-motion";
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator';

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
});

export default function UpdatePassword() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        resolver: zodResolver(updatePasswordSchema)
    });

    const newPassword = watch('newPassword');

    const onSubmit = async (data) => {
        setIsLoading(true);

        try {
            const response = await authService.updatePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });

            if (response?.data?.success) {
                addToast({
                    title: 'Success',
                    description: 'Password updated successfully! Please login with your new password.',
                    color: 'success',
                });
                // Optional: logout user and redirect to login
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                addToast({
                    title: 'Error',
                    description: response?.data?.message || 'Failed to update password. Please try again.',
                    color: 'danger',
                });
            }
        } catch (err) {
            addToast({
                title: 'Error',
                description: err.response?.data?.message || 'An error occurred while updating password.',
                color: 'danger',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:lock-reset" className="text-3xl text-primary" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Update Your Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Choose a strong password to keep your account secure
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
            >
                <Card className="shadow-xl">
                    <CardHeader className="flex gap-3 px-6 pt-6">
                        <div className="flex flex-col">
                            <p className="text-md font-bold">Password Update</p>
                            <p className="text-small text-default-500">Enter your current and new password</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="px-6 py-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                            {/* Current Password */}
                            <Input
                                {...register('currentPassword')}
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder='Enter your current password'
                                label="Current Password"
                                variant="bordered"
                                isInvalid={!!errors.currentPassword}
                                errorMessage={errors.currentPassword?.message}
                                startContent={<Icon icon="mdi:lock" className="text-default-400" />}
                                endContent={
                                    <button
                                        className="focus:outline-none"
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        <Icon
                                            icon={showCurrentPassword ? "mdi:eye-off" : "mdi:eye"}
                                            className="text-default-400 text-xl"
                                        />
                                    </button>
                                }
                            />

                            {/* New Password */}
                            <div>
                                <Input
                                    {...register('newPassword')}
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder='Enter your new password'
                                    label="New Password"
                                    variant="bordered"
                                    isInvalid={!!errors.newPassword}
                                    errorMessage={errors.newPassword?.message}
                                    startContent={<Icon icon="mdi:lock-plus" className="text-default-400" />}
                                    endContent={
                                        <button
                                            className="focus:outline-none"
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            <Icon
                                                icon={showNewPassword ? "mdi:eye-off" : "mdi:eye"}
                                                className="text-default-400 text-xl"
                                            />
                                        </button>
                                    }
                                />
                                {/* Password Strength Indicator */}
                                <PasswordStrengthIndicator password={newPassword} showTips={true} />
                            </div>

                            {/* Confirm Password */}
                            <Input
                                {...register('confirmPassword')}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder='Confirm your new password'
                                label="Confirm New Password"
                                variant="bordered"
                                isInvalid={!!errors.confirmPassword}
                                errorMessage={errors.confirmPassword?.message}
                                startContent={<Icon icon="mdi:lock-check" className="text-default-400" />}
                                endContent={
                                    <button
                                        className="focus:outline-none"
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <Icon
                                            icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"}
                                            className="text-default-400 text-xl"
                                        />
                                    </button>
                                }
                            />

                            {/* Submit Button */}
                            <div className="flex gap-3 mt-2">
                                <Button
                                    type="button"
                                    variant="bordered"
                                    className="w-full font-semibold"
                                    size="lg"
                                    onPress={() => navigate(-1)}
                                    startContent={<Icon icon="mdi:arrow-left" />}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    className="w-full font-semibold"
                                    size="lg"
                                    isLoading={isLoading}
                                    startContent={!isLoading && <Icon icon="mdi:lock-reset" />}
                                >
                                    {isLoading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </motion.div>
        </div>
    );
}
