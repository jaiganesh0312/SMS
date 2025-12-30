import React, { useState, useEffect } from 'react';
import { Card, CardBody, Select, SelectItem, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Spinner, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { academicService, attendanceService } from '@/services';
import { motion } from "framer-motion";

export default function AttendanceReport() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [reportType, setReportType] = useState('MONTHLY'); // 'MONTHLY' or 'DAILY'
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [reportData, setReportData] = useState([]);
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, halfDay: 0, total: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchReport();
        }
    }, [selectedClass, selectedMonth, selectedDate, reportType]);

    const fetchClasses = async () => {
        try {
            const response = await academicService.getAllClasses();
            if (response.data?.success) {
                setClasses(response.data.data?.classes || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = { classId: selectedClass };

            if (reportType === 'DAILY') {
                params.date = selectedDate;
            } else {
                // Calculate start and end date of the month
                const year = parseInt(selectedMonth.split('-')[0]);
                const month = parseInt(selectedMonth.split('-')[1]) - 1; // 0-indexed
                const startDate = new Date(year, month, 1).toISOString().split('T')[0];
                const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]; // Last day of month

                params.startDate = startDate;
                params.endDate = endDate;
            }

            const response = await attendanceService.getAttendanceReport(params);

            if (response.data?.success) {
                // Backend returns data: { attendance: [...] }
                const data = response.data.data?.attendance || [];
                setReportData(data);
                calculateStats(data);
            } else {
                setReportData([]);
                setStats({ present: 0, absent: 0, late: 0, halfDay: 0, total: 0 });
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const counts = { present: 0, absent: 0, late: 0, halfDay: 0, total: data.length };
        data.forEach(record => {
            if (record.status === 'PRESENT') counts.present++;
            else if (record.status === 'ABSENT') counts.absent++;
            else if (record.status === 'LATE') counts.late++;
            else if (record.status === 'HALF_DAY') counts.halfDay++;
        });
        setStats(counts);
    };

    const handleClassChange = (keys) => {
        const classId = Array.from(keys)[0];
        setSelectedClass(classId);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PRESENT': return 'success';
            case 'ABSENT': return 'danger';
            case 'LATE': return 'warning';
            case 'HALF_DAY': return 'primary';
            default: return 'default';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            className="p-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Reports</h1>
                        <p className="text-sm text-gray-500">View detailed attendance history</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-end">
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg h-10 items-center">
                            <Button
                                size="sm"
                                radius="sm"
                                variant={reportType === 'DAILY' ? 'solid' : 'light'}
                                color={reportType === 'DAILY' ? 'primary' : 'default'}
                                onPress={() => setReportType('DAILY')}
                                className={reportType === 'DAILY' ? "shadow-sm" : ""}
                            >
                                Daily
                            </Button>
                            <Button
                                size="sm"
                                radius="sm"
                                variant={reportType === 'MONTHLY' ? 'solid' : 'light'}
                                color={reportType === 'MONTHLY' ? 'primary' : 'default'}
                                onPress={() => setReportType('MONTHLY')}
                                className={reportType === 'MONTHLY' ? "shadow-sm" : ""}
                            >
                                Monthly
                            </Button>
                        </div>

                        <Select
                            className="min-w-[200px]"
                            label="Select Class"
                            placeholder="Choose a class"
                            selectedKeys={selectedClass ? new Set([String(selectedClass)]) : new Set()}
                            onSelectionChange={handleClassChange}
                            startContent={<Icon icon="mdi:google-classroom" className="text-default-400" />}
                        >
                            {classes.map((cls) => (
                                <SelectItem key={String(cls.id)} textValue={`${cls.name} - ${cls.section}`}>
                                    {cls.name} {cls.section ? `- ${cls.section}` : ''}
                                </SelectItem>
                            ))}
                        </Select>

                        {reportType === 'MONTHLY' ? (
                            <Input
                                type="month"
                                label="Select Month"
                                className="min-w-[200px]"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            />
                        ) : (
                            <Input
                                type="date"
                                label="Select Date"
                                className="min-w-[200px]"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="shadow-sm border-l-4 border-green-500">
                    <CardBody className="flex flex-row items-center gap-4 p-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <Icon icon="mdi:check-circle" className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Present</p>
                            <p className="text-2xl font-bold">{stats.present}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="shadow-sm border-l-4 border-red-500">
                    <CardBody className="flex flex-row items-center gap-4 p-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <Icon icon="mdi:close-circle" className="text-2xl text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Absent</p>
                            <p className="text-2xl font-bold">{stats.absent}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="shadow-sm border-l-4 border-yellow-500">
                    <CardBody className="flex flex-row items-center gap-4 p-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                            <Icon icon="mdi:clock-alert" className="text-2xl text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Late</p>
                            <p className="text-2xl font-bold">{stats.late}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="shadow-sm border-l-4 border-blue-500">
                    <CardBody className="flex flex-row items-center gap-4 p-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Icon icon="mdi:weather-sunset" className="text-2xl text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Half Day</p>
                            <p className="text-2xl font-bold">{stats.halfDay}</p>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm">
                    <CardBody className="pb-4">
                        <Table
                            aria-label="Attendance Report Table"
                            removeWrapper
                        >
                            <TableHeader>
                                <TableColumn>DATE</TableColumn>
                                <TableColumn>STUDENT</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                            </TableHeader>
                            <TableBody
                                emptyContent={loading ? <Spinner /> : "No attendance records found for this selection."}
                                isLoading={loading}
                            >
                                {reportData.map((record, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <span className="text-gray-900 dark:text-gray-300">
                                                {new Date(record.date).toLocaleDateString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {record.Student?.name ||
                                                    (record.Student?.firstName ? `${record.Student.firstName} ${record.Student.lastName}` : 'Unknown Student')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" color={getStatusColor(record.status)} variant="flat">
                                                {record.status}
                                            </Chip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </motion.div>
        </motion.div>
    );
}
