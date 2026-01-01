import React, { useState, useEffect } from 'react';
import { Card, CardBody, Spinner, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import teacherService from '@/services/teacherService';
import { useNavigate } from 'react-router-dom';

export default function MyClassTimetable() {
    const navigate = useNavigate();
    const [timetableData, setTimetableData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const response = await teacherService.getMyClassTimetable();
                if (response.data?.success) {
                    setTimetableData(response.data.data);
                } else if (response.status === 404) {
                    setError("You are not assigned as a Class Teacher to any class.");
                } else {
                    setError(response.data?.message || "Failed to fetch timetable");
                }
            } catch (err) {
                setError("An error occurred while fetching timetable");
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, []);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // Generate simple time slots for grid if needed, or just list.
    // For a better view, let's group by Day similar to MyPeriods but emphasized as "Class Schedule".

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    const { classDetails, timetable } = timetableData || {};

    const groupedTimetable = days.reduce((acc, day) => {
        if (timetable) {
            let daySlots = timetable.filter(t => t.dayOfWeek === day);
            // Frontend sorting by Start Time since backend sorting was removed
            daySlots.sort((a, b) => {
                return (a.startTime || '').localeCompare(b.startTime || '');
            });
            if (daySlots.length > 0) {
                acc[day] = daySlots;
            }
        }
        return acc;
    }, {});

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => navigate(-1)}
                    >
                        <Icon icon="mdi:arrow-left" className="text-2xl" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            My Class Timetable
                        </h1>
                        {classDetails && (
                            <p className="text-gray-500">
                                Class: <span className="font-semibold text-primary">{classDetails.name} - {classDetails.section}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex flex-col items-center justify-center p-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <Icon icon="mdi:alert-circle-outline" className="text-4xl text-gray-400 mb-2" />
                    <p className="text-gray-600 dark:text-gray-300">{error}</p>
                    <Button
                        color="primary"
                        variant="flat"
                        className="mt-4"
                        onPress={() => navigate('/teacher-dashboard')}
                    >
                        Back to Dashboard
                    </Button>
                </div>
            )}

            {!loading && !error && timetableData && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {days.map(day => {
                        const slots = groupedTimetable[day] || [];
                        if (slots.length === 0) return null;

                        return (
                            <Card key={day} className="h-full shadow-sm">
                                <CardBody className="p-0">
                                    <div className="py-3 px-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-200 flex justify-between items-center">
                                        {day}
                                        <Chip size="sm" variant="flat">{slots.length}</Chip>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {slots.map((slot) => (
                                            <div key={slot.id} className="p-4 flex gap-4 items-start hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <div className="text-center min-w-[80px]">
                                                    <div className="text-sm font-bold text-gray-800 dark:text-white">
                                                        {slot.startTime?.slice(0, 5)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {slot.endTime?.slice(0, 5)}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-primary">
                                                        {slot.Subject?.name}
                                                    </div>
                                                    {slot.User && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                            <Icon icon="mdi:account-tie" className="text-xs" />
                                                            <span>Teacher: {slot.User.name || 'Unknown'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
