import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';
import { Link } from 'react-router-dom';

export default function About() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 -z-10"></div>
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={fadeInUp}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            Reimagining <span className="text-blue-600 dark:text-blue-400">Education</span> Management
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                            We're on a mission to simplify school administration and empower educators to focus on what matters most - teaching and shaping future generations.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg">
                                <p>
                                    Founded in 2024, our platform emerged from a simple observation: schools were drowning in paperwork and disconnected systems. Teachers spent more time on administrative tasks than interacting with students.
                                </p>
                                <p>
                                    We set out to build a solution that wouldn't just digitize existing processes, but fundamentally improve them. By combining modern technology with intuitive design, we've created a comprehensive ecosystem that connects administrators, teachers, parents, and students.
                                </p>
                                <p>
                                    Today, we serve educational institutions of all sizes, helping them operate more efficiently and fostering better communication within their communities.
                                </p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-3xl transform rotate-3 -z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                alt="Team collaborating"
                                className="rounded-3xl shadow-xl w-full h-[400px] object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
                        <p className="text-gray-600 dark:text-gray-400">The principles that guide every decision we make</p>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <ValueCard
                            icon="mdi:lightbulb-on-outline"
                            title="Innovation"
                            description="We constantly seek new ways to solve old problems, leveraging the latest technology to improve education."
                        />
                        <ValueCard
                            icon="mdi:shield-check-outline"
                            title="Trust & Security"
                            description="We treat school data with the highest level of security and integrity. Privacy is non-negotiable."
                        />
                        <ValueCard
                            icon="mdi:account-heart-outline"
                            title="User-Centric"
                            description="We build for people. Every feature is designed with the end-user's experience in mind."
                        />
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
                        Join us in shaping the future of education
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/login">
                            <Button size="lg" color="primary" className="font-semibold text-lg px-8 shadow-lg hover:shadow-xl transition-shadow">
                                Get Started Today
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ValueCard({ icon, title, description }) {
    return (
        <motion.div
            variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
        >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <Icon icon={icon} className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}
