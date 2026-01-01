import React, { useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Select,
    SelectItem,
    addToast,
    Breadcrumbs,
    BreadcrumbItem
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { staffService } from "@/services";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const STAFF_ROLES = [
    { value: "TEACHER", label: "Teacher" },
    { value: "STAFF", label: "Staff" },
    { value: "LIBRARIAN", label: "Librarian" },
    { value: "BUS_DRIVER", label: "Bus Driver" }
];

const STEPS = [
    { id: 1, title: "Personal Details", icon: "lucide:user" },
    { id: 2, title: "Salary Structure", icon: "lucide:banknote" },
    { id: 3, title: "Login Credentials", icon: "lucide:lock" }
];

const CreateStaff = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loadingAction, setLoadingAction] = useState(false);

    const [formData, setFormData] = useState({
        // Personal
        name: "", email: "", phone: "",
        designation: "", department: "",
        workingAs: "TEACHER",
        joiningDate: new Date().toISOString().slice(0, 10),
        gender: "MALE", dob: "", address: "",
        // Salary
        basicSalary: "",
        allowances: [], // { name, amount }
        deductions: [], // { name, amount }
        // Login
        password: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAllowanceAdd = () => {
        setFormData(prev => ({
            ...prev,
            allowances: [...prev.allowances, { name: "", amount: "" }]
        }));
    };

    const handleDeductionAdd = () => {
        setFormData(prev => ({
            ...prev,
            deductions: [...prev.deductions, { name: "", amount: "" }]
        }));
    };

    const handleItemChange = (type, index, field, value) => {
        const updated = [...formData[type]];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, [type]: updated }));
    };

    const handleItemRemove = (type, index) => {
        const updated = formData[type].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [type]: updated }));
    };

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!formData.name || !formData.email || !formData.joiningDate || !formData.workingAs) {
                addToast({ title: "Validation Error", description: "Please fill required personal details", color: "danger" });
                return false;
            }
        } else if (currentStep === 3) {
            if (!formData.password) {
                addToast({ title: "Validation Error", description: "Password is required", color: "danger" });
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        setLoadingAction(true);
        try {
            const payload = {
                ...formData,
                schoolId: 1 // Ideally from context
            };
            const response = await staffService.createStaff(payload);
            if (response?.data?.success) {
                addToast({ title: "Success", description: "Staff registered successfully", color: "success" });
                navigate('/staff');
            } else {
                addToast({ title: "Error", description: response?.data?.message || "Registration failed", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An unexpected error occurred", color: "danger" });
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto min-h-screen">
            <div className="mb-6">
                <Breadcrumbs>
                    <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
                    <BreadcrumbItem href="/staff">Staff</BreadcrumbItem>
                    <BreadcrumbItem>Create Staff</BreadcrumbItem>
                </Breadcrumbs>
                <h1 className="text-3xl font-bold mt-2 text-gray-800">Onboard New Staff</h1>
                <p className="text-gray-500">Complete the steps below to add a new staff member to the system.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stepper Sidebar */}
                <Card className="lg:col-span-1 h-fit">
                    <CardBody className="py-6 px-4">
                        <div className="flex flex-col gap-6">
                            {STEPS.map((s, index) => (
                                <div key={s.id} className={`flex items-center gap-3 ${step === s.id ? "text-primary" : step > s.id ? "text-success" : "text-gray-400"}`}>
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm
                                        ${step === s.id ? "border-primary bg-primary-50" : step > s.id ? "border-success bg-success-50" : "border-gray-200"}
                                    `}>
                                        {step > s.id ? <Icon icon="lucide:check" /> : s.id}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-semibold ${step === s.id ? "text-gray-800" : ""}`}>{s.title}</span>
                                        {step === s.id && <span className="text-xs text-primary">In Progress</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Form Area */}
                <div className="lg:col-span-3">
                    <Card className="min-h-[500px]">
                        <CardHeader className="px-6 py-4 border-b">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Icon icon={STEPS[step - 1].icon} />
                                {STEPS[step - 1].title}
                            </h2>
                        </CardHeader>
                        <CardBody className="p-6">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {step === 1 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} isRequired placeholder="e.g. John Doe" variant="bordered" />
                                        <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} isRequired placeholder="john@example.com" variant="bordered" />
                                        <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" variant="bordered" />
                                        <Input label="Joining Date" type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} isRequired variant="bordered" />

                                        <Select
                                            label="Role / Working As"
                                            selectedKeys={[formData.workingAs]}
                                            onChange={(e) => handleSelectChange('workingAs', e.target.value)}
                                            variant="bordered"
                                        >
                                            {STAFF_ROLES.map(role => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}
                                        </Select>

                                        <Input label="Designation" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Senior Teacher" variant="bordered" />
                                        <Input label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Science" variant="bordered" />
                                        <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} variant="bordered" />

                                        <Select
                                            label="Gender"
                                            selectedKeys={[formData.gender]}
                                            onChange={(e) => handleSelectChange('gender', e.target.value)}
                                            variant="bordered"
                                        >
                                            <SelectItem key="MALE">Male</SelectItem>
                                            <SelectItem key="FEMALE">Female</SelectItem>
                                            <SelectItem key="OTHER">Other</SelectItem>
                                        </Select>

                                        <div className="md:col-span-2">
                                            <Input label="Residential Address" name="address" value={formData.address} onChange={handleChange} placeholder="Full address" variant="bordered" />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="max-w-md">
                                            <Input label="Basic Salary (Monthly)" type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange} placeholder="0.00" startContent="$" variant="bordered" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Allowances */}
                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-bold flex items-center gap-2">
                                                        <Icon icon="lucide:plus-circle" className="text-success" />
                                                        Allowances
                                                    </h4>
                                                    <Button size="sm" color="primary" variant="flat" onPress={handleAllowanceAdd}>Add Item</Button>
                                                </div>
                                                <div className="space-y-3">
                                                    {formData.allowances.map((item, i) => (
                                                        <div key={i} className="flex gap-2 items-center">
                                                            <Input size="sm" placeholder="Name (e.g. HRA)" value={item.name} onChange={(e) => handleItemChange('allowances', i, 'name', e.target.value)} className="flex-1" />
                                                            <Input size="sm" type="number" placeholder="Amount" value={item.amount} onChange={(e) => handleItemChange('allowances', i, 'amount', e.target.value)} className="w-32" />
                                                            <Button size="sm" isIconOnly color="danger" variant="light" onPress={() => handleItemRemove('allowances', i)}><Icon icon="lucide:trash" width={18} /></Button>
                                                        </div>
                                                    ))}
                                                    {formData.allowances.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No allowances added</p>}
                                                </div>
                                            </div>

                                            {/* Deductions */}
                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-bold flex items-center gap-2">
                                                        <Icon icon="lucide:minus-circle" className="text-danger" />
                                                        Deductions
                                                    </h4>
                                                    <Button size="sm" color="danger" variant="flat" onPress={handleDeductionAdd}>Add Item</Button>
                                                </div>
                                                <div className="space-y-3">
                                                    {formData.deductions.map((item, i) => (
                                                        <div key={i} className="flex gap-2 items-center">
                                                            <Input size="sm" placeholder="Name (e.g. Tax)" value={item.name} onChange={(e) => handleItemChange('deductions', i, 'name', e.target.value)} className="flex-1" />
                                                            <Input size="sm" type="number" placeholder="Amount" value={item.amount} onChange={(e) => handleItemChange('deductions', i, 'amount', e.target.value)} className="w-32" />
                                                            <Button size="sm" isIconOnly color="danger" variant="light" onPress={() => handleItemRemove('deductions', i)}><Icon icon="lucide:trash" width={18} /></Button>
                                                        </div>
                                                    ))}
                                                    {formData.deductions.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No deductions added</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="max-w-lg mx-auto py-10">
                                        <div className="text-center mb-8">
                                            <div className="w-16 h-16 bg-primary-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Icon icon="lucide:lock" width={32} />
                                            </div>
                                            <h3 className="text-xl font-bold">Secure Account Setup</h3>
                                            <p className="text-gray-500">Create login credentials for the new staff member.</p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Input
                                                label="Staff Email (Login ID)"
                                                value={formData.email}
                                                isDisabled
                                                variant="faded"
                                                startContent={<Icon icon="lucide:mail" className="text-gray-400" />}
                                            />
                                            <Input
                                                label="Set Password"
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                isRequired
                                                placeholder="Enter a strong password"
                                                variant="bordered"
                                                description="Password must be at least 6 characters long."
                                                startContent={<Icon icon="lucide:key" className="text-gray-400" />}
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </CardBody>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center rounded-b-xl">
                            <Button
                                variant="light"
                                onPress={step === 1 ? () => navigate('/staff') : handleBack}
                                startContent={<Icon icon="lucide:arrow-left" />}
                            >
                                {step === 1 ? "Cancel" : "Back"}
                            </Button>

                            {step < 3 ? (
                                <Button color="primary" onPress={handleNext} endContent={<Icon icon="lucide:arrow-right" />}>
                                    Next Step
                                </Button>
                            ) : (
                                <Button color="success" onPress={handleSubmit} isLoading={loadingAction} startContent={<Icon icon="lucide:check" />}>
                                    Create Staff Member
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CreateStaff;
