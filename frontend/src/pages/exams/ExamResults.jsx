import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Select,
    SelectItem,
    Card,
    CardBody,
    Chip,
    Accordion,
    AccordionItem,
    addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { academicService, examService } from '@/services';
import { motion } from "framer-motion";

export default function ExamResults() {
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [results, setResults] = useState([]);

    const [selectedExam, setSelectedExam] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedExam) {
            fetchResults();
        }
    }, [selectedExam, selectedSubject]);

    const fetchInitialData = async () => {
        try {
            const [examRes, subjectRes] = await Promise.all([
                examService.getExams(),
                academicService.getAllSubjects()
            ]);

            if (examRes.data?.success) setExams(examRes.data.data.exams || []);
            if (subjectRes.data?.success) setSubjects(subjectRes.data.data.subjects || []);
        } catch (error) {
            addToast({
                title: "Error",
                description: "Failed to load options",
                color: "danger",
            });
        }
    };

    const fetchResults = async () => {
        setLoading(true);
        try {
            const params = { examId: selectedExam };
            if (selectedSubject) params.subjectId = selectedSubject;

            const response = await examService.getExamResults(params);
            if (response.data?.success) {
                setResults(response.data.data.results || []);
            }
        } catch (error) {
            addToast({
                title: "Error",
                description: "Failed to load results",
                color: "danger",
            });
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
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Results</h1>
                    <p className="text-sm text-gray-500">View and manage student academic performance</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/admin/bulk-upload/results">
                        <Button color="secondary" variant="flat" startContent={<Icon icon="mdi:cloud-upload" />}>
                            Bulk Upload
                        </Button>
                    </Link>
                    <Link to="/exams/results/add">
                        <Button color="primary" startContent={<Icon icon="mdi:plus" />}>
                            Add Results
                        </Button>
                    </Link>
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm">
                    <CardBody className="p-4 gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                label="Filter by Exam"
                                placeholder="All Exams"
                                selectedKeys={selectedExam ? [selectedExam] : []}
                                onChange={(e) => setSelectedExam(e.target.value)}
                                startContent={<Icon icon="mdi:file-document-outline" className="text-default-400" />}
                            >
                                {exams.map((exam) => (
                                    <SelectItem key={exam.id || exam.id} value={exam.id || exam.id}>
                                        {exam.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Filter by Subject"
                                placeholder="All Subjects"
                                selectedKeys={selectedSubject ? [selectedSubject] : []}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                startContent={<Icon icon="mdi:book-open-variant" className="text-default-400" />}
                            >
                                {subjects.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm">
                    <CardBody className="p-0">
                        {results.length > 0 ? (
                            <Accordion selectionMode="multiple" variant="splitted">
                                {results.map((studentRecord) => {
                                    const { student, totalObtained, totalMax, percentage, results: subjectResults, isFailed } = studentRecord;
                                    return (
                                        <AccordionItem
                                            key={student.id}
                                            aria-label={student.name}
                                            title={
                                                <div className="w-full">
                                                    {/* Mobile Layout (< 640px) */}
                                                    <div className="block sm:hidden space-y-2 py-1">
                                                        {/* Row 1: Name and Badge */}
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                <Icon icon="lucide:user" className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                                <span className="font-semibold text-sm truncate">{student.name}</span>
                                                            </div>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${isFailed
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-green-100 text-green-700'
                                                                }`}>
                                                                {isFailed ? 'FAIL' : 'PASS'}
                                                            </span>
                                                        </div>

                                                        {/* Row 2: Reg No */}
                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <Icon icon="lucide:hash" className="w-3 h-3 flex-shrink-0" />
                                                            <span className="truncate">{student.admissionNumber || "N/A"}</span>
                                                        </div>

                                                        {/* Row 3: Stats */}
                                                        <div className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                                <Icon icon="lucide:target" className="w-3 h-3" />
                                                                <span>{totalObtained}/{totalMax}</span>
                                                            </div>
                                                            <div className={`flex items-center gap-1.5 font-bold ${isFailed ? 'text-red-600' : 'text-green-600'
                                                                }`}>
                                                                <Icon icon="lucide:trending-up" className="w-3 h-3" />
                                                                <span>{percentage.toFixed(1)}%</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Tablet Layout (640px - 1024px) */}
                                                    <div className="hidden sm:flex lg:hidden items-center justify-between py-2 gap-4">
                                                        {/* Left: Student Info */}
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <Icon icon="lucide:user" className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                                <span className="font-semibold text-sm truncate">{student.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                                                                <Icon icon="lucide:hash" className="w-3 h-3 flex-shrink-0" />
                                                                <span className="truncate">{student.admissionNumber || "N/A"}</span>
                                                            </div>
                                                        </div>

                                                        {/* Right: Stats and Badge */}
                                                        <div className="flex items-center gap-4 flex-shrink-0">
                                                            <div className="text-xs text-gray-600 text-right">
                                                                <div className="flex items-center gap-1.5 justify-end">
                                                                    <Icon icon="lucide:target" className="w-3 h-3" />
                                                                    <span>{totalObtained}/{totalMax}</span>
                                                                </div>
                                                                <div className={`flex items-center gap-1.5 font-bold mt-0.5 justify-end ${isFailed ? 'text-red-600' : 'text-green-600'
                                                                    }`}>
                                                                    <Icon icon="lucide:trending-up" className="w-3 h-3" />
                                                                    <span>{percentage.toFixed(1)}%</span>
                                                                </div>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isFailed
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-green-100 text-green-700'
                                                                }`}>
                                                                {isFailed ? 'FAIL' : 'PASS'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Desktop Layout (>= 1024px) */}
                                                    <div className="hidden lg:flex items-center justify-between py-2 gap-6">
                                                        {/* Left: Student Info */}
                                                        <div className="flex items-center gap-6 min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <Icon icon="lucide:user" className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                                <span className="font-semibold truncate">{student.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Icon icon="lucide:hash" className="w-4 h-4 flex-shrink-0" />
                                                                <span className="whitespace-nowrap">{student.admissionNumber || "N/A"}</span>
                                                            </div>
                                                        </div>

                                                        {/* Right: Stats and Badge */}
                                                        <div className="flex items-center gap-6 flex-shrink-0">
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Icon icon="lucide:target" className="w-4 h-4" />
                                                                <span className="whitespace-nowrap">{totalObtained} / {totalMax}</span>
                                                            </div>
                                                            <div className="w-px h-6 bg-gray-300" />
                                                            <div className={`flex items-center gap-2 text-sm font-bold ${isFailed ? 'text-red-600' : 'text-green-600'
                                                                }`}>
                                                                <Icon icon="lucide:trending-up" className="w-4 h-4" />
                                                                <span className="whitespace-nowrap">{percentage.toFixed(2)}%</span>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isFailed
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-green-100 text-green-700'
                                                                }`}>
                                                                {isFailed ? 'FAIL' : 'PASS'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <div className="py-2">
                                                <Table aria-label="Subject marks" shadow="none" classNames={{ wrapper: "p-0" }}>
                                                    <TableHeader>
                                                        <TableColumn>SUBJECT</TableColumn>
                                                        <TableColumn>MARKS OBTAINED</TableColumn>
                                                        <TableColumn>MAX MARKS</TableColumn>
                                                        <TableColumn>GRADE</TableColumn>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {subjectResults.map((subRes, idx) => {
                                                            const subPercentage = (subRes.marksObtained / subRes.maxMarks) * 100;
                                                            return (
                                                                <TableRow key={idx}>
                                                                    <TableCell>{subRes.subject.name} ({subRes.subject.code})</TableCell>
                                                                    <TableCell>{subRes.marksObtained}</TableCell>
                                                                    <TableCell>{subRes.maxMarks}</TableCell>
                                                                    <TableCell>
                                                                        <Chip size='sm' color={subRes.grade !== 'F' ? "success" : "danger"}>
                                                                            {subRes.grade}
                                                                        </Chip>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        ) : (
                            <div className="py-12 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <Icon icon="mdi:chart-box-outline" className="text-3xl text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Results Found</h3>
                                <p className="text-gray-500 max-w-sm mt-2 mb-6">
                                    {selectedExam ? "No results recorded for this selection." : "Select an exam to view results."}
                                </p>
                                <Link to="/exams/results/add">
                                    <Button color="primary" variant="flat">
                                        Enter Marks
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </motion.div>
        </motion.div>
    );
}

