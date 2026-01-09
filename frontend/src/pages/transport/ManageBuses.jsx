import { PageHeader } from '@/components/common';
import { staffService, transportService } from '@/services';
import {
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure
} from '@heroui/react';
import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';

const ManageBuses = () => {
    const [buses, setBuses] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        busNumber: '',
        registrationNumber: '',
        driverId: '',
        deviceId: '',
        capacity: 40,
    });
    const [editingBus, setEditingBus] = useState(null);
    const [error, setError] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchBuses = async () => {
        try {
            setLoading(true);
            const response = await transportService.getAllBuses();
            if (response.data?.success) {
                setBuses(response.data.data);
            }
        } catch (err) {
            setError('Failed to load buses');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await staffService.getAllStaff({ role: "BUS_DRIVER" });
            if (response.data?.success) {
                setStaff(response.data.data.staff);
            }
        } catch (err) {
        }
    };

    useEffect(() => {
        fetchBuses();
        fetchStaff();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (editingBus) {
                await transportService.updateBus(editingBus.id, formData);
            } else {
                await transportService.createBus(formData);
            }
            fetchBuses();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (bus) => {
        setEditingBus(bus);
        setFormData({
            busNumber: bus.busNumber,
            registrationNumber: bus.registrationNumber,
            driverId: bus.driverId || '',
            deviceId: bus.deviceId || '',
            capacity: bus.capacity || 40,
        });
        onOpen();
    };

    const handleDelete = async (busId) => {
        if (window.confirm('Are you sure you want to delete this bus?')) {
            try {
                await transportService.deleteBus(busId);
                fetchBuses();
            } catch (err) {
                setError(err.response?.data?.message || 'Delete failed');
            }
        }
    };

    const handleCloseModal = () => {
        setEditingBus(null);
        setFormData({
            busNumber: '',
            registrationNumber: '',
            driverId: '',
            deviceId: '',
            capacity: 40,
        });
        setError(null);
        onClose();
    };

    const columns = [
        { key: 'busNumber', label: 'Bus Number' },
        { key: 'registrationNumber', label: 'Registration' },
        { key: 'driver', label: 'Driver' },
        { key: 'capacity', label: 'Capacity' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: 'Actions' },
    ];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Manage Buses"
                subtitle="Add, edit, and manage school buses"
                action={
                    <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={onOpen}>
                        Add Bus
                    </Button>
                }
            />

            <Card className="bg-content1 border border-default-200 shadow-sm">
                <CardBody className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="lg" />
                        </div>
                    ) : (
                        <Table
                            aria-label="Buses table"
                            shadow="none"
                            classNames={{
                                wrapper: "shadow-none bg-content1",
                                th: "bg-default-100 text-default-500 font-medium",
                                td: "py-3"
                            }}
                        >
                            <TableHeader columns={columns}>
                                {(column) => (
                                    <TableColumn key={column.key}>{column.label}</TableColumn>
                                )}
                            </TableHeader>
                            <TableBody items={buses} emptyContent="No buses found">
                                {(bus) => (
                                    <TableRow key={bus.id} className="border-b border-default-100 last:border-0 hover:bg-default-50">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Icon icon="mdi:bus" className="text-primary" width={20} />
                                                </div>
                                                <span className="font-medium text-foreground">{bus.busNumber}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell><span className="text-default-500">{bus.registrationNumber}</span></TableCell>
                                        <TableCell>
                                            {bus.driver?.name ? (
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="mdi:account" className="text-default-400" />
                                                    <span className="text-foreground">{bus.driver.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-default-400 italic">Not assigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell><span className="text-default-500">{bus.capacity} seats</span></TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                color={bus.isActive ? 'success' : 'danger'}
                                                variant="flat"
                                                classNames={{ content: "font-medium" }}
                                            >
                                                {bus.isActive ? 'Active' : 'Inactive'}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    isIconOnly
                                                    variant="light"
                                                    color="default"
                                                    onPress={() => handleEdit(bus)}
                                                >
                                                    <Icon icon="mdi:pencil" width={20} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    isIconOnly
                                                    variant="light"
                                                    color="danger"
                                                    onPress={() => handleDelete(bus.id)}
                                                >
                                                    <Icon icon="mdi:delete" width={20} />
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

            {/* Add/Edit Modal */}
            {/* Add/Edit Modal */}
            <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg" classNames={{
                base: "bg-content1 border border-default-200",
                header: "border-b border-default-200",
                footer: "border-t border-default-200"
            }}>
                <ModalContent>
                    <ModalHeader className="flex gap-2 items-center">
                        <Icon icon={editingBus ? "mdi:pencil" : "mdi:plus-circle"} className="text-primary" />
                        {editingBus ? 'Edit Bus' : 'Add New Bus'}
                    </ModalHeader>
                    <ModalBody className="space-y-4 py-6">
                        {error && (
                            <div className="p-3 bg-danger-50 text-danger rounded-lg border border-danger-200 text-sm">{error}</div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Bus Number"
                                name="busNumber"
                                placeholder="e.g., BUS-001"
                                value={formData.busNumber}
                                onChange={handleInputChange}
                                isRequired
                                variant="bordered"
                                labelPlacement="outside"
                            />
                            <Input
                                label="Registration Number"
                                name="registrationNumber"
                                placeholder="e.g., KA-01-AB-1234"
                                value={formData.registrationNumber}
                                onChange={handleInputChange}
                                isRequired
                                variant="bordered"
                                labelPlacement="outside"
                            />
                        </div>
                        <Select
                            label="Driver (Optional)"
                            placeholder="Select a driver"
                            selectedKeys={formData.driverId ? [formData.driverId] : []}
                            onSelectionChange={(keys) =>
                                setFormData((prev) => ({ ...prev, driverId: [...keys][0] || '' }))
                            }
                            variant="bordered"
                            labelPlacement="outside"
                        >
                            {staff.map((s) => (
                                <SelectItem key={s.id} textValue={s.User?.name || s.name}>
                                    {s.User?.name || s.name}
                                </SelectItem>
                            ))}
                        </Select>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Device ID (Optional)"
                                name="deviceId"
                                placeholder="GPS device identifier"
                                value={formData.deviceId}
                                onChange={handleInputChange}
                                variant="bordered"
                                labelPlacement="outside"
                            />
                            <Input
                                label="Capacity"
                                name="capacity"
                                type="number"
                                placeholder="Seating capacity"
                                value={formData.capacity}
                                onChange={handleInputChange}
                                variant="bordered"
                                labelPlacement="outside"
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" color="default" onPress={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleSubmit} startContent={<Icon icon="mdi:check" />}>
                            {editingBus ? 'Update Bus' : 'Create Bus'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default ManageBuses;
