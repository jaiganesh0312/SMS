import { PageHeader } from '@/components/common';
import { studentService, transportService } from '@/services';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
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
            <PageHeader
                title="Bus Assignments"
                subtitle="Assign students to buses"
                action={
                    <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={onOpen}>
                        Assign Student
                    </Button>
                }
            />

            <Card className="bg-content1 border border-default-200 shadow-sm">
                <CardHeader className="bg-default-50 border-b border-default-100 px-6 py-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <span className="font-medium text-default-500 whitespace-nowrap">Filter by Bus:</span>
                        <Select
                            className="w-48"
                            size="sm"
                            placeholder="All buses"
                            selectedKeys={selectedBus ? [selectedBus] : []}
                            onSelectionChange={(keys) => setSelectedBus([...keys][0] || '')}
                            variant="flat"
                        >
                            {buses.map((bus) => (
                                <SelectItem key={bus.id} textValue={bus.busNumber}>
                                    {bus.busNumber}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="lg" />
                        </div>
                    ) : (
                        <Table
                            aria-label="Assignments table"
                            shadow="none"
                            classNames={{
                                wrapper: "shadow-none bg-content1",
                                th: "bg-default-100 text-default-500 font-medium",
                                td: "py-3"
                            }}
                        >
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
                                    <TableRow key={assignment.id} className="border-b border-default-100 last:border-0 hover:bg-default-50">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-primary/10 rounded-full">
                                                    <Icon icon="mdi:account" className="text-primary" width={16} />
                                                </div>
                                                <span className="font-medium text-foreground">{assignment.Student?.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell><span className="text-default-500">{assignment.Student?.admissionNumber}</span></TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="flat" color="primary" classNames={{ content: "font-medium" }}>
                                                {assignment.Bus?.busNumber}
                                            </Chip>
                                        </TableCell>
                                        <TableCell><span className="text-foreground">{assignment.BusRoute?.routeName || '-'}</span></TableCell>
                                        <TableCell><span className="text-default-500">{assignment.stopName || '-'}</span></TableCell>
                                        <TableCell><span className="text-default-500 font-mono">{assignment.pickupTime || '-'}</span></TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                isIconOnly
                                                variant="light"
                                                color="danger"
                                                onPress={() => handleRemove(assignment.studentId)}
                                            >
                                                <Icon icon="mdi:delete" width={20} />
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
            {/* Assign Modal */}
            <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg" classNames={{
                base: "bg-content1 border border-default-200",
                header: "border-b border-default-200",
                footer: "border-t border-default-200"
            }}>
                <ModalContent>
                    <ModalHeader className="flex gap-2 items-center">
                        <Icon icon="mdi:account-plus" className="text-primary" />
                        Assign Student to Bus
                    </ModalHeader>
                    <ModalBody className="space-y-4 py-6">
                        {error && (
                            <div className="p-3 bg-danger-50 text-danger rounded-lg border border-danger-200 text-sm">{error}</div>
                        )}

                        <Select
                            label="Student"
                            placeholder="Select student"
                            selectedKeys={formData.studentId ? [formData.studentId] : []}
                            onSelectionChange={(keys) =>
                                setFormData((prev) => ({ ...prev, studentId: [...keys][0] || '' }))
                            }
                            isRequired
                            variant="bordered"
                            labelPlacement="outside"
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
                            variant="bordered"
                            labelPlacement="outside"
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
                                variant="bordered"
                                labelPlacement="outside"
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
                            variant="bordered"
                            labelPlacement="outside"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Pickup Time"
                                type="time"
                                value={formData.pickupTime}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, pickupTime: e.target.value }))
                                }
                                variant="bordered"
                                labelPlacement="outside"
                            />
                            <Input
                                label="Dropoff Time"
                                type="time"
                                value={formData.dropoffTime}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, dropoffTime: e.target.value }))
                                }
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
                            Assign
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default BusAssignments;
