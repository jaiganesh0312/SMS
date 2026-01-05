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
            <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 text-white py-32 md:py-40 overflow-hidden">
                {/* Geometric Pattern Background */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                                <polygon points="25,0 50,14.4 50,43.4 25,57.7 0,43.4 0,14.4" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hexagons)" />
                    </svg>
                </div>

                {/* Grain Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15"></div>

                {/* Animated Background Orbs */}
                <motion.div
                    className="absolute top-20 left-10 w-80 h-80 bg-secondary-500/15 rounded-full blur-3xl"
                    animate={{ y: [0, 40, 0], x: [0, 25, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-10 right-20 w-96 h-96 bg-primary-300/10 rounded-full blur-3xl"
                    animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary-400/5 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            {/* Decorative Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20"
                            >
                                <Icon icon="mdi:star-four-points" className="text-secondary-400 text-lg" />
                                <span className="text-secondary-300 text-sm font-medium tracking-wide">Trusted by 500+ Schools</span>
                            </motion.div>

                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                                School Management <span className="text-secondary-400 relative">
                                    Simplified
                                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                                        <path d="M2 10C50 2 150 2 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-secondary-500/50" />
                                    </svg>
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-primary-100 mb-10 leading-relaxed">
                                A comprehensive platform to manage academics, attendance, exams, and finance with ease. Streamline your school's operations today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/login">
                                    <Button
                                        size="lg"
                                        className="font-semibold text-lg px-8 bg-secondary-500 text-primary-900 hover:bg-secondary-400 shadow-lg hover:shadow-secondary-500/30 transition-all duration-300 hover:-translate-y-0.5"
                                    >
                                        <Icon icon="mdi:rocket-launch" className="mr-2" />
                                        Get Started
                                    </Button>
                                </Link>
                                <Link to="/about">
                                    <Button
                                        size="lg"
                                        variant="bordered"
                                        className="font-semibold text-lg px-8 text-white border-2 border-white/40 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                                    >
                                        Learn More
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="mt-12 flex items-center gap-8"
                            >
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:shield-check" className="text-2xl text-success-400" />
                                    <span className="text-sm text-primary-200">Secure & Reliable</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:clock-fast" className="text-2xl text-secondary-400" />
                                    <span className="text-sm text-primary-200">24/7 Support</span>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Hero Illustration */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="hidden lg:block"
                        >
                            <div className="relative">
                                {/* Decorative Frame */}
                                <div className="absolute -inset-4 bg-gradient-to-br from-secondary-500/30 to-primary-400/20 rounded-3xl transform rotate-3 blur-sm"></div>
                                <div className="absolute -inset-4 border-2 border-secondary-500/30 rounded-3xl transform -rotate-2"></div>

                                <img
                                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="Students learning"
                                    className="rounded-3xl shadow-2xl relative z-10 w-full h-[400px] object-cover"
                                />

                                {/* Floating Stats Card */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -bottom-6 -left-6 bg-white dark:bg-content1 rounded-2xl p-4 shadow-xl border border-default-200 z-20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-success-100 dark:bg-success-500/20 rounded-xl flex items-center justify-center">
                                            <Icon icon="mdi:trending-up" className="text-2xl text-success-600 dark:text-success-400" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-foreground">98%</p>
                                            <p className="text-xs text-default-500">Satisfaction Rate</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Floating Badge */}
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute -top-4 -right-4 bg-secondary-500 rounded-2xl p-3 shadow-xl z-20"
                                >
                                    <Icon icon="mdi:medal" className="text-3xl text-primary-900" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" className="fill-background" />
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-sm font-semibold rounded-full mb-4">
                                Features
                            </span>
                            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Everything you need</h2>
                            <p className="text-lg text-default-600 max-w-2xl mx-auto">Power packed features to run your educational institution efficiently</p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon="mdi:google-classroom"
                            title="Academic Management"
                            description="Manage classes, subjects, and timetables efficiently. Keep track of curriculum progress."
                            delay={0}
                            color="primary"
                        />
                        <FeatureCard
                            icon="mdi:calendar-check"
                            title="Smart Attendance"
                            description="Digital attendance marking with comprehensive reports and tracking."
                            delay={0.1}
                            color="secondary"
                        />
                        <FeatureCard
                            icon="mdi:chart-box"
                            title="Exam & Results"
                            description="Schedule exams, record marks, and generate automated report cards for students."
                            delay={0.2}
                            color="success"
                        />
                        <FeatureCard
                            icon="mdi:cash-multiple"
                            title="Finance Management"
                            description="Track fees, generate receipts, and manage payroll seamlessly."
                            delay={0.3}
                            color="warning"
                        />
                        <FeatureCard
                            icon="mdi:account-group"
                            title="Staff Management"
                            description="Manage teacher profiles, attendance, leaves, and generate payslips."
                            delay={0.4}
                            color="primary"
                        />
                        <FeatureCard
                            icon="mdi:bell-ring"
                            title="Communication"
                            description="Send announcements, notifications, and manage parent-teacher communication."
                            delay={0.5}
                            color="secondary"
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 bg-content2">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-br from-secondary-500/20 to-primary-500/10 rounded-3xl transform -rotate-3"></div>
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
                            <span className="inline-block px-4 py-1.5 bg-secondary-100 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-400 text-sm font-semibold rounded-full mb-4">
                                Why Choose Us
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                                Why Choose Our Platform?
                            </h2>
                            <div className="space-y-6">
                                <BenefitItem
                                    icon="mdi:speedometer"
                                    title="Lightning Fast"
                                    description="Built with modern technology for blazing fast performance."
                                    color="primary"
                                />
                                <BenefitItem
                                    icon="mdi:shield-check"
                                    title="Secure & Reliable"
                                    description="Enterprise-grade security to protect your sensitive data."
                                    color="success"
                                />
                                <BenefitItem
                                    icon="mdi:cellphone-link"
                                    title="Mobile Friendly"
                                    description="Access from anywhere, on any device - desktop, tablet, or mobile."
                                    color="secondary"
                                />
                                <BenefitItem
                                    icon="mdi:lifebuoy"
                                    title="24/7 Support"
                                    description="Our dedicated support team is always here to help you succeed."
                                    color="warning"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block px-4 py-1.5 bg-success-100 dark:bg-success-500/20 text-success-700 dark:text-success-400 text-sm font-semibold rounded-full mb-4">
                                Testimonials
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Trusted by Educators Worldwide
                            </h2>
                            <p className="text-lg text-default-600">
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
            <section className="relative py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15"></div>
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-10 left-10 w-32 h-32 border border-secondary-500/20 rounded-full"></div>
                    <div className="absolute bottom-10 right-10 w-48 h-48 border border-secondary-500/20 rounded-full"></div>
                    <div className="absolute top-1/2 right-1/4 w-24 h-24 border border-white/10 rounded-full"></div>
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500/20 backdrop-blur-sm rounded-full mb-8 border border-secondary-500/30">
                            <Icon icon="mdi:rocket" className="text-secondary-400" />
                            <span className="text-secondary-300 text-sm font-medium">Start Your Journey Today</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to Transform Your School?
                        </h2>
                        <p className="text-xl text-primary-100 mb-10">
                            Join thousands of schools already using our platform to streamline operations and improve learning outcomes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/login">
                                <Button
                                    size="lg"
                                    className="font-semibold text-lg px-10 bg-secondary-500 text-primary-900 hover:bg-secondary-400 shadow-lg hover:shadow-secondary-500/30 transition-all duration-300"
                                >
                                    Get Started Now
                                </Button>
                            </Link>
                            <Link to="/about">
                                <Button
                                    size="lg"
                                    variant="bordered"
                                    className="font-semibold text-lg px-10 text-white border-2 border-white/40 hover:bg-white/10 backdrop-blur-sm"
                                >
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

function FeatureCard({ icon, title, description, delay, color = "primary" }) {
    const colorClasses = {
        primary: {
            bg: "bg-primary-100 dark:bg-primary-500/20",
            text: "text-primary-600 dark:text-primary-400",
            border: "hover:border-primary-300 dark:hover:border-primary-700"
        },
        secondary: {
            bg: "bg-secondary-100 dark:bg-secondary-500/20",
            text: "text-secondary-600 dark:text-secondary-400",
            border: "hover:border-secondary-300 dark:hover:border-secondary-600"
        },
        success: {
            bg: "bg-success-100 dark:bg-success-500/20",
            text: "text-success-600 dark:text-success-400",
            border: "hover:border-success-300 dark:hover:border-success-700"
        },
        warning: {
            bg: "bg-warning-100 dark:bg-warning-500/20",
            text: "text-warning-600 dark:text-warning-400",
            border: "hover:border-warning-300 dark:hover:border-warning-700"
        }
    };

    const colors = colorClasses[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`p-8 rounded-2xl bg-content1 border border-default-200 ${colors.border} hover:shadow-2xl transition-all duration-300 group`}
        >
            <motion.div
                className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-6 ${colors.text} group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
            >
                <Icon icon={icon} className="text-3xl" />
            </motion.div>
            <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
            <p className="text-default-600 leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}

function BenefitItem({ icon, title, description, color = "primary" }) {
    const colorClasses = {
        primary: "bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400",
        secondary: "bg-secondary-100 dark:bg-secondary-500/20 text-secondary-600 dark:text-secondary-400",
        success: "bg-success-100 dark:bg-success-500/20 text-success-600 dark:text-success-400",
        warning: "bg-warning-100 dark:bg-warning-500/20 text-warning-600 dark:text-warning-400"
    };

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
                    className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                >
                    <Icon icon={icon} className="text-2xl" />
                </motion.div>
            </div>
            <div>
                <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-default-600">{description}</p>
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
            className="p-8 rounded-2xl bg-content1 border border-default-200 hover:shadow-xl hover:border-secondary-300 dark:hover:border-secondary-700 transition-all duration-300"
        >
            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Icon key={i} icon="mdi:star" className="text-xl text-secondary-500" />
                ))}
            </div>
            <p className="text-default-700 mb-6 leading-relaxed italic">
                "{quote}"
            </p>
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                    {author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <p className="font-bold text-foreground">{author}</p>
                    <p className="text-sm text-default-500">{role}</p>
                </div>
            </div>
        </motion.div>
    );
}
