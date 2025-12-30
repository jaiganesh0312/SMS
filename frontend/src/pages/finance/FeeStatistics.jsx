import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Chip,
    Skeleton,
    Spinner,
    addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { financeService } from '@/services';
import { motion } from "framer-motion";

export default function FeeStatistics() {
    const [statistics, setStatistics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setIsLoading(true);
            const response = await financeService.getFeeStatistics();
            if (response.data?.success) {
                setStatistics(response.data.data);
            } else {
                addToast({
                    title: 'Error',
                    description: 'Failed to load statistics',
                    color: 'danger',
                });
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
            addToast({
                title: 'Error',
                description: 'Failed to load statistics',
                color: 'danger',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getCollectionColor = (rate) => {
        if (rate >= 75) return 'success';
        if (rate >= 50) return 'warning';
        return 'danger';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fee Statistics</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Overview of fee collection across all classes
                    </p>
                </div>
                <Button
                    color="primary"
                    variant="flat"
                    startContent={<Icon icon="mdi:refresh" />}
                    onPress={fetchStatistics}
                    isLoading={isLoading}
                >
                    Refresh
                </Button>
            </div>

            {/* Statistics Cards with Borders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardBody className="p-4">
                            {isLoading ? (
                                <Skeleton className="h-20 rounded" />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Fees</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(statistics?.overview?.totalFees || 0)}
                                        </p>
                                    </div>
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:currency-usd" className="text-2xl text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                    <Card className="border-l-4 border-l-success">
                        <CardBody className="p-4">
                            {isLoading ? (
                                <Skeleton className="h-20 rounded" />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Collected</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(statistics?.overview?.totalCollected || 0)}
                                        </p>
                                    </div>
                                    <div className="bg-success-100 dark:bg-success-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:check-circle" className="text-2xl text-success-600 dark:text-success-400" />
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                    <Card className="border-l-4 border-l-warning">
                        <CardBody className="p-4">
                            {isLoading ? (
                                <Skeleton className="h-20 rounded" />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(statistics?.overview?.totalPending || 0)}
                                        </p>
                                    </div>
                                    <div className="bg-warning-100 dark:bg-warning-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:clock-alert" className="text-2xl text-warning-600 dark:text-warning-400" />
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                    <Card className="border-l-4 border-l-primary">
                        <CardBody className="p-4">
                            {isLoading ? (
                                <Skeleton className="h-20 rounded" />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Collection Rate</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {statistics?.overview?.overallCollectionRate || 0}%
                                        </p>
                                    </div>
                                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:chart-line" className="text-2xl text-primary-600 dark:text-primary-400" />
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>
            </div>

            {/* Class-wise Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:google-classroom" size={24} className="text-primary" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Class-wise Summary</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {statistics?.classSummary?.length || 0} class{statistics?.classSummary?.length !== 1 ? 'es' : ''} found
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    <Table aria-label="Class-wise fee summary table" removeWrapper className='px-2'>
                        <TableHeader>
                            <TableColumn>CLASS</TableColumn>
                            <TableColumn>STUDENTS</TableColumn>
                            <TableColumn>TOTAL FEES</TableColumn>
                            <TableColumn>COLLECTED</TableColumn>
                            <TableColumn>PENDING</TableColumn>
                            <TableColumn>COLLECTION %</TableColumn>
                            <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody
                            emptyContent={
                                <div className="text-center py-12">
                                    <Icon
                                        icon="mdi:google-classroom"
                                        className="mx-auto text-gray-400 dark:text-gray-600 text-6xl mb-4"
                                    />
                                    <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                                        No classes found
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                        Create classes to see fee statistics
                                    </p>
                                </div>
                            }
                            isLoading={isLoading}
                            loadingContent={<Spinner label="Loading statistics..." />}
                        >
                            {(statistics?.classSummary || []).map((classItem) => (
                                <TableRow key={classItem.classId}>
                                    <TableCell className="font-medium">{classItem.className}</TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat" color="primary">{classItem.studentCount}</Chip>
                                    </TableCell>
                                    <TableCell>{formatCurrency(classItem.totalFees)}</TableCell>
                                    <TableCell className="text-green-600 font-medium">
                                        {formatCurrency(classItem.collectedAmount)}
                                    </TableCell>
                                    <TableCell className="text-orange-600 font-medium">
                                        {formatCurrency(classItem.pendingAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            color={getCollectionColor(classItem.collectionRate)}
                                            variant="flat"
                                        >
                                            {classItem.collectionRate}%
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            color="primary"
                                            startContent={<Icon icon="mdi:eye" />}
                                            onPress={() => navigate(`/finance/class/${classItem.classId}`)}
                                        >
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
}
