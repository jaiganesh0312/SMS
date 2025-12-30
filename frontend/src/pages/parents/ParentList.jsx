import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Chip,
    User,
    Tooltip
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { parentService } from '@/services';
import { PageHeader } from '@/components/common';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

export default function ParentList() {
    const navigate = useNavigate();
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        try {
            const response = await parentService.getAllParents();
            if (response.data?.success) {
                setParents(response.data.data.parents);
            }
        } catch (error) {
            console.error("Error fetching parents:", error);
        } finally {
            setLoading(false);
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
                    title="Parents"
                    description="Manage parent accounts and their linked students"
                    action={
                        <div className="flex gap-2">
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<Icon icon="mdi:cloud-upload" />}
                                onPress={() => navigate('/admin/bulk-upload/students')} // Bulk upload handles parents too
                            >
                                Bulk Upload
                            </Button>
                            <Button
                                color="primary"
                                startContent={<Icon icon="mdi:plus" />}
                                onPress={() => navigate('/register-parent')}
                            >
                                Add Parent
                            </Button>
                        </div>
                    }
                />
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm">
                    <CardHeader className="flex justify-between items-center px-6 pt-6">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:account-child" className="text-primary text-2xl" />
                            <div>
                                <h3 className="text-lg font-semibold">Registered Guardians</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                                    {parents.length} parent{parents.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="px-0 pb-4">
                        <Table aria-label="Parents Table" removeWrapper className="px-2">
                            <TableHeader>
                                <TableColumn>GUARDIAN</TableColumn>
                                <TableColumn>CONTACT</TableColumn>
                                <TableColumn>CHILDREN</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent={"No parents found"} isLoading={loading}>
                                {parents.map((parent) => (
                                    <TableRow key={parent.id}>
                                        <TableCell>
                                            <User
                                                name={parent.guardianName}
                                                description={parent.occupation}
                                                avatarProps={{
                                                    src: `https://i.pravatar.cc/150?u=${parent.id}`
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-small">{parent.User?.email}</span>
                                                <span className="text-tiny text-default-400">{parent.User?.phone || "N/A"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {parent.Students && parent.Students.length > 0 ? (
                                                <div className="flex gap-1 flex-wrap">
                                                    {parent.Students.map(student => (
                                                        <Chip key={student.id} size="sm" variant="flat">
                                                            {student.name}
                                                        </Chip>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-default-400 italic">No students linked</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip color="success" size="sm" variant="dot">Active</Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative flex items-center gap-2">
                                                <Tooltip content="Link Student">
                                                    <span
                                                        className="text-lg text-primary cursor-pointer active:opacity-50"
                                                        onClick={() => navigate(`/parents/${parent.id}/link-students`, { state: { parent } })}
                                                    >
                                                        <Icon icon="mdi:account-plus" />
                                                    </span>
                                                </Tooltip>
                                                <Tooltip content="Edit Parent">
                                                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                        <Icon icon="mdi:pencil" />
                                                    </span>
                                                </Tooltip>
                                            </div>
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
