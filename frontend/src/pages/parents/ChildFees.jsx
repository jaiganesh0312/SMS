import React, { useState, useEffect } from 'react';
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
    Select,
    SelectItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    addToast,
    Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { financeService, parentService } from '@/services';
import { format } from 'date-fns';
import { motion } from "framer-motion";

export default function ChildFees() {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [feeDetails, setFeeDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedFee, setSelectedFee] = useState(null);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchFeeDetails(selectedChild);
        }
    }, [selectedChild]);

    const fetchChildren = async () => {
        try {
            setIsLoading(true);
            const response = await parentService.getMyChildren();
            if (response.data?.success) {
                const kids = response.data.data?.students || [];
                setChildren(kids);
                if (kids.length > 0) {
                    setSelectedChild(kids[0].id);
                }
            }
        } catch (error) {
            addToast({
                title: 'Error',
                description: 'Failed to load children',
                color: 'danger',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFeeDetails = async (studentId) => {
        try {
            const response = await financeService.getStudentFeeDetails(studentId);
            if (response.data?.success) {
                setFeeDetails(response.data.data);
            }
        } catch (error) {
        }
    };

    const handlePayment = (fee) => {
        setSelectedFee(fee);
        onOpen();
    };

    const processPayment = async () => {
        if (!selectedFee || !selectedChild) return;

        try {
            setIsPaymentProcessing(true);
            const response = await financeService.processPayment({
                studentId: selectedChild,
                feeStructureId: selectedFee.feeStructureId,
                amountPaid: selectedFee.pendingAmount
            });

            if (response.data?.success) {
                addToast({
                    title: 'Success',
                    description: 'Payment processed successfully!',
                    color: 'success',
                });
                onClose();
                fetchFeeDetails(selectedChild);
            } else {
                addToast({
                    title: 'Error',
                    description: response.data?.message || 'Payment failed',
                    color: 'danger',
                });
            }
        } catch (error) {
            addToast({
                title: 'Error',
                description: 'Payment processing failed',
                color: 'danger',
            });
        } finally {
            setIsPaymentProcessing(false);
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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Children's Fees</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View and pay fees for your children
                    </p>
                </div>
                <Button
                    color="primary"
                    variant="flat"
                    startContent={<Icon icon="mdi:refresh" />}
                    onPress={() => {
                        fetchChildren();
                        if (selectedChild) fetchFeeDetails(selectedChild);
                    }}
                    isLoading={isLoading}
                >
                    Refresh
                </Button>
            </div>

            {/* Child Selector */}
            {children.length > 1 && (
                <Card>
                    <CardBody>
                        <Select
                            label="Select Child"
                            selectedKeys={selectedChild ? [selectedChild] : []}
                            onChange={(e) => setSelectedChild(e.target.value)}
                            startContent={<Icon icon="mdi:account-child" />}
                        >
                            {children.map((child) => (
                                <SelectItem key={child.id} value={child.id}>
                                    {child.name} - {child.admissionNumber}
                                </SelectItem>
                            ))}
                        </Select>
                    </CardBody>
                </Card>
            )}

            {/* Summary Cards with Borders */}
            {feeDetails && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div whileHover={{ scale: 1.02 }}>
                        <Card className="border-l-4 border-l-blue-500">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Fees</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(feeDetails.summary.totalFees)}
                                        </p>
                                    </div>
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:currency-usd" className="text-2xl text-blue-600 dark:text-blue-400" />
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
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(feeDetails.summary.totalPaid)}
                                        </p>
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
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(feeDetails.summary.totalPending)}
                                        </p>
                                    </div>
                                    <div className="bg-warning-100 dark:bg-warning-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:alert-circle" className="text-2xl text-warning-600 dark:text-warning-400" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Fee Structures */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:file-document-multiple" size={24} className="text-primary" />
                        <div>
                            <h2 className="text-xl font-bold">Fee Structure</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {feeDetails?.feeBreakdown?.length || 0} fee{feeDetails?.feeBreakdown?.length !== 1 ? 's' : ''} applicable
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    <Table aria-label="Fee structure table" removeWrapper className='px-2'>
                        <TableHeader>
                            <TableColumn>FEE NAME</TableColumn>
                            <TableColumn>AMOUNT</TableColumn>
                            <TableColumn>FREQUENCY</TableColumn>
                            <TableColumn>PAID</TableColumn>
                            <TableColumn>PENDING</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn>ACTION</TableColumn>
                        </TableHeader>
                        <TableBody
                            emptyContent="No fees found"
                            isLoading={isLoading}
                            loadingContent={<Spinner label="Loading fees..." />}
                        >
                            {(feeDetails?.feeBreakdown || []).map((fee) => (
                                <TableRow key={fee.feeStructureId}>
                                    <TableCell className="font-medium">{fee.feeName}</TableCell>
                                    <TableCell>{formatCurrency(fee.amount)}</TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat" color="primary">{fee.frequency}</Chip>
                                    </TableCell>
                                    <TableCell className="text-green-600 font-medium">{formatCurrency(fee.totalPaid)}</TableCell>
                                    <TableCell className="text-orange-600 font-medium">{formatCurrency(fee.pendingAmount)}</TableCell>
                                    <TableCell>
                                        <Chip size="sm" color={getStatusColor(fee.status)} variant="flat">
                                            {fee.status}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        {fee.pendingAmount > 0 && (
                                            <Button
                                                size="sm"
                                                color="primary"
                                                startContent={<Icon icon="mdi:cash" />}
                                                onPress={() => handlePayment(fee)}
                                            >
                                                Pay Now
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Payment History */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:history" size={24} className="text-primary" />
                        <div>
                            <h2 className="text-xl font-bold">Payment History</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {feeDetails?.paymentHistory?.length || 0} payment{feeDetails?.paymentHistory?.length !== 1 ? 's' : ''} made
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    <Table aria-label="Payment history table" removeWrapper className='px-2'>
                        <TableHeader>
                            <TableColumn>DATE</TableColumn>
                            <TableColumn>FEE NAME</TableColumn>
                            <TableColumn>AMOUNT PAID</TableColumn>
                            <TableColumn>TRANSACTION ID</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No payment history" isLoading={isLoading}>
                            {(feeDetails?.paymentHistory || []).map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Icon icon="mdi:calendar" size={14} />
                                            {format(new Date(payment.paymentDate), 'PPP')}
                                        </div>
                                    </TableCell>
                                    <TableCell>{payment.feeName}</TableCell>
                                    <TableCell className="text-green-600 font-medium">
                                        {formatCurrency(payment.amountPaid)}
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {payment.transactionId}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" color="success" variant="flat">{payment.status}</Chip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Payment Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:cash" className="text-primary" />
                                    <span>Confirm Payment</span>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                {selectedFee && (
                                    <div className="space-y-4">
                                        <p className="text-gray-600 dark:text-gray-400">
                                            You are about to pay the following fee:
                                        </p>
                                        <Card className="bg-gray-50 dark:bg-gray-800">
                                            <CardBody>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Fee Name:</span>
                                                        <span className="font-medium">{selectedFee.feeName}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                                        <span className="font-bold text-lg text-green-600">
                                                            {formatCurrency(selectedFee.pendingAmount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            This is a dummy payment. In production, this will integrate with Razorpay.
                                        </p>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={processPayment}
                                    isLoading={isPaymentProcessing}
                                    startContent={!isPaymentProcessing && <Icon icon="mdi:check-bold" />}
                                >
                                    Confirm Payment
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
