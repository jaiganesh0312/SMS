import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Chip, Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";
import { notificationService } from '@/services';
import { format } from 'date-fns';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getMyNotifications();
            if (response.data?.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications(); // Refresh list
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
                {notifications.length === 0 && !isLoading ? (
                    <div className="text-center py-12">
                        <Icon icon="mdi:bell-off-outline" className="text-4xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No new notifications</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <Card key={notification.id} className={notification.read ? "opacity-75" : ""}>
                            <CardBody className="flex flex-row items-start gap-4 p-4">
                                <div className={`p-2 rounded-full flex-shrink-0 ${notification.read ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                                    <Icon icon="mdi:bell" className="text-xl" />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{notification.title}</h4>
                                        <span className="text-xs text-gray-500">{format(new Date(notification.createdAt), 'PP p')}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                                </div>
                                {!notification.read && (
                                    <Button isIconOnly size="sm" variant="light" color="primary" onPress={() => handleMarkAsRead(notification.id)}>
                                        <Icon icon="mdi:check" />
                                    </Button>
                                )}
                            </CardBody>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
