import React from 'react';
import { motion } from 'framer-motion';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-default-50 pt-20 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold text-foreground font-heading mb-8">Privacy Policy</h1>
                    <p className="text-default-500 mb-8">Last updated: December 27, 2024</p>

                    <div className="prose prose-lg max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
                            <p className="text-default-600 mb-4">
                                We collect information that you provide directly to us when you register for an account, create or modify your profile, and use our services. This includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-default-600">
                                <li>Account information (name, email, password, school details).</li>
                                <li>Student and teacher data uploaded to the platform.</li>
                                <li>Usage data and cookies to improve user experience.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
                            <p className="text-default-600 mb-4">
                                We use the information we collect to provider, maintain, and improve our services, such as to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-default-600">
                                <li>Process transactions and manage your account.</li>
                                <li>Send you technical notices, updates, and support messages.</li>
                                <li>Respond to your comments and questions.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Sharing</h2>
                            <p className="text-default-600 mb-4">
                                We do not share your personal information with third parties except as described in this privacy policy (e.g., with your consent, for legal reasons, or with service providers who help us operate).
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
                            <p className="text-default-600 mb-4">
                                We implement reasonable security measures to help protect the security of your information and to ensure that your data is treated securely.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Choices</h2>
                            <p className="text-default-600 mb-4">
                                You may update, correct, or delete information about you at any time by logging into your online account or emailing us.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-4">6. Contact Us</h2>
                            <p className="text-default-600 mb-4">
                                If you have any questions about this Privacy Policy, please contact us at privacy@lms.example.com.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
