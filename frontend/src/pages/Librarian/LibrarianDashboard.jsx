import React, { useEffect, useState } from 'react';
import { Card, CardFooter, Image, Button, Spacer } from "@heroui/react";
import { LoadingSpinner } from '@/components/common';
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import libraryService from '@/services/libraryService';
import { useAuth } from '@/context/AuthContext';

export default function LibrarianDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalSections: 0,
        issuedBooks: 0,
        overdueBooks: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await libraryService.getDashboardStats();
                if (response.data.success) {
                    setStats(response.data.data);
                }
                else {
                    setError(response.data.message);
                }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);


    const menuItems = [
        {
            title: "Manage Sections",
            icon: "mdi:bookshelf",
            path: "/library/sections",
            description: "Add or edit library sections"
        },
        {
            title: "Manage Books",
            icon: "mdi:book-open-page-variant",
            path: "/library/books",
            description: "Add, edit, or remove books"
        },
        {
            title: "Issue Book",
            icon: "mdi:hand-coin",
            path: "/library/issue",
            description: "Issue books to students/staff"
        },
        {
            title: "Return Book",
            icon: "mdi:keyboard-return",
            path: "/library/return",
            description: "Return issued books"
        },
        {
            title: "Renew Book",
            icon: "mdi:autorenew",
            path: "/library/renew",
            description: "Renew issued books"
        },
    ];

    if (loading) {
        return <LoadingSpinner fullPage />;
    }



    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Librarian Dashboard</h1>
                <p className="text-gray-500">Welcome back, {user?.name}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Total Books</p>
                        <h2 className="text-2xl font-bold">{stats.totalBooks}</h2>
                    </div>
                    <Icon icon="mdi:book-multiple" width="32" className="text-blue-500" />
                </Card>
                <Card className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Issued Books</p>
                        <h2 className="text-2xl font-bold">{stats.issuedBooks}</h2>
                    </div>
                    <Icon icon="mdi:book-arrow-right" width="32" className="text-orange-500" />
                </Card>
                <Card className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Overdue Books</p>
                        <h2 className="text-2xl font-bold text-red-500">{stats.overdueBooks}</h2>
                    </div>
                    <Icon icon="mdi:alert-circle" width="32" className="text-red-500" />
                </Card>
                <Card className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Total Sections</p>
                        <h2 className="text-2xl font-bold">{stats.totalSections}</h2>
                    </div>
                    <Icon icon="mdi:view-grid" width="32" className="text-green-500" />
                </Card>
            </div>

            {/* Menu Grid */}
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {menuItems.map((item, index) => (
                    <Card
                        key={index}
                        isPressable
                        onPress={() => navigate(item.path)}
                        className="p-4 hover:scale-105 transition-transform"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3 bg-primary-50 rounded-full mb-3">
                                <Icon icon={item.icon} width="32" className="text-primary" />
                            </div>
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
