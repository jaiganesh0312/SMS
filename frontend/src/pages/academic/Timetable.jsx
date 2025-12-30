import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Spinner, addToast } from "@heroui/react";
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import academicService from '@/services/academicService';
import staffService from '@/services/staffService';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Timetable = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [timetable, setTimetable] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDailyCreateModalOpen, setIsDailyCreateModalOpen] = useState(false); // New modal state

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

    // Daily Creation Wizard State
    const [dailyStep, setDailyStep] = useState(1);
    const [dailyFormData, setDailyFormData] = useState({
        classId: '',
        day: '',
        periodCount: '',
        schoolStartTime: '08:00',
        schoolEndTime: '14:00',
        periods: [] // Array of { id, startTime, endTime, subjectId, teacherId, room }
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
            console.error("Error fetching data:", error);
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
            console.error("Error creating timetable entry:", error);
            addToast({ title: "Error", description: 'An error occurred', color: "danger" });
        } finally {
            setSaving(false);
        }
    };

    // --- Daily Creation Wizard Handlers ---

    const handleDailySelectionChange = (name, keys) => {
        if (!keys) return;
        const value = Array.from(keys)[0];
        setDailyFormData(prev => {
            const newData = { ...prev, [name]: value };

            // If period count changes, re-initialize periods array if needed
            if (name === 'periodCount') {
                const count = parseInt(value) || 0;
                // Preserve existing periods if reducing count, or add new empty ones
                const currentPeriods = prev.periods.slice(0, count);
                const newPeriods = [...currentPeriods];
                while (newPeriods.length < count) {
                    newPeriods.push({
                        id: newPeriods.length + 1,
                        startTime: '',
                        endTime: '',
                        subjectId: '',
                        teacherId: '',
                        room: ''
                    });
                }
                newData.periods = newPeriods;
                console.log("Periods:", newData.periods);
            }
            return newData;
        });
    };

    const handleDailyInputChange = (e) => {
        const { name, value } = e.target;
        setDailyFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePeriodChange = (index, field, value) => {
        setDailyFormData(prev => {
            const newPeriods = [...prev.periods];
            newPeriods[index] = { ...newPeriods[index], [field]: value };
            return { ...prev, periods: newPeriods };
        });
    };

    const generateTimeSlots = () => {
        // Simple helper to distribute time equally (optional, for convenience)
        // For now, we just rely on manual input or basic defaults user enters
        // But we could auto-fill based on schoolStartTime/EndTime later if requested.
    };

    const handleDailySubmit = async () => {
        setSaving(true);
        try {
            // Transform data to match backend expectation
            const payload = {
                classId: dailyFormData.classId,
                dayOfWeek: dailyFormData.day, // Backend expects dayOfWeek
                periods: dailyFormData.periods.map(p => ({
                    subjectId: p.subjectId,
                    teacherId: p.teacherId,
                    startTime: p.startTime,
                    endTime: p.endTime,
                    room: p.room
                }))
            };

            const response = await academicService.createDailyTimetable(payload);

            if (response?.data?.success) {
                addToast({ title: "Success", description: response.data.message || "Daily Timetable Created Successfully", color: "success" });
                setIsDailyCreateModalOpen(false);
                fetchInitialData();
                setDailyStep(1);
                setDailyFormData({
                    classId: '',
                    day: '',
                    periodCount: '',
                    schoolStartTime: '08:00',
                    schoolEndTime: '14:00',
                    periods: []
                });
            } else {
                addToast({ title: "Error", description: response?.data?.message || "Failed to create daily timetable", color: "danger" });
            }
        } catch (error) {
            console.error("Error creating daily timetable:", error);
            addToast({ title: "Error", description: "An error occurred while creating the timetable", color: "danger" });
        } finally {
            setSaving(false);
        }
    };

    const renderDailyStep1 = () => (
        <div className="grid grid-cols-1 gap-4">
            <div>
                <label className="text-sm font-medium mb-1 block">Class</label>
                <Select
                    placeholder="Select Class"
                    onSelectionChange={(keys) => handleDailySelectionChange('classId', keys)}
                    selectedKeys={dailyFormData.classId ? new Set([dailyFormData.classId]) : new Set()}
                >
                    {classes.map(c => (
                        <SelectItem key={String(c.id)} textValue={`${c.name} - ${c.section}`}>
                            {c.name} - {c.section}
                        </SelectItem>
                    ))}
                </Select>
            </div>
            <div>
                <label className="text-sm font-medium mb-1 block">Day</label>
                <Select
                    placeholder="Select Day"
                    onSelectionChange={(keys) => handleDailySelectionChange('day', keys)}
                    selectedKeys={dailyFormData.day ? new Set([dailyFormData.day]) : new Set()}
                >
                    {days.map(d => (
                        <SelectItem key={d.toUpperCase()} textValue={d} value={d.toUpperCase()}>
                            {d}
                        </SelectItem>
                    ))}
                </Select>
            </div>
            <div>
                <label className="text-sm font-medium mb-1 block">Number of Periods</label>
                <Input
                    type="number"
                    min="1"
                    max="15"
                    name="periodCount"
                    value={dailyFormData.periodCount}
                    onChange={handleDailyInputChange}
                    // Trigger update via onBlur or onChange carefully to resize array
                    onBlur={(e) => handleDailySelectionChange('periodCount', new Set([e.target.value]))}
                />
            </div>
        </div>
    );

    const renderDailyStep2 = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                    <label className="text-sm font-medium mb-1 block">School Start Time</label>
                    <Input
                        type="time"
                        name="schoolStartTime"
                        value={dailyFormData.schoolStartTime}
                        onChange={handleDailyInputChange}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">School End Time</label>
                    <Input
                        type="time"
                        name="schoolEndTime"
                        value={dailyFormData.schoolEndTime}
                        onChange={handleDailyInputChange}
                    />
                </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-3">
                {dailyFormData.periods.map((period, index) => (
                    <div key={index} className="flex gap-3 items-end bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <div className="w-16 pt-2 font-semibold text-sm text-gray-500">
                            P-{index + 1}
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1 block">Start</label>
                            <Input
                                type="time"
                                size="sm"
                                value={period.startTime}
                                onChange={(e) => handlePeriodChange(index, 'startTime', e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1 block">End</label>
                            <Input
                                type="time"
                                size="sm"
                                value={period.endTime}
                                onChange={(e) => handlePeriodChange(index, 'endTime', e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderDailyStep3 = () => (
        <div className="max-h-[500px] overflow-y-auto space-y-4">
            {dailyFormData.periods.map((period, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-primary">Period {index + 1}</h4>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {period.startTime || '--:--'} - {period.endTime || '--:--'}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Select
                                placeholder="Select Subject"
                                aria-label={`Subject for Period ${index + 1}`}
                                size="sm"
                                selectedKeys={period.subjectId ? new Set([String(period.subjectId)]) : new Set()}
                                onSelectionChange={(keys) => handlePeriodChange(index, 'subjectId', Array.from(keys)[0])}
                            >
                                {subjects.map(s => (
                                    <SelectItem key={String(s.id)} textValue={s.name}>
                                        {s.name} ({s.code})
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <Select
                                placeholder="Assign Teacher"
                                aria-label={`Teacher for Period ${index + 1}`}
                                size="sm"
                                selectedKeys={period.teacherId ? new Set([String(period.teacherId)]) : new Set()}
                                onSelectionChange={(keys) => handlePeriodChange(index, 'teacherId', Array.from(keys)[0])}
                            >
                                {teachers.map(t => (
                                    <SelectItem key={String(t.id)} textValue={`${t.name} - ${t.staffProfile?.designation || t.staffProfile?.workingAs || t.designation || t.workingAs || 'Teacher'}`}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{t.name}</span>
                                            <span className="text-tiny text-gray-500">{t.staffProfile?.designation || t.staffProfile?.workingAs || t.designation || t.workingAs || 'Teacher'}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

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
            <motion.div variants={itemVariants} className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timetable</h1>
                    <p className="text-sm text-gray-500">Manage class schedules</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        color="secondary"
                        variant="flat"
                        startContent={<Icon icon="mdi:calendar-edit" />}
                        onPress={() => setIsDailyCreateModalOpen(true)}
                    >
                        Create Daily Timetable
                    </Button>
                    <Button
                        color="primary"
                        startContent={<Icon icon="mdi:plus" />}
                        onPress={() => setIsCreateModalOpen(true)}
                    >
                        Single Entry
                    </Button>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-6">
                <Card className="shadow-sm">
                    <CardHeader className="px-6 pt-6">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:calendar-month" className="text-primary text-2xl" />
                            <h3 className="text-lg font-semibold">Weekly Schedule</h3>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6">
                        {loading ? (
                            <div className="flex justify-center p-10"><Spinner /></div>
                        ) : timetable.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="p-3">Day</th>
                                            <th className="p-3">Class</th>
                                            <th className="p-3">Subject</th>
                                            <th className="p-3">Time</th>
                                            <th className="p-3">Teacher</th>
                                            <th className="p-3">Room</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timetable.map((entry) => (
                                            <tr key={entry.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="p-3 font-medium">{entry.day || entry.dayOfWeek || '-'}</td>
                                                <td className="p-3">{entry.Class?.name} - {entry.Class?.section}</td>
                                                <td className="p-3">{entry.Subject?.name || entry.Subject?.code}</td>
                                                <td className="p-3">{entry.startTime} - {entry.endTime}</td>
                                                <td className="p-3">
                                                    {entry.User?.name || `${entry.User?.firstName} ${entry.User?.lastName}` || '-'}
                                                </td>
                                                <td className="p-3">{entry.classroom || '-'}</td>
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
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Timetable Found</h3>
                                <p className="text-gray-500 mb-6 max-w-sm">
                                    Create a timetable structure to start managing class schedules and teacher assignments.
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        color="secondary"
                                        variant="flat"
                                        startContent={<Icon icon="mdi:calendar-edit" />}
                                        onPress={() => setIsDailyCreateModalOpen(true)}
                                    >
                                        Create Daily Timetable
                                    </Button>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        startContent={<Icon icon="mdi:plus" />}
                                        onPress={() => setIsCreateModalOpen(true)}
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
                                        <label className="text-sm font-medium mb-1 block">Class</label>
                                        <Select
                                            placeholder="Select Class"
                                            aria-label="Select Class"
                                            onSelectionChange={(keys) => handleSelectionChange('classId', keys)}
                                            selectedKeys={formData.classId ? new Set([String(formData.classId)]) : new Set()}
                                        >
                                            {classes?.map(c => (
                                                <SelectItem key={String(c.id)} textValue={`${c.name} - ${c.section}`}>
                                                    {c.name} - {c.section}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {classes.length === 0 ? "No classes found" : `${classes.length} classes available`}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Subject</label>
                                        <Select
                                            placeholder="Select Subject"
                                            aria-label="Select Subject"
                                            onSelectionChange={(keys) => handleSelectionChange('subjectId', keys)}
                                            selectedKeys={formData.subjectId ? new Set([String(formData.subjectId)]) : new Set()}
                                        >
                                            {subjects?.map(s => (
                                                <SelectItem key={String(s.id)} textValue={`${s.name} (${s.code})`}>
                                                    {s.name} ({s.code})
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {subjects.length === 0 ? "No subjects found" : `${subjects.length} subjects available`}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Day</label>
                                        <Select
                                            placeholder="Select Day"
                                            aria-label="Select Day"
                                            onSelectionChange={(keys) => handleSelectionChange('day', keys)}
                                            selectedKeys={formData.day ? new Set([formData.day]) : new Set()}
                                        >
                                            {days.map(d => (
                                                <SelectItem key={d.toUpperCase()} textValue={d} value={d.toUpperCase()}>
                                                    {d}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Teacher</label>
                                        <Select
                                            placeholder="Assign Teacher"
                                            aria-label="Assign Teacher"
                                            onSelectionChange={(keys) => handleSelectionChange('teacherId', keys)}
                                            selectedKeys={formData.teacherId ? new Set([String(formData.teacherId)]) : new Set()}
                                        >
                                            {teachers?.map(t => (
                                                <SelectItem key={String(t.id)} textValue={`${t.name} - ${t.staffProfile?.designation || t.staffProfile?.workingAs || t.designation || t.workingAs || 'Teacher'}`}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{t.name}</span>
                                                        <span className="text-tiny text-gray-500">{t.staffProfile?.designation || t.staffProfile?.workingAs || t.designation || t.workingAs || 'Teacher'}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {teachers.length === 0 ? "No teachers found" : `${teachers.length} teachers available`}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Start Time</label>
                                        <Input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">End Time</label>
                                        <Input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-1 block">Room/Location</label>
                                        <Input
                                            placeholder="e.g. Room 101"
                                            name="room"
                                            value={formData.room}
                                            onChange={handleInputChange}
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

            {/* Daily Timetable Wizard Modal */}
            <Modal
                isOpen={isDailyCreateModalOpen}
                onClose={() => setIsDailyCreateModalOpen(false)}
                size="3xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex justify-between items-center">
                                <span>Create Daily Timetable</span>
                                <span className="text-sm font-normal text-gray-500 mr-8">Step {dailyStep} of 3</span>
                            </ModalHeader>
                            <ModalBody>
                                {dailyStep === 1 && renderDailyStep1()}
                                {dailyStep === 2 && renderDailyStep2()}
                                {dailyStep === 3 && renderDailyStep3()}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <div className="flex gap-2">
                                    {dailyStep > 1 && (
                                        <Button onPress={() => setDailyStep(prev => prev - 1)}>
                                            Back
                                        </Button>
                                    )}
                                    {dailyStep < 3 ? (
                                        <Button color="primary" onPress={() => setDailyStep(prev => prev + 1)} isDisabled={
                                            (dailyStep === 1 && (!dailyFormData.classId || !dailyFormData.day || !dailyFormData.periodCount))
                                        }>
                                            Next
                                        </Button>
                                    ) : (
                                        <Button color="success" className="text-white" onPress={handleDailySubmit}>
                                            Create Full Day Schedule
                                        </Button>
                                    )}
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </motion.div>
    );
};

export default Timetable;
