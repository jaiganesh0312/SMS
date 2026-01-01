import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Chip, Spinner, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import teacherService from '@/services/teacherService';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

export default function MyPeriods() {
    const navigate = useNavigate();
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const response = await teacherService.getMyPeriods();
                if (response.data?.success) {
                    setPeriods(response.data.data);
                } else {
                    setError(response.data?.message || "Failed to fetch periods");
                }
            } catch (err) {
                setError("An error occurred while fetching periods");
            } finally {
                setLoading(false);
            }
        };

        fetchPeriods();
    }, []);

    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const groupedPeriods = daysOrder.reduce((acc, day) => {
        let dayPeriods = periods.filter(p => p.dayOfWeek === day);
        // Frontend sorting by Start Time
        dayPeriods.sort((a, b) => {
            return (a.startTime || '').localeCompare(b.startTime || '');
        });

        if (dayPeriods.length > 0) {
            acc[day] = dayPeriods;
        }
        return acc;
    }, {});

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Spinner size="lg" />
            </div>
        );
    }

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
                            My Periods
                        </h1>
                        <p className="text-gray-500">Your weekly teaching schedule</p>
                    </div>
                </div>
            </div>

            {error && (
                <Card className="bg-red-50 border-red-200">
                    <CardBody>
                        <p className="text-red-600">{error}</p>
                    </CardBody>
                </Card>
            )}

            {!loading && !error && Object.keys(groupedPeriods).length === 0 && (
                <div className="text-center py-10">
                    <Icon icon="mdi:calendar-blank" className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No periods assigned to you yet.</p>
                </div>
            )}

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {Object.entries(groupedPeriods).map(([day, dayPeriods]) => (
                    <motion.div key={day} variants={itemVariants}>
                        <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                                <span className="font-bold text-lg text-primary">{day}</span>
                                <Chip size="sm" variant="flat" color="primary" className="ml-auto">
                                    {dayPeriods.length} Periods
                                </Chip>
                            </CardHeader>
                            <CardBody className="p-0">
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {dayPeriods.map((period) => (
                                        <div key={period.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {period.Subject?.name || "Subject"}
                                                </div>
                                                <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                    {period.startTime ? period.startTime.slice(0, 5) : ''} - {period.endTime ? period.endTime.slice(0, 5) : ''}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="mdi:google-classroom" />
                                                    <span>{period.Class?.name} - {period.Class?.section}</span>
                                                </div>
                                                {period.classroom && (
                                                    <div className="flex items-center gap-1">
                                                        <Icon icon="mdi:door" />
                                                        <span>{period.classroom}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
