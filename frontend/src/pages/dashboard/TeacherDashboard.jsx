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
    useDisclosure
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
            console.error("Error fetching class:", error);
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
            console.error("Error creating announcement:", error);
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
            className="p-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Teacher Dashboard
                    </h1>
                    <p className="text-gray-500">Welcome back, {user?.name}</p>
                </div>
            </motion.div>

            {/* Class Teacher Widget */}
            {myClass && (
                <motion.div variants={itemVariants}>
                    <Card className="shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
                        <CardBody className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm">
                                        <Icon icon="mdi:google-classroom" className="text-3xl text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">Class Teacher: {myClass.name} - {myClass.section}</h2>
                                        <p className="text-gray-600">{myClass.Students ? myClass.Students.length : 0} Students Assigned</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        color="primary"
                                        className="shadow-md"
                                        startContent={<Icon icon="mdi:account-school" />}
                                        onPress={() => navigate('/teacher/my-students')}
                                    >
                                        My Students
                                    </Button>
                                    <Button
                                        color="secondary"
                                        className="shadow-md"
                                        startContent={<Icon icon="mdi:bullhorn" />}
                                        onPress={onOpen}
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
                <Card className="shadow-sm">
                    <CardHeader className="px-6 pt-6">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:calendar-check" className="text-primary text-2xl" />
                            <div>
                                <h3 className="text-lg font-semibold">Quick Actions</h3>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="px-6 pb-6 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            <Button
                                className="w-full justify-start h-auto py-4 px-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                onPress={() => navigate('/teacher/my-periods')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-purple-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:clock-time-four-outline" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">My Periods</p>
                                        <p className="text-xs opacity-80">View my schedule</p>
                                    </div>
                                </div>
                            </Button>

                            <Button
                                className="w-full justify-start h-auto py-4 px-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                                onPress={() => navigate('/teacher/my-class-timetable')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-orange-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:calendar-multiselect" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">Class Timetable</p>
                                        <p className="text-xs opacity-80">Managed class schedule</p>
                                    </div>
                                </div>
                            </Button>
                            <Button
                                className="w-full justify-start h-auto py-4 px-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                                onPress={() => window.location.href = '/attendance/mark'}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-green-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:calendar-edit" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">Mark Attendance</p>
                                        <p className="text-xs opacity-80">Record daily entries</p>
                                    </div>
                                </div>
                            </Button>

                            <Button
                                className="w-full justify-start h-auto py-4 px-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                onPress={() => window.location.href = '/attendance/report'}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-blue-800 rounded-lg shadow-sm">
                                        <Icon icon="mdi:chart-bar" className="text-xl" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">View Reports</p>
                                        <p className="text-xs opacity-80">Check attendance history</p>
                                    </div>
                                </div>
                            </Button>

                            <Button
                                className="w-full justify-start h-auto py-4 px-4 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                onPress={() => window.location.href = '/my-leaves'}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-amber-800 rounded-lg shadow-sm">
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
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit(handleCreateAnnouncement)}>
                            <ModalHeader>Class Announcement</ModalHeader>
                            <ModalBody>
                                <p className="text-sm text-gray-500 mb-4">
                                    Creating announcement for <strong>{myClass?.name} - {myClass?.section}</strong>
                                </p>
                                <div className="space-y-4">
                                    <Input
                                        {...register('title', { required: true })}
                                        label="Title"
                                        placeholder="e.g. Picnic Tomorrow"
                                    />
                                    <Textarea
                                        {...register('message', { required: true })}
                                        label="Message"
                                        placeholder="Enter details..."
                                    />
                                    <Select
                                        {...register('priority')}
                                        label="Priority"
                                        defaultSelectedKeys={['MEDIUM']}
                                    >
                                        <SelectItem key="LOW" value="LOW">Low</SelectItem>
                                        <SelectItem key="MEDIUM" value="MEDIUM">Medium</SelectItem>
                                        <SelectItem key="HIGH" value="HIGH">High</SelectItem>
                                    </Select>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
                                <Button color="primary" type="submit">Post Announcement</Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </motion.div>
    );
}
