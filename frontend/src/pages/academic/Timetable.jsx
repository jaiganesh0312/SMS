import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Spinner, addToast } from "@heroui/react";
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import academicService from '@/services/academicService';
import staffService from '@/services/staffService';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Timetable = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [timetable, setTimetable] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


    // Single Entry Form Data
    const [formData, setFormData] = useState({
        classId: '',
        subjectId: '',
        teacherId: '',
        day: '',
        startTime: '',
        endTime: '',
        room: ''
    });



    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [timetableRes, classesRes, subjectsRes, staffRes] = await Promise.all([
                academicService.getTimetable(),
                academicService.getAllClasses(),
                academicService.getAllSubjects(),
                staffService.getAllStaff()
            ]);

            if (timetableRes?.data?.success) {
                const timetableData = timetableRes.data.data?.timetable || timetableRes.data.data;
                setTimetable(Array.isArray(timetableData) ? timetableData : []);
            }

            if (classesRes?.data?.success) {
                const classData = classesRes.data.data?.classes;
                setClasses(Array.isArray(classData) ? classData : []);
            }

            if (subjectsRes?.data?.success) {
                const subjectData = subjectsRes.data.data?.subjects;
                setSubjects(Array.isArray(subjectData) ? subjectData : []);
            }

            if (staffRes?.data?.success) {
                const allStaff = Array.isArray(staffRes.data.data?.staff) ? staffRes.data.data.staff : [];
                // Filter for teachers
                const teachersList = allStaff.filter(s =>
                    s.role === 'TEACHER' ||
                    s.role === 'teacher' ||
                    s.roles?.includes('teacher') ||
                    s.workingAs === 'TEACHER' ||
                    (s.designation && s.designation.toLowerCase().includes('teacher'))
                );
                setTeachers(teachersList);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleSelectionChange = (name, keys) => {
        if (!keys) return;
        const value = Array.from(keys)[0];
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const response = await academicService.createTimetableEntry(formData);
            if (response?.data?.success) {
                setIsCreateModalOpen(false);
                fetchInitialData();
                setFormData({
                    classId: '',
                    subjectId: '',
                    teacherId: '',
                    day: '',
                    startTime: '',
                    endTime: '',
                    room: ''
                });
            } else {
                addToast({ title: "Error", description: response?.data?.message || 'Failed to create entry', color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: 'An error occurred', color: "danger" });
        } finally {
            setSaving(false);
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
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
                    <p className="text-sm text-default-500">Manage class schedules</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                        color="secondary"
                        variant="flat"
                        startContent={<Icon icon="mdi:calendar-edit" />}
                        onPress={() => navigate('/academic/timetable/create-daily')}
                        className="w-full sm:w-auto"
                    >
                        Create Daily Timetable
                    </Button>
                    <Button
                        color="primary"
                        startContent={<Icon icon="mdi:plus" />}
                        onPress={() => setIsCreateModalOpen(true)}
                        className="w-full sm:w-auto"
                    >
                        Single Entry
                    </Button>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-6">
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardHeader className="px-6 pt-6">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:calendar-month" className="text-primary text-2xl" />
                            <h3 className="text-lg font-semibold text-foreground">Weekly Schedule</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6">
                        {loading ? (
                            <div className="flex justify-center p-10"><Spinner /></div>
                        ) : timetable.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-default-200 bg-default-100 text-default-500">
                                        <tr>
                                            <th className="p-3 font-semibold">Day</th>
                                            <th className="p-3 font-semibold">Class</th>
                                            <th className="p-3 font-semibold">Subject</th>
                                            <th className="p-3 font-semibold">Time</th>
                                            <th className="p-3 font-semibold hidden lg:table-cell">Teacher</th>
                                            <th className="p-3 font-semibold hidden md:table-cell">Room</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-default-200">
                                        {timetable.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-default-50 transition-colors">
                                                <td className="p-3 font-medium">{entry.day || entry.dayOfWeek || '-'}</td>
                                                <td className="p-3">{entry.Class?.name} - {entry.Class?.section}</td>
                                                <td className="p-3">{entry.Subject?.name || entry.Subject?.code}</td>
                                                <td className="p-3">{entry.startTime} - {entry.endTime}</td>
                                                <td className="p-3 hidden lg:table-cell">
                                                    {entry.User?.name || `${entry.User?.firstName} ${entry.User?.lastName}` || '-'}
                                                </td>
                                                <td className="p-3 hidden md:table-cell">{entry.classroom || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center py-10">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Icon icon="mdi:calendar-clock" className="text-3xl text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">No Timetable Found</h3>
                                <p className="text-default-500 mb-6 max-w-sm">
                                    Create a timetable structure to start managing class schedules and teacher assignments.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        color="secondary"
                                        variant="flat"
                                        startContent={<Icon icon="mdi:calendar-edit" />}
                                        onPress={() => navigate('/academic/timetable/create-daily')}
                                        className="w-full sm:w-auto"
                                    >
                                        Create Daily Timetable
                                    </Button>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        startContent={<Icon icon="mdi:plus" />}
                                        onPress={() => setIsCreateModalOpen(true)}
                                        className="w-full sm:w-auto"
                                    >
                                        Create First Entry
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </motion.div>

            {/* Single Entry Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                size="2xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Create Timetable Entry</ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block text-default-700">Class</label>
                                        <Select
                                            placeholder="Select Class"
                                            aria-label="Select Class"
                                            onSelectionChange={(keys) => handleSelectionChange('classId', keys)}
                                            selectedKeys={formData.classId ? new Set([String(formData.classId)]) : new Set()}
                                            variant="bordered"
                                        >
                                            {classes?.map(c => (
                                                <SelectItem key={String(c.id)} textValue={`${c.name} - ${c.section}`}>
                                                    {c.name} - {c.section}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <div className="text-xs text-default-400 mt-1">
                                            {classes.length === 0 ? "No classes found" : `${classes.length} classes available`}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block text-default-700">Subject</label>
                                        <Select
                                            placeholder="Select Subject"
                                            aria-label="Select Subject"
                                            onSelectionChange={(keys) => handleSelectionChange('subjectId', keys)}
                                            selectedKeys={formData.subjectId ? new Set([String(formData.subjectId)]) : new Set()}
                                            variant="bordered"
                                        >
                                            {subjects?.map(s => (
                                                <SelectItem key={String(s.id)} textValue={`${s.name} (${s.code})`}>
                                                    {s.name} ({s.code})
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <div className="text-xs text-default-400 mt-1">
                                            {subjects.length === 0 ? "No subjects found" : `${subjects.length} subjects available`}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block text-default-700">Day</label>
                                        <Select
                                            placeholder="Select Day"
                                            aria-label="Select Day"
                                            onSelectionChange={(keys) => handleSelectionChange('day', keys)}
                                            selectedKeys={formData.day ? new Set([formData.day]) : new Set()}
                                            variant="bordered"
                                        >
                                            {days.map(d => (
                                                <SelectItem key={d.toUpperCase()} textValue={d} value={d.toUpperCase()}>
                                                    {d}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block text-default-700">Teacher</label>
                                        <Select
                                            placeholder="Assign Teacher"
                                            aria-label="Assign Teacher"
                                            onSelectionChange={(keys) => handleSelectionChange('teacherId', keys)}
                                            selectedKeys={formData.teacherId ? new Set([String(formData.teacherId)]) : new Set()}
                                            variant="bordered"
                                        >
                                            {teachers?.map(t => (
                                                <SelectItem key={String(t.id)} textValue={`${t.name} - ${t.staffProfile?.designation || t.staffProfile?.workingAs || t.designation || t.workingAs || 'Teacher'}`}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{t.name}</span>
                                                        <span className="text-tiny text-default-400">{t.staffProfile?.designation || t.staffProfile?.workingAs || t.designation || t.workingAs || 'Teacher'}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <div className="text-xs text-default-400 mt-1">
                                            {teachers.length === 0 ? "No teachers found" : `${teachers.length} teachers available`}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block text-default-700">Start Time</label>
                                        <Input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            variant="bordered"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block text-default-700">End Time</label>
                                        <Input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            variant="bordered"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-1 block text-default-700">Room/Location</label>
                                        <Input
                                            placeholder="e.g. Room 101"
                                            name="room"
                                            value={formData.room}
                                            onChange={handleInputChange}
                                            variant="bordered"
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleSubmit} isLoading={saving}>
                                    Save Entry
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>


        </motion.div>
    );
};

export default Timetable;
