import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Spinner, Chip, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { transportService } from '@/services';

const DriverSchedule = () => {
    const [bus, setBus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const response = await transportService.getDriverBus();
            if (response.data?.success) {
                setBus(response.data.data);
            } else {
                setError(response.data?.message || 'Failed to load schedule');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load schedule');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" label="Loading schedule..." />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="bg-danger-50 border-danger-200">
                <CardBody className="text-center py-8">
                    <Icon icon="mdi:alert-circle" className="text-4xl text-danger mb-2 mx-auto" />
                    <p className="text-danger font-medium">{error}</p>
                    <Button size="sm" color="danger" variant="flat" className="mt-4" onPress={fetchSchedule}>
                        Retry
                    </Button>
                </CardBody>
            </Card>
        );
    }

    if (!bus) {
        return (
            <Card>
                <CardBody className="text-center py-12 text-gray-500">
                    <Icon icon="mdi:bus-off" className="text-5xl mb-3 mx-auto text-gray-300" />
                    <p className="text-lg">No bus assigned to you.</p>
                    <p className="text-sm">Please contact the school administrator.</p>
                </CardBody>
            </Card>
        );
    }

    const activeRoutes = bus.BusRoutes || [];

    return (
        <div className="space-y-6">
            {/* Bus Details Summary */}
            <Card className="bg-primary-50 border-primary-100">
                <CardBody>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-primary-900">Bus {bus.busNumber}</h3>
                            <p className="text-primary-600 font-mono">{bus.registrationNumber}</p>
                        </div>
                        <Chip color="primary" variant="solid" startContent={<Icon icon="mdi:seat" />}>
                            Capacity: {bus.capacity}
                        </Chip>
                    </div>
                </CardBody>
            </Card>

            {activeRoutes.length === 0 ? (
                <Card>
                    <CardBody className="text-center py-8">
                        <Icon icon="mdi:map-marker-off" className="text-4xl text-gray-300 mb-2 mx-auto" />
                        <p className="text-gray-500">No active routes for this bus.</p>
                    </CardBody>
                </Card>
            ) : (
                activeRoutes.map((route) => (
                    <Card key={route.id} className="overflow-visible">
                        <CardHeader className="bg-gray-50 border-b">
                            <div className="flex justify-between items-center w-full">
                                <div>
                                    <h4 className="font-bold text-lg">{route.routeName}</h4>
                                    <p className="text-small text-gray-500 capitalize">{route.routeType} Route</p>
                                </div>
                                <Chip size="sm" variant="dot" color="success">Active</Chip>
                            </div>
                        </CardHeader>
                        <CardBody className="p-0">
                            <div className="relative pl-8 py-6 pr-6">
                                {/* Vertical Line */}
                                <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-gray-200"></div>

                                <div className="space-y-6">
                                    {route.stops?.map((stop, index) => (
                                        <div key={index} className="relative flex items-start gap-4">
                                            {/* Dot */}
                                            <div className="absolute -left-[29px] mt-1 z-10 bg-white p-1">
                                                <div className={`w-3 h-3 rounded-full ${index === 0 || index === route.stops.length - 1 ? 'bg-primary ring-4 ring-primary-100' : 'bg-gray-400'}`}></div>
                                            </div>

                                            <div className="flex-1 bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h5 className="font-semibold text-gray-800">{stop.stopName}</h5>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                            <Icon icon="mdi:clock-outline" />
                                                            Est. Arrival: {stop.estimatedTime || '--:--'}
                                                        </p>
                                                    </div>
                                                    <Chip size="sm" variant="flat" color="default" className="text-xs">
                                                        Stop #{index + 1}
                                                    </Chip>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))
            )}
        </div>
    );
};

export default DriverSchedule;
