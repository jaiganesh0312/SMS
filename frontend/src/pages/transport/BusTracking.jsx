import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Select,
    SelectItem,
    Chip,
    Spinner,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useSocket } from '@/context/SocketContext';
import { transportService } from '@/services';

// Custom bus icon
const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3124/3124459.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

const stopIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25],
});

// Component to handle map center updates
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const BusTracking = () => {
    const { socket, isConnected } = useSocket();
    const [buses, setBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [busLocation, setBusLocation] = useState(null);
    const [activeTrip, setActiveTrip] = useState(null);
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const subscribedBusRef = useRef(null);

    // Default center (can be changed based on school location)
    const defaultCenter = [12.9716, 77.5946]; // Bangalore

    // Fetch all buses
    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const response = await transportService.getAllBuses(true);
                if (response.data?.success) {
                    setBuses(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch buses:', err);
                setError('Failed to load buses');
            } finally {
                setLoading(false);
            }
        };
        fetchBuses();
    }, []);

    // Fetch live location when bus is selected
    const fetchLiveLocation = useCallback(async (busId) => {
        try {
            const response = await transportService.getLiveLocation(busId);
            if (response.data?.success) {
                const { location, activeTrip: tripData } = response.data.data;
                if (location) {
                    setBusLocation({
                        lat: parseFloat(location.lat),
                        lng: parseFloat(location.lng),
                        speed: location.speed,
                        timestamp: location.timestamp,
                    });
                    setLastUpdate(new Date(location.timestamp));
                }
                if (tripData) {
                    setActiveTrip(tripData);
                    // Fetch route details if available
                    if (tripData.BusRoute) {
                        setRoute(tripData.BusRoute);
                    }
                } else {
                    setActiveTrip(null);
                }
            }
        } catch (err) {
            console.error('Failed to fetch live location:', err);
        }
    }, []);

    // Subscribe to socket updates when bus is selected
    useEffect(() => {
        if (!socket || !selectedBus) return;

        // Unsubscribe from previous bus
        if (subscribedBusRef.current && subscribedBusRef.current !== selectedBus) {
            socket.emit('bus:unsubscribe', { busId: subscribedBusRef.current });
        }

        // Subscribe to new bus
        socket.emit('bus:subscribe', { busId: selectedBus });
        subscribedBusRef.current = selectedBus;

        // Fetch initial location
        fetchLiveLocation(selectedBus);

        // Listen for location updates
        const handleLocationUpdate = (data) => {
            if (data.busId === selectedBus) {
                setBusLocation({
                    lat: data.lat,
                    lng: data.lng,
                    speed: data.speed,
                    timestamp: data.timestamp,
                });
                setLastUpdate(new Date(data.timestamp));
            }
        };

        socket.on('bus:location:receive', handleLocationUpdate);

        // Listen for trip events
        socket.on('bus:trip:start', (data) => {
            if (data.busId === selectedBus) {
                fetchLiveLocation(selectedBus);
            }
        });

        socket.on('bus:trip:end', (data) => {
            if (data.busId === selectedBus) {
                setActiveTrip(null);
            }
        });

        return () => {
            socket.off('bus:location:receive', handleLocationUpdate);
            socket.off('bus:trip:start');
            socket.off('bus:trip:end');
        };
    }, [socket, selectedBus, fetchLiveLocation]);

    // Refresh button handler
    const handleRefresh = () => {
        if (selectedBus) {
            fetchLiveLocation(selectedBus);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'IN_PROGRESS':
                return 'success';
            case 'NOT_STARTED':
                return 'warning';
            case 'COMPLETED':
                return 'default';
            default:
                return 'default';
        }
    };

    const selectedBusData = buses.find((b) => b.id === selectedBus);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Bus Tracking</h1>
                    <p className="text-default-500">Track live bus locations</p>
                </div>
                <div className="flex items-center gap-3">
                    <Chip
                        color={isConnected ? 'success' : 'danger'}
                        variant="flat"
                        startContent={
                            <Icon icon={isConnected ? 'mdi:wifi' : 'mdi:wifi-off'} width={16} />
                        }
                    >
                        {isConnected ? 'Live' : 'Offline'}
                    </Chip>
                    <Button
                        isIconOnly
                        variant="flat"
                        onPress={handleRefresh}
                        isDisabled={!selectedBus}
                    >
                        <Icon icon="mdi:refresh" width={20} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <h3 className="font-semibold">Select Bus</h3>
                        </CardHeader>
                        <CardBody>
                            {loading ? (
                                <Spinner size="sm" />
                            ) : (
                                <Select
                                    label="Choose a bus"
                                    placeholder="Select bus to track"
                                    selectedKeys={selectedBus ? [selectedBus] : []}
                                    onSelectionChange={(keys) => setSelectedBus([...keys][0])}
                                >
                                    {buses.map((bus) => (
                                        <SelectItem key={bus.id} textValue={bus.busNumber}>
                                            <div className="flex justify-between items-center">
                                                <span>{bus.busNumber}</span>
                                                <Chip size="sm" color={bus.isActive ? 'success' : 'default'}>
                                                    {bus.isActive ? 'Active' : 'Inactive'}
                                                </Chip>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}
                        </CardBody>
                    </Card>

                    {selectedBusData && (
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Bus Details</h3>
                            </CardHeader>
                            <CardBody className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-default-500">Number:</span>
                                    <span className="font-medium">{selectedBusData.busNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-default-500">Registration:</span>
                                    <span className="font-medium">{selectedBusData.registrationNumber}</span>
                                </div>
                                {selectedBusData.driver && (
                                    <div className="flex justify-between">
                                        <span className="text-default-500">Driver:</span>
                                        <span className="font-medium">{selectedBusData.driver.name}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-default-500">Status:</span>
                                    <Chip
                                        size="sm"
                                        color={getStatusColor(activeTrip?.status || 'NOT_STARTED')}
                                    >
                                        {activeTrip?.status?.replace('_', ' ') || 'No Active Trip'}
                                    </Chip>
                                </div>
                                {busLocation && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-default-500">Speed:</span>
                                            <span className="font-medium">
                                                {busLocation.speed ? `${busLocation.speed} km/h` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-default-500">Last Update:</span>
                                            <span className="font-medium text-xs">
                                                {lastUpdate?.toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    )}

                    {route && route.stops && route.stops.length > 0 && (
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Route: {route.routeName}</h3>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-2">
                                    {route.stops
                                        .sort((a, b) => a.order - b.order)
                                        .map((stop, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Icon icon="mdi:map-marker" className="text-primary" />
                                                <span>
                                                    {stop.order}. {stop.name}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>

                {/* Map */}
                <div className="lg:col-span-3">
                    <Card className="h-[600px]">
                        <CardBody className="p-0 overflow-hidden rounded-xl">
                            <MapContainer
                                center={
                                    busLocation
                                        ? [busLocation.lat, busLocation.lng]
                                        : defaultCenter
                                }
                                zoom={14}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapUpdater
                                    center={
                                        busLocation
                                            ? [busLocation.lat, busLocation.lng]
                                            : null
                                    }
                                />

                                {/* Bus marker */}
                                {busLocation && (
                                    <Marker
                                        position={[busLocation.lat, busLocation.lng]}
                                        icon={busIcon}
                                    >
                                        <Popup>
                                            <div className="text-center">
                                                <strong>{selectedBusData?.busNumber}</strong>
                                                <br />
                                                Speed: {busLocation.speed || 'N/A'} km/h
                                                <br />
                                                <small>
                                                    Updated:{' '}
                                                    {new Date(busLocation.timestamp).toLocaleTimeString()}
                                                </small>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}

                                {/* Route stops */}
                                {route &&
                                    route.stops &&
                                    route.stops.map((stop, idx) => (
                                        <Marker
                                            key={idx}
                                            position={[stop.lat, stop.lng]}
                                            icon={stopIcon}
                                        >
                                            <Popup>
                                                <div className="text-center">
                                                    <strong>
                                                        Stop {stop.order}: {stop.name}
                                                    </strong>
                                                    {stop.estimatedTime && (
                                                        <>
                                                            <br />
                                                            ETA: {stop.estimatedTime}
                                                        </>
                                                    )}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}

                                {/* Route polyline */}
                                {route && route.stops && route.stops.length > 1 && (
                                    <Polyline
                                        positions={route.stops
                                            .sort((a, b) => a.order - b.order)
                                            .map((stop) => [stop.lat, stop.lng])}
                                        color="#3b82f6"
                                        weight={3}
                                        dashArray="10, 10"
                                    />
                                )}
                            </MapContainer>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BusTracking;
