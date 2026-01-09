import { PageHeader } from '@/components/common';
import { transportService } from '@/services';
import {
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Select,
    SelectItem,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';

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
            <PageHeader
                title="Trip History"
                subtitle="View past bus trips and their details"
            />

            {/* Filters */}
            <Card className="bg-content1 border border-default-200 shadow-sm">
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
                            variant="bordered"
                            labelPlacement="outside"
                            size="sm"
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
                            variant="bordered"
                            labelPlacement="outside"
                            size="sm"
                        />

                        <Select
                            className="w-48"
                            label="Filter by Status"
                            placeholder="All statuses"
                            selectedKeys={filters.status ? [filters.status] : []}
                            onSelectionChange={(keys) =>
                                setFilters((p) => ({ ...p, status: [...keys][0] || '' }))
                            }
                            variant="bordered"
                            labelPlacement="outside"
                            size="sm"
                        >
                            <SelectItem key="NOT_STARTED">Not Started</SelectItem>
                            <SelectItem key="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem key="COMPLETED">Completed</SelectItem>
                            <SelectItem key="CANCELLED">Cancelled</SelectItem>
                        </Select>

                        <Button variant="flat" color="default" onPress={clearFilters} size="sm" startContent={<Icon icon="mdi:filter-off" />}>
                            Clear Filters
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Trips Table */}
            <Card className="bg-content1 border border-default-200 shadow-sm">
                <CardBody className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="lg" />
                        </div>
                    ) : (
                        <Table
                            aria-label="Trip history table"
                            shadow="none"
                            classNames={{
                                wrapper: "shadow-none bg-content1",
                                th: "bg-default-100 text-default-500 font-medium",
                                td: "py-3"
                            }}
                        >
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
                                    <TableRow key={trip.id} className="border-b border-default-100 last:border-0 hover:bg-default-50">
                                        <TableCell>
                                            <span className="text-foreground font-medium">
                                                {trip.startTime
                                                    ? format(new Date(trip.startTime), 'dd MMM yyyy')
                                                    : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Icon icon="mdi:bus" className="text-primary" width={16} />
                                                </div>
                                                <span className="font-medium text-foreground">
                                                    {trip.Bus?.busNumber || 'N/A'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell><span className="text-foreground">{trip.BusRoute?.routeName || '-'}</span></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Icon icon={getTripTypeIcon(trip.tripType)} className="text-default-500" width={18} />
                                                <span className="text-foreground">{trip.tripType}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                color={getStatusColor(trip.status)}
                                                variant="flat"
                                                classNames={{ content: "font-medium" }}
                                            >
                                                {trip.status?.replace('_', ' ')}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-default-500 font-mono text-sm">
                                                {trip.startTime
                                                    ? format(new Date(trip.startTime), 'HH:mm')
                                                    : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-default-500 font-mono text-sm">
                                                {trip.endTime
                                                    ? format(new Date(trip.endTime), 'HH:mm')
                                                    : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-foreground font-mono font-medium">
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
