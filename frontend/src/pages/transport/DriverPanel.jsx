import { PageHeader } from '@/components/common';
import { useSocket } from '@/context/SocketContext';
import { transportService } from '@/services';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Select,
    SelectItem,
    Spinner,
    Switch
} from '@heroui/react';
import { Icon } from '@iconify/react';
import React, { useCallback, useEffect, useState } from 'react';

const DriverPanel = () => {
    const { socket, isConnected } = useSocket();
    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [activeTrip, setActiveTrip] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [watchId, setWatchId] = useState(null);

    // Fetch buses
    useEffect(() => {
        const fetchBuses = async () => {
            try {
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
        fetchBuses();
    }, []);

    // Fetch routes when bus is selected
    useEffect(() => {
        const fetchRoutes = async () => {
            if (selectedBus) {
                try {
                    const response = await transportService.getRoutes(selectedBus);
                    if (response.data?.success) {
                        setRoutes(response.data.data);
                    }
                } catch (err) {
                }
            } else {
                setRoutes([]);
            }
        };
        fetchRoutes();
    }, [selectedBus]);

    // Check for active trip
    useEffect(() => {
        const checkActiveTrip = async () => {
            if (selectedBus) {
                try {
                    const response = await transportService.getLiveLocation(selectedBus);
                    if (response.data?.success && response.data.data.activeTrip) {
                        setActiveTrip(response.data.data.activeTrip);
                        setIsTracking(true);
                        startLocationTracking();
                    }
                } catch (err) {
                }
            }
        };
        checkActiveTrip();
    }, [selectedBus]);

    // Start location tracking
    const startLocationTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, speed, heading, accuracy } = position.coords;
                const locationData = {
                    lat: latitude,
                    lng: longitude,
                    speed: speed ? Math.round(speed * 3.6) : null, // Convert m/s to km/h
                    heading: heading || null,
                    accuracy: accuracy || null,
                };

                setCurrentLocation(locationData);

                // Send location via socket if connected and tracking
                if (socket && isConnected && selectedBus && isTracking) {
                    socket.emit('bus:location:update', {
                        busId: selectedBus,
                        ...locationData,
                    });
                }
            },
            (err) => {
                setError('Failed to get location: ' + err.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000,
            }
        );

        setWatchId(id);
    }, [socket, isConnected, selectedBus, isTracking]);

    // Stop location tracking
    const stopLocationTracking = useCallback(() => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
    }, [watchId]);

    // Handle trip start
    const handleStartTrip = async () => {
        if (!selectedBus) {
            setError('Please select a bus');
            return;
        }

        try {
            const response = await transportService.startTrip(selectedBus, {
                routeId: selectedRoute || undefined,
                tripType: 'MORNING',
            });

            if (response.data?.success) {
                setActiveTrip(response.data.data);
                setIsTracking(true);
                startLocationTracking();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start trip');
        }
    };

    // Handle trip end
    const handleEndTrip = async () => {
        if (!activeTrip) return;

        try {
            await transportService.endTrip(activeTrip.id);
            setActiveTrip(null);
            setIsTracking(false);
            stopLocationTracking();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to end trip');
        }
    };

    // Toggle tracking
    const handleTrackingToggle = (value) => {
        setIsTracking(value);
        if (value) {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopLocationTracking();
        };
    }, [stopLocationTracking]);

    const selectedBusData = buses.find((b) => b.id === selectedBus);

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Driver Panel"
                subtitle="Control bus tracking and trips"
                action={
                    <Chip
                        color={isConnected ? 'success' : 'danger'}
                        variant="flat"
                        startContent={
                            <Icon icon={isConnected ? 'mdi:wifi' : 'mdi:wifi-off'} width={16} />
                        }
                        classNames={{ content: "font-medium" }}
                    >
                        {isConnected ? 'Connected' : 'Offline'}
                    </Chip>
                }
            />

            {error && (
                <div className="p-4 bg-danger-50 text-danger rounded-lg border border-danger-200 flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" width={20} />
                    <span className="flex-1">{error}</span>
                    <Button
                        size="sm"
                        variant="light"
                        onPress={() => setError(null)}
                    >
                        Dismiss
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bus Selection */}
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardHeader className="border-b border-default-100">
                        <h3 className="font-semibold text-foreground">Select Bus</h3>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        {loading ? (
                            <Spinner />
                        ) : (
                            <>
                                <Select
                                    label="Bus"
                                    placeholder="Choose your bus"
                                    selectedKeys={selectedBus ? [selectedBus] : []}
                                    onSelectionChange={(keys) => setSelectedBus([...keys][0])}
                                    isDisabled={!!activeTrip}
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
                                        selectedKeys={selectedRoute ? [selectedRoute] : []}
                                        onSelectionChange={(keys) => setSelectedRoute([...keys][0])}
                                        isDisabled={!!activeTrip}
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
                            </>
                        )}
                    </CardBody>
                </Card>

                {/* Trip Controls */}
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardHeader className="border-b border-default-100">
                        <h3 className="font-semibold text-foreground">Trip Controls</h3>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg border border-default-100">
                            <div>
                                <p className="font-medium text-foreground">Trip Status</p>
                                <Chip
                                    color={activeTrip ? 'success' : 'warning'}
                                    variant="flat"
                                    className="mt-1"
                                    classNames={{ content: "font-medium" }}
                                >
                                    {activeTrip ? 'In Progress' : 'Not Started'}
                                </Chip>
                            </div>
                            {activeTrip ? (
                                <Button color="danger" onPress={handleEndTrip}>
                                    End Trip
                                </Button>
                            ) : (
                                <Button
                                    color="success"
                                    onPress={handleStartTrip}
                                    isDisabled={!selectedBus}
                                >
                                    Start Trip
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg border border-default-100">
                            <div>
                                <p className="font-medium text-foreground">Location Tracking</p>
                                <p className="text-sm text-default-500">
                                    {isTracking ? 'Sharing location' : 'Not sharing'}
                                </p>
                            </div>
                            <Switch
                                isSelected={isTracking}
                                onValueChange={handleTrackingToggle}
                                isDisabled={!selectedBus}
                                color="success"
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Current Location */}
            {currentLocation && (
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardHeader className="border-b border-default-100">
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:map-marker" className="text-primary" width={20} />
                            <h3 className="font-semibold text-foreground">Current Location</h3>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-default-50 rounded-lg text-center border border-default-100">
                                <p className="text-sm text-default-500">Latitude</p>
                                <p className="font-mono font-medium text-foreground">
                                    {currentLocation.lat.toFixed(6)}
                                </p>
                            </div>
                            <div className="p-4 bg-default-50 rounded-lg text-center border border-default-100">
                                <p className="text-sm text-default-500">Longitude</p>
                                <p className="font-mono font-medium text-foreground">
                                    {currentLocation.lng.toFixed(6)}
                                </p>
                            </div>
                            <div className="p-4 bg-default-50 rounded-lg text-center border border-default-100">
                                <p className="text-sm text-default-500">Speed</p>
                                <p className="font-mono font-medium text-foreground">
                                    {currentLocation.speed ?? 'N/A'} km/h
                                </p>
                            </div>
                            <div className="p-4 bg-default-50 rounded-lg text-center border border-default-100">
                                <p className="text-sm text-default-500">Accuracy</p>
                                <p className="font-mono font-medium text-foreground">
                                    {currentLocation.accuracy
                                        ? `${Math.round(currentLocation.accuracy)}m`
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Selected Bus Info */}
            {selectedBusData && (
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardHeader className="border-b border-default-100">
                        <h3 className="font-semibold text-foreground">Bus Information</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-default-500">Bus Number</p>
                                <p className="font-medium text-foreground">{selectedBusData.busNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Registration</p>
                                <p className="font-medium text-foreground">{selectedBusData.registrationNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Capacity</p>
                                <p className="font-medium text-foreground">{selectedBusData.capacity} seats</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Driver</p>
                                <p className="font-medium text-foreground">
                                    {selectedBusData.driver?.name || 'Not assigned'}
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export default DriverPanel;
