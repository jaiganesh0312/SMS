import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Input, Select, SelectItem, Spinner, addToast } from "@heroui/react";
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import academicService from '@/services/academicService';
import staffService from '@/services/staffService';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const CreateDailyTimetable = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [step, setStep] = useState(1);
    const [error, setError] = useState(null); // New error state

    const [formData, setFormData] = useState({
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
        setError(null);
        try {
            const [classesRes, subjectsRes, staffRes] = await Promise.all([
                academicService.getAllClasses(),
                academicService.getAllSubjects(),
                staffService.getAllStaff()
            ]);

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
            setError("Failed to load initial data. Please try refreshing the page.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectionChange = (name, keys) => {
        if (!keys) return;
        const value = Array.from(keys)[0];
        setFormData(prev => {
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
            }
            return newData;
        });
        if (error) setError(null); // Clear error on change
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null); // Clear error on change
    };

    const handlePeriodChange = (index, field, value) => {
        setFormData(prev => {
            const newPeriods = [...prev.periods];
            newPeriods[index] = { ...newPeriods[index], [field]: value };
            return { ...prev, periods: newPeriods };
        });
        if (error) setError(null); // Clear error on change
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);
        try {
            // Transform data to match backend expectation
            const payload = {
                classId: formData.classId,
                dayOfWeek: formData.day, // Backend expects dayOfWeek
                periods: formData.periods.map(p => ({
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
                navigate('/academic/timetable');
            } else {
                setError(response?.data?.message || "Failed to create daily timetable");
            }
        } catch (error) {
            console.error("Error creating daily timetable:", error);
            const errorMsg = error.response?.data?.message || "An error occurred while creating the timetable";
            setError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const renderStep1 = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Step 1: Basic Configuration</h3>
            </div>
            <div>
                <label className="text-sm font-medium mb-1.5 block text-gray-700 dark:text-gray-300">Class</label>
                <Select
                    placeholder="Select Class"
                    onSelectionChange={(keys) => handleSelectionChange('classId', keys)}
                    selectedKeys={formData.classId ? new Set([formData.classId]) : new Set()}
                >
                    {classes.map(c => (
                        <SelectItem key={String(c.id)} textValue={`${c.name} - ${c.section}`}>
                            {c.name} - {c.section}
                        </SelectItem>
                    ))}
                </Select>
            </div>
            <div>
                <label className="text-sm font-medium mb-1.5 block text-gray-700 dark:text-gray-300">Day</label>
                <Select
                    placeholder="Select Day"
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
                <label className="text-sm font-medium mb-1.5 block text-gray-700 dark:text-gray-300">Number of Periods</label>
                <Input
                    type="number"
                    min="1"
                    max="15"
                    name="periodCount"
                    value={formData.periodCount}
                    onChange={handleInputChange}
                    onBlur={(e) => handleSelectionChange('periodCount', new Set([e.target.value]))}
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Step 2: Time Slots</h3>
                <p className="text-sm text-gray-500 mb-4">Define the start and end time for each period.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.periods.map((period, index) => (
                    <Card key={index} className="bg-gray-50 dark:bg-gray-800/50 border-none shadow-sm">
                        <CardBody className="p-4">
                            <h4 className="font-semibold text-primary mb-3">Period {index + 1}</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                                    <Input
                                        type="time"
                                        size="sm"
                                        value={period.startTime}
                                        onChange={(e) => handlePeriodChange(index, 'startTime', e.target.value)}
                                        aria-label={`Start Time Period ${index + 1}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                                    <Input
                                        type="time"
                                        size="sm"
                                        value={period.endTime}
                                        onChange={(e) => handlePeriodChange(index, 'endTime', e.target.value)}
                                        aria-label={`End Time Period ${index + 1}`}
                                    />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Step 3: Assign Subjects & Teachers</h3>
                <p className="text-sm text-gray-500 mb-4">Assign a subject and teacher for each period.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {formData.periods.map((period, index) => (
                    <div key={index} className="p-4 border rounded-xl hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <div className="flex flex-wrap md:flex-nowrap justify-between items-center mb-4 gap-2">
                            <h4 className="font-semibold text-primary">Period {index + 1}</h4>
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full font-medium text-gray-600 dark:text-gray-300">
                                {period.startTime || '--:--'} - {period.endTime || '--:--'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Subject</label>
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
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Teacher</label>
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
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Room (Optional)</label>
                                <Input
                                    placeholder="e.g. 101"
                                    size="sm"
                                    value={period.room}
                                    onChange={(e) => handlePeriodChange(index, 'room', e.target.value)}
                                    aria-label={`Room for Period ${index + 1}`}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-100px)]"><Spinner size="lg" /></div>;

    return (
        <motion.div
            className="p-6 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex items-center gap-4 mb-6">
                <Button isIconOnly variant="light" onPress={() => navigate('/academic/timetable')}>
                    <Icon icon="mdi:arrow-left" className="text-2xl" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Daily Timetable</h1>
                    <p className="text-sm text-gray-500">Configure schedule for a specific class and day</p>
                </div>
            </div>

            <Card className="min-h-[500px]">
                <CardBody className="p-8">
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 flex items-start gap-3">
                            <Icon icon="mdi:alert-circle" className="text-xl mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm">Action Failed</h4>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    )}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </CardBody>
                <div className="p-6 border-t flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/30">
                    <Button
                        variant="flat"
                        color="secondary"
                        onPress={() => step === 1 ? navigate('/academic/timetable') : setStep(prev => prev - 1)}
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </Button>
                    {step < 3 ? (
                        <Button
                            color="primary"
                            onPress={() => setStep(prev => prev + 1)}
                            isDisabled={step === 1 && (!formData.classId || !formData.day || !formData.periodCount)}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            color="success"
                            className="text-white bg-green-600"
                            onPress={handleSubmit}
                            isLoading={saving}
                        >
                            Create Timetable
                        </Button>
                    )}
                </div>
            </Card>
        </motion.div>
    );
};

export default CreateDailyTimetable;
