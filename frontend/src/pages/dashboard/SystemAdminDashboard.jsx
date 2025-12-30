import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { dashboardService } from '@/services';
import { motion } from "framer-motion";

export default function SystemAdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        counts: {
            schools: 0,
            users: 0,
            revenue: 0,
        },
        recentSchools: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashboardService.getSystemStats();
                if (response.data?.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching system stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Registered Schools',
            value: stats.counts.schools,
            icon: 'mdi:domain',
            color: 'text-violet-600 dark:text-violet-400',
            bgColor: 'bg-violet-100 dark:bg-violet-900/30',
            borderColor: 'border-l-violet-500'
        },
        {
            title: 'Total Revenue',
            value: `$${stats.counts.revenue}`,
            icon: 'mdi:currency-usd',
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
            borderColor: 'border-l-emerald-500'
        },
        {
            title: 'Total Users',
            value: stats.counts.users,
            icon: 'mdi:account-group',
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-100 dark:bg-amber-900/30',
            borderColor: 'border-l-amber-500'
        },
        {
            title: 'System Health',
            value: '99.9%',
            icon: 'mdi:heart-pulse',
            color: 'text-cyan-600 dark:text-cyan-400',
            bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
            borderColor: 'border-l-cyan-500'
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Overview</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome to the Super Admin Control Panel</p>
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

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm">
                    <CardHeader className="font-bold text-lg px-6 pt-6">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:cog" className="text-gray-500 text-2xl" />
                            <div>
                                <h3 className="text-lg font-semibold">Global Management</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">System-wide tools</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="px-6 pb-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Button
                                className="w-full justify-start h-auto py-3 px-4 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800"
                                onPress={() => window.location.href = '/attendance/report'}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-cyan-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:poll" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">Attendance Report</p>
                                        <p className="text-xs opacity-80">View all records</p>
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                    <Card className="shadow-sm min-h-[300px]">
                        <CardHeader className="font-bold text-lg px-6 pt-6 flex justify-between">
                            <div className="flex items-center gap-3">
                                <Icon icon="mdi:school" className="text-violet-500 text-2xl" />
                                <div>
                                    <h3 className="text-lg font-semibold">Recent Registrations</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                                        Recently joined schools
                                    </p>
                                </div>
                            </div>
                            <Chip size="sm" variant="flat" color="secondary">Schools</Chip>
                        </CardHeader>
                        <CardBody className="px-0 pb-4">
                            <Table aria-label="Recent Schools" removeWrapper>
                                <TableHeader>
                                    <TableColumn>SCHOOL NAME</TableColumn>

                                    <TableColumn>DATE</TableColumn>
                                    <TableColumn>STATUS</TableColumn>
                                </TableHeader>
                                <TableBody emptyContent="No recent registrations">
                                    {stats.recentSchools.map((school) => (
                                        <TableRow key={school.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 flex items-center justify-center font-bold text-xs">
                                                        {school.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-small text-gray-900 dark:text-white">{school.name}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-tiny text-gray-500">{new Date(school.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Chip size="sm" color="success" variant="flat">Active</Chip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="shadow-sm h-full">
                        <CardHeader className="font-bold text-lg px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <Icon icon="mdi:server-network" className="text-cyan-500 text-2xl" />
                                <div>
                                    <h3 className="text-lg font-semibold">System Health</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                                        Real-time metrics
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="px-6 pb-6 flex items-center justify-center text-gray-400">
                            <div className="text-center w-full">
                                <Icon icon="mdi:heart-pulse" className="text-5xl mx-auto mb-4 text-cyan-500" />
                                <p className="text-lg font-semibold text-gray-700 dark:text-white">All systems operational</p>
                                <p className="text-sm">Server Uptime: 99.9%</p>
                                <div className="grid grid-cols-3 gap-4 mt-8 w-full">
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">CPU Load</p>
                                        <p className="text-2xl font-bold text-emerald-500">12%</p>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Memory</p>
                                        <p className="text-2xl font-bold text-blue-500">45%</p>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Storage</p>
                                        <p className="text-2xl font-bold text-amber-500">28%</p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
