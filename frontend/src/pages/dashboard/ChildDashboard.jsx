import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    CardHeader,
    Tabs,
    Tab,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Chip,
    Skeleton,
    addToast,
    Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { parentService, examService } from '@/services';
import { format } from 'date-fns';
import { motion } from "framer-motion";

export default function ChildDashboard() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloadingReports, setDownloadingReports] = useState({});
    const [examResults, setExamResults] = useState([]);
    const [loadingExams, setLoadingExams] = useState(true);

    useEffect(() => {
        fetchDashboard();
        fetchExamResults();
    }, [studentId]);

    const fetchDashboard = async () => {
        try {
            const response = await parentService.getChildDashboard(studentId);
            if (response.data?.success) {
                setData(response.data.data);
            }
        } catch (error) {
            addToast({
                title: 'Error',
                description: 'Failed to load dashboard',
                color: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchExamResults = async () => {
        try {
            const response = await examService.getStudentExamResults({ studentId });
            if (response.data?.success) {
                setExamResults(response.data.data.examResults || []);
            }
        } catch (error) {
        } finally {
            setLoadingExams(false);
        }
    };

    const downloadReportCard = async (examId, examName) => {
        try {
            setDownloadingReports(prev => ({ ...prev, [examId]: true }));
            const response = await examService.downloadReportCard({
                studentId: studentId,
                examId: examId
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_card_${data?.student?.name}_${examName}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            addToast({
                title: 'Success',
                description: 'Report card downloaded successfully',
                color: 'success',
            });
        } catch (error) {
            addToast({
                title: 'Error',
                description: 'Failed to download report card',
                color: 'danger',
            });
        } finally {
            setDownloadingReports(prev => ({ ...prev, [examId]: false }));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-32 rounded mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Skeleton className="h-24 rounded" />
                    <Skeleton className="h-24 rounded" />
                    <Skeleton className="h-24 rounded" />
                    <Skeleton className="h-24 rounded" />
                </div>
                <Skeleton className="h-96 rounded" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6 text-center">
                <Icon icon="mdi:alert-circle" className="text-6xl text-danger mb-4 mx-auto" />
                <p className="text-lg font-medium">Error loading data</p>
            </div>
        );
    }

    const { student, school, timetable, attendance, attendancePercentage, feeInfo } = data;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* School Header */}
            {school && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 mb-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                    <Icon icon="mdi:school" className="text-4xl text-indigo-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{school.name}</h1>
                                    <div className="flex gap-4 text-sm mt-1 opacity-90">
                                        {school.phone && (
                                            <span className="flex items-center gap-1">
                                                <Icon icon="mdi:phone" />
                                                {school.phone}
                                            </span>
                                        )}
                                        {school.email && (
                                            <span className="flex items-center gap-1">
                                                <Icon icon="mdi:email" />
                                                {school.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="light"
                                startContent={<Icon icon="mdi:arrow-left" className="text-white" />}
                                onPress={() => navigate('/parent-dashboard')}
                                className="text-white"
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Page Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{student.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Admission No: {student.admissionNumber} | Class: {student.Class?.name} - {student.Class?.section}
                        </p>
                    </div>
                    <Button
                        color="primary"
                        variant="flat"
                        startContent={<Icon icon="mdi:refresh" />}
                        onPress={() => {
                            fetchDashboard();
                            fetchExamResults();
                        }}
                    >
                        Refresh
                    </Button>
                </div>

                {/* Overview Cards with Bordered Design */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div whileHover={{ scale: 1.02 }}>
                        <Card className="border-l-4 border-l-blue-500">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {attendancePercentage}%
                                        </p>
                                    </div>
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:calendar-check" className="text-2xl text-blue-600 dark:text-blue-400" />
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
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Pending Fees</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(feeInfo.totalPending)}
                                        </p>
                                    </div>
                                    <div className="bg-warning-100 dark:bg-warning-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:currency-usd" className="text-2xl text-warning-600 dark:text-warning-400" />
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
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Exam Average</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {examResults.length > 0
                                                ? (examResults.reduce((sum, e) => sum + parseFloat(e.overallPercentage), 0) / examResults.length).toFixed(1) + '%'
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                    <div className="bg-success-100 dark:bg-success-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:chart-line" className="text-2xl text-success-600 dark:text-success-400" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }}>
                        <Card className="border-l-4 border-l-primary">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Exams</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{examResults.length}</p>
                                    </div>
                                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:trophy" className="text-2xl text-primary-600 dark:text-primary-400" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>

                {/* Tabs for Details */}
                <Card>
                    <CardBody>
                        <Tabs aria-label="Student Details" color="primary" variant="underlined" size="lg">
                            {/* Timetable Tab */}
                            <Tab
                                key="timetable"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:calendar-clock" />
                                        <span>Timetable</span>
                                    </div>
                                }
                            >
                                <div className="pt-4">
                                    {timetable.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {timetable.map((t) => (
                                                <Card key={t.id} className="bg-gray-50 dark:bg-gray-800">
                                                    <CardBody>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="font-bold text-lg">{t.Subject.name}</h3>
                                                                <Chip size="sm" color="primary" variant="flat">{t.dayOfWeek}</Chip>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                <Icon icon="mdi:clock-outline" />
                                                                <span>{t.startTime} - {t.endTime}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                <Icon icon="mdi:account" />
                                                                <span>{t.User?.name || "Teacher"}</span>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Icon icon="mdi:calendar-blank" className="text-6xl text-gray-300 mb-4 mx-auto" />
                                            <p className="text-gray-500">No timetable available</p>
                                        </div>
                                    )}
                                </div>
                            </Tab>

                            {/* Attendance Tab */}
                            <Tab
                                key="attendance"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:calendar-check" />
                                        <span>Attendance</span>
                                        <Chip size="sm" variant="flat" color={parseFloat(attendancePercentage) >= 75 ? "success" : "warning"}>
                                            {attendancePercentage}%
                                        </Chip>
                                    </div>
                                }
                            >
                                <div className="pt-4">
                                    <Card className="mb-4 bg-gray-50 dark:bg-gray-800">
                                        <CardBody>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Overall Attendance</p>
                                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{attendancePercentage}%</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Days</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendance.length}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {attendance.filter(a => ['PRESENT', 'LATE', 'HALF_DAY'].includes(a.status?.toUpperCase())).length}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    <Table aria-label="Attendance records">
                                        <TableHeader>
                                            <TableColumn>DATE</TableColumn>
                                            <TableColumn>DAY</TableColumn>
                                            <TableColumn>STATUS</TableColumn>
                                            <TableColumn>REMARKS</TableColumn>
                                        </TableHeader>
                                        <TableBody emptyContent="No attendance records">
                                            {attendance.slice(0, 30).map((att) => (
                                                <TableRow key={att.id}>
                                                    <TableCell>{format(new Date(att.date), 'PPP')}</TableCell>
                                                    <TableCell>{format(new Date(att.date), 'EEEE')}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            color={
                                                                ['PRESENT', 'LATE'].includes(att.status?.toUpperCase()) ? 'success' :
                                                                    ['ABSENT'].includes(att.status?.toUpperCase()) ? 'danger' :
                                                                        'warning'
                                                            }
                                                            variant="flat"
                                                            size="sm"
                                                        >
                                                            {att.status}
                                                        </Chip>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-500">{att.remarks || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Tab>

                            {/* Fees Tab */}
                            <Tab
                                key="fees"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:currency-usd" />
                                        <span>Fees</span>
                                        {feeInfo.totalPending > 0 && (
                                            <Chip size="sm" color="warning" variant="flat">
                                                Pending
                                            </Chip>
                                        )}
                                    </div>
                                }
                            >
                                <div className="pt-4 space-y-4">
                                    {/* Fee Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card className="bg-blue-50 dark:bg-blue-900/20">
                                            <CardBody className="text-center">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Fees</p>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(feeInfo.totalFees)}
                                                </p>
                                            </CardBody>
                                        </Card>
                                        <Card className="bg-green-50 dark:bg-green-900/20">
                                            <CardBody className="text-center">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {formatCurrency(feeInfo.totalPaid)}
                                                </p>
                                            </CardBody>
                                        </Card>
                                        <Card className="bg-orange-50 dark:bg-orange-900/20">
                                            <CardBody className="text-center">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                                <p className="text-2xl font-bold text-orange-600">
                                                    {formatCurrency(feeInfo.totalPending)}
                                                </p>
                                            </CardBody>
                                        </Card>
                                    </div>

                                    {/* Payment History */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold">Recent Payments</h3>
                                            <Button
                                                color="primary"
                                                size="sm"
                                                startContent={<Icon icon="mdi:cash" />}
                                                onPress={() => navigate('/parent/fees')}
                                            >
                                                Pay Fees
                                            </Button>
                                        </div>
                                        <Table aria-label="Recent payments">
                                            <TableHeader>
                                                <TableColumn>DATE</TableColumn>
                                                <TableColumn>FEE NAME</TableColumn>
                                                <TableColumn>AMOUNT</TableColumn>
                                                <TableColumn>TRANSACTION ID</TableColumn>
                                            </TableHeader>
                                            <TableBody emptyContent="No payment history">
                                                {feeInfo.recentPayments.map((payment) => (
                                                    <TableRow key={payment.id}>
                                                        <TableCell>{format(new Date(payment.date), 'PPP')}</TableCell>
                                                        <TableCell>{payment.feeName}</TableCell>
                                                        <TableCell className="text-green-600 font-medium">
                                                            {formatCurrency(payment.amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <code className="text-xs">{payment.transactionId}</code>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </Tab>

                            {/* Exam Results Tab */}
                            <Tab
                                key="exams"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:file-certificate" />
                                        <span>Exam Results</span>
                                    </div>
                                }
                            >
                                <div className="pt-4 space-y-6">
                                    {loadingExams ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-32 rounded" />
                                            <Skeleton className="h-32 rounded" />
                                        </div>
                                    ) : examResults.length > 0 ? (
                                        examResults.map((exam, idx) => (
                                            <Card key={exam.examId || idx} className="mb-4">
                                                <CardHeader className="bg-gray-50 dark:bg-gray-800">
                                                    <div className="flex justify-between items-center w-full">
                                                        <div>
                                                            <h3 className="text-lg font-bold">{exam.examName}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                {exam.startDate && format(new Date(exam.startDate), 'PPP')}
                                                            </p>
                                                            {exam.className && (
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    Class: {exam.className}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Chip
                                                                size="lg"
                                                                color={parseFloat(exam.overallPercentage) >= 60 ? "success" : parseFloat(exam.overallPercentage) >= 40 ? "warning" : "danger"}
                                                                variant="flat"
                                                            >
                                                                Overall: {exam.overallPercentage}%
                                                            </Chip>
                                                            <Button
                                                                color="primary"
                                                                size="sm"
                                                                startContent={<Icon icon="mdi:download" />}
                                                                onPress={() => downloadReportCard(exam.examId, exam.examName)}
                                                                isLoading={downloadingReports[exam.examId]}
                                                            >
                                                                Generate Report
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardBody>
                                                    <Table aria-label={`${exam.examName} results`}>
                                                        <TableHeader>
                                                            <TableColumn>SUBJECT</TableColumn>
                                                            <TableColumn>SUBJECT CODE</TableColumn>
                                                            <TableColumn>OBTAINED MARKS</TableColumn>
                                                            <TableColumn>MAX MARKS</TableColumn>
                                                            <TableColumn>PERCENTAGE</TableColumn>
                                                            <TableColumn>GRADE</TableColumn>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {exam.subjects && exam.subjects.map((subject, subIdx) => (
                                                                <TableRow key={subject.subjectId || subIdx}>
                                                                    <TableCell className="font-medium">{subject.subjectName}</TableCell>
                                                                    <TableCell className="text-sm text-gray-500">{subject.subjectCode}</TableCell>
                                                                    <TableCell className="font-semibold">{subject.marksObtained}</TableCell>
                                                                    <TableCell>{subject.maxMarks}</TableCell>
                                                                    <TableCell>
                                                                        <Chip
                                                                            size="sm"
                                                                            color={parseFloat(subject.percentage) >= 60 ? "success" : parseFloat(subject.percentage) >= 40 ? "warning" : "danger"}
                                                                            variant="flat"
                                                                        >
                                                                            {subject.percentage}%
                                                                        </Chip>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <span className="font-semibold">
                                                                            {subject.grade || (
                                                                                parseFloat(subject.percentage) >= 90 ? 'A+' :
                                                                                    parseFloat(subject.percentage) >= 80 ? 'A' :
                                                                                        parseFloat(subject.percentage) >= 70 ? 'B+' :
                                                                                            parseFloat(subject.percentage) >= 60 ? 'B' :
                                                                                                parseFloat(subject.percentage) >= 50 ? 'C' :
                                                                                                    parseFloat(subject.percentage) >= 40 ? 'D' : 'F'
                                                                            )}
                                                                        </span>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium text-sm">Total Marks:</span>
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-bold text-lg">{exam.totalObtained} / {exam.totalMax}</span>
                                                                <Chip
                                                                    color={parseFloat(exam.overallPercentage) >= 60 ? "success" : parseFloat(exam.overallPercentage) >= 40 ? "warning" : "danger"}
                                                                    variant="flat"
                                                                    size="lg"
                                                                >
                                                                    {exam.overallPercentage}%
                                                                </Chip>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <Icon icon="mdi:file-document-outline" className="text-6xl text-gray-300 mb-4 mx-auto" />
                                            <p className="text-gray-500">No exam results available</p>
                                        </div>
                                    )}
                                </div>
                            </Tab>
                        </Tabs>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
