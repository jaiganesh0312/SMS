import React, { useEffect, useState } from 'react';
import { Card, CardFooter, Image, Button, Spacer, CardBody } from "@heroui/react";
import { LoadingSpinner } from '@/components/common';
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import libraryService from '@/services/libraryService';
import { useAuth } from '@/context/AuthContext';
import { motion } from "framer-motion";

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
        return <LoadingSpinner fullPage />;
    }

    return (
        <motion.div
            className="p-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Librarian Dashboard</h1>
                <p className="text-default-500">Welcome back, {user?.name}</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <motion.div variants={itemVariants}>
                    <Card className="bg-content1 border border-default-200 shadow-sm">
                        <CardBody className='flex flex-row items-center justify-between p-4'>
                            <div>
                                <p className="text-sm text-default-500">Total Books</p>
                                <h2 className="text-2xl font-bold text-foreground">{stats.totalBooks}</h2>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Icon icon="mdi:book-multiple" width="28" className="text-primary" />
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-content1 border border-default-200 shadow-sm">
                        <CardBody className='flex flex-row items-center justify-between p-4'>
                            <div>
                                <p className="text-sm text-default-500">Issued Books</p>
                                <h2 className="text-2xl font-bold text-foreground">{stats.issuedBooks}</h2>
                            </div>
                            <div className="p-3 bg-secondary/10 rounded-lg">
                                <Icon icon="mdi:book-arrow-right" width="28" className="text-secondary" />
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-content1 border border-default-200 shadow-sm">
                        <CardBody className='flex flex-row items-center justify-between p-4'>
                            <div>
                                <p className="text-sm text-default-500">Overdue Books</p>
                                <h2 className="text-2xl font-bold text-danger">{stats.overdueBooks}</h2>
                            </div>
                            <div className="p-3 bg-danger/10 rounded-lg">
                                <Icon icon="mdi:alert-circle" width="28" className="text-danger" />
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="bg-content1 border border-default-200 shadow-sm">
                        <CardBody className='flex flex-row items-center justify-between p-4'>
                            <div>
                                <p className="text-sm text-default-500">Total Sections</p>
                                <h2 className="text-2xl font-bold text-foreground">{stats.totalSections}</h2>
                            </div>
                            <div className="p-3 bg-success/10 rounded-lg">
                                <Icon icon="mdi:view-grid" width="28" className="text-success" />
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>

            {/* Menu Grid */}
            <motion.h2 variants={itemVariants} className="text-xl font-bold mb-4 text-foreground">Quick Actions</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {menuItems.map((item, index) => (
                    <motion.div key={index} variants={itemVariants} whileHover={{ y: -5 }}>
                        <Card
                            isPressable
                            onPress={() => navigate(item.path)}
                            className="w-full bg-content1 border border-default-200 shadow-sm hover:shadow-md transition-all hover:border-primary/50"
                        >
                            <CardBody className="flex flex-col items-center text-center p-6">
                                <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                                    <Icon icon={item.icon} width="32" className="text-primary" />
                                </div>
                                <h3 className="font-bold text-lg text-foreground mb-1">{item.title}</h3>
                                <p className="text-sm text-default-500">{item.description}</p>
                            </CardBody>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
