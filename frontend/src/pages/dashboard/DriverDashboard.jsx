import React from 'react';
import { Card, CardBody, Button, Avatar } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DriverSchedule from '@/pages/transport/DriverSchedule';
import { motion } from "framer-motion";

const DriverDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

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
            className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto min-h-screen"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* 1. Welcome Section */}
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-content1 p-4 md:p-6 rounded-2xl shadow-sm border border-default-200 dark:border-default-100">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                        size="lg"
                        className="w-16 h-16 text-xl"
                        isBordered
                        color="primary"
                    />
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-foreground">
                            Welcome, {user?.name}
                        </h1>
                        <div className="flex items-center gap-2 text-default-500 text-sm mt-1">
                            <Icon icon="mdi:steering" className="text-lg" />
                            <span>Bus Driver Dashboard</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Button
                        color="primary"
                        size="lg"
                        startContent={<Icon icon="mdi:map-marker-radius" />}
                        onPress={() => navigate('/transport/driver-panel')}
                        className="shadow-md shadow-primary-500/20 w-full sm:w-auto"
                    >
                        Start Trip / Live Location
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* 2. Main Content - Schedule */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4 md:space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon icon="mdi:calendar-clock" className="text-xl md:text-2xl text-primary-500" />
                        <h2 className="text-lg md:text-xl font-bold text-foreground">Your Schedule</h2>
                    </div>
                    <DriverSchedule />
                </motion.div>

                {/* 3. Sidebar - Quick Stats / Actions */}
                <motion.div variants={itemVariants} className="space-y-4 md:space-y-6">
                    {/* Quick Links Card */}
                    <Card className="bg-content1 dark:bg-content1 shadow-sm border border-default-200 dark:border-default-100">
                        <CardBody className="p-5">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
                                <Icon icon="mdi:lightning-bolt" className="text-warning-500" />
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <Button
                                    fullWidth
                                    variant="flat"
                                    color="default"
                                    className="justify-start bg-default-50 hover:bg-default-100 text-foreground"
                                    startContent={<Icon icon="mdi:history" className="text-xl text-primary-500" />}
                                    onPress={() => navigate('/transport/trip-history')}
                                >
                                    My Trip History
                                </Button>
                                <Button
                                    fullWidth
                                    variant="flat"
                                    color="default"
                                    className="justify-start bg-default-50 hover:bg-default-100 text-foreground"
                                    startContent={<Icon icon="mdi:account" className="text-xl text-secondary-500" />}
                                    onPress={() => navigate('/profile')}
                                >
                                    My Profile
                                </Button>
                                <Button
                                    fullWidth
                                    variant="flat"
                                    color="default"
                                    className="justify-start bg-default-50 hover:bg-default-100 text-foreground"
                                    startContent={<Icon icon="mdi:message-alert" className="text-xl text-warning-500" />}
                                // onPress={() => navigate('/complaints')} // Future feature
                                >
                                    Report Issue
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Stats Card */}
                    <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-md">
                        <CardBody className="p-6">
                            <h3 className="font-semibold text-white/90 mb-6">Today's Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-3xl font-bold mb-1">0</p>
                                    <p className="text-xs text-white/70 uppercase tracking-wider">Trips Completed</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold mb-1">--</p>
                                    <p className="text-xs text-white/70 uppercase tracking-wider">On Time Rate</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default DriverDashboard;
