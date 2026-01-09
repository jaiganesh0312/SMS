import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Input, Button, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Spinner, addToast, User } from "@heroui/react";
import { Icon } from "@iconify/react";
import { academicService, financeService } from "@/services";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod validation schema for payment form
const paymentSchema = z.object({
    selectedFeeId: z.string().min(1, "Please select a fee to pay"),
    paymentAmount: z.coerce
        .number({ invalid_type_error: "Amount must be a number" })
        .positive("Amount must be greater than zero")
        .max(999999, "Amount is too large"),
    paymentMethod: z.enum(["CASH", "ONLINE", "CHEQUE"], {
        errorMap: () => ({ message: "Please select a payment method" })
    }),
    remarks: z.string().optional()
});

export default function CollectFees() {
    const [currentPage, setCurrentPage] = useState("select"); // "select" or "payment"
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [pendingFees, setPendingFees] = useState([]);
    const [loadingFees, setLoadingFees] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");

    // React Hook Form setup
    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            selectedFeeId: "",
            paymentAmount: "",
            paymentMethod: "CASH",
            remarks: ""
        }
    });

    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        try {
            const res = await academicService.getAllClasses();
            if (res.data?.success) setClasses(res.data.data.classes || []);
        } catch (error) {
        }
    };

    const handleSearch = async (classId = selectedClass) => {
        if (!classId) {
            addToast({ title: "Select Class", description: "Please select a class first", color: "warning" });
            return;
        }
        setLoading(true);
        try {
            let studentsData = [];
            let source = 'finance';

            try {
                const res = await financeService.getClassFeeStatus(classId);
                if (res.data?.success) {
                    studentsData = res.data.data.students || [];
                }
            } catch (finError) {
            }

            if (studentsData.length === 0) {
                try {
                    const res = await academicService.getStudentsByClass(classId);
                    if (res.data?.success) {
                        studentsData = res.data.data.students || [];
                        source = 'academic';
                    }
                } catch (acadError) {
                }
            }

            if (studentsData.length > 0) {
                const filtered = searchQuery
                    ? studentsData.filter(s => (s.studentName || s.firstName).toLowerCase().includes(searchQuery.toLowerCase()))
                    : studentsData;

                setStudents(filtered.map(s => ({
                    id: s.studentId || s.id,
                    firstName: s.studentName || s.firstName,
                    lastName: s.lastName || "",
                    admissionNumber: s.admissionNumber,
                    rollNumber: s.rollNumber || "N/A",
                    email: s.email || "",
                    paymentStatus: source === 'finance' ? s.paymentStatus : 'UNKNOWN',
                    pendingAmount: source === 'finance' ? s.pendingAmount : 0
                })));
            } else {
                setStudents([]);
                addToast({ title: "Info", description: "No students found in this class", color: "warning" });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStudent = async (student) => {
        setSelectedStudent(student);
        setLoadingFees(true);
        setCurrentPage("payment");
        reset();

        try {
            const res = await financeService.getStudentFeeDetails(student.id);
            if (res.data?.success) {
                setPendingFees(res.data.data.feeBreakdown || []);
            }
        } catch (error) {
            addToast({ title: "Error", description: "Could not fetch fee details", color: "danger" });
        } finally {
            setLoadingFees(false);
        }
    };

    const onSubmit = async (data) => {
        setProcessingPayment(true);
        try {
            const res = await financeService.collectFee({
                studentId: selectedStudent.id,
                feeStructureId: data.selectedFeeId,
                amount: parseFloat(data.paymentAmount),
                paymentMethod: data.paymentMethod,
                remarks: data.remarks || 'Collected at Office'
            });

            if (res.data?.success) {
                addToast({ title: "Success", description: "Payment recorded successfully", color: "success" });
                handleSelectStudent(selectedStudent);
            } else {
                addToast({ title: "Error", description: res.data?.message || "Payment failed", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "Transaction failed", color: "danger" });
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleFeeSelection = (feeId) => {
        setValue("selectedFeeId", feeId);
        const fee = pendingFees.find(f => f.feeStructureId == feeId);
        if (fee) {
            setValue("paymentAmount", fee.pendingAmount.toString());
        }
    };

    const handleBackToSelection = () => {
        setCurrentPage("select");
        setSelectedStudent(null);
        setPendingFees([]);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
                {currentPage === "select" ? (
                    // PAGE 1: Student Selection
                    <motion.div
                        key="select"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Collect Fees</h1>
                            <p className="text-sm text-default-500 mt-1">Select a student to process payment</p>
                        </div>
                        {/* Students Table */}
                        <Card className="bg-content1 border border-default-200 shadow-sm">
                            <CardHeader>

                                {/* Search Controls */}
                                <div className="flex flex-col md:flex-row gap-3 mb-6 my-2 items-end w-full">
                                    <Select
                                        label="Class"
                                        placeholder="Select class"
                                        className="md:w-64"
                                        variant="bordered"
                                        selectedKeys={selectedClass ? [String(selectedClass)] : []}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val) {
                                                setSelectedClass(val);
                                                handleSearch(val);
                                            }
                                        }}
                                        startContent={<Icon icon="mdi:google-classroom" className="text-default-400" />}
                                    >
                                        {classes.map(c => (
                                            <SelectItem key={String(c.id)} value={String(c.id)}>
                                                {`${c.name}-${c.section}`}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Input
                                        placeholder="Search by student name..."
                                        label="Search"
                                        className="md:flex-1"
                                        variant="bordered"
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                        startContent={<Icon icon="mdi:magnify" className="text-default-400" />}
                                    />

                                    <Button
                                        color="primary"
                                        onPress={() => handleSearch(selectedClass)}
                                        isLoading={loading}
                                        startContent={<Icon icon="mdi:refresh" />}
                                    >
                                        Refresh
                                    </Button>

                                </div>     </CardHeader>
                            <CardBody>
                                <Table aria-label="Students" shadow="none" classNames={{
                                    wrapper: "bg-content1 shadow-none",
                                    th: "bg-default-100 text-default-500",
                                    td: "text-foreground"
                                }}>
                                    <TableHeader>
                                        <TableColumn>STUDENT</TableColumn>
                                        <TableColumn>ADMISSION NO</TableColumn>
                                        <TableColumn>STATUS</TableColumn>
                                        <TableColumn>PENDING</TableColumn>
                                        <TableColumn>ACTION</TableColumn>
                                    </TableHeader>
                                    <TableBody
                                        emptyContent={
                                            <div className="text-center py-16 text-default-400">
                                                <Icon icon="mdi:account-search" className="text-6xl mb-3 mx-auto opacity-30" />
                                                <p className="font-medium">No students found</p>
                                                <p className="text-xs mt-1">Select a class to view students</p>
                                            </div>
                                        }
                                        isLoading={loading}
                                        loadingContent={<Spinner />}
                                    >
                                        {students.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell>
                                                    <User
                                                        name={student.firstName}
                                                        description={student.email}
                                                        avatarProps={{
                                                            src: `https://i.pravatar.cc/150?u=${student.id}`,
                                                            size: "sm",
                                                            showFallback: true
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm text-default-500">
                                                        {student.admissionNumber}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color={
                                                            student.paymentStatus === 'PAID' ? 'success' :
                                                                student.paymentStatus === 'PARTIAL' ? 'warning' :
                                                                    'danger'
                                                        }
                                                    >
                                                        {student.paymentStatus}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    {student.pendingAmount > 0 ? (
                                                        <span className="text-danger font-semibold">
                                                            ₹{student.pendingAmount?.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-default-400">₹0</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        color="primary"
                                                        variant="light"
                                                        onPress={() => handleSelectStudent(student)}
                                                        startContent={<Icon icon="mdi:arrow-right" />}
                                                    >
                                                        Proceed
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardBody>
                        </Card>
                    </motion.div>
                ) : (
                    // PAGE 2: Payment Processing
                    <motion.div
                        key="payment"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="space-y-6"
                    >
                        {/* Header with Back Button */}
                        <div className="flex items-center gap-4">
                            <Button
                                isIconOnly
                                variant="flat"
                                onPress={handleBackToSelection}
                            >
                                <Icon icon="mdi:arrow-left" className="text-xl" />
                            </Button>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-foreground">Process Payment</h1>
                                <p className="text-sm text-default-500 mt-1">Collect fee for {selectedStudent?.firstName}</p>
                            </div>
                        </div>

                        {/* Student Info Card */}
                        <Card className="bg-content1 border border-default-200 shadow-sm">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <User
                                        name={selectedStudent?.firstName}
                                        description={`Admission No: ${selectedStudent?.admissionNumber}`}
                                        avatarProps={{
                                            src: `https://i.pravatar.cc/150?u=${selectedStudent?.id}`,
                                            size: "lg",
                                            showFallback: true
                                        }}
                                    />
                                    <div className="text-right">
                                        <p className="text-sm text-default-500">Class</p>
                                        <p className="font-semibold text-foreground">
                                            {classes.find(c => c.id == selectedClass)?.name}-{classes.find(c => c.id == selectedClass)?.section}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Fee Details */}
                        <Card className="bg-content1 border border-default-200 shadow-sm">
                            <CardHeader className="px-6 pt-6 pb-2">
                                <h3 className="text-lg font-semibold text-foreground">Fee Details</h3>
                            </CardHeader>
                            <CardBody>
                                {loadingFees ? (
                                    <div className="flex justify-center py-12">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <Table aria-label="Fee Details" shadow="none" classNames={{
                                        wrapper: "bg-content1 shadow-none",
                                        th: "bg-default-100 text-default-500",
                                        td: "text-foreground"
                                    }}>
                                        <TableHeader>
                                            <TableColumn>FEE TYPE</TableColumn>
                                            <TableColumn>TOTAL</TableColumn>
                                            <TableColumn>PAID</TableColumn>
                                            <TableColumn>PENDING</TableColumn>
                                            <TableColumn>STATUS</TableColumn>
                                        </TableHeader>
                                        <TableBody emptyContent="No fee records found">
                                            {pendingFees.map((fee) => (
                                                <TableRow key={fee.feeStructureId}>
                                                    <TableCell className="font-medium">{fee.feeName}</TableCell>
                                                    <TableCell>₹{fee.amount?.toLocaleString()}</TableCell>
                                                    <TableCell className="text-success">₹{fee.totalPaid?.toLocaleString()}</TableCell>
                                                    <TableCell className="text-danger font-semibold">₹{fee.pendingAmount?.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            color={
                                                                fee.status === 'PAID' ? 'success' :
                                                                    fee.status === 'PARTIAL' ? 'warning' :
                                                                        'danger'
                                                            }
                                                        >
                                                            {fee.status}
                                                        </Chip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>

                        {/* Payment Form */}
                        <Card className="bg-content1 border border-default-200 shadow-sm">
                            <CardHeader className="px-6 pt-6 pb-2">
                                <h3 className="text-lg font-semibold text-foreground">Collect Payment</h3>
                            </CardHeader>
                            <CardBody className="p-6">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="selectedFeeId"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    label="Select Fee"
                                                    placeholder="Choose fee to pay"
                                                    variant="bordered"
                                                    selectedKeys={field.value ? [field.value] : []}
                                                    onChange={(e) => handleFeeSelection(e.target.value)}
                                                    isInvalid={!!errors.selectedFeeId}
                                                    errorMessage={errors.selectedFeeId?.message}
                                                    startContent={<Icon icon="mdi:format-list-checks" className="text-default-400" />}
                                                >
                                                    {pendingFees.filter(f => f.status !== 'PAID').map(fee => (
                                                        <SelectItem key={fee.feeStructureId} value={fee.feeStructureId} textValue={fee.feeName}>
                                                            {fee.feeName} (₹{fee.pendingAmount})
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            )}
                                        />

                                        <Controller
                                            name="paymentAmount"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    label="Amount"
                                                    placeholder="0.00"
                                                    variant="bordered"
                                                    startContent={<Icon icon="mdi:currency-rupee" className="text-default-400" />}
                                                    isInvalid={!!errors.paymentAmount}
                                                    errorMessage={errors.paymentAmount?.message}
                                                />
                                            )}
                                        />

                                        <Controller
                                            name="paymentMethod"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    label="Payment Method"
                                                    variant="bordered"
                                                    selectedKeys={field.value ? [field.value] : []}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    isInvalid={!!errors.paymentMethod}
                                                    errorMessage={errors.paymentMethod?.message}
                                                    startContent={<Icon icon="mdi:cash" className="text-default-400" />}
                                                >
                                                    <SelectItem key="CASH" value="CASH">Cash</SelectItem>
                                                    <SelectItem key="ONLINE" value="ONLINE">Online</SelectItem>
                                                    <SelectItem key="CHEQUE" value="CHEQUE">Cheque</SelectItem>
                                                </Select>
                                            )}
                                        />

                                        <Controller
                                            name="remarks"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Remarks"
                                                    placeholder="Optional notes"
                                                    variant="bordered"
                                                    startContent={<Icon icon="mdi:note-text" className="text-default-400" />}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button
                                            variant="flat"
                                            onPress={handleBackToSelection}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            color="success"
                                            isLoading={processingPayment}
                                            startContent={<Icon icon="mdi:check" />}
                                        >
                                            Confirm Payment
                                        </Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
