import React, { useState, useEffect } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Chip,
    Card,
    CardBody,
    CardHeader,
    Avatar,
    Tooltip,
    Input,
    Spinner,
    addToast,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '@/services';
import { motion } from "framer-motion";
import { format } from 'date-fns';

const Schools = () => {
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterValue, setFilterValue] = useState("");

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        setLoading(true);
        try {
            const response = await dashboardService.getAllSchools();
            if (response.data?.success) {
                setSchools(response.data.data || []);
            } else {
                addToast({
                    title: "Error",
                    description: response.data?.message || "Failed to fetch schools",
                    color: "danger"
                });
            }
        } catch (error) {
            console.error("Fetch schools error:", error);
            addToast({
                title: "Error",
                description: "An unexpected error occurred",
                color: "danger"
            });
        } finally {
            setLoading(false);
        }
    };

    const onSearchChange = (value) => {
        setFilterValue(value);
    };

    const filteredItems = React.useMemo(() => {
        return schools.filter((school) =>
            school.name.toLowerCase().includes(filterValue.toLowerCase()) ||
            school.adminEmail?.toLowerCase().includes(filterValue.toLowerCase())
        );
    }, [schools, filterValue]);

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

    const renderCell = (school, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex items-center gap-3">
                        <Avatar
                            radius="sm"
                            src={school.logo}
                            name={school.name}
                            className="w-10 h-10 text-large"
                            fallback={<Icon icon="mdi:school" className="text-xl" />}
                        />
                        <div className="flex flex-col">
                            <p className="text-bold text-small capitalize">{school.name}</p>
                            <p className="text-bold text-tiny capitalize text-default-400">{school.board || 'Generic'}</p>
                        </div>
                    </div>
                );
            case "admin":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-small capitalize">{school.adminEmail || 'No Admin'}</p>
                        <p className="text-bold text-tiny text-default-400">School Admin</p>
                    </div>
                );
            case "stats":
                return (
                    <div className="flex gap-4 items-center">
                        <Tooltip content="Students">
                            <div className="flex items-center gap-1 text-default-400">
                                <Icon icon="mdi:account-group" className="text-lg" />
                                <span className="text-tiny font-bold">{school.studentsCount || 0}</span>
                            </div>
                        </Tooltip>
                        <Tooltip content="Teachers">
                            <div className="flex items-center gap-1 text-default-400">
                                <Icon icon="mdi:teacher" className="text-lg" />
                                <span className="text-tiny font-bold">{school.teachersCount || 0}</span>
                            </div>
                        </Tooltip>
                        <Tooltip content="Classes">
                            <div className="flex items-center gap-1 text-default-400">
                                <Icon icon="mdi:google-classroom" className="text-lg" />
                                <span className="text-tiny font-bold">{school.classesCount || 0}</span>
                            </div>
                        </Tooltip>
                    </div>
                );
            case "status":
                return (
                    <Chip
                        className="capitalize"
                        color={school.status === "active" ? "success" : "danger"}
                        size="sm"
                        variant="flat"
                    >
                        {school.status}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                    <Icon icon="mdi:dots-vertical" className="text-xl" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Action menu" onAction={(key) => {
                                if (key === 'view') navigate(`/dashboard?schoolId=${school.id}`);
                                else navigate(`/${key}?schoolId=${school.id}`);
                            }}>
                                <DropdownItem key="view" startContent={<Icon icon="mdi:view-dashboard" />}>Dashboard</DropdownItem>
                                <DropdownItem key="students" startContent={<Icon icon="mdi:account-group" />}>Students</DropdownItem>
                                <DropdownItem key="staff" startContent={<Icon icon="mdi:account-tie" />}>Staff</DropdownItem>
                                <DropdownItem key="academic/classes" startContent={<Icon icon="mdi:google-classroom" />}>Classes</DropdownItem>
                                <DropdownItem key="exams" startContent={<Icon icon="mdi:file-document-edit" />}>Exams</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );
            default:
                return school[columnKey];
        }
    };

    return (
        <motion.div
            className="p-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex justify-between items-end gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schools Management</h1>
                    <p className="text-gray-500 mt-1">Manage and monitor all registered schools in the system</p>
                </div>
                <Button
                    color="primary"
                    startContent={<Icon icon="mdi:plus" className="text-xl" />}
                    onPress={() => navigate('/register-school')}
                >
                    Add New School
                </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm">
                    <CardHeader className="p-4 flex flex-col sm:flex-row gap-3">
                        <Input
                            isClearable
                            className="w-full sm:max-w-[44%]"
                            placeholder="Search by name or admin email..."
                            startContent={<Icon icon="mdi:magnify" className="text-default-300" />}
                            value={filterValue}
                            onClear={() => onSearchChange("")}
                            onValueChange={onSearchChange}
                        />
                    </CardHeader>
                    <CardBody className="p-0">
                        <Table
                            aria-label="Schools list table"
                            removeWrapper
                            className="px-4 pb-4"
                            selectionMode="none"
                        >
                            <TableHeader>
                                <TableColumn key="name">SCHOOL</TableColumn>
                                <TableColumn key="admin">ADMIN</TableColumn>
                                <TableColumn key="stats">METRICS</TableColumn>
                                <TableColumn key="status">STATUS</TableColumn>
                                <TableColumn key="actions" align="end">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody
                                emptyContent={"No schools found matching your search"}
                                items={filteredItems}
                                isLoading={loading}
                                loadingContent={<Spinner label="Loading schools..." />}
                            >
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default Schools;
