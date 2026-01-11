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

export default function ExamResults() {
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [results, setResults] = useState([]);

    const [selectedExam, setSelectedExam] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    // When Class changes
    useEffect(() => {
        if (selectedClass) {
            // Reset dependent selections
            setSelectedSection('');
            setSelectedExam('');
            setSelectedSubject('');

            // Fetch dependent data
            fetchClassDependentData(selectedClass);
        } else {
            // Reset all if class is deselected
            setSections([]);
            setSubjects([]);
            setExams([]);
            setSelectedSection('');
            setSelectedExam('');
            setSelectedSubject('');
        }
    }, [selectedClass]);

    // When Section changes
    useEffect(() => {
        if (selectedClass) {
            // Refetch exams based on section (if selected) or just class (if section cleared)
            // Even if section is '' (all sections), we re-fetch exams for the class.
            // But if section is selected, we want generic + specific.
            // Current getExams with classId gets all (checked implementation? No, getExams logic depends on input).
            // If I call getExams(classId), backend returns all exams where classId=X (and no section restriction unless implemented?).
            // Wait, previous getExams implemented: if sectionId passed, use OR logic.
            // If sectionId NOT passed, it returns where classId=X. This logically includes generic AND specific (unless I want to exclude specific?).
            // Standard getExams(classId) returns all exams for class.
            // getExams(classId, sectionId) returns generic + specific to section. It DOES NOT return generic + specific to OTHER sections.
            // So calling fetchExams with sectionId is correct update.
            fetchExams(selectedClass, selectedSection);
        }
    }, [selectedSection]);

    // When filters change (for fetching results)
    useEffect(() => {
        if (selectedExam) {
            fetchResults();
        } else {
            setResults([]);
        }
    }, [selectedExam, selectedClass, selectedSection, selectedSubject]);

    const fetchClasses = async () => {
        try {
            const classRes = await academicService.getAllClasses();
            if (classRes.data?.success) setClasses(classRes.data.data.classes || []);
        } catch (error) {
            addToast({
                title: "Error",
                description: "Failed to load classes",
                color: "danger",
            });
        }
    };

    const fetchClassDependentData = async (classId) => {
        try {
            const cls = classes.find(c => c.id === classId);
            const standard = cls ? cls.name : '';

            const [divRes, subRes] = await Promise.all([
                academicService.getDivisions(standard),
                academicService.getAllSubjects({ classId })
                // We fetch exams separately or here? Let's do here for initial load (generic/all class exams)
                // But we handle exams via the section effect usually.
                // However, initial load of class needs exams too (for "All Sections" case).
            ]);

            if (divRes.data?.success) setSections(divRes.data.data || []);
            if (subRes.data?.success) setSubjects(subRes.data.data.subjects || []);

            // Trigger exam fetch directly or let effect do it?
            // section effect runs on mount if dep changes? 'selectedSection' is '' initially.
            // It might run. Let's call it explicitly here to be safe and clear.
            fetchExams(classId, '');
        } catch (error) {
            console.error(error);
            addToast({
                title: "Error",
                description: "Failed to load class data",
                color: "danger",
            });
        }
    };

    const fetchExams = async (classId, sectionId) => {
        try {
            const params = { classId };
            if (sectionId) params.sectionId = sectionId;

            const response = await examService.getExams(params);
            if (response.data?.success) setExams(response.data.data.exams || []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchResults = async () => {
        setLoading(true);
        try {
            const params = { examId: selectedExam };
            if (selectedSubject) params.subjectId = selectedSubject;
            if (selectedClass) params.classId = selectedClass;
            if (selectedSection) params.sectionId = selectedSection;

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

    return (
        <motion.div
            className="p-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-content1 p-5 rounded-2xl border border-default-200 dark:border-default-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Exam Results</h1>
                    <p className="text-sm text-default-500">View and manage student academic performance</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/admin/bulk-upload/results">
                        <Button color="secondary" variant="flat" startContent={<Icon icon="mdi:cloud-upload" />}>
                            Bulk Upload
                        </Button>
                    </Link>
                    <Link to="/exams/results/add">
                        <Button className="bg-primary-600 text-white shadow-md shadow-primary-500/20" startContent={<Icon icon="mdi:plus" />}>
                            Add Results
                        </Button>
                    </Link>
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm bg-content1 border border-default-200 dark:border-default-100">
                    <CardBody className="p-4 gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Select
                                label="Filter by Class"
                                placeholder="Select Class First"
                                selectedKeys={selectedClass ? [selectedClass] : []}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                startContent={<Icon icon="mdi:google-classroom" className="text-default-400" />}
                                variant="bordered"
                                classNames={{ value: "text-foreground", label: "text-default-500" }}
                            >
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Filter by Section"
                                placeholder="All Sections"
                                selectedKeys={selectedSection ? [selectedSection] : []}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                startContent={<Icon icon="mdi:google-classroom" className="text-default-400" />}
                                variant="bordered"
                                isDisabled={!selectedClass}
                                classNames={{ value: "text-foreground", label: "text-default-500" }}
                            >
                                {sections.map((sec) => (
                                    <SelectItem key={sec.id} value={sec.id}>
                                        {sec.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Filter by Exam"
                                placeholder="Select Exam"
                                selectedKeys={selectedExam ? [selectedExam] : []}
                                onChange={(e) => setSelectedExam(e.target.value)}
                                startContent={<Icon icon="mdi:file-document-outline" className="text-default-400" />}
                                variant="bordered"
                                isDisabled={!selectedClass}
                                classNames={{ value: "text-foreground", label: "text-default-500" }}
                            >
                                {exams.map((exam) => (
                                    <SelectItem key={exam.id || exam.id} value={exam.id || exam.id}>
                                        {exam.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="shadow-sm bg-content1 border border-default-200 dark:border-default-100">
                    <CardBody>
                        {results.length > 0 ? (
                            <Accordion
                                selectionMode="multiple"
                                variant="splitted"
                                itemClasses={{
                                    base: "group-[.is-splitted]:px-4 group-[.is-splitted]:bg-default-50 dark:group-[.is-splitted]:bg-default-100/50 shadow-sm border border-default-200 dark:border-default-100",
                                    title: "text-foreground font-medium",
                                    trigger: "py-3",
                                    content: "py-2"
                                }}
                            >
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
                                                                <Icon icon="lucide:user" className="w-4 h-4 text-default-500 flex-shrink-0" />
                                                                <span className="font-semibold text-sm truncate text-foreground">{student.name}</span>
                                                            </div>
                                                            <Chip
                                                                size="sm"
                                                                variant="flat"
                                                                color={isFailed ? "danger" : "success"}
                                                                className="flex-shrink-0"
                                                            >
                                                                {isFailed ? 'FAIL' : 'PASS'}
                                                            </Chip>
                                                        </div>

                                                        {/* Row 2: Reg No */}
                                                        <div className="flex items-center gap-2 text-xs text-default-500">
                                                            <Icon icon="lucide:hash" className="w-3 h-3 flex-shrink-0" />
                                                            <span className="truncate">{student.admissionNumber || "N/A"}</span>
                                                        </div>

                                                        {/* Row 3: Stats */}
                                                        <div className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-1.5 text-default-500">
                                                                <Icon icon="lucide:target" className="w-3 h-3" />
                                                                <span>{totalObtained}/{totalMax}</span>
                                                            </div>
                                                            <div className={`flex items-center gap-1.5 font-bold ${isFailed ? 'text-danger-600' : 'text-success-600'
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
                                                                <Icon icon="lucide:user" className="w-4 h-4 text-default-500 flex-shrink-0" />
                                                                <span className="font-semibold text-sm truncate text-foreground">{student.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-default-500 mt-0.5">
                                                                <Icon icon="lucide:hash" className="w-3 h-3 flex-shrink-0" />
                                                                <span className="truncate">{student.admissionNumber || "N/A"}</span>
                                                            </div>
                                                        </div>

                                                        {/* Right: Stats and Badge */}
                                                        <div className="flex items-center gap-4 flex-shrink-0">
                                                            <div className="text-xs text-default-500 text-right">
                                                                <div className="flex items-center gap-1.5 justify-end">
                                                                    <Icon icon="lucide:target" className="w-3 h-3" />
                                                                    <span>{totalObtained}/{totalMax}</span>
                                                                </div>
                                                                <div className={`flex items-center gap-1.5 font-bold mt-0.5 justify-end ${isFailed ? 'text-danger-600' : 'text-success-600'
                                                                    }`}>
                                                                    <Icon icon="lucide:trending-up" className="w-3 h-3" />
                                                                    <span>{percentage.toFixed(1)}%</span>
                                                                </div>
                                                            </div>
                                                            <Chip
                                                                size="sm"
                                                                variant="flat"
                                                                color={isFailed ? "danger" : "success"}
                                                                className="flex-shrink-0"
                                                            >
                                                                {isFailed ? 'FAIL' : 'PASS'}
                                                            </Chip>
                                                        </div>
                                                    </div>

                                                    {/* Desktop Layout (>= 1024px) */}
                                                    <div className="hidden lg:flex items-center justify-between py-2 gap-6">
                                                        {/* Left: Student Info */}
                                                        <div className="flex items-center gap-6 min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <Icon icon="lucide:user" className="w-4 h-4 text-default-500 flex-shrink-0" />
                                                                <span className="font-semibold truncate text-foreground">{student.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-default-500">
                                                                <Icon icon="lucide:hash" className="w-4 h-4 flex-shrink-0" />
                                                                <span className="whitespace-nowrap">{student.admissionNumber || "N/A"}</span>
                                                            </div>
                                                        </div>

                                                        {/* Right: Stats and Badge */}
                                                        <div className="flex items-center gap-6 flex-shrink-0">
                                                            <div className="flex items-center gap-2 text-sm text-default-500">
                                                                <Icon icon="lucide:target" className="w-4 h-4" />
                                                                <span className="whitespace-nowrap">{totalObtained} / {totalMax}</span>
                                                            </div>
                                                            <div className="w-px h-6 bg-default-300" />
                                                            <div className={`flex items-center gap-2 text-sm font-bold ${isFailed ? 'text-danger-600' : 'text-success-600'
                                                                }`}>
                                                                <Icon icon="lucide:trending-up" className="w-4 h-4" />
                                                                <span className="whitespace-nowrap">{percentage.toFixed(2)}%</span>
                                                            </div>
                                                            <Chip
                                                                size="sm"
                                                                variant="flat"
                                                                color={isFailed ? "danger" : "success"}
                                                                className="flex-shrink-0"
                                                            >
                                                                {isFailed ? 'FAIL' : 'PASS'}
                                                            </Chip>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <div>
                                                <Table
                                                    aria-label="Subject marks"
                                                    shadow="none"
                                                    classNames={{
                                                        wrapper: "p-0 m-0",
                                                    }}

                                                >
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
                                                                        <Chip size='sm' color={subRes.grade !== 'F' ? "success" : "danger"} variant="flat">
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
                                <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center mb-4 text-default-400">
                                    <Icon icon="mdi:chart-box-outline" className="text-3xl" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No Results Found</h3>
                                <p className="text-default-500 max-w-sm mt-2 mb-6">
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

