import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Spinner,
    Select,
    SelectItem,
    Input,
    Button,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { transportService } from '@/services';

const TripHistory = () => {
    const [trips, setTrips] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        busId: '',
        date: '',
        status: '',
    });

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.busId) params.busId = filters.busId;
            if (filters.date) params.date = filters.date;
            if (filters.status) params.status = filters.status;

            const response = await transportService.getTripHistory(params);
            if (response.data?.success) {
                setTrips(response.data.data);
            }
        } catch (err) {
            console.error('Failed to load trips:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBuses = async () => {
        try {
            const response = await transportService.getAllBuses();
            if (response.data?.success) {
                setBuses(response.data.data);
            }
        } catch (err) {
            console.error('Failed to load buses:', err);
        }
    };

    useEffect(() => {
        fetchBuses();
    }, []);

    useEffect(() => {
        fetchTrips();
    }, [filters]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'IN_PROGRESS':
                return 'primary';
            case 'COMPLETED':
                return 'success';
            case 'CANCELLED':
                return 'danger';
            default:
                return 'warning';
        }
    };

    const getTripTypeIcon = (type) => {
        switch (type) {
            case 'MORNING':
                return 'mdi:weather-sunset-up';
            case 'EVENING':
                return 'mdi:weather-sunset-down';
            default:
                return 'mdi:bus';
        }
    };

    const formatDuration = (start, end) => {
        if (!start || !end) return '-';
        const diff = new Date(end) - new Date(start);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const clearFilters = () => {
        setFilters({ busId: '', date: '', status: '' });
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Trip History</h1>
                <p className="text-default-500">View past bus trips and their details</p>
            </div>

            {/* Filters */}
            <Card>
                <CardBody>
                    <div className="flex flex-wrap items-end gap-4">
                        <Select
                            className="w-48"
                            label="Filter by Bus"
                            placeholder="All buses"
                            selectedKeys={filters.busId ? [filters.busId] : []}
                            onSelectionChange={(keys) =>
                                setFilters((p) => ({ ...p, busId: [...keys][0] || '' }))
                            }
                        >
                            {buses.map((bus) => (
                                <SelectItem key={bus.id} textValue={bus.busNumber}>
                                    {bus.busNumber}
                                </SelectItem>
                            ))}
                        </Select>

                        <Input
                            className="w-48"
                            type="date"
                            label="Filter by Date"
                            value={filters.date}
                            onChange={(e) => setFilters((p) => ({ ...p, date: e.target.value }))}
                        />

                        <Select
                            className="w-48"
                            label="Filter by Status"
                            placeholder="All statuses"
                            selectedKeys={filters.status ? [filters.status] : []}
                            onSelectionChange={(keys) =>
                                setFilters((p) => ({ ...p, status: [...keys][0] || '' }))
                            }
                        >
                            <SelectItem key="NOT_STARTED">Not Started</SelectItem>
                            <SelectItem key="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem key="COMPLETED">Completed</SelectItem>
                            <SelectItem key="CANCELLED">Cancelled</SelectItem>
                        </Select>

                        <Button variant="flat" onPress={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Trips Table */}
            <Card>
                <CardBody>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="lg" />
                        </div>
                    ) : (
                        <Table aria-label="Trip history table">
                            <TableHeader>
                                <TableColumn>Date</TableColumn>
                                <TableColumn>Bus</TableColumn>
                                <TableColumn>Route</TableColumn>
                                <TableColumn>Type</TableColumn>
                                <TableColumn>Status</TableColumn>
                                <TableColumn>Start Time</TableColumn>
                                <TableColumn>End Time</TableColumn>
                                <TableColumn>Duration</TableColumn>
                            </TableHeader>
                            <TableBody items={trips} emptyContent="No trips found">
                                {(trip) => (
                                    <TableRow key={trip.id}>
                                        <TableCell>
                                            {trip.startTime
                                                ? format(new Date(trip.startTime), 'dd MMM yyyy')
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Icon icon="mdi:bus" className="text-primary" />
                                                <span className="font-medium">
                                                    {trip.Bus?.busNumber || 'N/A'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{trip.BusRoute?.routeName || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Icon icon={getTripTypeIcon(trip.tripType)} />
                                                <span>{trip.tripType}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                color={getStatusColor(trip.status)}
                                                variant="flat"
                                            >
                                                {trip.status?.replace('_', ' ')}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            {trip.startTime
                                                ? format(new Date(trip.startTime), 'HH:mm')
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {trip.endTime
                                                ? format(new Date(trip.endTime), 'HH:mm')
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono">
                                                {formatDuration(trip.startTime, trip.endTime)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default TripHistory;
