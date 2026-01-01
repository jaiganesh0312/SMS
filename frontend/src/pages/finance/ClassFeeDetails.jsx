import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Chip,
    Input,
    Select,
    SelectItem,
    Spinner,
    addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { financeService } from '@/services';
import { format } from 'date-fns';
import { motion } from "framer-motion";

export default function ClassFeeDetails() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchClassFeeStatus();
    }, [classId]);

    const fetchClassFeeStatus = async () => {
        try {
            setIsLoading(true);
            const response = await financeService.getClassFeeStatus(classId);
            if (response.data?.success) {
                setData(response.data.data);
            } else {
                addToast({
                    title: 'Error',
                    description: 'Failed to load fee details',
                    color: 'danger',
                });
            }
        } catch (error) {
            addToast({
                title: 'Error',
                description: 'Failed to load fee details',
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'success';
            case 'PARTIAL': return 'warning';
            case 'PENDING': return 'danger';
            default: return 'default';
        }
    };

    const filteredStudents = (data?.students || []).filter(student => {
        const matchesStatus = filterStatus === 'ALL' || student.paymentStatus === filterStatus;
        const matchesSearch = !searchQuery ||
            student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Calculate summary stats
    const stats = {
        total: data?.students?.length || 0,
        paid: data?.students?.filter(s => s.paymentStatus === 'PAID').length || 0,
        partial: data?.students?.filter(s => s.paymentStatus === 'PARTIAL').length || 0,
        pending: data?.students?.filter(s => s.paymentStatus === 'PENDING').length || 0
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Button
                        variant="light"
                        startContent={<Icon icon="mdi:arrow-left" />}
                        onPress={() => navigate('/finance/statistics')}
                        className="mb-2"
                    >
                        Back to Statistics
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {data?.classDetails?.name || 'Class'} - Fee Details
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Fee per student: {formatCurrency(data?.classDetails?.totalFeePerStudent || 0)}
                    </p>
                </div>
                <Button
                    color="primary"
                    variant="flat"
                    startContent={<Icon icon="mdi:refresh" />}
                    onPress={fetchClassFeeStatus}
                    isLoading={isLoading}
                >
                    Refresh
                </Button>
            </div>

            {/* Summary Cards with Borders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.02 }}>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                                    <Icon icon="mdi:account-group" className="text-2xl text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                    <Card className="border-l-4 border-l-success">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.paid}</p>
                                </div>
                                <div className="bg-success-100 dark:bg-success-900/30 p-3 rounded-lg">
                                    <Icon icon="mdi:check-circle" className="text-2xl text-success-600 dark:text-success-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                    <Card className="border-l-4 border-l-warning">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Partial</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.partial}</p>
                                </div>
                                <div className="bg-warning-100 dark:bg-warning-900/30 p-3 rounded-lg">
                                    <Icon icon="mdi:alert-circle" className="text-2xl text-warning-600 dark:text-warning-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                    <Card className="border-l-4 border-l-danger">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                                </div>
                                <div className="bg-danger-100 dark:bg-danger-900/30 p-3 rounded-lg">
                                    <Icon icon="mdi:close-circle" className="text-2xl text-danger-600 dark:text-danger-400" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>

            {/* Filters */}
            <Card>
                <CardBody>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                            placeholder="Search by name or admission number..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            startContent={<Icon icon="mdi:magnify" size={18} />}
                            className="sm:max-w-xs"
                            isClearable
                            onClear={() => setSearchQuery('')}
                        />
                        <Select
                            placeholder="Filter by status"
                            selectedKeys={[filterStatus]}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="sm:max-w-xs"
                            startContent={<Icon icon="mdi:filter" size={16} />}
                        >
                            <SelectItem key="ALL" value="ALL">All Status</SelectItem>
                            <SelectItem key="PAID" value="PAID">Paid</SelectItem>
                            <SelectItem key="PARTIAL" value="PARTIAL">Partial</SelectItem>
                            <SelectItem key="PENDING" value="PENDING">Pending</SelectItem>
                        </Select>
                    </div>
                </CardBody>
            </Card>

            {/* Student Table */}
            <Card>
                <CardBody className="p-0">
                    <Table aria-label="Student payment status table" removeWrapper className='px-2'>
                        <TableHeader>
                            <TableColumn>ADMISSION NO</TableColumn>
                            <TableColumn>STUDENT NAME</TableColumn>
                            <TableColumn>TOTAL FEES</TableColumn>
                            <TableColumn>AMOUNT PAID</TableColumn>
                            <TableColumn>PENDING</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn>LAST PAYMENT</TableColumn>
                        </TableHeader>
                        <TableBody
                            emptyContent={
                                <div className="text-center py-12">
                                    <Icon
                                        icon="mdi:account-off"
                                        className="mx-auto text-gray-400 dark:text-gray-600 text-6xl mb-4"
                                    />
                                    <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                                        No students found
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                        {searchQuery || filterStatus !== 'ALL'
                                            ? "Try adjusting your filters"
                                            : "This class has no students yet"}
                                    </p>
                                </div>
                            }
                            isLoading={isLoading}
                            loadingContent={<Spinner label="Loading students..." />}
                        >
                            {filteredStudents.map((student) => (
                                <TableRow key={student.studentId}>
                                    <TableCell>
                                        <span className="font-mono text-sm">{student.admissionNumber}</span>
                                    </TableCell>
                                    <TableCell className="font-medium">{student.studentName}</TableCell>
                                    <TableCell>{formatCurrency(student.totalFees)}</TableCell>
                                    <TableCell className="text-green-600 font-medium">
                                        {formatCurrency(student.amountPaid)}
                                    </TableCell>
                                    <TableCell className="text-orange-600 font-medium">
                                        {formatCurrency(student.pendingAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            color={getStatusColor(student.paymentStatus)}
                                            variant="flat"
                                        >
                                            {student.paymentStatus}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            {student.lastPaymentDate ? (
                                                <>
                                                    <Icon icon="mdi:calendar" size={14} />
                                                    {format(new Date(student.lastPaymentDate), 'PPP')}
                                                </>
                                            ) : '-'}
                                        </div>
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
