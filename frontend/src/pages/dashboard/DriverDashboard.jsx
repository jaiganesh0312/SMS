import React from 'react';
import { Card, CardBody, Button, Avatar } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DriverSchedule from '@/pages/transport/DriverSchedule';

const DriverDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto min-h-screen bg-transparent">
            {/* 1. Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-content1 p-6 rounded-2xl shadow-sm border border-default-200 dark:border-default-100">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                        size="lg"
                        className="w-16 h-16 text-xl"
                        isBordered
                        color="primary"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Welcome, {user?.name}
                        </h1>
                        <div className="flex items-center gap-2 text-default-500 text-sm mt-1">
                            <Icon icon="mdi:steering" className="text-lg" />
                            <span>Bus Driver Dashboard</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        color="primary"
                        size="lg"
                        startContent={<Icon icon="mdi:map-marker-radius" />}
                        onPress={() => navigate('/transport/driver-panel')}
                        className="shadow-md shadow-primary-500/20"
                    >
                        Start Trip / Live Location
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Main Content - Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon icon="mdi:calendar-clock" className="text-2xl text-primary" />
                        <h2 className="text-xl font-bold text-foreground">Your Schedule</h2>
                    </div>
                    <DriverSchedule />
                </div>

                {/* 3. Sidebar - Quick Stats / Actions */}
                <div className="space-y-6">
                    {/* Quick Links Card */}
                    <Card className="bg-content1 dark:bg-content1 shadow-sm border border-default-200 dark:border-default-100">
                        <CardBody className="p-5">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
                                <Icon icon="mdi:lightning-bolt" className="text-warning" />
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
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
