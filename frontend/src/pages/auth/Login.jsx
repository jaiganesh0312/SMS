import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Button, Input, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services';
import { motion } from "framer-motion";


const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Get success message from registration redirect if any
    const successMessage = location.state?.message;

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await authService.login(data);
            if (response.data?.success) {
                const token = response.data.token;
                const user = response.data.data?.user;

                if (token && user) {
                    login(user, token);
                    if (user.role === 'PARENT') {
                        navigate('/parent-dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                } else {
                    setError('Invalid server response');
                }
            } else {
                setError(response.data?.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };
    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:school" className="text-3xl text-primary" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Sign in to your account
                </h2>
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
                            <p className="text-md font-bold">Welcome Back</p>
                            <p className="text-small text-default-500">Enter your credentials to access the portal</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="px-6 py-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
                            {successMessage && (
                                <div className="bg-success-50 text-success px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" className="text-lg" />
                                    {successMessage}
                                </div>
                            )}

                            {error && (
                                <div className="bg-danger-50 text-danger px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                    <Icon icon="mdi:alert-circle" className="text-lg" />
                                    {error}
                                </div>
                            )}

                            <Input
                                {...register('email')}
                                type="email"
                                placeholder='Enter your email'
                                label="Email Address"
                                variant="bordered"
                                isInvalid={!!errors.email}
                                errorMessage={errors.email?.message}
                                startContent={<Icon icon="mdi:email" className="text-default-400" />}
                            />

                            <div className="space-y-1">
                                <Input
                                    {...register('password')}
                                    type="password"
                                    placeholder='Enter your password'
                                    label="Password"
                                    variant="bordered"
                                    isInvalid={!!errors.password}
                                    errorMessage={errors.password?.message}
                                    startContent={<Icon icon="mdi:lock" className="text-default-400" />}
                                />
                                <div className="flex justify-end">
                                    <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-primary-600">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                color="primary"
                                className="w-full font-semibold"
                                size="lg"
                                isLoading={isLoading}
                                startContent={!isLoading && <Icon icon="mdi:login" />}
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            </motion.div>
        </div>
    );
}
