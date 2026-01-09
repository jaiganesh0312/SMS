import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Tabs,
    Tab,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    addToast,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Textarea
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { leaveService } from "@/services";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

const LeaveManagement = () => {
    const [activeTab, setActiveTab] = useState("PENDING");
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);

    // Action Modal
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [actionNotes, setActionNotes] = useState("");
    const [actionType, setActionType] = useState(""); // APPROVED | REJECTED

    const loadLeaves = async () => {
        setLoading(true);
        try {
            // Fetch based on active tab
            const status = activeTab === "HISTORY" ? undefined : "PENDING";
            const response = await leaveService.getAllLeaves({ status });

            if (response?.data?.success) {
                let data = response.data.data.leaves || [];
                // If HISTORY, filter out PENDING manually if API returns all, or rely on API.
                // Assuming API returns mixed if undefined. WE want to separate them cleanly.
                if (activeTab === "HISTORY") {
                    data = data.filter(l => l.status !== "PENDING");
                }
                setLeaves(data);
            } else {
                addToast({ title: "Error", description: "Failed to load leaves", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "Unexpected error", color: "danger" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaves();
    }, [activeTab]);

    const handleActionClick = (leave, type) => {
        setSelectedLeave(leave);
        setActionType(type);
        setActionNotes("");
        onOpen();
    };

    const handleConfirmAction = async (onClose) => {
        if (!selectedLeave) return;
        try {
            const response = await leaveService.updateLeaveStatus(selectedLeave.id, actionType);
            if (response?.data?.success) {
                addToast({ title: "Success", description: `Leave ${actionType.toLowerCase()}`, color: "success" });
                loadLeaves();
                onClose();
            } else {
                addToast({ title: "Failed", description: response?.data?.message, color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "Update failed", color: "danger" });
        }
    };




    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <motion.div
            className="space-y-6 p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
                <p className="text-default-500 mt-1">Review and manage staff leave applications</p>
            </motion.div>

            <Tabs aria-label="Leave Tabs" selectedKey={activeTab} onSelectionChange={setActiveTab} variant="underlined" color="primary"
                classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-primary",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-primary"
                }}
            >
                <Tab key="PENDING" title={<div className="flex items-center space-x-2"><span>Pending Requests</span></div>} >
                    <LeavesTable leaves={leaves} type="PENDING" loading={loading} />
                </Tab>
                <Tab key="HISTORY" title={<div className="flex items-center space-x-2"><span>History</span></div>} >
                    <LeavesTable leaves={leaves} type="HISTORY" loading={loading} />
                </Tab>
            </Tabs>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                {actionType === "APPROVED" ? "Approve Leave" : "Reject Leave"}
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-foreground">Are you sure you want to <strong>{actionType === "APPROVED" ? "approve" : "reject"}</strong> the leave request for <strong>{selectedLeave?.User?.name}</strong>?</p>
                                <div className="bg-default-100 p-3 rounded-md text-small">
                                    <p className="font-semibold text-default-600">Reason:</p>
                                    <p className="text-default-500">{selectedLeave?.reason}</p>
                                </div>
                                {/* Placeholder for admin notes if backend supports it later */}
                                {/* <Textarea label="Notes" placeholder="Optional notes..." value={actionNotes} onValueChange={setActionNotes} /> */}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancel</Button>
                                <Button
                                    color={actionType === "APPROVED" ? "success" : "danger"}
                                    onPress={() => handleConfirmAction(onClose)}
                                >
                                    Confirm {actionType === "APPROVED" ? "Approval" : "Rejection"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

        </motion.div >
    );
};

const LeavesTable = ({ leaves, type, loading }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING": return "warning";
            case "APPROVED": return "success";
            case "REJECTED": return "danger";
            default: return "default";
        }
    };

    return (
        <Table aria-label="Leaves Table" classNames={{
            wrapper: "bg-content1 border border-default-200 shadow-sm",
            th: "bg-default-100 text-default-500 font-medium"
        }}>
            <TableHeader>
                <TableColumn>APPLICANT</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>DURATION</TableColumn>
                <TableColumn>REASON</TableColumn>
                {type == "HISTORY" ?
                    <TableColumn>STATUS</TableColumn> :
                    <TableColumn>ACTIONS</TableColumn>}
            </TableHeader>
            <TableBody
                isLoading={loading}
                loadingContent={<Spinner label="Loading leaves..." />}
                emptyContent="No leave records found"
            >
                {leaves.map((leave, index) => (
                    <TableRow key={leave.id} as={motion.tr} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                        <TableCell>
                            <div>
                                <p className="font-semibold">{leave.User?.name || "Unknown"}</p>
                                <p className="text-tiny text-default-500">{leave.User?.email}</p>
                                <Chip size="sm" variant="flat" className="mt-1">{leave.role}</Chip>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Chip variant="flat" color="primary" size="sm">{leave.type}</Chip>
                        </TableCell>
                        <TableCell>
                            <div className="text-small">
                                <p>From: {format(new Date(leave.startDate), "MMM dd, yyyy")}</p>
                                <p>To: {format(new Date(leave.endDate), "MMM dd, yyyy")}</p>
                                <p className="text-tiny text-default-500">
                                    {differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1} Days
                                </p>
                            </div>
                        </TableCell>
                        <TableCell>
                            <p className="max-w-xs truncate text-small" title={leave.reason}>{leave.reason}</p>
                        </TableCell>
                        {type == "HISTORY" ?
                            <TableCell>
                                <Chip color={getStatusColor(leave.status)} variant="flat" size="sm">{leave.status}</Chip>
                            </TableCell> :
                            <TableCell>
                                {leave.status === "PENDING" && (
                                    <div className="flex gap-2">
                                        <Button size="sm" color="success" onPress={() => handleActionClick(leave, "APPROVED")}>Approve</Button>
                                        <Button size="sm" color="danger" variant="flat" onPress={() => handleActionClick(leave, "REJECTED")}>Reject</Button>
                                    </div>
                                )}
                            </TableCell>
                        }
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
};



export default LeaveManagement;
