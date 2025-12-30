import React from 'react';
import { motion } from 'framer-motion';

export default function Terms() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 pt-20 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms and Conditions</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">Last updated: December 27, 2024</p>

                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Welcome to School Management System. By accessing or using our website and services, you agree to be bound by these Terms and Conditions.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Use of Service</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Our platform allows schools to manage their administrative tasks. You agree to use the service only for lawful purposes and in accordance with these Terms.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                                <li>You must maintain the security of your account credentials.</li>
                                <li>You are responsible for all activities that occur under your account.</li>
                                <li>You must not misuse our services or help anyone else do so.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Data Privacy</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                We take data privacy seriously. Your use of our services is also governed by our Privacy Policy. By using our services, you consent to the terms of the Privacy Policy.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Intellectual Property</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                The service and its original content, features, and functionality are and will remain the exclusive property of School Management System and its licensors.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Termination</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Contact Us</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                If you have any questions about these Terms, please contact us at support@lms.example.com.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
