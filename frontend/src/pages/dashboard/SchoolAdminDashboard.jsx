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
                console.error("Error fetching dashboard stats:", error);
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
            color: 'text-indigo-600 dark:text-indigo-400',
            bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
            borderColor: 'border-l-indigo-500'
        },
        {
            title: 'Total Teachers',
            value: stats.counts.teachers,
            icon: 'mdi:account-tie',
            color: 'text-fuchsia-600 dark:text-fuchsia-400',
            bgColor: 'bg-fuchsia-100 dark:bg-fuchsia-900/30',
            borderColor: 'border-l-fuchsia-500'
        },
        {
            title: 'Total Classes',
            value: stats.counts.classes,
            icon: 'mdi:google-classroom',
            color: 'text-teal-600 dark:text-teal-400',
            bgColor: 'bg-teal-100 dark:bg-teal-900/30',
            borderColor: 'border-l-teal-500'
        },
        {
            title: 'Parents',
            value: stats.counts.parents,
            icon: 'mdi:human-male-female-child',
            color: 'text-rose-600 dark:text-rose-400',
            bgColor: 'bg-rose-100 dark:bg-rose-900/30',
            borderColor: 'border-l-rose-500'
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">School Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Overview of your academic institution</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <Card className={`border-l-4 ${stat.borderColor} shadow-sm`}>
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
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
                    <Card className="shadow-sm min-h-[300px]">
                        <CardHeader className="font-bold text-lg px-6 pt-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Icon icon="mdi:account-school" className="text-primary text-2xl" />
                                <div>
                                    <h3 className="text-lg font-semibold">New Admissions</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                                        Latest students joining the school
                                    </p>
                                </div>
                            </div>
                            <Chip size="sm" variant="flat" color="primary">Last 5</Chip>
                        </CardHeader>
                        <CardBody className="px-0 pb-4">
                            <Table aria-label="Recent Students" removeWrapper className='px-2'>
                                <TableHeader>
                                    <TableColumn>STUDENT</TableColumn>
                                    <TableColumn>ADMISSION NO</TableColumn>
                                    <TableColumn>CLASS</TableColumn>
                                    <TableColumn>JOINED</TableColumn>
                                </TableHeader>
                                <TableBody emptyContent="No recent admissions">
                                    {stats.recentStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <User
                                                    name={student.name}
                                                    description={student.email}
                                                    avatarProps={{ src: `https://i.pravatar.cc/150?u=${student.id}`, size: "sm" }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm">{student.admissionNumber}</span>
                                            </TableCell>
                                            <TableCell>
                                                {student.Class ? (
                                                    <Chip size="sm" variant="flat" color="secondary">
                                                        {student.Class.name}-{student.Class.section}
                                                    </Chip>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-sm">
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
                    <Card className="shadow-sm min-h-[300px]">
                        <CardHeader className="px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <Icon icon="mdi:lightning-bolt" className="text-warning text-2xl" />
                                <div>
                                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                                        Common tasks
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="px-6 pb-6 gap-4">
                            <Button
                                className="w-full justify-start h-auto py-3 px-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                as={Link}
                                to="/students"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-blue-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:account-plus" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">Add Student</p>
                                        <p className="text-xs opacity-80">Register new admission</p>
                                    </div>
                                </div>
                            </Button>

                            <Button
                                className="w-full justify-start h-auto py-3 px-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                                as={Link}
                                to="/attendance/mark"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-green-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:calendar-check" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">Mark Attendance</p>
                                        <p className="text-xs opacity-80">Record daily entries</p>
                                    </div>
                                </div>
                            </Button>

                            <Button
                                className="w-full justify-start h-auto py-3 px-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                as={Link}
                                to="/academic/timetable"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-purple-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:calendar-clock" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">Manage Timetable</p>
                                        <p className="text-xs opacity-80">Class schedules</p>
                                    </div>
                                </div>
                            </Button>

                            <Button
                                className="w-full justify-start h-auto py-3 px-4 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800"
                                as={Link}
                                to="/attendance/report"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-cyan-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:poll" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">Attendance Report</p>
                                        <p className="text-xs opacity-80">View stats & trends</p>
                                    </div>
                                </div>
                            </Button>

                            <Button
                                className="w-full justify-start h-auto py-3 px-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                                as={Link}
                                to="/academic/classes"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-orange-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:google-classroom" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">Manage Classes</p>
                                        <p className="text-xs opacity-80">View & edit structures</p>
                                    </div>
                                </div>
                            </Button>

                            <Button
                                className="w-full justify-start h-auto py-3 px-4 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                                as={Link}
                                to="/finance/receipts"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-teal-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:receipt-text" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">Fee Receipts</p>
                                        <p className="text-xs opacity-80">Generate & Print</p>
                                    </div>
                                </div>
                            </Button>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
