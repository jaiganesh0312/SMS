import React from 'react';
import { Card, CardBody, Avatar } from "@heroui/react";
import { useAuth } from '@/context/AuthContext';
import { Icon } from "@iconify/react";
import SchoolAdminDashboard from "./dashboard/SchoolAdminDashboard";
import SystemAdminDashboard from "./dashboard/SystemAdminDashboard";
import TeacherDashboard from "./dashboard/TeacherDashboard";
import OfficeStaffDashboard from "./dashboard/OfficeStaffDashboard";
import ParentDashboard from './dashboard/ParentDashboard';
import LibrarianDashboard from '@/pages/Librarian/LibrarianDashboard';

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

    // Default dashboard for other roles (Teachers, Students, etc.)
    // For now, we keep the original generic generic view for them or fallback
    const stats = [
        { title: 'Total Students', value: '1,234', icon: 'mdi:account-school', color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Total Teachers', value: '56', icon: 'mdi:account-tie', color: 'text-purple-600', bg: 'bg-purple-100' },
        { title: 'Total Classes', value: '24', icon: 'mdi:google-classroom', color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Attendance Rate', value: '95%', icon: 'mdi:calendar-check', color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Avatar
                    src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                    size="lg"
                />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.firstName}
                    </h1>
                    <p className="text-gray-500">{user?.role}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="shadow-sm">
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <Icon icon={stat.icon} className="text-2xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Quick Actions / Recent Activity placeholders could go here */}
            <Card className="min-h-[300px] flex items-center justify-center border-dashed border-2 border-gray-200 dark:border-gray-800">
                <div className="text-center text-gray-400">
                    <Icon icon="mdi:chart-line-variant" className="text-4xl mx-auto mb-2" />
                    <p>Analytics Dashboard Coming Soon</p>
                </div>
            </Card>
        </div>
    );
}
