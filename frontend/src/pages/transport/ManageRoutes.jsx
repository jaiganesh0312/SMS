import { PageHeader } from '@/components/common';
import { transportService } from '@/services';
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
            <PageHeader
                title="Manage Routes"
                subtitle="Create and manage bus routes with stops"
                action={
                    <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={onOpen}>
                        Add Route
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
                            aria-label="Routes table"
                            shadow="none"
                            classNames={{
                                wrapper: "shadow-none bg-content1",
                                th: "bg-default-100 text-default-500 font-medium",
                                td: "py-3"
                            }}
                        >
                            <TableHeader>
                                <TableColumn>Route Name</TableColumn>
                                <TableColumn>Bus</TableColumn>
                                <TableColumn>Type</TableColumn>
                                <TableColumn>Stops</TableColumn>
                                <TableColumn>Actions</TableColumn>
                            </TableHeader>
                            <TableBody items={routes} emptyContent="No routes found">
                                {(route) => (
                                    <TableRow key={route.id} className="border-b border-default-100 last:border-0 hover:bg-default-50">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Icon icon="mdi:map-marker-path" className="text-primary" />
                                                </div>
                                                <span className="font-medium text-foreground">{route.routeName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {route.Bus ? (
                                                <div className="flex flex-col">
                                                    <span className="text-foreground text-sm">{route.Bus.busNumber}</span>
                                                    <span className="text-default-400 text-xs">{route.Bus.registrationNumber}</span>
                                                </div>
                                            ) : (
                                                <span className="text-default-400 italic">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" color={getRouteTypeColor(route.routeType)} variant="flat" classNames={{ content: "font-medium" }}>
                                                {route.routeType}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="bordered" className="border-default-200 text-default-500">
                                                {route.stops?.length || 0} stops
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    isIconOnly
                                                    variant="light"
                                                    color="default"
                                                    onPress={() => handleEdit(route)}
                                                >
                                                    <Icon icon="mdi:pencil" width={20} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    isIconOnly
                                                    variant="light"
                                                    color="danger"
                                                    onPress={() => handleDelete(route.id)}
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
            <Modal isOpen={isOpen} onClose={handleCloseModal} size="2xl" scrollBehavior="inside" classNames={{
                base: "bg-content1 border border-default-200",
                header: "border-b border-default-200",
                footer: "border-t border-default-200"
            }}>
                <ModalContent>
                    <ModalHeader className="flex gap-2 items-center">
                        <Icon icon={editingRoute ? "mdi:pencil" : "mdi:plus-circle"} className="text-primary" />
                        {editingRoute ? 'Edit Route' : 'Add New Route'}
                    </ModalHeader>
                    <ModalBody className="space-y-4 py-6">
                        {error && (
                            <div className="p-3 bg-danger-50 text-danger rounded-lg border border-danger-200 text-sm">{error}</div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Route Name"
                                name="routeName"
                                placeholder="e.g., Morning Route A"
                                value={formData.routeName}
                                onChange={handleInputChange}
                                isRequired
                                variant="bordered"
                                labelPlacement="outside"
                            />
                            <Select
                                label="Bus"
                                placeholder="Select bus"
                                selectedKeys={formData.busId ? [formData.busId] : []}
                                onSelectionChange={(keys) =>
                                    setFormData((prev) => ({ ...prev, busId: [...keys][0] || '' }))
                                }
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
                        </div>

                        <Select
                            label="Route Type"
                            selectedKeys={[formData.routeType]}
                            onSelectionChange={(keys) =>
                                setFormData((prev) => ({ ...prev, routeType: [...keys][0] }))
                            }
                            variant="bordered"
                            labelPlacement="outside"
                        >
                            <SelectItem key="MORNING">Morning</SelectItem>
                            <SelectItem key="EVENING">Evening</SelectItem>
                            <SelectItem key="BOTH">Both</SelectItem>
                        </Select>

                        {/* Stops Section */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-foreground">Stops</h4>
                                <Chip size="sm" variant="flat" color="primary">{formData.stops.length} stops</Chip>
                            </div>

                            {/* Existing Stops */}
                            {formData.stops.length > 0 && (
                                <div className="space-y-2 max-h-60 overflow-y-auto p-3 bg-default-50 rounded-xl border border-default-200">
                                    {formData.stops
                                        .sort((a, b) => a.order - b.order)
                                        .map((stop, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 bg-white dark:bg-content1 rounded-lg border border-default-100 shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                        {stop.order}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{stop.name}</span>
                                                        <span className="text-xs text-default-400">
                                                            {stop.lat}, {stop.lng}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    isIconOnly
                                                    variant="light"
                                                    color="danger"
                                                    onPress={() => handleRemoveStop(idx)}
                                                >
                                                    <Icon icon="mdi:close" width={18} />
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Add New Stop */}
                            <div className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-5">
                                    <Input
                                        size="sm"
                                        label="Stop name"
                                        placeholder="Enter stop name"
                                        value={newStop.name}
                                        onChange={(e) => setNewStop((p) => ({ ...p, name: e.target.value }))}
                                        variant="bordered"
                                        labelPlacement="outside"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <Input
                                        size="sm"
                                        label="Latitude"
                                        placeholder="Lat"
                                        type="number"
                                        step="any"
                                        value={newStop.lat}
                                        onChange={(e) => setNewStop((p) => ({ ...p, lat: e.target.value }))}
                                        variant="bordered"
                                        labelPlacement="outside"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <Input
                                        size="sm"
                                        label="Longitude"
                                        placeholder="Lng"
                                        type="number"
                                        step="any"
                                        value={newStop.lng}
                                        onChange={(e) => setNewStop((p) => ({ ...p, lng: e.target.value }))}
                                        variant="bordered"
                                        labelPlacement="outside"
                                    />
                                </div>
                                <div className="col-span-1 pb-1">
                                    <Button size="sm" isIconOnly color="primary" onPress={handleAddStop}>
                                        <Icon icon="mdi:plus" width={20} />
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-default-400 px-1">
                                Tip: Get coordinates from Google Maps by right-clicking on a location
                            </p>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" color="default" onPress={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleSubmit} startContent={<Icon icon="mdi:check" />}>
                            {editingRoute ? 'Update Route' : 'Create Route'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default ManageRoutes;
