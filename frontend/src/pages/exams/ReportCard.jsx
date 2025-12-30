import React, { useState, useEffect } from 'react';
import { Button, Select, SelectItem, Card, CardBody, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { academicService, examService, studentService } from '@/services';
import { motion } from "framer-motion";

export default function ReportCard() {
    const [classes, setClasses] = useState([]);
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedClass, setSelectedClass] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchStudents(selectedClass);
        } else {
            setStudents([]);
            setSelectedStudent('');
        }
    }, [selectedClass]);

    const fetchInitialData = async () => {
        try {
            const [classRes, examRes] = await Promise.all([
                academicService.getAllClasses(),
                examService.getExams()
            ]);
            if (classRes.data?.success) setClasses(classRes.data.data.classes || []);
            if (examRes.data?.success) setExams(examRes.data.data.exams || []);
        } catch (error) {
            console.error(error);
            addToast({ title: "Error", description: "Failed to load options", color: "danger" });
        }
    };

    const fetchStudents = async (classId) => {
        try {
            const res = await studentService.getAllStudents({ classId });
            if (res.data?.success) {
                setStudents(res.data.data.students || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownload = async () => {
        if (!selectedStudent || !selectedExam) return;
        setLoading(true);
        try {
            const response = await examService.downloadReportCard({
                studentId: selectedStudent,
                examId: selectedExam
            });

            // Create Blob download link
            if (response.status === 200) {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const studentName = students.find(s => s.id === selectedStudent)?.name || 'Student';
                const examName = exams.find(e => e.id === selectedExam)?.name || 'Exam';
                link.setAttribute('download', `ReportCard_${studentName}_${examName}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                addToast({ title: "Success", description: "Report card downloaded", color: "success" });
            } else {
                addToast({ title: "Error", description: "Failed to generate report", color: "danger" });
            }
        } catch (error) {
            console.error(error);
            addToast({ title: "Error", description: "Failed to download", color: "danger" });
        } finally {
            setLoading(false);
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
            <motion.div variants={itemVariants}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Download Report Card</h1>
                <p className="text-sm text-gray-500 mt-1">Select details to generate and download student report card</p>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm">
                    <CardBody className="p-6 gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Select
                                label="Select Class"
                                placeholder="Choose a class"
                                selectedKeys={selectedClass ? [selectedClass] : []}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                startContent={<Icon icon="mdi:google-classroom" className="text-default-400" />}
                            >
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {`${cls.name} - ${cls.section}`}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Select Exam"
                                placeholder="Choose an exam"
                                selectedKeys={selectedExam ? [selectedExam] : []}
                                onChange={(e) => setSelectedExam(e.target.value)}
                                startContent={<Icon icon="mdi:file-document-outline" className="text-default-400" />}
                            >
                                {exams.map((exam) => (
                                    <SelectItem key={exam.id} value={exam.id}>
                                        {exam.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Select Student"
                                placeholder="Choose a student"
                                selectedKeys={selectedStudent ? [selectedStudent] : []}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                startContent={<Icon icon="mdi:account" className="text-default-400" />}
                                isDisabled={!selectedClass}
                            >
                                {students.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {`${student.name} (${student.admissionNumber})`}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button
                                color="primary"
                                onPress={handleDownload}
                                isLoading={loading}
                                isDisabled={!selectedStudent || !selectedExam}
                                startContent={<Icon icon="mdi:download" />}
                            >
                                Generate & Download PDF
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center mt-10">
                <div className="text-center text-gray-400">
                    <Icon icon="mdi:printer" className="text-6xl mx-auto mb-4 opacity-50" />
                    <p>Select criteria above to generate a printable PDF report card.</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
