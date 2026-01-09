import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Textarea,
    Select,
    SelectItem,
    useDisclosure,
    Chip
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from '@/context/AuthContext';
import { motion } from "framer-motion";
import teacherService from '@/services/teacherService';
import announcementService from '@/services/announcementService';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myClass, setMyClass] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        fetchMyClass();
    }, []);

    const fetchMyClass = async () => {
        try {
            const response = await teacherService.getMyClass();
            if (response.data?.success) {
                setMyClass(response.data.data);
            }
        } catch (error) {
        }
    };

    const handleCreateAnnouncement = async (data) => {
        if (!myClass) return;
        try {
            const payload = {
                ...data,
                targetClassId: myClass.id,
                priority: data.priority || 'MEDIUM'
            };
            const response = await announcementService.createAnnouncement(payload);
            if (response.success) { // service returns response.data
                onClose();
                reset();
                // Optionally show success toast
            }
        } catch (error) {
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
            className="p-4 md:p-6 space-y-4 md:space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Teacher Dashboard
                </h1>
                <p className="text-default-800">Welcome back, {user?.name}</p>
            </motion.div>

            {/* Class Teacher Widget */}
            {myClass && (
                <motion.div className='p-2'>
                    <Card className="shadow-md border-none bg-gradient-to-r from-primary-600 to-primary-900 text-white ">
                        <CardBody className="p-6 relative overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                    <div className="p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
                                        <Icon icon="mdi:google-classroom" className="text-2xl md:text-3xl text-secondary-300" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Chip size="sm" variant="shadow" classNames={{ base: "bg-secondary-500 text-primary-900", content: "font-bold tracking-wide" }}>CLASS TEACHER</Chip>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{myClass.name} - {myClass.section}</h2>
                                        <p className="text-primary-100 mt-1 font-medium flex items-center gap-2">
                                            <Icon icon="mdi:account-group" />
                                            {myClass.Students ? myClass.Students.length : 0} Students Assigned
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full lg:w-auto">
                                    <Button
                                        className="bg-primary-700/50 hover:bg-primary-700 text-white border border-white/20 font-semibold shadow-lg backdrop-blur-sm w-full sm:w-auto"
                                        startContent={<Icon icon="mdi:account-school" className="text-xl" />}
                                        onPress={() => navigate('/teacher/my-students')}
                                        size="sm"
                                    >
                                        My Students
                                    </Button>
                                    <Button
                                        className="bg-secondary-500 text-primary-900 font-bold shadow-lg shadow-secondary-500/20 w-full sm:w-auto"
                                        startContent={<Icon icon="mdi:bullhorn" className="text-xl" />}
                                        onPress={onOpen}
                                        size="sm"
                                    >
                                        Make Announcement
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            )}

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm bg-content1 border border-default-200 dark:border-default-100">
                    <CardHeader className="px-6 pt-6">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:calendar-check" className="text-secondary-500 text-2xl" />
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
                                <p className="text-sm text-default-800">Manage your daily tasks</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 md:px-6 pb-4 md:pb-6 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            <Button
                                className="w-full justify-start h-auto py-4 px-4 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                                onPress={() => navigate('/teacher/my-periods')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-primary-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:clock-time-four-outline" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">My Periods</p>
                                        <p className="text-xs opacity-80">View my schedule</p>
                                    </div>
                                </div>
                            </Button>

                            <Button
                                className="w-full justify-start h-auto py-4 px-4 bg-warning-50 dark:bg-warning-900/20 hover:bg-warning-100 dark:hover:bg-warning-900/40 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800"
                                onPress={() => navigate('/teacher/my-class-timetable')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-warning-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:calendar-multiselect" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">Class Timetable</p>
                                        <p className="text-xs opacity-80">Managed class schedule</p>
                                    </div>
                                </div>
                            </Button>
                            <Button
                                className="w-full justify-start h-auto py-4 px-4 bg-success-50 dark:bg-success-900/20 hover:bg-success-100 dark:hover:bg-success-900/40 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-800"
                                onPress={() => window.location.href = '/attendance/mark'}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-success-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:calendar-edit" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">Mark Attendance</p>
                                        <p className="text-xs opacity-80">Record daily entries</p>
                                    </div>
                                </div>
                            </Button>

                            <Button
                                className="w-full justify-start h-auto py-4 px-4 bg-secondary-50 dark:bg-secondary-900/20 hover:bg-secondary-100 dark:hover:bg-secondary-900/40 text-secondary-700 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-800"
                                onPress={() => window.location.href = '/attendance/report'}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-secondary-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:chart-bar" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">View Reports</p>
                                        <p className="text-xs opacity-80">Check attendance history</p>
                                    </div>
                                </div>
                            </Button>

                            <Button
                                className="w-full justify-start h-auto py-4 px-4 bg-default-100 dark:bg-default-100/10 hover:bg-default-200 dark:hover:bg-default-200/20 text-default-700 dark:text-default-300 border border-default-200 dark:border-default-700"
                                onPress={() => window.location.href = '/my-leaves'}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-default-700 rounded-lg shadow-sm">
                                        <Icon icon="mdi:calendar-account" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">Apply Leave</p>
                                        <p className="text-xs opacity-80">My leave requests</p>
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Create Announcement Modal */}
            <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" classNames={{
                base: "bg-content1 dark:bg-content1 border border-default-200",
                header: "border-b border-default-200",
                footer: "border-t border-default-200",
                closeButton: "hover:bg-default-100 active:bg-default-200"
            }}>
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit(handleCreateAnnouncement)}>
                            <ModalHeader className="flex flex-col gap-1">
                                <span className="text-xl font-bold">Class Announcement</span>
                            </ModalHeader>
                            <ModalBody className="py-6">
                                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800 mb-2">
                                    <p className="text-sm text-primary-700 dark:text-primary-300">
                                        Target Class: <strong>{myClass?.name} - {myClass?.section}</strong>
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <Input
                                        {...register('title', { required: true })}
                                        label="Announcement Title"
                                        placeholder="e.g. Picnic Tomorrow"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        classNames={{
                                            inputWrapper: "bg-default-50 hover:bg-default-100",
                                        }}
                                    />
                                    <Textarea
                                        {...register('message', { required: true })}
                                        label="Message Details"
                                        placeholder="Enter full details regarding the announcement..."
                                        variant="bordered"
                                        labelPlacement="outside"
                                        minRows={3}
                                        classNames={{
                                            inputWrapper: "bg-default-50 hover:bg-default-100",
                                        }}
                                    />
                                    <Select
                                        {...register('priority')}
                                        label="Priority Level"
                                        defaultSelectedKeys={['MEDIUM']}
                                        variant="bordered"
                                        labelPlacement="outside"
                                    >
                                        <SelectItem key="LOW" value="LOW" startContent={<Icon icon="mdi:arrow-down" className="text-success" />}>Low Priority</SelectItem>
                                        <SelectItem key="MEDIUM" value="MEDIUM" startContent={<Icon icon="mdi:minus" className="text-warning" />}>Medium Priority</SelectItem>
                                        <SelectItem key="HIGH" value="HIGH" startContent={<Icon icon="mdi:arrow-up" className="text-danger" />}>High Priority</SelectItem>
                                    </Select>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit" className="shadow-md shadow-primary/20">
                                    Post Announcement
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </motion.div>
    );
}
