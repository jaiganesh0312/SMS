import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Input,
    Select,
    SelectItem,
    Card,
    CardBody,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { academicService, examService, studentService } from '@/services';
import { motion } from "framer-motion";

export default function AddExamResult() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedExam, setSelectedExam] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [marksData, setMarksData] = useState({});
    const [editingRowId, setEditingRowId] = useState(null); // Track single row being edited

    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingStudents, setIsFetchingStudents] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedExam && selectedSubject) {
            fetchExistingMarks();
        }
    }, [selectedExam, selectedSubject, students]); // Re-run when students are loaded or selection changes

    const fetchInitialData = async () => {
        try {
            const [examRes, subjectRes] = await Promise.all([
                examService.getExams(),
                academicService.getAllSubjects()
            ]);

            if (examRes.data?.success) {
                setExams(examRes.data.data?.exams || []);
            }
            if (subjectRes.data?.success) {
                setSubjects(subjectRes.data.data.subjects || []);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            addToast({
                title: "Error!",
                description: "Failed to load exams or subjects",
                color: "danger",
            });
        }
    };

    const handleExamChange = async (e) => {
        const examId = e.target.value;
        setSelectedExam(examId);

        if (!examId) {
            setStudents([]);
            setMarksData({});
            return;
        }

        const exam = exams.find(ex => ex.id === examId);
        if (exam && exam.classId) {
            fetchStudents(exam.classId);
        }
    };

    const fetchStudents = async (classId) => {
        setIsFetchingStudents(true);
        try {
            const response = await studentService.getAllStudents({ classId });
            if (response.data?.success) {
                setStudents(response.data.data?.students || []);
                // Marks data will be populated by fetchExistingMarks via useEffect
            } else {
                setStudents([]);
                addToast({
                    title: "Error!",
                    description: "No students found for this class",
                    color: "danger",
                });
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            addToast({
                title: "Failed to fetch students",
                description: "Please try again later",
                color: "danger",
            });
        } finally {
            setIsFetchingStudents(false);
        }
    };

    const fetchExistingMarks = async () => {
        if (!selectedExam || !selectedSubject || students.length === 0) return;

        try {
            const response = await examService.getExamResults({
                examId: selectedExam,
                subjectId: selectedSubject
            });

            if (response.data?.success) {
                const results = response.data.data.results || [];
                const newMarksData = {};

                // Map results to student IDs. 
                // The API returns grouped results, typically. 
                // Let's assume getExamResults returns a list of student results for the specific subject if queried with subjectId.
                // However, based on examController, getExamResults returns grouped data.
                // We might need to iterate through the grouped structure or adjust the API usage.
                // Looking at examController.js:
                // If subjectId is provided, it filters by subjectId but still groups by student.
                // Output: data: { results: [ { student: ..., results: [ { marksObtained, ... } ] } ] }

                results.forEach(studentResult => {
                    const studentId = studentResult.student.id;
                    // Find the result for the selected subject
                    const subjectResult = studentResult.results.find(r => r.subject.id === selectedSubject);

                    if (subjectResult) {
                        newMarksData[studentId] = {
                            id: subjectResult.id,
                            marksObtained: subjectResult.marksObtained,
                            maxMarks: subjectResult.maxMarks || 100,
                            grade: subjectResult.grade,
                            remarks: subjectResult.remarks
                        };
                    }
                });

                // Merge with existing marksData to preserve any unsaved input if user switches quickly? 
                // Better to overwrite with fetched data to show truth.
                setMarksData(newMarksData);
            }
        } catch (error) {
            console.error("Error fetching existing marks:", error);
            // Don't show toast to avoid spamming if just no results yet
        }
    };

    const handleMarkChange = (studentId, field, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleEdit = (studentId) => {
        setEditingRowId(studentId);
    };

    const handleCancel = (studentId) => {
        setEditingRowId(null);
        // Ideally revert changes, but for now we just exit edit mode. 
        // To strictly revert, we'd need to re-fetch or store original state. 
        // As a simple fix, re-fetch marks for this student from the "server state" (fetchExistingMarks), 
        // but `fetchExistingMarks` fetches all. Simpler to just fetch all again or let it be.
        fetchExistingMarks();
    };

    const handleUpdate = async (studentId) => {
        const data = marksData[studentId];
        if (!data || !data.id) return;

        try {
            const payload = {
                marksObtained: parseFloat(data.marksObtained),
                maxMarks: parseFloat(data.maxMarks || 100)
            };

            const response = await examService.updateExamResult(data.id, payload);
            if (response.data?.success) {
                addToast({
                    title: "Success",
                    description: "Result updated",
                    color: "success",
                });
                setEditingRowId(null);
                fetchExistingMarks(); // Refresh to get calculated grade/remarks
            } else {
                addToast({
                    title: "Error",
                    description: response.data?.message || "Failed to update",
                    color: "danger",
                });
            }
        } catch (error) {
            console.error("Update error:", error);
            addToast({
                title: "Error",
                description: "Failed to update result",
                color: "danger",
            });
        }
    };

    const handleSubmit = async () => {
        if (!selectedExam || !selectedSubject) {
            addToast({
                title: "Error!",
                description: "Please select both Exam and Subject",
                color: "danger",
            });
            return;
        }

        if (students.length === 0) {
            addToast({
                title: "Error!",
                description: "No students to grades for",
                color: "danger",
            });
            return;
        }

        const results = students.map(student => {
            const data = marksData[student.id] || {};
            // Skip existing results (handled by single update)
            if (data.id) return null;

            // Only include if marksObtained is entered/present
            if (data.marksObtained === undefined || data.marksObtained === '') return null;

            return {
                studentId: student.id,
                marksObtained: parseFloat(data.marksObtained),
                maxMarks: parseFloat(data.maxMarks || 100)
            };
        }).filter(Boolean); // Remove nulls

        if (results.length === 0) {
            addToast({
                title: "Warning",
                description: "No marks entered to save",
                color: "warning",
            });
            return;
        }

        const payload = {
            examId: selectedExam,
            subjectId: selectedSubject,
            results
        };

        setIsLoading(true);
        try {
            const response = await examService.addExamResult(payload);
            if (response.data?.success) {
                addToast({
                    title: "Success!",
                    description: "Results updated successfully",
                    color: "success",
                });
                // Refresh marks to show new grades/remarks calculated by backend
                fetchExistingMarks();
            } else {
                addToast({
                    title: "Error!",
                    description: response.data?.message || "Failed to add results",
                    color: "danger",
                });
            }
        } catch (error) {
            console.error('Error submitting results:', error);
            addToast({
                title: "Error!",
                description: "An error occurred while saving results",
                color: "danger",
            });
        } finally {
            setIsLoading(false);
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
            className="p-6 max-w-6xl mx-auto space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex items-center gap-4">
                <Button isIconOnly variant="light" onPress={() => navigate(-1)}>
                    <Icon icon="mdi:arrow-left" className="text-xl" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Exam Results</h1>
                    <p className="text-sm text-gray-500">Enter or update marks for students</p>
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm mb-6">
                    <CardBody className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Select Exam"
                            placeholder="Choose an exam"
                            selectedKeys={selectedExam ? [selectedExam] : []}
                            onChange={handleExamChange}
                            startContent={<Icon icon="mdi:file-document-edit-outline" className="text-default-400" />}
                        >
                            {exams.map((exam) => (
                                <SelectItem key={exam.id || exam.id} value={exam.id || exam.id} textValue={exam.name}>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{exam.name}</span>
                                        <span className="text-xs text-default-400">{exam.class?.name || exam.Class?.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </Select>

                        <Select
                            label="Select Subject"
                            placeholder="Choose a subject"
                            selectedKeys={selectedSubject ? [selectedSubject] : []}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            startContent={<Icon icon="mdi:book-open-page-variant" className="text-default-400" />}
                        >
                            {subjects.map((sub) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                    {sub.name}
                                </SelectItem>
                            ))}
                        </Select>
                    </CardBody>
                </Card>
            </motion.div>

            {selectedExam && students.length > 0 && (
                <motion.div variants={itemVariants}>
                    <Card className="shadow-sm">
                        <CardBody >
                            <Table aria-label="Student marks table" shadow="none" removeWrapper>
                                <TableHeader>
                                    <TableColumn>STUDENT NAME</TableColumn>
                                    <TableColumn>ADMISSION NO</TableColumn>
                                    <TableColumn width={150}>MAX MARKS</TableColumn>
                                    <TableColumn width={150}>MARKS OBTAINED</TableColumn>
                                    <TableColumn>GRADE</TableColumn>
                                    <TableColumn>REMARKS</TableColumn>
                                    <TableColumn>ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody
                                    emptyContent={isFetchingStudents ? "Loading students..." : "No students found in this class"}
                                    isLoading={isFetchingStudents}
                                >
                                    {students.map((student) => {
                                        const marks = marksData[student.id];
                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                                                        <span className="text-xs text-gray-500">{student.admissionNumber}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{student.admissionNumber || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="w-24">
                                                        {(marks?.id && editingRowId !== student.id) ? (
                                                            marks.maxMarks
                                                        ) : (
                                                            <Input
                                                                type="number"
                                                                placeholder="100"
                                                                value={marks?.maxMarks || '100'}
                                                                onValueChange={(val) => handleMarkChange(student.id, 'maxMarks', val)}
                                                                size="sm"
                                                            />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="w-24">
                                                        {(marks?.id && editingRowId !== student.id) ? (
                                                            marks.marksObtained
                                                        ) : (
                                                            <Input
                                                                type="number"
                                                                placeholder="0"
                                                                value={marks?.marksObtained || ''}
                                                                onValueChange={(val) => handleMarkChange(student.id, 'marksObtained', val)}
                                                                size="sm"
                                                                color={
                                                                    parseFloat(marks?.marksObtained) > parseFloat(marks?.maxMarks)
                                                                        ? "danger"
                                                                        : "default"
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {marks?.grade ? (
                                                        <Chip size="sm" color={marks.grade === 'F' ? "danger" : "success"} variant="flat">
                                                            {marks.grade}
                                                        </Chip>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-600">
                                                        {marks?.remarks || '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {marks?.id ? (
                                                        <div className="flex gap-2">
                                                            {editingRowId === student.id ? (
                                                                <>
                                                                    <Button isIconOnly size="sm" color="success" variant="flat" onPress={() => handleUpdate(student.id)}>
                                                                        <Icon icon="mdi:check" />
                                                                    </Button>
                                                                    <Button isIconOnly size="sm" color="danger" variant="flat" onPress={() => handleCancel(student.id)}>
                                                                        <Icon icon="mdi:close" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Button isIconOnly size="sm" variant="light" onPress={() => handleEdit(student.id)}>
                                                                    <Icon icon="mdi:pencil" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">New</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardBody>
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                            <Button
                                color="primary"
                                onPress={handleSubmit}
                                isLoading={isLoading}
                                isDisabled={students.length === 0 || !selectedSubject}
                                startContent={!isLoading && <Icon icon="mdi:content-save-check" />}
                            >
                                Save Results
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}
