import React, { useState, useEffect } from "react";
import {
    Card, CardBody, Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Chip, Spinner, addToast, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    useDisclosure, Divider, CardHeader, User
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { financeService, academicService } from "@/services";
import { format } from "date-fns";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function FeeReceipts() {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [downloadingId, setDownloadingId] = useState(null);

    // Class Filter States
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [classStudents, setClassStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // History Modal State
    const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
    const [studentReceipts, setStudentReceipts] = useState([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Stats
    const [stats, setStats] = useState({ totalCollected: 0, todayCollected: 0, receiptCount: 0 });

    const loadReceipts = async () => {
        setLoading(true);
        try {
            const res = await financeService.getReceipts();
            if (res.data?.success) {
                const data = res.data.data.receipts || [];
                setReceipts(data);

                // Calculate basic stats from client side data
                const total = data.reduce((acc, curr) => acc + Number(curr.amountPaid || curr.amount), 0);
                const today = data.filter(r => new Date(r.paymentDate || r.date).toDateString() === new Date().toDateString())
                    .reduce((acc, curr) => acc + Number(curr.amountPaid || curr.amount), 0);

                setStats({
                    totalCollected: total,
                    todayCollected: today,
                    receiptCount: data.length
                });

            } else {
                setReceipts([]);
            }
        } catch (error) {
            console.error("Failed to load receipts", error);
        } finally {
            setLoading(false);
        }
    }

    const loadClasses = async () => {
        try {
            const res = await academicService.getAllClasses();
            if (res.data?.success) setClasses(res.data.data.classes || []);
        } catch (error) {
            console.error("Failed to load classes", error);
        }
    };

    useEffect(() => {
        loadReceipts();
        loadClasses();
    }, []);

    // Load students when class changes
    useEffect(() => {
        if (selectedClass) {
            fetchClassStudents(selectedClass);
        } else {
            setClassStudents([]);
        }
    }, [selectedClass]);

    const fetchClassStudents = async (classId) => {
        setLoadingStudents(true);
        try {
            const res = await financeService.getClassFeeStatus(classId);
            if (res.data?.success) {
                setClassStudents(res.data.data.students || []);
            }
        } catch (error) {
            console.error(error);
            addToast({ title: "Error", description: "Failed to load students", color: "danger" });
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleDownloadReceipt = async (receiptId, fileName) => {
        if (!receiptId) return;

        setDownloadingId(receiptId);
        try {
            const res = await financeService.downloadReceipt(receiptId);
            if (res.status === 200) {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName || `receipt.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                addToast({ title: "Success", description: "Receipt downloaded successfully", color: "success" });
            } else {
                addToast({ title: "Error", description: "Failed to download receipt", color: "danger" });
            }
        } catch (error) {
            console.error(error);
            addToast({ title: "Error", description: "Error downloading receipt", color: "danger" });
        } finally {
            setDownloadingId(null);
        }
    }

    const safeFormatDate = (dateString, withTime = false) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return withTime ? format(date, 'dd MMM yyyy, hh:mm a') : format(date, 'dd MMM yyyy');
        } catch (error) {
            return 'Error';
        }
    };

    const handleViewHistory = (student) => {
        setSelectedStudentForHistory(student);
        const matches = receipts.filter(r => {
            const receiptStudentId = r.studentId;
            const receiptAdmission = r.Student?.admissionNumber;

            const idMatch = (receiptStudentId && student.studentId) && (String(receiptStudentId) === String(student.studentId));
            const admMatch = (receiptAdmission && student.admissionNumber) &&
                (String(receiptAdmission).trim().toLowerCase() === String(student.admissionNumber).trim().toLowerCase());
            return idMatch || admMatch;
        });

        matches.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
        setStudentReceipts(matches);
        setShowHistoryModal(true);
    };

    const filteredReceipts = receipts.filter(r => {
        const studentName = r.Student?.name || r.studentName || "";
        const transactionId = r.transactionId || "";
        return (
            transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            studentName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const filteredStudents = classStudents.filter(s =>
        (s.studentName && s.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.admissionNumber && s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleRefresh = () => {
        loadReceipts();
        if (selectedClass) {
            fetchClassStudents(selectedClass);
        }
        addToast({ title: "Refreshed", description: "Data updated successfully", color: "success" });
    };

    const statCards = [
        {
            title: 'Collected Today',
            value: `₹${stats.todayCollected.toLocaleString('en-IN')}`,
            icon: 'solar:wad-of-money-bold-duotone',
            color: 'text-success-600',
            bgColor: 'bg-success-100 dark:bg-success-900/30',
            borderColor: 'border-l-success-500'
        },
        {
            title: 'Total Revenue',
            value: `₹${stats.totalCollected.toLocaleString('en-IN')}`,
            icon: 'solar:chart-square-bold-duotone',
            color: 'text-primary-600',
            bgColor: 'bg-primary-100 dark:bg-primary-900/30',
            borderColor: 'border-l-primary-500'
        },
        {
            title: 'Total Receipts',
            value: stats.receiptCount,
            icon: 'solar:documents-bold-duotone',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            borderColor: 'border-l-purple-500'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-7xl mx-auto space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    Fee Receipts
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Manage and track all fee payments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index} className={`border-l-4 ${stat.borderColor} shadow-sm`}>
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <Icon icon={stat.icon} className={`text-2xl ${stat.color}`} />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Controls Bar */}
            <Card className="shadow-sm border border-gray-100 dark:border-gray-800">
                <CardBody className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full md:w-auto">
                            <Select
                                placeholder="Filter by Class"
                                startContent={<Icon icon="solar:users-group-rounded-bold-duotone" className="text-gray-400" />}
                                variant="bordered"
                                selectedKeys={selectedClass ? new Set([String(selectedClass)]) : new Set()}
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                {classes.map((c) => (
                                    <SelectItem key={String(c.id)} value={String(c.id)}>
                                        {c.name} {c.section}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                placeholder={selectedClass ? "Search student in class..." : "Search receipts..."}
                                startContent={<Icon icon="solar:magnifer-linear" className="text-gray-400" />}
                                variant="bordered"
                                isClearable
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                onClear={() => setSearchQuery("")}
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                            <Button
                                isIconOnly
                                variant="light"
                                onPress={handleRefresh}
                                className="text-gray-500"
                                title="Refresh Data"
                            >
                                <Icon icon="solar:refresh-circle-linear" width={24} />
                            </Button>
                            <Button
                                color="primary"
                                startContent={<Icon icon="solar:hand-money-linear" />}
                                onPress={() => navigate('/finance/collect-fees')}
                                className="font-medium shadow-md shadow-primary/20"
                            >
                                Collect New Fee
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Main Content Area */}
            <Card className="shadow-sm border border-gray-100 dark:border-gray-800 min-h-[400px]">
                <CardHeader className="px-6 pt-6 pb-0 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Icon icon={selectedClass ? "solar:users-group-rounded-bold-duotone" : "solar:bill-list-bold-duotone"} className="text-xl text-gray-500" />
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                            {selectedClass ?
                                `Students in Class ${classes.find(c => String(c.id) === String(selectedClass))?.name || ''}` :
                                'Recent Transactions'
                            }
                        </h3>
                    </div>
                    <Chip size="sm" variant="flat" color="secondary">
                        {selectedClass ? `${filteredStudents.length} Students` : `${filteredReceipts.length} Receipts`}
                    </Chip>
                </CardHeader>
                <CardBody className="px-2">
                    {selectedClass ? (
                        // CLASS STUDENT VIEW
                        <Table aria-label="Class Students" removeWrapper shadow="none" classNames={{ th: "bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium" }}>
                            <TableHeader>
                                <TableColumn>STUDENT DETAILS</TableColumn>
                                <TableColumn>ADMISSION NO</TableColumn>
                                <TableColumn>FEE STATUS</TableColumn>
                                <TableColumn>PENDING AMOUNT</TableColumn>
                                <TableColumn align="end">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody
                                items={filteredStudents}
                                isLoading={loadingStudents}
                                loadingContent={<Spinner label="Loading students..." />}
                                emptyContent={
                                    <div className="py-12 flex flex-col items-center text-gray-400">
                                        <Icon icon="solar:user-block-broken" width={48} className="mb-2 opacity-50" />
                                        <p>No students found matching your search.</p>
                                    </div>
                                }
                            >
                                {(student) => (
                                    <TableRow key={student.studentId || student.admissionNumber} className="hover:bg-gray-50/50 cursor-default transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <User
                                                    name={student.studentName}
                                                    description="Student"
                                                    avatarProps={{
                                                        radius: "full",
                                                        size: "sm",
                                                        name: student.studentName?.charAt(0),
                                                        color: "primary"
                                                    }}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell><span className="text-gray-500 font-mono text-xs">{student.admissionNumber}</span></TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                className="capitalize"
                                                color={student.paymentStatus === 'PAID' ? 'success' : student.paymentStatus === 'PARTIAL' ? 'warning' : 'danger'}
                                                startContent={student.paymentStatus === 'PAID' ? <Icon icon="solar:check-circle-bold" /> : <Icon icon="solar:clock-circle-bold" />}
                                            >
                                                {student.paymentStatus.toLowerCase()}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-semibold ${student.pendingAmount > 0 ? "text-danger" : "text-success"}`}>
                                                ₹{student.pendingAmount.toLocaleString('en-IN')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    color="primary"
                                                    onPress={() => handleViewHistory(student)}
                                                    startContent={<Icon icon="solar:history-bold" />}
                                                >
                                                    History
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        // ALL RECEIPTS VIEW
                        <Table aria-label="Fee Receipts" removeWrapper shadow="none" classNames={{ th: "bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium" }}>
                            <TableHeader>
                                <TableColumn>RECEIPT INFO</TableColumn>
                                <TableColumn>STUDENT</TableColumn>
                                <TableColumn>CLASS</TableColumn>
                                <TableColumn>AMOUNT</TableColumn>
                                <TableColumn>DATE & TIME</TableColumn>
                                <TableColumn>MODE</TableColumn>
                                <TableColumn align="end">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody
                                items={filteredReceipts}
                                isLoading={loading}
                                loadingContent={<Spinner label="Loading receipts..." />}
                                emptyContent={
                                    <div className="py-12 flex flex-col items-center text-gray-400">
                                        <Icon icon="solar:bill-cross-broken" width={48} className="mb-2 opacity-50" />
                                        <p>No receipts found.</p>
                                    </div>
                                }
                            >
                                {(item) => (
                                    <TableRow key={item.id} className="hover:bg-gray-50/50 cursor-default transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-gray-100 rounded text-gray-600">
                                                    <Icon icon="solar:document-text-linear" width={16} />
                                                </div>
                                                <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                                                    {item.transactionId || item.id}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <User
                                                name={item.Student?.name || item.studentName || 'N/A'}
                                                description={item.Student?.admissionNumber || item.admissionNumber || 'N/A'}
                                                avatarProps={{ size: "sm", isBordered: false }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="flat" color="primary" className="text-xs">
                                                {item.className || (item.Student?.Class ? `${item.Student.Class.name}-${item.Student.Class.section}` : 'N/A')}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-success-600">₹{(item.amount || item.amountPaid).toLocaleString('en-IN')}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-gray-600">
                                                {safeFormatDate(item.paymentDate || item.date)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="dot" color="default" className="border-none">{item.paymentMethod || 'CASH'}</Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    isIconOnly
                                                    className="bg-primary-50 text-primary-600"
                                                    onPress={() => handleDownloadReceipt(item.id, `receipt-${item.transactionId || item.id}.pdf`)}
                                                    isLoading={downloadingId === item.id}
                                                >
                                                    <Icon icon="solar:download-minimalistic-bold" width={18} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Receipt History Modal */}
            <Modal isOpen={showHistoryModal} onOpenChange={setShowHistoryModal} size="3xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b">
                                <span className="text-xl">Payment History</span>
                                <div className="flex items-center gap-2 text-sm font-normal text-gray-500">
                                    <Icon icon="solar:user-circle-bold" />
                                    {selectedStudentForHistory?.studentName} ({selectedStudentForHistory?.admissionNumber})
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-0">
                                {studentReceipts.length > 0 ? (
                                    <Table aria-label="Student Receipts" removeWrapper shadow="none" classNames={{ th: "bg-gray-100 text-gray-600" }}>
                                        <TableHeader>
                                            <TableColumn>RECEIPT NO</TableColumn>
                                            <TableColumn>DATE</TableColumn>
                                            <TableColumn>FEE TYPE</TableColumn>
                                            <TableColumn>AMOUNT</TableColumn>
                                            <TableColumn>MODE</TableColumn>
                                            <TableColumn align="end">ACTION</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {studentReceipts.map((receipt) => (
                                                <TableRow key={receipt.id} className="border-b last:border-none border-gray-100">
                                                    <TableCell className="font-semibold">{receipt.transactionId || receipt.id}</TableCell>
                                                    <TableCell>{safeFormatDate(receipt.paymentDate || receipt.date)}</TableCell>
                                                    <TableCell>{receipt.FeeStructure?.name || 'School Fee'}</TableCell>
                                                    <TableCell className="font-bold text-success-600">₹{(receipt.amount || receipt.amountPaid).toLocaleString('en-IN')}</TableCell>
                                                    <TableCell><Chip size="sm" variant="flat">{receipt.paymentMethod || 'CASH'}</Chip></TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end">
                                                            <Button
                                                                size="sm"
                                                                color="primary"
                                                                variant="ghost"
                                                                startContent={<Icon icon="solar:download-minimalistic-bold" />}
                                                                isLoading={downloadingId === receipt.id}
                                                                onPress={() => handleDownloadReceipt(receipt.id, `receipt-${receipt.transactionId || receipt.id}.pdf`)}
                                                            >
                                                                Invoice
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="py-16 text-center text-gray-500 flex flex-col items-center bg-gray-50">
                                        <div className="p-4 bg-gray-100 rounded-full mb-3">
                                            <Icon icon="solar:file-remove-bold-duotone" className="text-4xl text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-700">No payment records found</p>
                                        <p className="text-xs mt-1 text-gray-400 max-w-xs">There are no receipt records available for this student in the system.</p>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter className="border-t">
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </motion.div>
    );
}
