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
        <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background noise/texture if desired, otherwise just the gradient is fine. 
                 Adding a subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-secondary-100/10 backdrop-blur-lg border border-secondary-500/20 rounded-2xl flex items-center justify-center shadow-xl shadow-secondary-500/10">
                        <Icon icon="mdi:school" className="text-4xl text-secondary-500" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-primary-200/60">
                    Welcome to the School Management System
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <Card className="shadow-2xl bg-content1/90 dark:bg-content1/50 backdrop-blur-xl border border-white/20 dark:border-white/10">
                    <CardHeader className="flex gap-3 px-8 pt-8 pb-0">
                        <div className="flex flex-col">
                            <p className="text-xl font-bold text-foreground">Welcome Back</p>
                            <p className="text-sm text-default-500">Enter your credentials to access the portal</p>
                        </div>
                    </CardHeader>
                    <div className="px-8 py-4">
                        <Divider className="bg-default-200/50" />
                    </div>
                    <CardBody className="px-8 pb-8 pt-0">
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
                            {successMessage && (
                                <div className="bg-success-50 text-success-700 border border-success-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" className="text-lg" />
                                    {successMessage}
                                </div>
                            )}

                            {error && (
                                <div className="bg-danger-50 text-danger-600 border border-danger-100 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                    <Icon icon="mdi:alert-circle" className="text-lg" />
                                    {error}
                                </div>
                            )}

                            <Input
                                {...register('email')}
                                type="email"
                                label="Email Address"
                                placeholder="Enter your email"
                                variant="bordered"
                                labelPlacement="outside"
                                classNames={{
                                    label: "text-default-600 font-medium",
                                    inputWrapper: "bg-default-100/50 dark:bg-default-100/20 border-default-200 dark:border-default-700 hover:border-primary-500 focus-within:!border-primary-500 transition-colors duration-300",
                                    innerWrapper: "bg-transparent",
                                    input: "text-foreground",
                                }}
                                isInvalid={!!errors.email}
                                errorMessage={errors.email?.message}
                                startContent={<Icon icon="mdi:email" className="text-default-400 text-xl" />}
                            />

                            <div className="space-y-2">
                                <Input
                                    {...register('password')}
                                    type="password"
                                    label="Password"
                                    placeholder="Enter your password"
                                    variant="bordered"
                                    labelPlacement="outside"
                                    classNames={{
                                        label: "text-default-600 font-medium",
                                        inputWrapper: "bg-default-100/50 dark:bg-default-100/20 border-default-200 dark:border-default-700 hover:border-primary-500 focus-within:!border-primary-500 transition-colors duration-300",
                                        innerWrapper: "bg-transparent",
                                        input: "text-foreground",
                                    }}
                                    isInvalid={!!errors.password}
                                    errorMessage={errors.password?.message}
                                    startContent={<Icon icon="mdi:lock" className="text-default-400 text-xl" />}
                                />
                                <div className="flex justify-end">
                                    <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-secondary-500 transition-colors">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/30 transition-all duration-300"
                                size="lg"
                                isLoading={isLoading}
                                startContent={!isLoading && <Icon icon="mdi:login" className="text-xl" />}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Footer text */}
            <div className="mt-8 text-center relative z-10">
                <p className="text-xs text-primary-200/40">
                    &copy; {new Date().getFullYear()} School Management System. All rights reserved.
                </p>
            </div>
        </div>
    );
}
