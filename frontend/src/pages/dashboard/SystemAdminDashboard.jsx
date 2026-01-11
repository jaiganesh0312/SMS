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
            color: 'text-primary-600 dark:text-primary-400',
            bgColor: 'bg-primary-100 dark:bg-primary-500/20',
            borderColor: 'border-l-blue'
        },
        {
            title: 'Total Revenue',
            value: `$${stats.counts.revenue}`,
            icon: 'mdi:currency-usd',
            color: 'text-success-600 dark:text-success-400',
            bgColor: 'bg-success-100 dark:bg-success-500/20',
            borderColor: 'border-l-success'
        },
        {
            title: 'Total Users',
            value: stats.counts.users,
            icon: 'mdi:account-group',
            color: 'text-secondary-600 dark:text-secondary-400',
            bgColor: 'bg-secondary-100 dark:bg-secondary-500/20',
            borderColor: 'border-l-secondary'
        },
        {
            title: 'System Health',
            value: '99.9%',
            icon: 'mdi:heart-pulse',
            color: 'text-warning-600 dark:text-warning-400',
            bgColor: 'bg-warning-100 dark:bg-warning-500/20',
            borderColor: 'border-l-warning'
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
                <h1 className="text-3xl font-bold text-foreground">System Overview</h1>
                <p className="text-default-500">Welcome to the Super Admin Control Panel</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <Card className={`border-l-4 ${stat.borderColor} shadow-sm bg-content1 dark:bg-content1 dark:border-default-100`}>
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-default-500">{stat.title}</p>
                                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
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
                <Card className="shadow-sm bg-content1 border border-default-200 dark:border-default-100">
                    <CardHeader className="font-bold text-lg px-6 pt-6">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:cog" className="text-default-500 text-2xl" />
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Global Management</h3>
                                <p className="text-sm text-default-500 font-normal">System-wide tools</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="px-6 pb-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Button
                                className="w-full justify-start h-auto py-3 px-4 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                                onPress={() => window.location.href = '/attendance/report'}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-primary-800 rounded-lg shadow-sm">
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
                    <Card className="shadow-sm min-h-[300px] bg-content1 border border-default-200 dark:border-default-100">
                        <CardHeader className="font-bold text-lg px-6 pt-6 flex justify-between">
                            <div className="flex items-center gap-3">
                                <Icon icon="mdi:school" className="text-secondary-500 text-2xl" />
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Recent Registrations</h3>
                                    <p className="text-sm text-default-500 font-normal">
                                        Recently joined schools
                                    </p>
                                </div>
                            </div>
                            <Chip size="sm" variant="flat" color="secondary">Schools</Chip>
                        </CardHeader>
                        <CardBody className="px-2 pb-4">
                            <Table aria-label="Recent Schools" removeWrapper classNames={{ th: "bg-default-100 text-default-500", td: "border-b border-default-100" }}>
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
                                                    <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-900/50 text-secondary-600 dark:text-secondary-300 flex items-center justify-center font-bold text-xs">
                                                        {school.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-small text-foreground">{school.name}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-tiny text-default-500">{new Date(school.createdAt).toLocaleDateString()}</TableCell>
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
                    <Card className="shadow-sm h-full bg-content1 border border-default-200 dark:border-default-100">
                        <CardHeader className="font-bold text-lg px-6 pt-6">
                            <div className="flex items-center gap-3">
                                <Icon icon="mdi:server-network" className="text-cyan-500 text-2xl" />
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">System Health</h3>
                                    <p className="text-sm text-default-500 font-normal">
                                        Real-time metrics
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="px-6 pb-6 flex items-center justify-center text-default-400">
                            <div className="text-center w-full">
                                <Icon icon="mdi:heart-pulse" className="text-5xl mx-auto mb-4 text-cyan-500" />
                                <p className="text-lg font-semibold text-foreground">All systems operational</p>
                                <p className="text-sm">Server Uptime: 99.9%</p>
                                <div className="grid grid-cols-3 gap-4 mt-8 w-full">
                                    <div className="text-center p-4 bg-default-50 dark:bg-default-100/10 rounded-lg">
                                        <p className="text-xs text-default-500 uppercase tracking-wider mb-1">CPU Load</p>
                                        <p className="text-2xl font-bold text-success-500">12%</p>
                                    </div>
                                    <div className="text-center p-4 bg-default-50 dark:bg-default-100/10 rounded-lg">
                                        <p className="text-xs text-default-500 uppercase tracking-wider mb-1">Memory</p>
                                        <p className="text-2xl font-bold text-primary-500">45%</p>
                                    </div>
                                    <div className="text-center p-4 bg-default-50 dark:bg-default-100/10 rounded-lg">
                                        <p className="text-xs text-default-500 uppercase tracking-wider mb-1">Storage</p>
                                        <p className="text-2xl font-bold text-warning-500">28%</p>
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
