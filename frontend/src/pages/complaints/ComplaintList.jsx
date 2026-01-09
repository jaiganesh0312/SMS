import React, { useState, useEffect } from 'react';
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Chip, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
    Spinner, addToast, User
} from "@heroui/react";
import { Icon } from '@iconify/react';
import { complaintService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import ComplaintDetailsModal from './ComplaintDetailsModal';

const STATUS_COLOR_MAP = {
    PENDING: "warning",
    IN_PROGRESS: "primary",
    RESOLVED: "success",
    REJECTED: "danger"
};

const ComplaintList = ({ refreshTrigger }) => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isAdminOrStaff = user?.role === 'SCHOOL_ADMIN' || user?.role === 'TEACHER' || user?.role === 'SUPER_ADMIN';

    useEffect(() => {
        fetchComplaints();
    }, [refreshTrigger]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            let response;
            if (user?.role === 'PARENT') {
                response = await complaintService.getMyComplaints();
            } else {
                response = await complaintService.getAllComplaints();
            }

            if (response?.data?.success) {
                setComplaints(response.data.data.complaints || []);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await complaintService.updateComplaintStatus(id, newStatus);
            if (response?.data?.success) {
                addToast({ title: "Success", description: "Status updated successfully", color: "success" });
                fetchComplaints();
            } else {
                addToast({ title: "Error", description: "Failed to update status", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An error occurred", color: "danger" });
        }
    };

    const renderCell = (item, columnKey) => {
        switch (columnKey) {
            case "info":
                return (
                    <div>
                        <p className="font-semibold text-small text-foreground">{item.title}</p>
                        <p className="text-tiny text-default-500 truncate max-w-xs">{item.description}</p>
                    </div>
                );
            case "raisedBy":
                return (
                    <User
                        name={item.Parent?.fatherName || item.Parent?.motherName || "Parent"}
                        description={item.Parent?.email}
                        avatarProps={{ size: "sm", src: item.Parent?.profileImage }}
                    />
                );
            case "priority":
                return (
                    <Chip size="sm" variant="flat" color={item.priority === 'HIGH' ? 'danger' : item.priority === 'MEDIUM' ? 'warning' : 'success'} classNames={{ content: "font-medium" }}>
                        {item.priority}
                    </Chip>
                );
            case "status":
                return (
                    <Chip size="sm" color={STATUS_COLOR_MAP[item.status] || "default"} variant="dot" classNames={{ content: "font-medium" }}>
                        {item.status?.replace('_', ' ')}
                    </Chip>
                );
            case "date":
                return (
                    <div className="text-small text-default-500">
                        {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : '-'}
                    </div>
                );
            case "actions":
                return (
                    <div className="flex items-center gap-2 justify-center">
                        {/* View Button (For Everyone) */}
                        <Button
                            size="sm"
                            isIconOnly
                            variant="light"
                            color="primary"
                            onPress={() => {
                                setSelectedComplaint(item);
                                setIsModalOpen(true);
                            }}
                        >
                            <Icon icon="lucide:eye" className="text-lg" />
                        </Button>

                        {/* Admin/Staff Actions */}
                        {isAdminOrStaff && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button size="sm" isIconOnly variant="light">
                                        <Icon icon="lucide:more-vertical" />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Status Actions" onAction={(key) => handleStatusUpdate(item.id, key)}>
                                    <DropdownItem key="PENDING">Mark as Pending</DropdownItem>
                                    <DropdownItem key="IN_PROGRESS">Mark as In Progress</DropdownItem>
                                    <DropdownItem key="RESOLVED" className="text-success">Mark as Resolved</DropdownItem>
                                    <DropdownItem key="REJECTED" className="text-danger">Reject</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                );
            default:
                return item[columnKey];
        }
    };

    const columns = [
        { name: "ISSUE", uid: "info" },
        { name: "PRIORITY", uid: "priority" },
        { name: "STATUS", uid: "status" },
        { name: "DATE", uid: "date" },
        ...(isAdminOrStaff ? [{ name: "RAISED BY", uid: "raisedBy" }] : []),
        { name: "ACTIONS", uid: "actions" } // Always show actions column now
    ];

    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground font-heading">Complaint History</h3>
                <Button size="sm" color="primary" startContent={<Icon icon="lucide:refresh-cw" />} onPress={fetchComplaints}>
                    Refresh
                </Button>
            </div>
            <Table aria-label="Complaints Table" shadow="none" classNames={{
                wrapper: "shadow-none bg-content1 border border-default-200",
                th: "bg-default-100 text-default-500 font-medium",
                td: "py-3"
            }}>
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    items={complaints}
                    isLoading={loading}
                    loadingContent={<Spinner />}
                    emptyContent="No complaints found"
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <ComplaintDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                complaint={selectedComplaint}
            />
        </div>
    );
};

export default ComplaintList;
