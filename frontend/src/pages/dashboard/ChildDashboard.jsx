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
        <div className="min-h-screen bg-background">
            {/* School Header Banner */}
            {school && (
                <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white p-6 mb-6 shadow-md">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg">
                                    <Icon icon="mdi:school" className="text-4xl text-primary-700" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">{school.name}</h1>
                                    <div className="flex gap-4 text-sm mt-1 opacity-90 font-medium">
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
                                startContent={<Icon icon="mdi:arrow-left" />}
                                onPress={() => navigate('/parent-dashboard')}
                                className="text-white/80 hover:text-white"
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
                        <h2 className="text-3xl font-bold text-foreground">{student.name}</h2>
                        <div className="flex items-center gap-3 text-default-500 mt-1">
                            <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded text-sm font-medium">
                                {student.admissionNumber}
                            </span>
                            <span>|</span>
                            <span className="flex items-center gap-1">
                                <Icon icon="mdi:google-classroom" />
                                Class {student.Class?.name} - {student.Class?.section}
                            </span>
                        </div>
                    </div>
                    <Button
                        color="primary"
                        variant="flat"
                        startContent={<Icon icon="mdi:refresh" />}
                        onPress={() => {
                            fetchDashboard();
                            fetchExamResults();
                        }}
                        className="bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    >
                        Refresh
                    </Button>
                </div>

                {/* Overview Cards with Bordered Design */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div whileHover={{ scale: 1.02 }}>
                        <Card className="border-l-4 border-l-primary-500 bg-content1 dark:bg-content1 shadow-sm">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-default-500">Attendance</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {attendancePercentage}%
                                        </p>
                                    </div>
                                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:calendar-check" className="text-2xl text-primary-600 dark:text-primary-400" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }}>
                        <Card className="border-l-4 border-l-warning bg-content1 dark:bg-content1 shadow-sm">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-default-500">Pending Fees</p>
                                        <p className="text-2xl font-bold text-foreground">
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
                        <Card className="border-l-4 border-l-success bg-content1 dark:bg-content1 shadow-sm">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-default-500">Exam Average</p>
                                        <p className="text-2xl font-bold text-foreground">
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
                        <Card className="border-l-4 border-l-secondary bg-content1 dark:bg-content1 shadow-sm">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-default-500">Total Exams</p>
                                        <p className="text-2xl font-bold text-foreground">{examResults.length}</p>
                                    </div>
                                    <div className="bg-secondary-100 dark:bg-secondary-900/30 p-3 rounded-lg">
                                        <Icon icon="mdi:trophy" className="text-2xl text-secondary-600 dark:text-secondary-400" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>

                {/* Tabs for Details */}
                <Card className="bg-content1 dark:bg-content1 shadow-md border border-default-200 dark:border-default-100">
                    <CardBody className="p-0">
                        <Tabs aria-label="Student Details" color="primary" variant="underlined" size="lg" classNames={{
                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-default-100",
                            cursor: "w-full bg-primary-500",
                            tab: "max-w-fit px-2 h-12",
                            tabContent: "group-data-[selected=true]:text-primary-600 dark:group-data-[selected=true]:text-primary-400 font-medium",
                            panel: "p-6"
                        }}>
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
                                <div className="pt-2">
                                    {timetable.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {timetable.map((t) => (
                                                <Card key={t.id} className="bg-default-50 dark:bg-default-100/20 border border-default-200 dark:border-default-100 hover:border-primary-500 transition-colors shadow-sm">
                                                    <CardBody>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="font-bold text-lg text-foreground">{t.Subject.name}</h3>
                                                                <Chip size="sm" color="primary" variant="flat" classNames={{ content: "font-medium" }}>{t.dayOfWeek}</Chip>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-default-500">
                                                                <Icon icon="mdi:clock-outline" />
                                                                <span>{t.startTime} - {t.endTime}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-default-500">
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
                                            <Icon icon="mdi:calendar-blank" className="text-6xl text-default-300 mb-4 mx-auto" />
                                            <p className="text-default-500">No timetable available</p>
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
                                <div className="pt-2">
                                    <Card className="mb-6 bg-default-50 dark:bg-default-100/20 border border-default-200 dark:border-default-100 shadow-sm">
                                        <CardBody>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-default-500">Overall Attendance</p>
                                                    <p className="text-3xl font-bold text-foreground">{attendancePercentage}%</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-default-500">Total Days</p>
                                                    <p className="text-2xl font-bold text-foreground">{attendance.length}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-default-500">Present</p>
                                                    <p className="text-2xl font-bold text-success-600">
                                                        {attendance.filter(a => ['PRESENT', 'LATE', 'HALF_DAY'].includes(a.status?.toUpperCase())).length}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    <Table aria-label="Attendance records" removeWrapper classNames={{ th: "bg-default-100 text-default-500", td: "text-foreground" }}>
                                        <TableHeader>
                                            <TableColumn>DATE</TableColumn>
                                            <TableColumn>DAY</TableColumn>
                                            <TableColumn>STATUS</TableColumn>
                                            <TableColumn>REMARKS</TableColumn>
                                        </TableHeader>
                                        <TableBody emptyContent="No attendance records">
                                            {attendance.slice(0, 30).map((att) => (
                                                <TableRow key={att.id} className="border-b border-default-100 last:border-0 hover:bg-default-50/50">
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
                                                            classNames={{ content: "font-medium" }}
                                                        >
                                                            {att.status}
                                                        </Chip>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-default-500">{att.remarks || '-'}</TableCell>
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
                                <div className="pt-2 space-y-4">
                                    {/* Fee Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card className="bg-primary-50 dark:bg-primary-900/20 border-none shadow-sm">
                                            <CardBody className="text-center p-4">
                                                <p className="text-sm text-primary-700 dark:text-primary-300">Total Fees</p>
                                                <p className="text-2xl font-bold text-primary-900 dark:text-white">
                                                    {formatCurrency(feeInfo.totalFees)}
                                                </p>
                                            </CardBody>
                                        </Card>
                                        <Card className="bg-success-50 dark:bg-success-900/20 border-none shadow-sm">
                                            <CardBody className="text-center p-4">
                                                <p className="text-sm text-success-700 dark:text-success-300">Paid</p>
                                                <p className="text-2xl font-bold text-success-900 dark:text-white">
                                                    {formatCurrency(feeInfo.totalPaid)}
                                                </p>
                                            </CardBody>
                                        </Card>
                                        <Card className="bg-warning-50 dark:bg-warning-900/20 border-none shadow-sm">
                                            <CardBody className="text-center p-4">
                                                <p className="text-sm text-warning-700 dark:text-warning-300">Pending</p>
                                                <p className="text-2xl font-bold text-warning-900 dark:text-white">
                                                    {formatCurrency(feeInfo.totalPending)}
                                                </p>
                                            </CardBody>
                                        </Card>
                                    </div>

                                    {/* Payment History */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold text-foreground">Recent Payments</h3>
                                            <Button
                                                color="primary"
                                                size="sm"
                                                startContent={<Icon icon="mdi:cash" />}
                                                onPress={() => navigate('/parent/fees')}
                                                className="shadow-md shadow-primary-500/20"
                                            >
                                                Pay Fees
                                            </Button>
                                        </div>
                                        <Table aria-label="Recent payments" removeWrapper classNames={{ th: "bg-default-100 text-default-500", td: "text-foreground" }}>
                                            <TableHeader>
                                                <TableColumn>DATE</TableColumn>
                                                <TableColumn>FEE NAME</TableColumn>
                                                <TableColumn>AMOUNT</TableColumn>
                                                <TableColumn>TRANSACTION ID</TableColumn>
                                            </TableHeader>
                                            <TableBody emptyContent="No payment history">
                                                {feeInfo.recentPayments.map((payment) => (
                                                    <TableRow key={payment.id} className="border-b border-default-100 last:border-0 hover:bg-default-50/50">
                                                        <TableCell>{format(new Date(payment.date), 'PPP')}</TableCell>
                                                        <TableCell>{payment.feeName}</TableCell>
                                                        <TableCell className="text-success-600 font-medium">
                                                            {formatCurrency(payment.amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <code className="text-xs bg-default-100 px-2 py-1 rounded text-default-600">{payment.transactionId}</code>
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
                                <div className="pt-2 space-y-6">
                                    {loadingExams ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-32 rounded-xl" />
                                            <Skeleton className="h-32 rounded-xl" />
                                        </div>
                                    ) : examResults.length > 0 ? (
                                        examResults.map((exam, idx) => (
                                            <Card key={exam.examId || idx} className="mb-4 border border-default-200 dark:border-default-100 shadow-sm bg-content1">
                                                <CardHeader className="bg-default-50 dark:bg-default-100/20 border-b border-default-100">
                                                    <div className="flex justify-between items-center w-full">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-foreground">{exam.examName}</h3>
                                                            <p className="text-sm text-default-500">
                                                                {exam.startDate && format(new Date(exam.startDate), 'PPP')}
                                                            </p>
                                                            {exam.className && (
                                                                <p className="text-xs text-default-400 mt-1">
                                                                    Class: {exam.className}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Chip
                                                                size="lg"
                                                                color={parseFloat(exam.overallPercentage) >= 60 ? "success" : parseFloat(exam.overallPercentage) >= 40 ? "warning" : "danger"}
                                                                variant="flat"
                                                                classNames={{ content: "font-bold" }}
                                                            >
                                                                Overall: {exam.overallPercentage}%
                                                            </Chip>
                                                            <Button
                                                                color="primary"
                                                                size="sm"
                                                                startContent={<Icon icon="mdi:download" />}
                                                                onPress={() => downloadReportCard(exam.examId, exam.examName)}
                                                                isLoading={downloadingReports[exam.examId]}
                                                                className="shadow-sm"
                                                            >
                                                                Generate Report
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardBody className="p-0">
                                                    <Table aria-label={`${exam.examName} results`} removeWrapper classNames={{ th: "bg-transparent text-default-500", td: "text-foreground", base: "p-4" }}>
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
                                                                <TableRow key={subject.subjectId || subIdx} className="border-b border-default-50 last:border-0">
                                                                    <TableCell className="font-medium">{subject.subjectName}</TableCell>
                                                                    <TableCell className="text-sm text-default-500">{subject.subjectCode}</TableCell>
                                                                    <TableCell className="font-semibold">{subject.marksObtained}</TableCell>
                                                                    <TableCell>{subject.maxMarks}</TableCell>
                                                                    <TableCell>
                                                                        <Chip
                                                                            size="sm"
                                                                            color={parseFloat(subject.percentage) >= 60 ? "success" : parseFloat(subject.percentage) >= 40 ? "warning" : "danger"}
                                                                            variant="flat"
                                                                            classNames={{ content: "font-medium" }}
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
                                                    <div className="p-4 bg-default-50/50 dark:bg-default-100/10 border-t border-default-100">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium text-sm text-default-500">Total Marks:</span>
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-bold text-lg text-foreground">{exam.totalObtained} / {exam.totalMax}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <Icon icon="mdi:file-certificate-outline" className="text-6xl text-default-300 mb-4 mx-auto" />
                                            <p className="text-default-500">No exam results available</p>
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
