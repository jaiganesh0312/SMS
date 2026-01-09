import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Chip,
    Select,
    SelectItem,
    Card,
    CardHeader,
    CardBody,
    Spinner,
    addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { financeService, academicService } from '@/services';

const feeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    amount: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0, "Amount must be positive")),
    classId: z.string().min(1, "Class is required"),
    frequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME']),
    dueDate: z.string().min(1, "Due date is required"),
});

export default function FeeStructure() {
    const [fees, setFees] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
        resolver: zodResolver(feeSchema)
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [feeRes, classRes] = await Promise.all([
                financeService.getFeeStructures(),
                academicService.getAllClasses()
            ]);

            if (feeRes.data?.success) setFees(feeRes.data.data?.fees || []);
            if (classRes.data?.success) setClasses(classRes.data.data?.classes || []);
        } catch (error) {
            addToast({
                title: 'Error',
                description: 'Failed to load fee structures',
                color: 'danger',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (data) => {
        try {
            const response = await financeService.createFeeStructure(data);
            if (response.data?.success) {
                addToast({
                    title: 'Success',
                    description: 'Fee structure created successfully',
                    color: 'success',
                });
                fetchData();
                onClose();
                reset();
            } else {
                addToast({
                    title: 'Error',
                    description: response.data?.message || 'Failed to create fee structure',
                    color: 'danger',
                });
            }
        } catch (error) {
            addToast({
                title: 'Error',
                description: 'Failed to create fee structure',
                color: 'danger',
            });
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Fee Structures</h1>
                    <p className="text-default-500 mt-1">
                        Manage school fees and payment structures
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        color="primary"
                        variant="flat"
                        startContent={<Icon icon="mdi:refresh" />}
                        onPress={fetchData}
                        isLoading={isLoading}
                    >
                        Refresh
                    </Button>
                    <Button
                        color="primary"
                        startContent={<Icon icon="mdi:plus" />}
                        onPress={onOpen}
                    >
                        Add Fee
                    </Button>
                </div>
            </div>

            {/* Fee Structures Table */}
            <Card className="bg-content1 border border-default-200 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:file-document-multiple" size={24} className="text-primary" />
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Fee Structures</h2>
                            <p className="text-sm text-default-500">
                                {fees.length} fee structure{fees.length !== 1 ? 's' : ''} configured
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    <Table aria-label="Fee structures table" shadow="none" classNames={{
                        wrapper: "bg-content1 shadow-none overflow-x-auto",
                        th: "bg-default-100 text-default-500 font-medium",
                        td: "text-foreground group-hover:bg-default-50"
                    }}>
                        <TableHeader>
                            <TableColumn>NAME</TableColumn>
                            <TableColumn>CLASS</TableColumn>
                            <TableColumn>AMOUNT</TableColumn>
                            <TableColumn>FREQUENCY</TableColumn>
                            <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody
                            emptyContent={
                                <div className="text-center py-12">
                                    <Icon
                                        icon="mdi:file-document-outline"
                                        className="mx-auto text-default-400 text-6xl mb-4 opacity-50"
                                    />
                                    <p className="text-lg font-medium text-foreground">
                                        No fee structures found
                                    </p>
                                    <p className="text-sm text-default-500 mt-1">
                                        Create your first fee structure to get started
                                    </p>
                                    <Button
                                        color="primary"
                                        className="mt-4"
                                        startContent={<Icon icon="mdi:plus" />}
                                        onPress={onOpen}
                                    >
                                        Add Fee Structure
                                    </Button>
                                </div>
                            }
                            isLoading={isLoading}
                            loadingContent={<Spinner label="Loading fee structures..." />}
                        >
                            {fees.map((fee) => (
                                <TableRow key={fee.id} className="border-b border-default-100 last:border-none">
                                    <TableCell className="font-medium">{fee.name}</TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat" color="primary">
                                            {classes.find(c => c.id === fee.classId)?.name || 'All Classes'}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Icon icon="mdi:currency-rupee" className="text-default-400" />
                                            <span className="font-medium">₹{fee.amount?.toLocaleString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat" color="warning">{fee.frequency}</Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="primary"
                                            >
                                                <Icon icon="mdi:pencil" className="text-lg" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Add Fee Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <ModalHeader className="border-b border-default-200">
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:plus-circle" className="text-primary" />
                                    <span className="text-foreground">Add New Fee Structure</span>
                                </div>
                            </ModalHeader>
                            <ModalBody className="py-6">
                                <div className="space-y-4">
                                    <div className='grid gap-3'>
                                        <Input
                                            {...register('name')}
                                            label="Fee Name"
                                            placeholder="e.g. Tuition Fee"
                                            variant="bordered"
                                            isInvalid={!!errors.name}
                                            errorMessage={errors.name?.message}
                                            startContent={<Icon icon="mdi:text" className="text-default-400" />}
                                        />

                                        <Select
                                            label="Class"
                                            {...register('classId')}
                                            variant="bordered"
                                            isInvalid={!!errors.classId}
                                            errorMessage={errors.classId?.message}
                                            placeholder="Select a class"
                                            startContent={<Icon icon="mdi:google-classroom" className="text-default-400" />}
                                        >
                                            {classes.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id}>
                                                    {cls.name} - {cls.section}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            {...register('amount')}
                                            type="number"
                                            label="Amount"
                                            placeholder="0"
                                            variant="bordered"
                                            startContent={<Icon icon="mdi:currency-rupee" className="text-default-400" />}
                                            isInvalid={!!errors.amount}
                                            errorMessage={errors.amount?.message}
                                        />
                                        <Select
                                            label="Frequency"
                                            {...register('frequency')}
                                            variant="bordered"
                                            isInvalid={!!errors.frequency}
                                            errorMessage={errors.frequency?.message}
                                            placeholder="Select frequency"
                                            startContent={<Icon icon="mdi:calendar-refresh" className="text-default-400" />}
                                        >
                                            {['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME'].map((f) => (
                                                <SelectItem key={f} value={f}>{f.replace('_', ' ')}</SelectItem>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className='grid gap-3'>
                                        <Input
                                            {...register('dueDate')}
                                            type="date"
                                            label="Due Date"
                                            variant="bordered"
                                            isInvalid={!!errors.dueDate}
                                            errorMessage={errors.dueDate?.message}
                                            startContent={<Icon icon="mdi:calendar" className="text-default-400" />}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="border-t border-default-200">
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    type="submit"
                                    startContent={<Icon icon="mdi:check-bold" />}
                                >
                                    Create Fee
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
