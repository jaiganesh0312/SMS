import { PageHeader } from '@/components/common';
import { transportService } from '@/services';
import { Button, Card, CardBody, CardHeader, Chip, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';

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
            <div className="p-6">
                <PageHeader title="Driver Schedule" subtitle="View your assigned bus and routes" />
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" label="Loading schedule..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 space-y-6">
                <PageHeader title="Driver Schedule" subtitle="View your assigned bus and routes" />
                <Card className="bg-danger-50 border-danger-200 border shadow-sm">
                    <CardBody className="text-center py-8">
                        <Icon icon="mdi:alert-circle" className="text-4xl text-danger mb-2 mx-auto" />
                        <p className="text-danger font-medium">{error}</p>
                        <Button size="sm" color="danger" variant="flat" className="mt-4" onPress={fetchSchedule}>
                            Retry
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    if (!bus) {
        return (
            <div className="p-6 space-y-6">
                <PageHeader title="Driver Schedule" subtitle="View your assigned bus and routes" />
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardBody className="text-center py-12">
                        <Icon icon="mdi:bus-off" className="text-5xl mb-3 mx-auto text-default-300" />
                        <p className="text-lg text-default-500">No bus assigned to you.</p>
                        <p className="text-sm text-default-400">Please contact the school administrator.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const activeRoutes = bus.BusRoutes || [];

    return (
        <div className="p-6 space-y-6">
            <PageHeader title="Driver Schedule" subtitle="View your assigned bus and routes" />

            {/* Bus Details Summary */}
            <Card className="bg-primary-50 border-primary-200 border shadow-sm">
                <CardBody>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-primary-900">Bus {bus.busNumber}</h3>
                            <p className="text-primary-700 font-mono">{bus.registrationNumber}</p>
                        </div>
                        <Chip color="primary" variant="flat" startContent={<Icon icon="mdi:seat" />} classNames={{ content: "font-medium" }}>
                            Capacity: {bus.capacity}
                        </Chip>
                    </div>
                </CardBody>
            </Card>

            {activeRoutes.length === 0 ? (
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardBody className="text-center py-8">
                        <Icon icon="mdi:map-marker-off" className="text-4xl text-default-300 mb-2 mx-auto" />
                        <p className="text-default-500">No active routes for this bus.</p>
                    </CardBody>
                </Card>
            ) : (
                activeRoutes.map((route) => (
                    <Card key={route.id} className="bg-content1 border border-default-200 shadow-sm overflow-visible">
                        <CardHeader className="bg-default-50 border-b border-default-100">
                            <div className="flex justify-between items-center w-full">
                                <div>
                                    <h4 className="font-bold text-lg text-foreground">{route.routeName}</h4>
                                    <p className="text-small text-default-500 capitalize">{route.routeType} Route</p>
                                </div>
                                <Chip size="sm" variant="dot" color="success">Active</Chip>
                            </div>
                        </CardHeader>
                        <CardBody className="p-0">
                            <div className="relative pl-8 py-6 pr-6">
                                {/* Vertical Line */}
                                <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-default-200"></div>

                                <div className="space-y-6">
                                    {route.stops?.map((stop, index) => (
                                        <div key={index} className="relative flex items-start gap-4">
                                            {/* Dot */}
                                            <div className="absolute -left-[29px] mt-1 z-10 bg-white p-1">
                                                <div className={`w-3 h-3 rounded-full ${index === 0 || index === route.stops.length - 1 ? 'bg-primary ring-4 ring-primary-100' : 'bg-default-400'}`}></div>
                                            </div>

                                            <div className="flex-1 bg-white border border-default-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h5 className="font-semibold text-foreground">{stop.stopName}</h5>
                                                        <p className="text-xs text-default-500 flex items-center gap-1 mt-1">
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
