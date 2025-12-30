import React, { useState, useEffect } from 'react';
import payrollService from '@/services/payrollService';
import staffService from '@/services/staffService';
import { Icon } from '@iconify/react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Select,
    SelectItem,
    Tabs,
    Tab,
    addToast,
    Spinner,
    Divider,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip
} from "@heroui/react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from 'date-fns';

// --- Zod Schemas ---
const generatePayrollSchema = z.object({
    month: z.coerce.number().min(1).max(12),
    year: z.coerce.number().min(2000).max(2100)
});

const salaryStructureSchema = z.object({
    staffId: z.string().min(1, "Staff selection is required"),
    basicSalary: z.coerce.number().min(0, "Basic salary must be positive"),
    allowances: z.array(z.object({
        name: z.string().min(1, "Name required"),
        amount: z.coerce.number().min(0, "Amount must be positive")
    })).optional(),
    deductions: z.array(z.object({
        name: z.string().min(1, "Name required"),
        amount: z.coerce.number().min(0, "Amount must be positive")
    })).optional(),
});

const PayrollManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [payrollHistory, setPayrollHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [activeTab, setActiveTab] = useState("generate");

    // --- Generate Payroll Form ---
    const {
        control: generateControl,
        handleSubmit: handleGenerateSubmit,
        watch: watchGenerate,
        formState: { isSubmitting: isGenerating }
    } = useForm({
        resolver: zodResolver(generatePayrollSchema),
        defaultValues: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        }
    });

    const watchMonth = watchGenerate('month');
    const watchYear = watchGenerate('year');

    // --- Salary Structure Form ---
    const {
        control: structureControl,
        handleSubmit: handleStructureSubmit,
        formState: { isSubmitting: isSavingStructure },
        setValue: setStructureValue,
        reset: resetStructureForm,
        control
    } = useForm({
        resolver: zodResolver(salaryStructureSchema),
        defaultValues: {
            staffId: "",
            basicSalary: 0,
            allowances: [],
            deductions: []
        }
    });

    const { fields: allowanceFields, append: appendAllowance, remove: removeAllowance } = useFieldArray({
        control: structureControl,
        name: "allowances"
    });

    const { fields: deductionFields, append: appendDeduction, remove: removeDeduction } = useFieldArray({
        control: structureControl,
        name: "deductions"
    });

    // Real-time calculation using useWatch
    const basicSalary = useWatch({ control: structureControl, name: "basicSalary" }) || 0;
    const allowances = useWatch({ control: structureControl, name: "allowances" }) || [];
    const deductions = useWatch({ control: structureControl, name: "deductions" }) || [];

    const totalAllowances = allowances.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const estimatedNetSalary = Number(basicSalary) + totalAllowances - totalDeductions;

    // --- Effects & Data Loading ---
    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        if (activeTab === 'generate') {
            fetchPayrollHistory();
        }
    }, [activeTab, watchMonth, watchYear]);

    const fetchStaff = async () => {
        setLoadingStaff(true);
        try {
            const response = await staffService.getAllStaff();
            if (response.data?.success) {
                setStaffList(response.data.data.staff || []);
            }
        } catch (error) {
            addToast({ title: "Error", description: "Failed to load staff list", color: "danger" });
        } finally {
            setLoadingStaff(false);
        }
    };

    const fetchPayrollHistory = async (overrideParams = null) => {
        setLoadingHistory(true);
        const queryParams = overrideParams || { month: watchMonth, year: watchYear };
        try {
            const response = await payrollService.getPayrolls(queryParams);
            if (response.success) {
                setPayrollHistory(response.data || []);
            } else {
                setPayrollHistory([]);
            }
        } catch (error) {
            console.error(error);
            setPayrollHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    // --- Handlers ---

    const onGeneratePayroll = async (data) => {
        try {
            const response = await payrollService.generatePayroll({ month: data.month, year: data.year });
            if (response.success) {
                addToast({ title: "Success", description: response.message || "Payroll generated successfully", color: "success" });
                // Small delay to ensure DB write propogation
                setTimeout(() => {
                    fetchPayrollHistory({ month: data.month, year: data.year });
                }, 500);
            } else {
                addToast({ title: "Error", description: response.message || "Failed to generate payroll", color: "danger" });
            }
        } catch (error) {
            console.error(error);
            addToast({ title: "Error", description: "An error occurred while generating payroll", color: "danger" });
        }
    };

    const onSaveStructure = async (data) => {
        try {
            const response = await payrollService.upsertSalaryStructure({
                staffId: data.staffId,
                basicSalary: data.basicSalary,
                allowances: data.allowances,
                deductions: data.deductions
            });
            if (response.success) {
                addToast({ title: "Success", description: "Salary structure saved successfully", color: "success" });
            } else {
                addToast({ title: "Error", description: "Failed to save salary structure", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An error occurred while saving structure", color: "danger" });
        }
    };

    const handleStaffSelect = async (staffId) => {
        // Reset form first with new staffId
        resetStructureForm({ staffId, basicSalary: 0, allowances: [], deductions: [] });

        // Fetch existing structure
        try {
            const response = await payrollService.getSalaryStructure(staffId);
            if (response.success && response.data) {
                const s = response.data;
                resetStructureForm({
                    staffId: s.staffId,
                    basicSalary: s.basicSalary,
                    allowances: s.allowances || [],
                    deductions: s.deductions || []
                });
            } else {
                // If no structure, maybe pre-fill basics? Nah, leave empty/default
            }
        } catch (error) {
            console.error("Failed to fetch structure", error);
        }
    };

    const handleDownloadPayslip = async (id, name) => {
        try {
            const blob = await payrollService.getPayslip(id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payslip_${name}_${watchMonth}_${watchYear}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            addToast({ title: "Error", description: "Failed to download payslip", color: "danger" });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payroll Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage salaries and generate monthly payrolls</p>
            </div>

            <Card className="p-4">
                <Tabs
                    aria-label="Payroll Options"
                    color="primary"
                    variant="underlined"
                    selectedKey={activeTab}
                    onSelectionChange={setActiveTab}
                >
                    <Tab
                        key="generate"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:indian-rupee" />
                                <span>Generate Payroll</span>
                            </div>
                        }
                    >
                        <CardBody className="pt-6 space-y-6">
                            {/* Generation Form */}
                            <form onSubmit={handleGenerateSubmit(onGeneratePayroll)} className="flex flex-col sm:flex-row gap-4 items-end bg-default-50 p-4 rounded-lg">
                                <Controller
                                    name="month"
                                    control={generateControl}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            type="number"
                                            label="Month"
                                            placeholder="1-12"
                                            errorMessage={fieldState.error?.message}
                                            isInvalid={!!fieldState.error}
                                            {...field}
                                            className="max-w-xs bg-white dark:bg-black"
                                        />
                                    )}
                                />
                                <Controller
                                    name="year"
                                    control={generateControl}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            type="number"
                                            label="Year"
                                            placeholder="2024"
                                            errorMessage={fieldState.error?.message}
                                            isInvalid={!!fieldState.error}
                                            {...field}
                                            className="max-w-xs bg-white dark:bg-black"
                                        />
                                    )}
                                />
                                <Button
                                    color="success"
                                    type="submit"
                                    isLoading={isGenerating}
                                    className="text-white"
                                    startContent={!isGenerating && <Icon icon="lucide:play" />}
                                >
                                    Generate / Update Payroll
                                </Button>
                            </form>

                            <Divider />

                            {/* History Table */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Payroll History for {watchMonth}/{watchYear}</h3>
                                <Table aria-label="Payroll History">
                                    <TableHeader>
                                        <TableColumn>EMPLOYEE</TableColumn>
                                        <TableColumn>BASIC</TableColumn>
                                        <TableColumn>DEDUCTIONS</TableColumn>
                                        <TableColumn>NET SALARY</TableColumn>
                                        <TableColumn>STATUS</TableColumn>
                                        <TableColumn>ACTIONS</TableColumn>
                                    </TableHeader>
                                    <TableBody
                                        isLoading={loadingHistory}
                                        emptyContent="No payroll records generated for this period."
                                    >
                                        {payrollHistory.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{record.StaffProfile?.User?.name || "Unknown"}</p>
                                                        <p className="text-tiny text-default-500">{record.StaffProfile?.employeeCode}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>₹{record.basicSalary}</TableCell>
                                                <TableCell className="text-danger">₹{record.deductions}</TableCell>
                                                <TableCell className="font-bold text-success">₹{record.netSalary}</TableCell>
                                                <TableCell>
                                                    <Chip color={record.status === 'PAID' ? 'success' : 'warning'} size="sm" variant="flat">
                                                        {record.status}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="primary"
                                                        startContent={<Icon icon="lucide:download" />}
                                                        onPress={() => handleDownloadPayslip(record.id, record.StaffProfile?.User?.name)}
                                                    >
                                                        Payslip
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardBody>
                    </Tab>
                    <Tab
                        key="structure"
                        title={
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:settings" />
                                <span>Salary Structures</span>
                            </div>
                        }
                    >
                        <CardBody className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Col: Form */}
                            <div className="lg:col-span-2">
                                <form onSubmit={handleStructureSubmit(onSaveStructure)} className="space-y-6">
                                    <Controller
                                        name="staffId"
                                        control={structureControl}
                                        render={({ field, fieldState }) => (
                                            <Select
                                                label="Select Staff Member"
                                                placeholder="Search staff..."
                                                isLoading={loadingStaff}
                                                selectedKeys={field.value ? [field.value] : []}
                                                onChange={(e) => handleStaffSelect(e.target.value)}
                                                errorMessage={fieldState.error?.message}
                                                isInvalid={!!fieldState.error}
                                            >
                                                {staffList.map((s) => (
                                                    <SelectItem key={s.StaffProfile?.id} value={s.StaffProfile?.id} textValue={s.name}>
                                                        <div className="flex flex-col">
                                                            <span className="text-small">{s.name}</span>
                                                            <span className="text-tiny text-default-400">{s.StaffProfile?.employeeCode || "No Code"}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        )}
                                    />

                                    <Divider />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="basicSalary"
                                            control={structureControl}
                                            render={({ field, fieldState }) => (
                                                <Input
                                                    type="number"
                                                    label="Basic Salary"
                                                    placeholder="0.00"
                                                    startContent={<span className="text-default-400 text-small">₹</span>}
                                                    errorMessage={fieldState.error?.message}
                                                    isInvalid={!!fieldState.error}
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Allowances */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-small">Allowances</h4>
                                            <Button size="sm" variant="flat" color="primary" onPress={() => appendAllowance({ name: "", amount: 0 })}>
                                                + Add Allowance
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {allowanceFields.map((field, index) => (
                                                <div key={field.id} className="flex gap-2 items-center">
                                                    <Controller
                                                        name={`allowances.${index}.name`}
                                                        control={structureControl}
                                                        render={({ field }) => <Input {...field} placeholder="Name (e.g. HRA)" size="sm" />}
                                                    />
                                                    <Controller
                                                        name={`allowances.${index}.amount`}
                                                        control={structureControl}
                                                        render={({ field }) => <Input {...field} type="number" placeholder="Amount" size="sm" />}
                                                    />
                                                    <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => removeAllowance(index)}>
                                                        <Icon icon="lucide:trash" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {allowanceFields.length === 0 && <p className="text-tiny text-default-400 italic">No allowances added.</p>}
                                        </div>
                                    </div>

                                    {/* Deductions */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-small">Deductions</h4>
                                            <Button size="sm" variant="flat" color="danger" onPress={() => appendDeduction({ name: "", amount: 0 })}>
                                                + Add Deduction
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {deductionFields.map((field, index) => (
                                                <div key={field.id} className="flex gap-2 items-center">
                                                    <Controller
                                                        name={`deductions.${index}.name`}
                                                        control={structureControl}
                                                        render={({ field }) => <Input {...field} placeholder="Name (e.g. PF)" size="sm" />}
                                                    />
                                                    <Controller
                                                        name={`deductions.${index}.amount`}
                                                        control={structureControl}
                                                        render={({ field }) => <Input {...field} type="number" placeholder="Amount" size="sm" />}
                                                    />
                                                    <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => removeDeduction(index)}>
                                                        <Icon icon="lucide:trash" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {deductionFields.length === 0 && <p className="text-tiny text-default-400 italic">No deductions added.</p>}
                                        </div>
                                    </div>

                                    <Button
                                        color="primary"
                                        type="submit"
                                        isLoading={isSavingStructure}
                                        className="w-full"
                                        size="lg"
                                    >
                                        Save Salary Structure
                                    </Button>
                                </form>
                            </div>

                            {/* Right Col: Summary */}
                            <div className="lg:col-span-1">
                                <Card className="bg-default-50 sticky top-4">
                                    <CardBody className="space-y-4">
                                        <h3 className="text-lg font-bold">Estimated Salary</h3>
                                        <Divider />
                                        <div className="flex justify-between text-sm">
                                            <span>Basic Salary</span>
                                            <span>₹{Number(basicSalary).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-success">
                                            <span>Total Allowances</span>
                                            <span>+ ₹{totalAllowances.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-danger">
                                            <span>Total Deductions</span>
                                            <span>- ₹{totalDeductions.toFixed(2)}</span>
                                        </div>
                                        <Divider />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Net Salary</span>
                                            <span>₹{estimatedNetSalary.toFixed(2)}</span>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        </CardBody>
                    </Tab>
                </Tabs>
            </Card>
        </div>
    );
};

export default PayrollManagement;
