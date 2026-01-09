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
                    <h1 className="text-3xl font-bold text-foreground">Fee Statistics</h1>
                    <p className="text-default-500 mt-1">
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
                    <Card className="border-l-4 border-l-primary bg-content1 shadow-sm">
                        <CardBody className="p-4">
                            {isLoading ? (
                                <Skeleton className="h-20 rounded" />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-default-500">Total Fees</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {formatCurrency(statistics?.overview?.totalFees || 0)}
                                        </p>
                                    </div>
                                    <div className="bg-primary/10 p-3 rounded-lg">
                                        <Icon icon="mdi:currency-usd" className="text-2xl text-primary" />
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                    <Card className="border-l-4 border-l-success bg-content1 shadow-sm">
                        <CardBody className="p-4">
                            {isLoading ? (
                                <Skeleton className="h-20 rounded" />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-default-500">Collected</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {formatCurrency(statistics?.overview?.totalCollected || 0)}
                                        </p>
                                    </div>
                                    <div className="bg-success/10 p-3 rounded-lg">
                                        <Icon icon="mdi:check-circle" className="text-2xl text-success" />
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                    <Card className="border-l-4 border-l-warning bg-content1 shadow-sm">
                        <CardBody className="p-4">
                            {isLoading ? (
                                <Skeleton className="h-20 rounded" />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-default-500">Pending</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {formatCurrency(statistics?.overview?.totalPending || 0)}
                                        </p>
                                    </div>
                                    <div className="bg-warning/10 p-3 rounded-lg">
                                        <Icon icon="mdi:clock-alert" className="text-2xl text-warning" />
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                    <Card className="border-l-4 border-l-secondary bg-content1 shadow-sm">
                        <CardBody className="p-4">
                            {isLoading ? (
                                <Skeleton className="h-20 rounded" />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-default-500">Collection Rate</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {statistics?.overview?.overallCollectionRate || 0}%
                                        </p>
                                    </div>
                                    <div className="bg-secondary/10 p-3 rounded-lg">
                                        <Icon icon="mdi:chart-line" className="text-2xl text-secondary" />
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>
            </div>

            {/* Class-wise Table */}
            <Card className="bg-content1 border border-default-200 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:google-classroom" size={24} className="text-primary" />
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Class-wise Summary</h2>
                            <p className="text-sm text-default-500">
                                {statistics?.classSummary?.length || 0} class{statistics?.classSummary?.length !== 1 ? 'es' : ''} found
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    <Table aria-label="Class-wise fee summary table" shadow="none" classNames={{
                        wrapper: "bg-content1 shadow-none",
                        th: "bg-default-100 text-default-500 font-medium",
                        td: "text-foreground group-hover:bg-default-50"
                    }}>
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
                                        className="mx-auto text-default-400 text-6xl mb-4 opacity-50"
                                    />
                                    <p className="text-lg font-medium text-foreground">
                                        No classes found
                                    </p>
                                    <p className="text-sm text-default-500 mt-1">
                                        Create classes to see fee statistics
                                    </p>
                                </div>
                            }
                            isLoading={isLoading}
                            loadingContent={<Spinner label="Loading statistics..." />}
                        >
                            {(statistics?.classSummary || []).map((classItem) => (
                                <TableRow key={classItem.classId} className="border-b border-default-100 last:border-none">
                                    <TableCell className="font-medium text-foreground">{classItem.className}</TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat" color="primary">{classItem.studentCount}</Chip>
                                    </TableCell>
                                    <TableCell>{formatCurrency(classItem.totalFees)}</TableCell>
                                    <TableCell className="text-success font-medium">
                                        {formatCurrency(classItem.collectedAmount)}
                                    </TableCell>
                                    <TableCell className="text-warning font-medium">
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
                                            variant="light"
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
