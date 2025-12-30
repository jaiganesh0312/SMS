import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Button,
    Input,
    Select,
    SelectItem,
    Textarea,
    Chip,
    Spinner,
    addToast,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { leaveService } from "@/services";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const LEAVE_TYPES = [
    { value: "SICK", label: "Sick Leave" },
    { value: "CASUAL", label: "Casual Leave" },
    { value: "EMERGENCY", label: "Emergency Leave" },
    { value: "VACATION", label: "Vacation" }
];

const MyLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        type: "",
        startDate: "",
        endDate: "",
        reason: ""
    });

    useEffect(() => {
        loadMyLeaves();
    }, []);

    const loadMyLeaves = async () => {
        setLoading(true);
        try {
            const response = await leaveService.getMyLeaves();
            if (response?.data?.success) {
                setLeaves(response.data.data.leaves || []);
            }
        } catch (error) {
            addToast({ title: "Error", description: "Could not load leaves", color: "danger" });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelect = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (!form.type || !form.startDate || !form.endDate || !form.reason) {
                addToast({ title: "Validation Error", description: "All fields are required", color: "warning" });
                setSubmitting(false);
                return;
            }

            const response = await leaveService.applyLeave(form);
            if (response?.data?.success) {
                addToast({ title: "Success", description: "Leave application submitted", color: "success" });
                setForm({ type: "", startDate: "", endDate: "", reason: "" });
                loadMyLeaves();
            } else {
                addToast({ title: "Error", description: response?.data?.message || "Failed to apply", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "Unexpected error", color: "danger" });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING": return "warning";
            case "APPROVED": return "success";
            case "REJECTED": return "danger";
            default: return "default";
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
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Application Form */}
            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Apply for Leave</h2>
                    <p className="text-gray-600 dark:text-gray-400">Submit a new leave request</p>
                </div>
                <Card>
                    <CardBody>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-3">
                            <Select
                                label="Leave Type"
                                placeholder="Select type"
                                selectedKeys={form.type ? [form.type] : []}
                                onChange={(e) => handleSelect("type", e.target.value)}
                            >
                                {LEAVE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                            </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    type="date"
                                    label="Start Date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    placeholder="YYYY-MM-DD"
                                />
                                <Input
                                    type="date"
                                    label="End Date"
                                    name="endDate"
                                    value={form.endDate}
                                    onChange={handleChange}
                                    placeholder="YYYY-MM-DD"
                                />
                            </div>
                            <div className="grid gap-3">
                            <Textarea
                                label="Reason"
                                name="reason"
                                value={form.reason}
                                onChange={handleChange}
                                placeholder="Why do you need this leave?"
                            />
                            </div>

                            <Button
                                type="submit"
                                color="primary"
                                fullWidth
                                isLoading={submitting}
                                startContent={<Icon icon="lucide:send" />}
                            >
                                Submit Application
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            </motion.div>

            {/* History List */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Leave History</h2>
                    <p className="text-gray-600 dark:text-gray-400">Track status of your applications</p>
                </div>
                    <Table aria-label="My Leaves">
                        <TableHeader>
                            <TableColumn>TYPE</TableColumn>
                            <TableColumn>DATES</TableColumn>
                            <TableColumn>REASON</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn>APPLIED ON</TableColumn>
                        </TableHeader>
                        <TableBody
                            isLoading={loading}
                            loadingContent={<Spinner label="Loading history..." />}
                            emptyContent="No leave history found"
                        >
                            {leaves.map((leave, index) => (
                                <TableRow key={leave.id} as={motion.tr} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                                    <TableCell>
                                        <Chip variant="flat" color="primary" size="sm">{leave.type}</Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-small">
                                            <p>{format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="max-w-[150px] truncate text-small text-default-500">{leave.reason}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Chip color={getStatusColor(leave.status)} size="sm" variant="dot">{leave.status}</Chip>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-tiny text-default-400">{formatDistanceToNow(new Date(leave.createdAt), { addSuffix: true })}</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
            </motion.div>
        </motion.div>
    );
};

export default MyLeaves;
