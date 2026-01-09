import React from 'react';
import { Card, CardBody, Avatar } from "@heroui/react";
import { useAuth } from '@/context/AuthContext';
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import SchoolAdminDashboard from "./dashboard/SchoolAdminDashboard";
import SystemAdminDashboard from "./dashboard/SystemAdminDashboard";
import TeacherDashboard from "./dashboard/TeacherDashboard";
import OfficeStaffDashboard from "./dashboard/OfficeStaffDashboard";
import ParentDashboard from './dashboard/ParentDashboard';
import LibrarianDashboard from '@/pages/Librarian/LibrarianDashboard';
import DriverDashboard from './dashboard/DriverDashboard';


export default function Dashboard() {
    const { user } = useAuth();

    // Role-based dashboard routing
    if (user?.role === 'SUPER_ADMIN') {
        return <SystemAdminDashboard />;
    }

    if (user?.role === 'SCHOOL_ADMIN') {
        return <SchoolAdminDashboard />;
    }

    if (user?.role === 'TEACHER') {
        return <TeacherDashboard />;
    }

    if (user?.role === 'OFFICE_STAFF' || user?.role === 'STAFF') {
        return <OfficeStaffDashboard />;
    }

    if (user?.role === 'PARENT') {
        return <ParentDashboard />;
    }

    if (user?.role === 'LIBRARIAN') {
        return <LibrarianDashboard />;
    }

    if (user?.role === 'BUS_DRIVER') {
        return <DriverDashboard />;
    }


    // Default dashboard for other roles or fallback
    const stats = [
        { title: 'Total Students', value: '1,234', icon: 'mdi:account-school', color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-500/20' },
        { title: 'Total Teachers', value: '56', icon: 'mdi:account-tie', color: 'text-secondary-600 dark:text-secondary-400', bg: 'bg-secondary-100 dark:bg-secondary-500/20' },
        { title: 'Total Classes', value: '24', icon: 'mdi:google-classroom', color: 'text-success-600 dark:text-success-400', bg: 'bg-success-100 dark:bg-success-500/20' },
        { title: 'Attendance Rate', value: '95%', icon: 'mdi:calendar-check', color: 'text-warning-600 dark:text-warning-400', bg: 'bg-warning-100 dark:bg-warning-500/20' },
    ];

    return (
        <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-1 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full">
                    <Avatar
                        src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                        size="lg"
                        className="border-2 border-white"
                    />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Welcome back, <span className="text-primary-500">{user?.firstName}</span>
                    </h1>
                    <p className="text-default-500 bg-default-100 px-2 py-0.5 rounded-full text-xs font-medium inline-block mt-1 border border-default-200">{user?.role}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="shadow-sm border border-default-200 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-md bg-content1">
                            <CardBody className="flex flex-row items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <Icon icon={stat.icon} className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-sm text-default-500">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions / Recent Activity placeholders */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="min-h-[300px] flex items-center justify-center border-dashed border-2 border-default-300 bg-content2/50">
                    <div className="text-center text-default-400">
                        <div className="w-16 h-16 bg-default-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:chart-line-variant" className="text-3xl" />
                        </div>
                        <p className="text-lg font-medium">Analytics Dashboard Coming Soon</p>
                        <p className="text-sm">We are building something amazing for you.</p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
