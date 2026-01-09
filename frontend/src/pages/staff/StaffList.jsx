import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { staffService } from "@/services";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const STAFF_ROLES = [
    { value: "TEACHER", label: "Teacher" },
    { value: "STAFF", label: "Staff" },
    { value: "LIBRARIAN", label: "Librarian" }
];

const StaffList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingAction, setLoadingAction] = useState(false);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        loadStaff();
    }, [searchParams]);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const params = Object.fromEntries(searchParams.entries());
            const response = await staffService.getAllStaff(params);
            if (response?.data?.success) {
                setStaff(response.data.data.staff || []);
            } else {
                addToast({ title: "Error", description: response?.data?.message || "Failed to load staff", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "Failed to load staff", color: "danger" });
        } finally {
            setLoading(false);
        }
    };

    // Modal logic removed. 
    // Navigation to Create Page handled inline.

    const handleGenerateLetter = async (type, staffId, staffName) => {
        setLoadingAction(true);
        try {
            let response;
            if (type === 'offer') {
                response = await staffService.generateOfferLetter(staffId);
            } else {
                response = await staffService.generateJoiningLetter(staffId);
            }

            if (response?.data) {
                // Create download link
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${type === 'offer' ? 'Offer_Letter' : 'Joining_Letter'}_${staffName}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                addToast({ title: "Success", description: "Letter generated successfully", color: "success" });
            } else {
                addToast({ title: "Error", description: "Failed to generate letter", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An error occurred", color: "danger" });
        } finally {
            setLoadingAction(false);
        }
    };

    // Searching
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

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.staffProfile?.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            className="space-y-6 p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
                    <p className="text-default-500 mt-1">Manage teachers and support staff</p>
                </div>
                <Button
                    color="primary"
                    startContent={<Icon icon="lucide:plus" width={20} />}
                    onPress={() => navigate('/staff/create')}
                >
                    Add New Staff
                </Button>
            </motion.div>

            {/* Search */}
            <motion.div variants={itemVariants}>
                <Card className="bg-content1 border border-default-200">
                    <CardBody>
                        <Input
                            placeholder="Search by name, email or code..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            startContent={<Icon icon="lucide:search" width={18} />}
                            isClearable
                            onClear={() => setSearchQuery("")}
                        />
                    </CardBody>
                </Card>
            </motion.div>

            {/* Table */}
            <Table aria-label="Staff List" classNames={{
                wrapper: "bg-content1 border border-default-200 overflow-x-auto",
                th: "bg-default-100 text-default-500",
            }}>
                <TableHeader>
                    <TableColumn>EMPLOYEE</TableColumn>
                    <TableColumn>CONTACT</TableColumn>
                    <TableColumn>ROLE</TableColumn>
                    <TableColumn>DESIGNATION</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                    isLoading={loading}
                    loadingContent={<Spinner label="Loading staff..." />}
                    emptyContent="No staff members found"
                >
                    {filteredStaff.map((person, index) => (
                        <TableRow key={person.id} as={motion.tr} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                            <TableCell>
                                <div>
                                    <p className="font-semibold">{person.name}</p>
                                    <p className="text-tiny text-default-500">{person.staffProfile?.employeeCode}</p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p className="text-small">{person.email}</p>
                                    <p className="text-tiny text-default-500">{person.phone || "N/A"}</p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Icon icon={person.role === "TEACHER" ? "lucide:graduation-cap" : person.role === "LIBRARIAN" ? "lucide:book" : "lucide:briefcase"} width={16} />
                                    <span>{person.role}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p className="text-small">{person.StaffProfile?.designation || "-"}</p>
                                    <p className="text-tiny text-default-500">{person.StaffProfile?.department || "-"}</p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${person.isActive ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                                    {person.isActive ? "Active" : "Inactive"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button size="sm" isIconOnly variant="light" color="primary">
                                        <Icon icon="lucide:edit" width={18} />
                                    </Button>

                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button size="sm" isIconOnly variant="light" color="secondary">
                                                <Icon icon="lucide:file-text" width={18} />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu aria-label="Document Actions">
                                            <DropdownItem key="offer" onPress={() => handleGenerateLetter('offer', person.id, person.name)}>
                                                Generate Offer Letter
                                            </DropdownItem>
                                            <DropdownItem key="joining" onPress={() => handleGenerateLetter('joining', person.id, person.name)}>
                                                Generate Joining Letter
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Modal removed */}
        </motion.div >
    );
};

export default StaffList;
