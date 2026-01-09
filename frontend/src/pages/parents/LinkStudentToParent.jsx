import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Chip,
    Select,
    SelectItem,
    Card,
    CardBody,
    CardHeader
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { studentService, parentService, academicService } from '@/services';
import { PageHeader } from '@/components/common';
import { motion } from "framer-motion";

export default function LinkStudentToParent() {
    const { parentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [parent, setParent] = useState(location.state?.parent || null);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("all");

    useEffect(() => {
        if (parentId) {
            if (!parent) {
                fetchParentDetails();
            }
            fetchUnassignedStudents();
            fetchClasses();
        }
    }, [parentId]);

    useEffect(() => {
        filterStudents();
    }, [searchQuery, classFilter, students]);

    const fetchParentDetails = async () => {
        try {
            const response = await parentService.getAllParents();
            if (response.data?.success) {
                const found = response.data.data.parents.find(p => p.id === parentId);
                setParent(found);
            }
        } catch (error) {
        }
    };

    const fetchUnassignedStudents = async () => {
        setLoading(true);
        try {
            const response = await studentService.getAllStudents({ parentId: 'null' });
            if (response.data?.success) {
                setStudents(response.data.data.students);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await academicService.getAllClasses();
            if (response.data?.success) {
                setClasses(response.data.data.classes);
            }
        } catch (error) {
        }
    };

    const filterStudents = () => {
        let filtered = [...students];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.admissionNumber.toLowerCase().includes(query)
            );
        }

        if (classFilter !== "all") {
            filtered = filtered.filter(s => s.classId === classFilter);
        }

        setFilteredStudents(filtered);
    };

    const handleLinkStudents = async () => {
        if (selectedKeys.size === 0 && selectedKeys !== "all") return;

        let idsToLink = [];
        if (selectedKeys === "all") {
            idsToLink = filteredStudents.map(s => s.id);
        } else {
            idsToLink = Array.from(selectedKeys);
        }

        try {
            const response = await studentService.bulkUpdateStudents({
                studentIds: idsToLink,
                parentId: parentId
            });

            if (response.data?.success) {
                navigate('/parents');
            }
        } catch (error) {
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
                <PageHeader
                    title={parent ? `Link Students to ${parent.guardianName}` : "Link Students to Parent"}
                    description="Select unassigned students to link to this parent account."
                    backLink="/parents"
                />
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardHeader className="flex flex-col gap-4 px-6 pt-6">
                        <div className="flex w-full flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                            <Input
                                label="Search Student"
                                placeholder="Name or Admission No."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                startContent={<Icon icon="mdi:magnify" />}
                                className="w-full sm:max-w-xs"
                                variant="bordered"
                            />
                            <Select
                                label="Filter by Class"
                                placeholder="All Classes"
                                selectedKeys={[classFilter]}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="w-full sm:max-w-xs"
                                variant="bordered"
                            >
                                <SelectItem key="all" value="all">All Classes</SelectItem>
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name} - {cls.section}
                                    </SelectItem>
                                ))}
                            </Select>
                            <div className="w-full sm:w-auto sm:ml-auto">
                                <Button
                                    color="primary"
                                    isDisabled={selectedKeys.size === 0 && selectedKeys !== "all"}
                                    onPress={handleLinkStudents}
                                    startContent={<Icon icon="mdi:link-variant" />}
                                    className="w-full sm:w-auto"
                                >
                                    Link Selected ({selectedKeys === "all" ? filteredStudents.length : selectedKeys.size})
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="px-0 pb-4">
                        <Table
                            aria-label="Unassigned Students Table"
                            selectionMode="multiple"
                            selectedKeys={selectedKeys}
                            onSelectionChange={setSelectedKeys}
                            className="px-2"
                            removeWrapper
                        >
                            <TableHeader>
                                <TableColumn className="bg-default-100 text-default-500 font-semibold">ADMISSION NO</TableColumn>
                                <TableColumn className="bg-default-100 text-default-500 font-semibold">NAME</TableColumn>
                                <TableColumn className="bg-default-100 text-default-500 font-semibold">CLASS</TableColumn>
                                <TableColumn className="bg-default-100 text-default-500 font-semibold hidden sm:table-cell">GENDER</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent={"No unassigned students found"} isLoading={loading}>
                                {filteredStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.admissionNumber}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-bold text-small">{student.name}</span>
                                                <span className="text-tiny text-default-400">{student.dob}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {student.Class ? (
                                                <span>{student.Class.name}-{student.Class.section}</span>
                                            ) : (
                                                <span className="text-default-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Chip size="sm" variant="flat" color={student.gender === 'Male' ? 'primary' : 'secondary'}>
                                                {student.gender}
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
