import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Select,
    SelectItem,
    Checkbox,
    Card,
    CardBody,
    CardHeader,
    User,
    Chip,
    Tooltip,
    Spinner,
    addToast,
    Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { academicService, attendanceService } from '@/services';
import { format } from 'date-fns';
import { motion } from "framer-motion";
import ConfirmModal from '@/components/common/ConfirmModal';
import { PageHeader } from '@/components/common';

const ATTENDANCE_STATUS = [
    { value: "PRESENT", label: "Present", color: "success", icon: "mdi:check-circle" },
    { value: "ABSENT", label: "Absent", color: "danger", icon: "mdi:close-circle" },
    { value: "LATE", label: "Late", color: "warning", icon: "mdi:clock-alert" },
    { value: "HALF_DAY", label: "Half Day", color: "primary", icon: "mdi:weather-sunset" }
];

export default function MarkAttendance() {
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Split Data
    const [pendingStudents, setPendingStudents] = useState([]); // List of student objects
    const [markedRecords, setMarkedRecords] = useState([]); // List of attendance records

    // Form States for Pending
    const [pendingAttendance, setPendingAttendance] = useState({}); // { studentId: status }
    const [pendingSelected, setPendingSelected] = useState(new Set([]));

    // Form States for Editing Marked
    const [editingMarkedId, setEditingMarkedId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        fetchSections();
    }, []);

    useEffect(() => {
        if (selectedSection && selectedDate) {
            fetchData();
        } else {
            setPendingStudents([]);
            setMarkedRecords([]);
        }
    }, [selectedSection, selectedDate]);

    const fetchSections = async () => {
        try {
            const response = await academicService.getAllSections();
            if (response.data?.success) {
                setSections(response.data.data || []);
            }
        } catch (error) {
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setPendingSelected(new Set([]));
        setPendingAttendance({});
        try {
            const response = await attendanceService.getAttendance({ sectionId: selectedSection, date: selectedDate });
            if (response.data?.success) {
                const { marked, pending } = response.data.data;
                setMarkedRecords(marked || []);
                setPendingStudents(pending || []);

                // Initialize Pending State
                const initialStatus = {};
                (pending || []).forEach(s => {
                    initialStatus[s.id] = 'PRESENT'; // Default
                });
                setPendingAttendance(initialStatus);
            }
        } catch (error) {
            addToast({ title: "Error", description: "Failed to load data", color: "danger" });
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = (keys) => {
        // Renaming handler internally but keeping prop name if Select expects it
        const sectionId = Array.from(keys)[0];
        setSelectedSection(sectionId);
    };

    // --- Handlers for Pending Table ---
    const handlePendingStatusChange = (studentId, status) => {
        setPendingAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleBulkPendingUpdate = (status) => {
        if (pendingSelected === "all") {
            const updates = {};
            pendingStudents.forEach(s => updates[s.id] = status);
            setPendingAttendance(prev => ({ ...prev, ...updates }));
        } else {
            const updates = {};
            pendingSelected.forEach(key => updates[key] = status);
            setPendingAttendance(prev => ({ ...prev, ...updates }));
        }
        setPendingSelected(new Set([]));
    };

    const onSavePendingClick = () => {
        setIsConfirmOpen(true);
    };

    // --- Handlers for Marked Table (Editing) ---
    const handleMarkedStatusChange = (recordId, newStatus) => {
        setMarkedRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: newStatus, isDirty: true } : r));
    };

    const saveMarkedRecord = async (record) => {
        setSubmitLoading(true);
        try {
            const response = await attendanceService.updateAttendance(record.id, {
                status: record.status
            });

            if (response.data?.success) {
                addToast({ title: "Success", description: "Updated successfully", color: "success" });
                setMarkedRecords(prev => prev.map(r => r.id === record.id ? { ...r, isDirty: false } : r));
                setEditingMarkedId(null);
            } else {
                addToast({ title: "Error", description: "Failed to update", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An error occurred", color: "danger" });
        } finally {
            setSubmitLoading(false);
        }
    };

    // --- Final Submit for Pending ---
    const handleSubmitPending = async () => {
        setSubmitLoading(true);
        try {
            const attendanceData = pendingStudents.map(student => ({
                studentId: student.id,
                status: pendingAttendance[student.id]
            }));

            if (attendanceData.length === 0) return;

            const payload = {
                sectionId: selectedSection,
                date: selectedDate,
                attendance: attendanceData
            };

            const response = await attendanceService.markAttendance(payload);

            if (response.data?.success) {
                addToast({ title: "Success", description: "Attendance marked successfully", color: "success" });
                setIsConfirmOpen(false);
                fetchData(); // Refresh to move them to marked table
            } else {
                addToast({ title: "Error", description: "Failed to mark attendance", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An error occurred", color: "danger" });
        } finally {
            setSubmitLoading(false);
        }
    };

    // Stats
    const stats = useMemo(() => {
        const counts = {
            PRESENT: 0,
            ABSENT: 0,
            LATE: 0,
            HALF_DAY: 0,
            TOTAL: pendingStudents.length + markedRecords.length
        };
        markedRecords.forEach(r => {
            if (counts[r.status] !== undefined) counts[r.status]++;
        });
        Object.values(pendingAttendance).forEach(status => {
            if (counts[status] !== undefined) counts[status]++;
        });
        return counts;
    }, [pendingStudents, markedRecords, pendingAttendance]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
                <PageHeader
                    title="Mark Student Attendance"
                    subtitle="Manage daily attendance for students"
                    action={
                        <Link to="/admin/bulk-upload/attendance">
                            <Button color="secondary" variant="flat" startContent={<Icon icon="mdi:cloud-upload" />}>
                                Bulk Upload
                            </Button>
                        </Link>
                    }
                />
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardBody className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end p-4">
                        <div className="w-full sm:w-1/2 md:w-1/3">
                            <Select
                                label="Select Class"
                                placeholder="Choose a class"
                                selectedKeys={selectedSection ? new Set([String(selectedSection)]) : new Set()}
                                onSelectionChange={handleClassChange}
                                startContent={<Icon icon="mdi:google-classroom" className="text-default-400" />}
                                variant="bordered"
                            >
                                {sections.map((sec) => (
                                    <SelectItem key={String(sec.id)} value={String(sec.id)}>
                                        {`${sec.Class?.name} - ${sec.name}`}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="w-full sm:w-auto">
                            <Input
                                type="date"
                                label="Date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                variant="bordered"
                            />
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Summary Cards */}
            {selectedSection && (
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card className="bg-content1 shadow-sm border-l-4 border-l-primary border-y border-r border-default-200">
                        <CardBody className="p-4">
                            <p className="text-small text-default-500 uppercase font-bold">Total Students</p>
                            <p className="text-2xl font-bold text-foreground">{stats.TOTAL}</p>
                        </CardBody>
                    </Card>
                    {ATTENDANCE_STATUS.map(status => (
                        <Card key={status.value} className={`bg-content1 shadow-sm border-l-4 border-l-${status.color} border-y border-r border-default-200`}>
                            <CardBody className="p-4 flex flex-row justify-between items-center">
                                <div>
                                    <p className="text-small text-default-500 uppercase font-bold">{status.label}</p>
                                    <p className={`text-2xl font-bold text-${status.color}`}>{stats[status.value]}</p>
                                </div>
                                <div className={`p-2 rounded-full bg-${status.color}/10`}>
                                    <Icon icon={status.icon} width={24} className={`text-${status.color}`} />
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </motion.div>
            )}

            {/* Pending Attendance Table */}
            {selectedSection && pendingStudents.length > 0 && (
                <motion.div >
                    <Card className="bg-content1 border border-warning-200 shadow-sm">
                        <CardHeader className="flex flex-col gap-3 px-4 sm:px-6 py-4 bg-warning/10">
                            <div className='flex gap-2 items-center w-full'>
                                <Icon icon="mdi:clock-outline" width={20} className='text-warning' />
                                <span className='font-semibold text-sm sm:text-base text-warning-700 dark:text-warning'>Pending Attendance ({pendingStudents.length})</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:items-center">
                                {(pendingSelected === "all" || pendingSelected.size > 0) && (
                                    <div className="flex gap-1 items-center flex-wrap">
                                        <span className="text-tiny text-gray-500 mr-1">Mark Selected:</span>
                                        {ATTENDANCE_STATUS.map(status => (
                                            <Tooltip key={status.value} content={`As ${status.label}`}>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    color={status.color}
                                                    variant="light"
                                                    onPress={() => handleBulkPendingUpdate(status.value)}
                                                >
                                                    <Icon icon={status.icon} width={16} />
                                                </Button>
                                            </Tooltip>
                                        ))}
                                        <Divider orientation="vertical" className="h-4 mx-2 hidden sm:block" />
                                    </div>
                                )}
                                <Button
                                    color="primary"
                                    size="sm"
                                    onPress={onSavePendingClick}
                                    isLoading={submitLoading}
                                    startContent={!submitLoading && <Icon icon="mdi:cloud-upload" width={18} />}
                                    className="w-full sm:w-auto sm:ml-auto"
                                >
                                    <span className="hidden sm:inline">Submit Attendance</span>
                                    <span className="sm:hidden">Submit</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <Table
                            aria-label="Pending Attendance Table"
                            shadow="none"
                            selectionMode="multiple"
                            selectedKeys={pendingSelected}
                            onSelectionChange={setPendingSelected}
                        >
                            <TableHeader>
                                <TableColumn>STUDENT</TableColumn>
                                <TableColumn>ADMISSION NO</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                            </TableHeader>
                            <TableBody isLoading={loading} loadingContent={<Spinner />}>
                                {pendingStudents.map((student) => {
                                    const currentStatus = pendingAttendance[student.id] || 'PRESENT';
                                    const statusConfig = ATTENDANCE_STATUS.find(s => s.value === currentStatus);
                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <User
                                                    name={student.name}
                                                    avatarProps={{ src: `${import.meta.env.VITE_API_URL}/${student.profilePicture}`, name: student.name?.charAt(0) }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-small text-default-500">{student.admissionNumber}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-full sm:w-40">
                                                    <Select
                                                        aria-label="Select status"
                                                        size="sm"
                                                        selectedKeys={[currentStatus]}
                                                        onChange={(e) => handlePendingStatusChange(student.id, e.target.value)}
                                                        color={statusConfig?.color || "default"}
                                                        variant="flat"
                                                        startContent={<Icon icon={statusConfig?.icon} className={`text-${statusConfig?.color}`} width={16} />}
                                                    >
                                                        {ATTENDANCE_STATUS.map((s) => (
                                                            <SelectItem key={s.value} value={s.value} textValue={s.label}>
                                                                <div className="flex items-center gap-2">
                                                                    <Icon icon={s.icon} className={`text-${s.color}`} width={16} />
                                                                    {s.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Card>
                </motion.div>
            )}

            {/* Marked Attendance Table */}
            {selectedSection && markedRecords.length > 0 && (
                <motion.div>
                    <Card className="bg-content1 border border-default-200 shadow-sm">
                        <CardHeader className="flex gap-2 items-center px-6 py-4">
                            <Icon icon="mdi:checkbox-marked-circle-outline" width={20} className='text-success' />
                            <span className='font-semibold text-foreground'>Marked Attendance ({markedRecords.length})</span>
                        </CardHeader>
                        <Table aria-label="Marked Attendance Table" shadow="none" classNames={{ wrapper: "shadow-none bg-content1", th: "bg-default-100 text-default-500" }}>
                            <TableHeader>
                                <TableColumn>STUDENT</TableColumn>
                                <TableColumn>ROLL NO</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody isLoading={loading} emptyContent="No records found">
                                {markedRecords.map((record) => {
                                    const student = record.Student;
                                    const isEditing = editingMarkedId === record.id;
                                    const statusConfig = ATTENDANCE_STATUS.find(s => s.value === record.status);

                                    return (
                                        <TableRow key={record.id}>
                                            <TableCell>
                                                <User
                                                    name={student?.name}
                                                    description={`Admn: ${student?.admissionNumber}`}
                                                    avatarProps={{ src: student?.profilePicture, name: student?.name?.charAt(0) }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-small text-default-500">{student?.rollNumber || "-"}</span>
                                            </TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <div className="w-full sm:w-40">
                                                        <Select
                                                            aria-label="val"
                                                            size="sm"
                                                            selectedKeys={[record.status]}
                                                            onChange={(e) => handleMarkedStatusChange(record.id, e.target.value)}
                                                            color={statusConfig?.color}
                                                        >
                                                            {ATTENDANCE_STATUS.map((s) => (
                                                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                            ))}
                                                        </Select>
                                                    </div>
                                                ) : (
                                                    <Chip
                                                        startContent={<Icon icon={statusConfig?.icon} width={14} />}
                                                        variant="flat"
                                                        color={statusConfig?.color}
                                                        size="sm"
                                                    >
                                                        {statusConfig?.label}
                                                    </Chip>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <div className="flex gap-1">
                                                        <Button isIconOnly size="sm" color="success" variant="flat" onPress={() => saveMarkedRecord(record)}>
                                                            <Icon icon="mdi:check" width={16} />
                                                        </Button>
                                                        <Button isIconOnly size="sm" color="danger" variant="flat" onPress={() => setEditingMarkedId(null)}>
                                                            <Icon icon="mdi:close" width={16} />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Tooltip content="Edit Record">
                                                        <Button isIconOnly size="sm" variant="light" onPress={() => setEditingMarkedId(record.id)}>
                                                            <Icon icon="mdi:pencil-outline" width={16} className="text-default-400" />
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Card>
                </motion.div>
            )}

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleSubmitPending}
                title="Save Pending Attendance"
                message={`Are you sure you want to mark attendance for ${pendingStudents.length} pending students?`}
                confirmText="Save All"
                confirmColor="primary"
                icon="mdi:content-save-outline"
                isLoading={submitLoading}
            />
        </motion.div>
    );
}

