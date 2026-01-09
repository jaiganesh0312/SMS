import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from '@/context/AuthContext';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

export default function OfficeStaffDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Safely access department, handling potential undefined structure
    const department = user?.staffProfile?.department || user?.department || '';

    // All office staff can now manage fees
    const canManageFees = true;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            className="p-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Office Dashboard
                    </h1>
                    <p className="text-default-500">Welcome back, {user?.firstName} {user?.lastName}</p>
                    {department && <span className="text-xs text-primary font-semibold uppercase tracking-wider">{department} Department</span>}
                </div>
            </motion.div>

            {/* Common Shortcuts for ALL Office Staff */}
            <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-content1 dark:bg-content1 border border-default-200 dark:border-default-100" onPress={() => navigate('/my-leaves')}>
                        <CardBody className="flex flex-row items-center gap-4 p-4">
                            <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                <Icon icon="mdi:calendar-account-outline" className="text-2xl" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">My Leaves</h4>
                                <p className="text-xs text-default-500">Apply & Status</p>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Placeholder for Task Management if needed later */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer opacity-70 bg-content1 dark:bg-content1 border border-default-200 dark:border-default-100">
                        <CardBody className="flex flex-row items-center gap-4 p-4">
                            <div className="p-3 rounded-lg bg-default-100 dark:bg-default-100/10 text-default-600">
                                <Icon icon="mdi:clipboard-list-outline" className="text-2xl" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">My Tasks</h4>
                                <p className="text-xs text-default-500">Coming Soon</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </motion.div>

            {/* Fees Management Section - Available to all Office Staff */}
            {canManageFees && (
                <motion.div variants={itemVariants} className="space-y-4">
                    <Divider className="my-6" />
                    <div className="flex items-center gap-2 mb-4">
                        <Icon icon="mdi:finance" className="text-success-500 text-2xl" />
                        <h3 className="text-lg font-semibold text-foreground">Fees & Accounts Management</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Collect Fees */}
                        <Card className="shadow-sm border-l-4 border-l-success-500 bg-content1 dark:bg-content1">
                            <CardBody className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-lg text-success-600 dark:text-success-400">
                                        <Icon icon="mdi:cash-register" className="text-3xl" />
                                    </div>
                                    <Button size="sm" color="success" variant="flat" onPress={() => navigate('/finance/collect-fees')}>
                                        Collection
                                    </Button>
                                </div>
                                <h4 className="text-xl font-bold text-success-700 dark:text-success-500">Collect Fees</h4>
                                <p className="text-sm text-default-500 mt-1">Record student fee payments</p>
                            </CardBody>
                        </Card>

                        {/* Generate Receipt */}
                        <Card className="shadow-sm border-l-4 border-l-primary-500 bg-content1 dark:bg-content1">
                            <CardBody className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                                        <Icon icon="mdi:receipt-text" className="text-3xl" />
                                    </div>
                                    <Button size="sm" color="primary" variant="flat" onPress={() => navigate('/finance/receipts')}>
                                        Receipts
                                    </Button>
                                </div>
                                <h4 className="text-xl font-bold text-primary-700 dark:text-primary-500">Generate Receipt</h4>
                                <p className="text-sm text-default-500 mt-1">View & Print past receipts</p>
                            </CardBody>
                        </Card>

                        {/* Fee Statistics / Reports */}
                        <Card className="shadow-sm border-l-4 border-l-secondary-500 bg-content1 dark:bg-content1">
                            <CardBody className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg text-secondary-600 dark:text-secondary-400">
                                        <Icon icon="mdi:chart-box" className="text-3xl" />
                                    </div>
                                    <Button size="sm" color="secondary" variant="flat" onPress={() => navigate('/finance/statistics')}>
                                        Reports
                                    </Button>
                                </div>
                                <h4 className="text-xl font-bold text-secondary-700 dark:text-secondary-500">Fee Reports</h4>
                                <p className="text-sm text-default-500 mt-1">View collection statistics</p>
                            </CardBody>
                        </Card>

                        {/* Fee Structures */}
                        <Card className="shadow-sm border-l-4 border-l-warning-500 bg-content1 dark:bg-content1">
                            <CardBody className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg text-warning-600 dark:text-warning-400">
                                        <Icon icon="mdi:cogs" className="text-3xl" />
                                    </div>
                                    <Button size="sm" color="warning" variant="flat" onPress={() => navigate('/finance/fees')}>
                                        Setup
                                    </Button>
                                </div>
                                <h4 className="text-xl font-bold text-warning-700 dark:text-warning-500">Fee Setup</h4>
                                <p className="text-sm text-default-500 mt-1">Manage fee structures</p>
                            </CardBody>
                        </Card>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
