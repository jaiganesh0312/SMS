import React, { useState, useEffect, useMemo } from 'react';
import staffAttendanceService from '@/services/staffAttendanceService';
// import staffService from '@/services/staffService'; // No longer needed as getAttendance returns everything
import { format } from 'date-fns';
import { Icon } from '@iconify/react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    addToast,
    Select,
    SelectItem,
    Chip,
    User,
    Tooltip,
    Divider
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ConfirmModal from '@/components/common/ConfirmModal';
import { PageHeader } from '@/components/common';

const attendanceSchema = z.object({
    date: z.string().min(1, "Date is required"),
});

const ATTENDANCE_STATUS = [
    { value: "PRESENT", label: "Present", color: "success", icon: "lucide:check-circle" },
    { value: "ABSENT", label: "Absent", color: "danger", icon: "lucide:x-circle" },
    { value: "HALF_DAY", label: "Half Day", color: "warning", icon: "lucide:clock" },
    { value: "LEAVE", label: "Leave", color: "default", icon: "lucide:calendar-off" }
];

const StaffAttendance = () => {
    // Split Data
    const [pendingStaff, setPendingStaff] = useState([]); // List of staff objects
    const [markedRecords, setMarkedRecords] = useState([]); // List of attendance records

    // Form States for Pending
    const [pendingAttendance, setPendingAttendance] = useState({}); // { staffId: status }
    const [pendingRemarks, setPendingRemarks] = useState({}); // { staffId: remarks }
    const [pendingSelected, setPendingSelected] = useState(new Set([]));

    // Form States for Editing Marked (if needed)
    // For now, "Marked" is read-only.
    // To implement "Update", we can treat the Marked table as active OR have a "Edit" mode.
    // The requirement is "One read only table where attendance is already marked".
    // But also "Handle updates".
    // I will add an "Edit" button to row that turns it into editable mode?
    // Or just make it editable?
    // Let's make "Marked" table editable row-by-row or just editable.
    // To strictly follow "Read Only", I'll make it display CHIPS.
    // And add an "Edit" action that converts that row back to a state where it can be changed?
    // Actually, simplest is: Marked table rows have a dropdown but it's disabled? or just Chips.
    // Let's use Chips + an Edit button that opens a small modal or popover?
    // Or, allow inline editing by changing the status directly.
    // Let's stick to: Marked = Read Only. But with an "Edit" button on the row.
    const [editingMarkedId, setEditingMarkedId] = useState(null); // ID of marked record being edited

    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'MARK_PENDING' or 'UPDATE_MARKED'

    const { control, watch } = useForm({
        resolver: zodResolver(attendanceSchema),
        defaultValues: {
            date: format(new Date(), 'yyyy-MM-dd')
        }
    });

    const date = watch("date");

    useEffect(() => {
        if (date) {
            fetchData();
        }
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        setPendingSelected(new Set([]));
        setPendingAttendance({});
        setPendingRemarks({});
        try {
            const response = await staffAttendanceService.getAttendance({ date });
            if (response.success && response.data) {
                setMarkedRecords(response.data.marked || []);
                setPendingStaff(response.data.pending || []);

                // Initialize Pending State
                const initialStatus = {};
                const initialRemarks = {};
                (response.data.pending || []).forEach(s => {
                    initialStatus[s.id] = 'PRESENT'; // Default
                    initialRemarks[s.id] = '';
                });
                setPendingAttendance(initialStatus);
                setPendingRemarks(initialRemarks);
            }
        } catch (error) {
            addToast({ title: "Error", description: "Failed to load data", color: "danger" });
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers for Pending Table ---
    const handlePendingStatusChange = (staffId, status) => {
        setPendingAttendance(prev => ({ ...prev, [staffId]: status }));
    };

    const handlePendingRemarkChange = (staffId, val) => {
        setPendingRemarks(prev => ({ ...prev, [staffId]: val }));
    };

    const handleBulkPendingUpdate = (status) => {
        if (pendingSelected === "all") {
            const updates = {};
            pendingStaff.forEach(s => updates[s.id] = status);
            setPendingAttendance(prev => ({ ...prev, ...updates }));
        } else {
            const updates = {};
            pendingSelected.forEach(key => updates[key] = status);
            setPendingAttendance(prev => ({ ...prev, ...updates }));
        }
        setPendingSelected(new Set([]));
    };

    const onSavePendingClick = () => {
        setConfirmAction('MARK_PENDING');
        setIsConfirmOpen(true);
    };

    // --- Handlers for Marked Table (Editing) ---
    // We allow inline editing of Status and Remarks for marked records
    const handleMarkedStatusChange = (recordId, newStatus) => {
        setMarkedRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: newStatus, isDirty: true } : r));
    };

    const handleMarkedRemarkChange = (recordId, newRemark) => {
        setMarkedRecords(prev => prev.map(r => r.id === recordId ? { ...r, remarks: newRemark, isDirty: true } : r));
    };

    const saveMarkedRecord = async (record) => {
        // We can reuse the same API but pass just this one record
        setSubmitLoading(true);
        try {
            const response = await staffAttendanceService.updateAttendance(record.id, {
                status: record.status,
                remarks: record.remarks
            });

            if (response.success) {
                addToast({ title: "Success", description: "Updated successfully", color: "success" });
                // Remove dirty flag
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
            // Only submit for selected or all?
            // Usually "Save Attendance" in pending section implies saving ALL pending forms or just what's filled?
            // Let's save ALL pending staff data to move them to 'Marked'
            const attendanceData = pendingStaff.map(staff => ({
                staffId: staff.id,
                status: pendingAttendance[staff.id],
                remarks: pendingRemarks[staff.id]
            }));

            if (attendanceData.length === 0) return;

            const response = await staffAttendanceService.markAttendance({
                date,
                attendanceData
            });

            if (response.success) {
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
            HALF_DAY: 0,
            LEAVE: 0,
            TOTAL: pendingStaff.length + markedRecords.length
        };
        // Count from Marked
        markedRecords.forEach(r => {
            if (counts[r.status] !== undefined) counts[r.status]++;
        });
        // Count from Pending (using current form state)
        Object.values(pendingAttendance).forEach(status => {
            if (counts[status] !== undefined) counts[status]++;
        });
        return counts;
    }, [pendingStaff, markedRecords, pendingAttendance]);

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
            <PageHeader
                title="Staff Attendance"
                subtitle="Manage daily attendance for all employees"
                action={
                    <div className="flex gap-4 items-center bg-content1 p-2 rounded-xl shadow-sm border border-default-200">
                        <Controller
                            name="date"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="date"
                                    label="Date"
                                    labelPlacement='outside-left'
                                    startContent={<Icon icon="lucide:calendar" className="text-default-500" width={20} />}
                                    className="bg-transparent border-none focus:ring-0 text-foreground outline-none w-48"
                                    classNames={{ inputWrapper: "shadow-none bg-transparent hover:bg-transparent" }}
                                    {...field}
                                />
                            )}
                        />
                    </div>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="shadow-sm border-l-4 border-l-primary bg-content1 border-y border-r border-default-200">
                    <CardBody className="p-4">
                        <p className="text-small text-default-500 uppercase font-bold">Total Staff</p>
                        <p className="text-2xl font-bold text-foreground">{stats.TOTAL}</p>
                    </CardBody>
                </Card>
                {ATTENDANCE_STATUS.map(status => (
                    <Card key={status.value} className={`shadow-sm border-l-4 border-l-${status.color} bg-content1 border-y border-r border-default-200`}>
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
            </div>

            {/* Pending Attendance Table */}
            {pendingStaff.length > 0 && (
                <Card className="shadow-sm border border-warning-200 bg-content1">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 md:px-6 py-4 gap-4 bg-warning/10">
                        <div className='flex gap-2 items-center w-full md:w-auto'>
                            <Icon icon="lucide:clock" width={20} className='text-warning' />
                            <span className='font-semibold text-sm sm:text-base text-warning-700 dark:text-warning'>Pending Attendance ({pendingStaff.length})</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto justify-end">
                            {(pendingSelected === "all" || pendingSelected.size > 0) && (
                                <div className="flex gap-1 items-center">
                                    <span className="text-tiny text-gray-500 mr-1 sm:mr-2">Mark:</span>
                                    {ATTENDANCE_STATUS.map(status => (
                                        <Tooltip key={status.value} content={`As ${status.label}`}>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                color={status.color}
                                                variant="light"
                                                onPress={() => handleBulkPendingUpdate(status.value)}
                                            >
                                                <Icon icon={status.icon} width={14} />
                                            </Button>
                                        </Tooltip>
                                    ))}
                                    <Divider orientation="vertical" className="h-4 mx-2 hidden sm:block" />
                                </div>
                            )}
                            <Button
                                color="primary"
                                onPress={onSavePendingClick}
                                isLoading={submitLoading}
                                startContent={!submitLoading && <Icon icon="lucide:check-circle" width={18} />}
                                className="w-full sm:w-auto"
                                size="sm"
                            >
                                Submit Attendance
                            </Button>
                        </div>
                    </CardHeader>
                    <Table
                        aria-label="Pending Attendance Table"
                        shadow="none"
                        selectionMode="multiple"
                        selectedKeys={pendingSelected}
                        onSelectionChange={setPendingSelected}
                        classNames={{ wrapper: "shadow-none bg-content1", th: "bg-warning/10 text-warning-700" }}
                    >
                        <TableHeader>
                            <TableColumn>EMPLOYEE</TableColumn>
                            <TableColumn className="hidden md:table-cell">DESIGNATION</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn width={300}>REMARKS</TableColumn>
                        </TableHeader>
                        <TableBody isLoading={loading} loadingContent={<Spinner />}>
                            {pendingStaff.map((staff) => {
                                const currentStatus = pendingAttendance[staff.id] || 'PRESENT';
                                const statusConfig = ATTENDANCE_STATUS.find(s => s.value === currentStatus);
                                return (
                                    <TableRow key={staff.id}>
                                        <TableCell>
                                            <User
                                                name={staff.name || staff.User?.name}
                                                description={staff.employeeCode}
                                                avatarProps={{ src: staff.profilePicture, name: (staff.name || staff.User?.name)?.charAt(0) }}
                                            />
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex flex-col">
                                                <span className="text-small">{staff.designation || "Staff"}</span>
                                                <span className="text-tiny text-default-400">{staff.department}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-full sm:w-40">
                                                <Select
                                                    aria-label="Select status"
                                                    size="sm"
                                                    selectedKeys={[currentStatus]}
                                                    onChange={(e) => handlePendingStatusChange(staff.id, e.target.value)}
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
                                        <TableCell>
                                            <Input
                                                size="sm"
                                                placeholder="Remarks..."
                                                value={pendingRemarks[staff.id] || ''}
                                                onValueChange={(val) => handlePendingRemarkChange(staff.id, val)}
                                                variant="bordered"
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Marked Attendance Table */}
            {markedRecords.length > 0 && (
                <Card className="shadow-sm bg-content1 border border-default-200">
                    <CardHeader className="flex gap-2 items-center px-6 py-4">
                        <Icon icon="lucide:check-square" width={20} className='text-success' />
                        <span className='font-semibold text-foreground'>Marked Attendance ({markedRecords.length})</span>
                    </CardHeader>
                    <Table aria-label="Marked Attendance Table" shadow="none" classNames={{ wrapper: "shadow-none bg-content1", th: "bg-default-100 text-default-500" }}>
                        <TableHeader>
                            <TableColumn>EMPLOYEE</TableColumn>
                            <TableColumn className="hidden md:table-cell">DESIGNATION</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn>REMARKS</TableColumn>
                            <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody isLoading={loading} emptyContent="No records found">
                            {markedRecords.map((record) => {
                                const staff = record.StaffProfile;
                                const isEditing = editingMarkedId === record.id;
                                const statusConfig = ATTENDANCE_STATUS.find(s => s.value === record.status);

                                return (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <User
                                                name={staff?.name || staff?.User?.name}
                                                description={staff?.employeeCode}
                                                avatarProps={{ src: staff?.profilePicture, name: (staff?.name || staff?.User?.name)?.charAt(0) }}
                                            />
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex flex-col">
                                                <span className="text-small">{staff?.designation || "Staff"}</span>
                                                <span className="text-tiny text-default-400">{staff?.department}</span>
                                            </div>
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
                                                <Input
                                                    size="sm"
                                                    value={record.remarks || ''}
                                                    onValueChange={(val) => handleMarkedRemarkChange(record.id, val)}
                                                />
                                            ) : (
                                                <span className="text-small text-gray-500">{record.remarks || "-"}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <div className="flex gap-1">
                                                    <Button isIconOnly size="sm" color="success" variant="flat" onPress={() => saveMarkedRecord(record)}>
                                                        <Icon icon="lucide:check" width={16} />
                                                    </Button>
                                                    <Button isIconOnly size="sm" color="danger" variant="flat" onPress={() => setEditingMarkedId(null)}>
                                                        <Icon icon="lucide:x" width={16} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Tooltip content="Edit Record">
                                                    <Button isIconOnly size="sm" variant="light" onPress={() => setEditingMarkedId(record.id)}>
                                                        <Icon icon="lucide:edit-2" width={16} className="text-default-400" />
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
            )}

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleSubmitPending}
                title="Save Pending Attendance"
                message={`Are you sure you want to mark attendance for ${pendingStaff.length} pending staff members?`}
                confirmText="Save All"
                confirmColor="primary"
                icon="lucide:save"
                isLoading={submitLoading}
            />
        </div>
    );
};

export default StaffAttendance;
