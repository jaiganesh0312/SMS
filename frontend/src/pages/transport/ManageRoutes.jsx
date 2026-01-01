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
    Textarea,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { transportService } from '@/services';

const ManageRoutes = () => {
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        busId: '',
        routeName: '',
        routeType: 'BOTH',
        stops: [],
    });
    const [editingRoute, setEditingRoute] = useState(null);
    const [error, setError] = useState(null);
    const [newStop, setNewStop] = useState({ name: '', lat: '', lng: '' });
    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [routesRes, busesRes] = await Promise.all([
                transportService.getRoutes(),
                transportService.getAllBuses(),
            ]);
            if (routesRes.data?.success) {
                setRoutes(routesRes.data.data);
            }
            if (busesRes.data?.success) {
                setBuses(busesRes.data.data);
            }
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddStop = () => {
        if (newStop.name && newStop.lat && newStop.lng) {
            setFormData((prev) => ({
                ...prev,
                stops: [
                    ...prev.stops,
                    {
                        ...newStop,
                        lat: parseFloat(newStop.lat),
                        lng: parseFloat(newStop.lng),
                        order: prev.stops.length + 1,
                    },
                ],
            }));
            setNewStop({ name: '', lat: '', lng: '' });
        }
    };

    const handleRemoveStop = (index) => {
        setFormData((prev) => ({
            ...prev,
            stops: prev.stops
                .filter((_, i) => i !== index)
                .map((s, i) => ({ ...s, order: i + 1 })),
        }));
    };

    const handleSubmit = async () => {
        try {
            if (editingRoute) {
                await transportService.updateRoute(editingRoute.id, formData);
            } else {
                await transportService.createRoute(formData);
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (route) => {
        setEditingRoute(route);
        setFormData({
            busId: route.busId,
            routeName: route.routeName,
            routeType: route.routeType,
            stops: route.stops || [],
        });
        onOpen();
    };

    const handleDelete = async (routeId) => {
        if (window.confirm('Are you sure you want to delete this route?')) {
            try {
                await transportService.deleteRoute(routeId);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Delete failed');
            }
        }
    };

    const handleCloseModal = () => {
        setEditingRoute(null);
        setFormData({
            busId: '',
            routeName: '',
            routeType: 'BOTH',
            stops: [],
        });
        setNewStop({ name: '', lat: '', lng: '' });
        setError(null);
        onClose();
    };

    const getRouteTypeColor = (type) => {
        switch (type) {
            case 'MORNING':
                return 'warning';
            case 'EVENING':
                return 'secondary';
            default:
                return 'primary';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Routes</h1>
                    <p className="text-default-500">Create and manage bus routes with stops</p>
                </div>
                <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={onOpen}>
                    Add Route
                </Button>
            </div>

            <Card>
                <CardBody>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="lg" />
                        </div>
                    ) : (
                        <Table aria-label="Routes table">
                            <TableHeader>
                                <TableColumn>Route Name</TableColumn>
                                <TableColumn>Bus</TableColumn>
                                <TableColumn>Type</TableColumn>
                                <TableColumn>Stops</TableColumn>
                                <TableColumn>Actions</TableColumn>
                            </TableHeader>
                            <TableBody items={routes} emptyContent="No routes found">
                                {(route) => (
                                    <TableRow key={route.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Icon icon="mdi:map-marker-path" className="text-primary" />
                                                <span className="font-medium">{route.routeName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{route.Bus?.busNumber || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip size="sm" color={getRouteTypeColor(route.routeType)} variant="flat">
                                                {route.routeType}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="bordered">
                                                {route.stops?.length || 0} stops
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    isIconOnly
                                                    variant="flat"
                                                    onPress={() => handleEdit(route)}
                                                >
                                                    <Icon icon="mdi:pencil" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    isIconOnly
                                                    variant="flat"
                                                    color="danger"
                                                    onPress={() => handleDelete(route.id)}
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
            <Modal isOpen={isOpen} onClose={handleCloseModal} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    <ModalHeader>{editingRoute ? 'Edit Route' : 'Add New Route'}</ModalHeader>
                    <ModalBody className="space-y-4">
                        {error && (
                            <div className="p-3 bg-danger-50 text-danger rounded-lg">{error}</div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Route Name"
                                name="routeName"
                                placeholder="e.g., Morning Route A"
                                value={formData.routeName}
                                onChange={handleInputChange}
                                isRequired
                            />
                            <Select
                                label="Bus"
                                placeholder="Select bus"
                                selectedKeys={formData.busId ? [formData.busId] : []}
                                onSelectionChange={(keys) =>
                                    setFormData((prev) => ({ ...prev, busId: [...keys][0] || '' }))
                                }
                                isRequired
                            >
                                {buses.map((bus) => (
                                    <SelectItem key={bus.id} textValue={bus.busNumber}>
                                        {bus.busNumber} - {bus.registrationNumber}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <Select
                            label="Route Type"
                            selectedKeys={[formData.routeType]}
                            onSelectionChange={(keys) =>
                                setFormData((prev) => ({ ...prev, routeType: [...keys][0] }))
                            }
                        >
                            <SelectItem key="MORNING">Morning</SelectItem>
                            <SelectItem key="EVENING">Evening</SelectItem>
                            <SelectItem key="BOTH">Both</SelectItem>
                        </Select>

                        {/* Stops Section */}
                        <div className="space-y-3">
                            <h4 className="font-semibold">Stops</h4>

                            {/* Existing Stops */}
                            {formData.stops.length > 0 && (
                                <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-default-100 rounded-lg">
                                    {formData.stops
                                        .sort((a, b) => a.order - b.order)
                                        .map((stop, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-2 bg-white rounded"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{stop.order}.</span>
                                                    <span>{stop.name}</span>
                                                    <span className="text-xs text-default-400">
                                                        ({stop.lat}, {stop.lng})
                                                    </span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    isIconOnly
                                                    variant="light"
                                                    color="danger"
                                                    onPress={() => handleRemoveStop(idx)}
                                                >
                                                    <Icon icon="mdi:close" />
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Add New Stop */}
                            <div className="grid grid-cols-4 gap-2">
                                <Input
                                    size="sm"
                                    placeholder="Stop name"
                                    value={newStop.name}
                                    onChange={(e) => setNewStop((p) => ({ ...p, name: e.target.value }))}
                                />
                                <Input
                                    size="sm"
                                    placeholder="Latitude"
                                    type="number"
                                    step="any"
                                    value={newStop.lat}
                                    onChange={(e) => setNewStop((p) => ({ ...p, lat: e.target.value }))}
                                />
                                <Input
                                    size="sm"
                                    placeholder="Longitude"
                                    type="number"
                                    step="any"
                                    value={newStop.lng}
                                    onChange={(e) => setNewStop((p) => ({ ...p, lng: e.target.value }))}
                                />
                                <Button size="sm" color="primary" onPress={handleAddStop}>
                                    Add
                                </Button>
                            </div>
                            <p className="text-xs text-default-400">
                                Tip: Get coordinates from Google Maps by right-clicking on a location
                            </p>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleSubmit}>
                            {editingRoute ? 'Update' : 'Create'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default ManageRoutes;
