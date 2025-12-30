import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Avatar,
    Chip,
    Skeleton,
    addToast,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { parentService, studentService } from '@/services';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

export default function ParentDashboard() {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState({});
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [idCardData, setIdCardData] = useState(null);
    const { isOpen: isIdOpen, onOpen: onIdOpen, onClose: onIdClose } = useDisclosure();

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const response = await parentService.getMyChildren();
            if (response.data?.success) {
                const students = response.data.data.students;
                setChildren(students);
                if (students.length > 0 && students[0].Class?.School) {
                    setSchoolInfo(students[0].Class.School);
                }
            }
        } catch (error) {
            console.error("Error fetching children:", error);
            addToast({
                title: 'Error',
                description: 'Failed to load children',
                color: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadIDCard = async (student) => {
        setDownloading((prev) => ({ ...prev, [student.id]: true }));
        try {
            const result = await studentService.getIDCard(student.id, student.name);
            if (result.success) {
                addToast({ title: "Success", description: "ID Card downloaded", color: "success" });
            } else {
                addToast({ title: "Error", description: "Failed to generate ID Card", color: "danger" });
            }
        } catch (error) {
            console.error(error);
            addToast({ title: "Error", description: "Error generating ID Card", color: "danger" });
        } finally {
            setDownloading((prev) => ({ ...prev, [student.id]: false }));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Calculate overall statistics
    const totalPendingFees = children.reduce((sum, child) => sum + (child.feeSummary?.totalPending || 0), 0);
    const avgAttendance = children.length > 0
        ? (children.reduce((sum, child) => sum + parseFloat(child.attendanceRate || 0), 0) / children.length).toFixed(1)
        : 0;

    // Simple ID Card Component for Display
    const IDCard = ({ data }) => {
        if (!data) return null;
        return (
            <div className="border-2 border-gray-800 rounded-lg p-6 w-[350px] mx-auto bg-white text-black font-sans">
                <div className="text-center border-b-2 border-gray-200 pb-4 mb-4">
                    <h2 className="text-xl font-bold uppercase text-blue-900">{data.schoolName || "School Name"}</h2>
                    <p className="text-xs text-gray-500">{data.schoolAddress || "Address"}</p>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border">
                        <Icon icon="mdi:account" className="text-4xl text-gray-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold">{data.studentName}</h3>
                        <p className="text-sm font-semibold text-gray-600">Class: {data.class}</p>
                        <p className="text-xs text-gray-500">Adm. No: {data.admissionNumber}</p>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-y-2 text-sm mt-2">
                        <div className="font-semibold text-gray-600">DOB:</div>
                        <div>{new Date(data.dob).toLocaleDateString()}</div>
                        <div className="font-semibold text-gray-600">Father:</div>
                        <div>{data.fatherName}</div>
                        <div className="font-semibold text-gray-600">Contact:</div>
                        <div>{data.emergencyContact}</div>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t-2 border-gray-200 text-center">
                    <p className="text-xs font-bold text-blue-900">IDENTITY CARD</p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* School Header Banner */}
            {schoolInfo && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 mb-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                <Icon icon="mdi:school" className="text-4xl text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{schoolInfo.name}</h1>
                                <div className="flex gap-4 text-sm mt-1 opacity-90">
                                    {schoolInfo.phone && (
                                        <span className="flex items-center gap-1">
                                            <Icon icon="mdi:phone" />
                                            {schoolInfo.phone}
                                        </span>
                                    )}
                                    {schoolInfo.email && (
                                        <span className="flex items-center gap-1">
                                            <Icon icon="mdi:email" />
                                            {schoolInfo.email}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Page Title with Refresh */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h2>
                        <p className="text-gray-500 dark:text-gray-400">Overview of your children's academic progress</p>
                    </div>
                    <Button
                        color="primary"
                        variant="flat"
                        startContent={<Icon icon="mdi:refresh" />}
                        onPress={fetchChildren}
                        isLoading={loading}
                    >
                        Refresh
                    </Button>
                </div>

                {/* Summary Statistics with Borders */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Children</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{children.length}</p>
                                    </div>
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:account-multiple" className="text-2xl text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                        <Card className="border-l-4 border-l-warning">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Pending Fees</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(totalPendingFees)}
                                        </p>
                                    </div>
                                    <div className="bg-warning-100 dark:bg-warning-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:currency-usd" className="text-2xl text-warning-600 dark:text-warning-400" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} className="h-full">
                        <Card className="border-l-4 border-l-success">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Attendance</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgAttendance}%</p>
                                    </div>
                                    <div className="bg-success-100 dark:bg-success-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:calendar-check" className="text-2xl text-success-600 dark:text-success-400" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>

                {/* Children Cards */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:account-school" size={24} className="text-primary" />
                            <div>
                                <h3 className="text-xl font-bold">My Children</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {children.length} child{children.length !== 1 ? 'ren' : ''} enrolled
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-48 rounded" />
                                ))
                            ) : children.length > 0 ? (
                                children.map((child) => (
                                    <motion.div
                                        key={child.id}
                                        whileHover={{ scale: 1.03 }}
                                        className="h-full"
                                    >
                                        <Card className="h-full hover:shadow-lg transition-shadow">
                                            <CardHeader className="justify-between pb-2">
                                                <div className="flex gap-3">
                                                    <Avatar
                                                        isBordered
                                                        radius="full"
                                                        size="md"
                                                        src={`https://i.pravatar.cc/150?u=${child.id}`}
                                                        color="primary"
                                                    />
                                                    <div className="flex flex-col gap-1 items-start justify-center">
                                                        <h4 className="text-sm font-semibold leading-none text-default-900">{child.name}</h4>
                                                        <h5 className="text-xs tracking-tight text-default-500">{child.admissionNumber}</h5>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardBody className="px-4 py-3">
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">Class:</span>
                                                        <Chip size="sm" color="primary" variant="flat">
                                                            {child.Class ? `${child.Class.name} - ${child.Class.section}` : "N/A"}
                                                        </Chip>
                                                    </div>

                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">Attendance:</span>
                                                        <Chip
                                                            size="sm"
                                                            color={parseFloat(child.attendanceRate) >= 75 ? "success" : "warning"}
                                                            variant="flat"
                                                        >
                                                            {child.attendanceRate}%
                                                        </Chip>
                                                    </div>

                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">Pending Fees:</span>
                                                        <span className={`font-medium ${child.feeSummary?.totalPending > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                            {formatCurrency(child.feeSummary?.totalPending || 0)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            color="primary"
                                                            variant="flat"
                                                            startContent={<Icon icon="mdi:eye" />}
                                                            onPress={() => navigate(`/parent/child/${child.id}`)}
                                                            className='w-full'
                                                        >
                                                            View Details
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            color="secondary"
                                                            variant="flat"
                                                            startContent={<Icon icon="mdi:download" />}
                                                            onPress={() => handleDownloadIDCard(child)}
                                                            className='w-full'
                                                            title="Download ID Card"
                                                            isLoading={downloading[child.id]}
                                                        >
                                                            {downloading[child.id] ? 'Downloading...' : 'Download ID Card'}
                                                        </Button>
                                                    </div>
                                                    {child.feeSummary?.totalPending > 0 && (
                                                        <Button
                                                            size="sm"
                                                            color="warning"
                                                            variant="flat"
                                                            startContent={<Icon icon="mdi:cash" />}
                                                            onPress={() => navigate('/parent/fees')}
                                                            className="w-full"
                                                        >
                                                            Pay Fees
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-500">
                                    <Icon icon="mdi:account-school" className="text-6xl mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No children linked to your account</p>
                                    <p className="text-sm text-gray-400 mt-1">Contact your school administrator for assistance</p>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

        </div>
    );
}
