import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { user, isAuthenticated } = useAuth();
    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }
    return (

        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-32 md:py-40 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                {/* Animated Background Shapes */}
                <motion.div
                    className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"
                    animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
                    animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                                School Management <span className="text-blue-300">Simplified</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
                                A comprehensive platform to manage academics, attendance, exams, and finance with ease. Streamline your school's operations today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/login">
                                    <Button size="lg" color="primary" className="font-semibold text-lg px-8 bg-white text-blue-900 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-shadow">
                                        Get Started
                                    </Button>
                                </Link>
                                <Link to="/about">
                                    <Button size="lg" variant="bordered" className="font-semibold text-lg px-8 text-white border-2 border-white hover:bg-white/20 backdrop-blur-sm">
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Hero Illustration */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="hidden lg:block"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-300/20 rounded-3xl transform rotate-6 blur-xl"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="Students learning"
                                    className="rounded-3xl shadow-2xl relative z-10 w-full h-[400px] object-cover"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything you need</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400">Power packed features to run your educational institution efficiently</p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon="mdi:google-classroom"
                            title="Academic Management"
                            description="Manage classes, subjects, and timetables efficiently. Keep track of curriculum progress."
                            delay={0}
                        />
                        <FeatureCard
                            icon="mdi:calendar-check"
                            title="Smart Attendance"
                            description="Digital attendance marking with comprehensive reports and tracking."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon="mdi:chart-box"
                            title="Exam & Results"
                            description="Schedule exams, record marks, and generate automated report cards for students."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon="mdi:cash-multiple"
                            title="Finance Management"
                            description="Track fees, generate receipts, and manage payroll seamlessly."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon="mdi:account-group"
                            title="Staff Management"
                            description="Manage teacher profiles, attendance, leaves, and generate payslips."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon="mdi:bell-ring"
                            title="Communication"
                            description="Send announcements, notifications, and manage parent-teacher communication."
                            delay={0.5}
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-200/30 dark:bg-blue-800/20 rounded-3xl transform -rotate-3"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="Modern classroom"
                                    className="rounded-3xl shadow-xl relative z-10 w-full h-[400px] object-cover"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Why Choose Our Platform?
                            </h2>
                            <div className="space-y-6">
                                <BenefitItem
                                    icon="mdi:speedometer"
                                    title="Lightning Fast"
                                    description="Built with modern technology for blazing fast performance."
                                />
                                <BenefitItem
                                    icon="mdi:shield-check"
                                    title="Secure & Reliable"
                                    description="Enterprise-grade security to protect your sensitive data."
                                />
                                <BenefitItem
                                    icon="mdi:cellphone-link"
                                    title="Mobile Friendly"
                                    description="Access from anywhere, on any device - desktop, tablet, or mobile."
                                />
                                <BenefitItem
                                    icon="mdi:lifebuoy"
                                    title="24/7 Support"
                                    description="Our dedicated support team is always here to help you succeed."
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Trusted by Educators Worldwide
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                See what school administrators and teachers have to say
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="This platform has transformed how we manage our school. Everything is organized and accessible in one place."
                            author="Sarah Johnson"
                            role="Principal, Greenfield High School"
                            delay={0}
                        />
                        <TestimonialCard
                            quote="The attendance and gradebook features save me hours every week. I can focus more on teaching now."
                            author="Michael Chen"
                            role="Teacher, Riverside Academy"
                            delay={0.1}
                        />
                        <TestimonialCard
                            quote="Parent communication has never been easier. They love the transparency and real-time updates."
                            author="Emily Rodriguez"
                            role="Administrator, Oakwood School"
                            delay={0.2}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to Transform Your School?
                        </h2>
                        <p className="text-xl text-blue-100 mb-10">
                            Join thousands of schools already using our platform to streamline operations and improve learning outcomes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/login">
                                <Button size="lg" className="font-semibold text-lg px-10 bg-white text-blue-900 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-shadow">
                                    Get Started Now
                                </Button>
                            </Link>
                            <Link to="/about">
                                <Button size="lg" variant="bordered" className="font-semibold text-lg px-10 text-white border-2 border-white hover:bg-white/20 backdrop-blur-sm">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300"
        >
            <motion.div
                className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
            >
                <Icon icon={icon} className="text-3xl" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}

function BenefitItem({ icon, title, description }) {
    return (
        <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ x: 5 }}
        >
            <div className="flex-shrink-0">
                <motion.div
                    className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                >
                    <Icon icon={icon} className="text-2xl" />
                </motion.div>
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{description}</p>
            </div>
        </motion.div>
    );
}

function TestimonialCard({ quote, author, role, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300"
        >
            <Icon icon="mdi:format-quote-open" className="text-4xl text-blue-600 dark:text-blue-400 mb-4" />
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                "{quote}"
            </p>
            <div>
                <p className="font-bold text-gray-900 dark:text-white">{author}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
            </div>
        </motion.div>
    );
}
