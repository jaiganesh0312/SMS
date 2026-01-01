import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
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
    Input,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { transportService } from '@/services';
import { studentService } from '@/services';

const BusAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBus, setSelectedBus] = useState('');
    const [formData, setFormData] = useState({
        studentId: '',
        busId: '',
        routeId: '',
        stopName: '',
        pickupTime: '',
        dropoffTime: '',
    });
    const [error, setError] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignmentsRes, busesRes, studentsRes] = await Promise.all([
                transportService.getBusAssignments(selectedBus || undefined),
                transportService.getAllBuses(),
                studentService.getAllStudents(),
            ]);

            if (assignmentsRes.data?.success) {
                setAssignments(assignmentsRes.data.data);
            }
            if (busesRes.data?.success) {
                setBuses(busesRes.data.data);
            }
            if (studentsRes.data?.success) {
                setStudents(studentsRes.data.data.students);
            }
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedBus]);

    const fetchRoutesForBus = async (busId) => {
        try {
            const res = await transportService.getRoutes(busId);
            if (res.data?.success) {
                setRoutes(res.data.data);
            }
        } catch (err) {
        }
    };

    const handleBusChange = (busId) => {
        setFormData((prev) => ({ ...prev, busId, routeId: '' }));
        if (busId) {
            fetchRoutesForBus(busId);
        } else {
            setRoutes([]);
        }
    };

    const handleSubmit = async () => {
        try {
            await transportService.assignStudentToBus(formData);
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Assignment failed');
        }
    };

    const handleRemove = async (studentId) => {
        if (window.confirm('Remove this student from bus?')) {
            try {
                await transportService.removeStudentFromBus(studentId);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Removal failed');
            }
        }
    };

    const handleCloseModal = () => {
        setFormData({
            studentId: '',
            busId: '',
            routeId: '',
            stopName: '',
            pickupTime: '',
            dropoffTime: '',
        });
        setError(null);
        onClose();
    };

    // Filter out already assigned students
    const unassignedStudents = students.filter(
        (s) => !assignments.some((a) => a.studentId === s.id)
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Bus Assignments</h1>
                    <p className="text-default-500">Assign students to buses</p>
                </div>
                <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={onOpen}>
                    Assign Student
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <span className="font-medium">Filter by Bus:</span>
                        <Select
                            className="w-48"
                            size="sm"
                            placeholder="All buses"
                            selectedKeys={selectedBus ? [selectedBus] : []}
                            onSelectionChange={(keys) => setSelectedBus([...keys][0] || '')}
                        >
                            {buses.map((bus) => (
                                <SelectItem key={bus.id} textValue={bus.busNumber}>
                                    {bus.busNumber}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="lg" />
                        </div>
                    ) : (
                        <Table aria-label="Assignments table">
                            <TableHeader>
                                <TableColumn>Student</TableColumn>
                                <TableColumn>Admission No.</TableColumn>
                                <TableColumn>Bus</TableColumn>
                                <TableColumn>Route</TableColumn>
                                <TableColumn>Stop</TableColumn>
                                <TableColumn>Pickup</TableColumn>
                                <TableColumn>Actions</TableColumn>
                            </TableHeader>
                            <TableBody items={assignments} emptyContent="No assignments found">
                                {(assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell>
                                            <span className="font-medium">{assignment.Student?.name}</span>
                                        </TableCell>
                                        <TableCell>{assignment.Student?.admissionNumber}</TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="flat" color="primary">
                                                {assignment.Bus?.busNumber}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>{assignment.BusRoute?.routeName || '-'}</TableCell>
                                        <TableCell>{assignment.stopName || '-'}</TableCell>
                                        <TableCell>{assignment.pickupTime || '-'}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                isIconOnly
                                                variant="flat"
                                                color="danger"
                                                onPress={() => handleRemove(assignment.studentId)}
                                            >
                                                <Icon icon="mdi:delete" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Assign Modal */}
            <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
                <ModalContent>
                    <ModalHeader>Assign Student to Bus</ModalHeader>
                    <ModalBody className="space-y-4">
                        {error && (
                            <div className="p-3 bg-danger-50 text-danger rounded-lg">{error}</div>
                        )}

                        <Select
                            label="Student"
                            placeholder="Select student"
                            selectedKeys={formData.studentId ? [formData.studentId] : []}
                            onSelectionChange={(keys) =>
                                setFormData((prev) => ({ ...prev, studentId: [...keys][0] || '' }))
                            }
                            isRequired
                        >
                            {unassignedStudents.map((student) => (
                                <SelectItem key={student.id} textValue={student.name}>
                                    {student.name} ({student.admissionNumber})
                                </SelectItem>
                            ))}
                        </Select>

                        <Select
                            label="Bus"
                            placeholder="Select bus"
                            selectedKeys={formData.busId ? [formData.busId] : []}
                            onSelectionChange={(keys) => handleBusChange([...keys][0] || '')}
                            isRequired
                        >
                            {buses.map((bus) => (
                                <SelectItem key={bus.id} textValue={bus.busNumber}>
                                    {bus.busNumber} - {bus.registrationNumber}
                                </SelectItem>
                            ))}
                        </Select>

                        {routes.length > 0 && (
                            <Select
                                label="Route (Optional)"
                                placeholder="Select route"
                                selectedKeys={formData.routeId ? [formData.routeId] : []}
                                onSelectionChange={(keys) =>
                                    setFormData((prev) => ({ ...prev, routeId: [...keys][0] || '' }))
                                }
                            >
                                {routes.map((route) => (
                                    <SelectItem key={route.id} textValue={route.routeName}>
                                        {route.routeName}
                                    </SelectItem>
                                ))}
                            </Select>
                        )}

                        <Input
                            label="Stop Name (Optional)"
                            placeholder="e.g., Main Street"
                            value={formData.stopName}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, stopName: e.target.value }))
                            }
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Pickup Time"
                                type="time"
                                value={formData.pickupTime}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, pickupTime: e.target.value }))
                                }
                            />
                            <Input
                                label="Dropoff Time"
                                type="time"
                                value={formData.dropoffTime}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, dropoffTime: e.target.value }))
                                }
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleSubmit}>
                            Assign
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default BusAssignments;
