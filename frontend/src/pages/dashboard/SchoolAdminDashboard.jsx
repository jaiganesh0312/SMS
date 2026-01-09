import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { dashboardService } from '@/services';
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';

export default function SchoolAdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        counts: {
            classes: 0,
            parents: 0,
            students: 0,
            teachers: 0,
        },
        recentStudents: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashboardService.getSchoolStats();
                if (response.data?.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Total Students',
            value: stats.counts.students,
            icon: 'mdi:account-school',
            color: 'text-primary-600 dark:text-primary-400',
            bgColor: 'bg-primary-100 dark:bg-primary-500/20',
            borderColor: 'border-l-primary-500'
        },
        {
            title: 'Total Teachers',
            value: stats.counts.teachers,
            icon: 'mdi:account-tie',
            color: 'text-secondary-600 dark:text-secondary-400',
            bgColor: 'bg-secondary-100 dark:bg-secondary-500/20',
            borderColor: 'border-l-secondary-500'
        },
        {
            title: 'Total Classes',
            value: stats.counts.classes,
            icon: 'mdi:google-classroom',
            color: 'text-success-600 dark:text-success-400',
            bgColor: 'bg-success-100 dark:bg-success-500/20',
            borderColor: 'border-l-success-500'
        },
        {
            title: 'Parents',
            value: stats.counts.parents,
            icon: 'mdi:human-male-female-child',
            color: 'text-warning-600 dark:text-warning-400',
            bgColor: 'bg-warning-100 dark:bg-warning-500/20',
            borderColor: 'border-l-warning-500'
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full p-10"><Spinner size="lg" /></div>;
    }

    return (
        <motion.div
            className="p-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">School Dashboard</h1>
                <p className="text-default-500">Overview of your academic institution</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <Card className={`border-l-4 ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow bg-content1 dark:bg-content1`}>
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-default-500">{stat.title}</p>
                                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                        <Icon icon={stat.icon} className={`text-2xl ${stat.color}`} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Students - Takes up 2 columns */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <Card className="shadow-sm min-h-[300px] bg-content1 dark:bg-content1 border border-default-200 dark:border-default-100">
                        <CardHeader className="font-bold text-lg px-6 pt-6 flex justify-between items-center bg-transparent">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                    <Icon icon="mdi:account-school" className="text-primary-600 dark:text-primary-400 text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">New Admissions</h3>
                                    <p className="text-sm text-default-500 font-normal">
                                        Latest students joining the school
                                    </p>
                                </div>
                            </div>
                            <Chip size="sm" variant="flat" color="primary">Last 5</Chip>
                        </CardHeader>
                        <CardBody className="px-0 pb-4">
                            <Table
                                aria-label="Recent Students"
                                removeWrapper
                                className='px-2'
                                classNames={{
                                    th: "bg-default-50 dark:bg-default-50 text-default-600",
                                    td: "border-b border-default-100 dark:border-default-50 last:border-none"
                                }}
                            >
                                <TableHeader>
                                    <TableColumn className="uppercase text-xs font-semibold">STUDENT</TableColumn>
                                    <TableColumn className="uppercase text-xs font-semibold">ADMISSION NO</TableColumn>
                                    <TableColumn className="uppercase text-xs font-semibold">CLASS</TableColumn>
                                    <TableColumn className="uppercase text-xs font-semibold">JOINED</TableColumn>
                                </TableHeader>
                                <TableBody emptyContent="No recent admissions">
                                    {stats.recentStudents.map((student) => (
                                        <TableRow key={student.id} className="hover:bg-default-50 dark:hover:bg-white/5 transition-colors cursor-default">
                                            <TableCell>
                                                <User
                                                    name={student.name}
                                                    description={student.email}
                                                    avatarProps={{ src: `https://i.pravatar.cc/150?u=${student.id}`, size: "sm", isBordered: true, color: "primary" }}
                                                    classNames={{
                                                        name: "text-foreground font-semibold",
                                                        description: "text-default-400"
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm text-default-600 bg-default-100 px-2 py-1 rounded">{student.admissionNumber}</span>
                                            </TableCell>
                                            <TableCell>
                                                {student.Class ? (
                                                    <Chip size="sm" variant="flat" color="secondary" classNames={{ content: "font-medium" }}>
                                                        {student.Class.name}-{student.Class.section}
                                                    </Chip>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell className="text-default-500 text-sm">
                                                {new Date(student.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Quick Actions / Notices */}
                <motion.div variants={itemVariants}>
                    <Card className="shadow-sm min-h-[300px] bg-content1 dark:bg-content1 border border-default-200 dark:border-default-100">
                        <CardHeader className="px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                                    <Icon icon="mdi:lightning-bolt" className="text-secondary-600 dark:text-secondary-400 text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
                                    <p className="text-sm text-default-500 font-normal">
                                        Common tasks
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="px-6 pb-6 gap-3">
                            {[
                                { to: "/students", icon: "mdi:account-plus", title: "Add Student", subtitle: "Register new admission", colorClass: "primary" },
                                { to: "/attendance/mark", icon: "mdi:calendar-check", title: "Mark Attendance", subtitle: "Record daily entries", colorClass: "success" },
                                { to: "/academic/timetable", icon: "mdi:calendar-clock", title: "Manage Timetable", subtitle: "Class schedules", colorClass: "secondary" },
                                { to: "/attendance/report", icon: "mdi:poll", title: "Attendance Report", subtitle: "View stats & trends", colorClass: "warning" },
                                { to: "/academic/classes", icon: "mdi:google-classroom", title: "Manage Classes", subtitle: "View & edit structures", colorClass: "default" },
                                { to: "/finance/receipts", icon: "mdi:receipt-text", title: "Fee Receipts", subtitle: "Generate & Print", colorClass: "primary" },
                            ].map((action, idx) => (
                                <Button
                                    key={idx}
                                    className="w-full justify-start h-auto py-3 px-4 bg-default-50 dark:bg-default-100/10 hover:bg-default-100 dark:hover:bg-default-100/20 text-foreground border border-default-200 dark:border-default-100/50"
                                    as={Link}
                                    to={action.to}
                                    variant="flat"
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <div className={`p-2 rounded-lg bg-white dark:bg-white/10 shadow-sm text-${action.colorClass}-500`}>
                                            <Icon icon={action.icon} className="text-xl" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-semibold text-sm text-foreground">{action.title}</p>
                                            <p className="text-xs text-default-500 opacity-80">{action.subtitle}</p>
                                        </div>
                                        <Icon icon="mdi:chevron-right" className="text-default-300" />
                                    </div>
                                </Button>
                            ))}
                        </CardBody>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
