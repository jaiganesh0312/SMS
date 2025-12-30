import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Chip,
    Spinner,
    Select,
    SelectItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { transportService } from '@/services';
import { staffService } from '@/services';

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
            console.error(err);
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
            console.error('Failed to load staff:', err);
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Buses</h1>
                    <p className="text-default-500">Add, edit, and manage school buses</p>
                </div>
                <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={onOpen}>
                    Add Bus
                </Button>
            </div>

            <Card>
                <CardBody>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="lg" />
                        </div>
                    ) : (
                        <Table aria-label="Buses table">
                            <TableHeader columns={columns}>
                                {(column) => (
                                    <TableColumn key={column.key}>{column.label}</TableColumn>
                                )}
                            </TableHeader>
                            <TableBody items={buses} emptyContent="No buses found">
                                {(bus) => (
                                    <TableRow key={bus.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Icon icon="mdi:bus" className="text-primary" width={20} />
                                                <span className="font-medium">{bus.busNumber}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{bus.registrationNumber}</TableCell>
                                        <TableCell>
                                            {bus.driver?.name || (
                                                <span className="text-default-400">Not assigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{bus.capacity}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                color={bus.isActive ? 'success' : 'danger'}
                                                variant="flat"
                                            >
                                                {bus.isActive ? 'Active' : 'Inactive'}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    isIconOnly
                                                    variant="flat"
                                                    onPress={() => handleEdit(bus)}
                                                >
                                                    <Icon icon="mdi:pencil" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    isIconOnly
                                                    variant="flat"
                                                    color="danger"
                                                    onPress={() => handleDelete(bus.id)}
                                                >
                                                    <Icon icon="mdi:delete" />
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
            <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
                <ModalContent>
                    <ModalHeader>{editingBus ? 'Edit Bus' : 'Add New Bus'}</ModalHeader>
                    <ModalBody className="space-y-4">
                        {error && (
                            <div className="p-3 bg-danger-50 text-danger rounded-lg">{error}</div>
                        )}
                        <Input
                            label="Bus Number"
                            name="busNumber"
                            placeholder="e.g., BUS-001"
                            value={formData.busNumber}
                            onChange={handleInputChange}
                            isRequired
                        />
                        <Input
                            label="Registration Number"
                            name="registrationNumber"
                            placeholder="e.g., KA-01-AB-1234"
                            value={formData.registrationNumber}
                            onChange={handleInputChange}
                            isRequired
                        />
                        <Select
                            label="Driver (Optional)"
                            placeholder="Select a driver"
                            selectedKeys={formData.driverId ? [formData.driverId] : []}
                            onSelectionChange={(keys) =>
                                setFormData((prev) => ({ ...prev, driverId: [...keys][0] || '' }))
                            }
                        >
                            {staff.map((s) => (
                                <SelectItem key={s.id} textValue={s.User?.name || s.name}>
                                    {s.User?.name || s.name}
                                </SelectItem>
                            ))}
                        </Select>
                        <Input
                            label="Device ID (Optional)"
                            name="deviceId"
                            placeholder="GPS device identifier"
                            value={formData.deviceId}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Capacity"
                            name="capacity"
                            type="number"
                            placeholder="Seating capacity"
                            value={formData.capacity}
                            onChange={handleInputChange}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleSubmit}>
                            {editingBus ? 'Update' : 'Create'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default ManageBuses;
