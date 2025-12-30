import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Button, Avatar, Divider, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from '../context/AuthContext';
import { motion } from "framer-motion";

export default function NavigationDrawer({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const getNavigationSections = () => {
        // Common sections for all roles
        const commonSections = [
            {
                title: 'Overview',
                items: [
                    { name: 'Dashboard', path: '/dashboard', icon: 'mdi:view-dashboard' },
                    ...(user?.role !== 'STUDENT' ? [{ name: 'Chat', path: '/chat', icon: 'mdi:chat-processing' }] : []),
                    { name: 'Announcements', path: '/announcements', icon: 'mdi:bullhorn' },
                    { name: 'Gallery', path: '/gallery', icon: 'mdi:image-multiple' },
                ],
            },
        ];

        // Role-specific sections
        const roleSectionsMap = {
            SUPER_ADMIN: [
                {
                    title: 'System Management',
                    items: [
                        { name: 'Register School', path: '/register-school', icon: 'mdi:domain-plus' },
                        { name: 'Schools', path: '/admin/schools', icon: 'mdi:school' },
                    ],
                },
            ],
            SCHOOL_ADMIN: [
                {
                    title: 'Student Management',
                    items: [
                        { name: 'Students', path: '/students', icon: 'mdi:account-school' },
                        { name: 'Parents', path: '/parents', icon: 'mdi:human-male-female-child' },
                        { name: 'Complaints', path: '/complaints', icon: 'mdi:message-alert' },
                        { name: 'Mark Attendance', path: '/attendance/mark', icon: 'mdi:calendar-check' },
                        { name: 'Attendance Reports', path: '/attendance/report', icon: 'mdi:file-chart' },

                    ],
                },
                {
                    title: 'Academic',
                    items: [
                        { name: 'Classes', path: '/academic/classes', icon: 'mdi:google-classroom' },
                        { name: 'Subjects', path: '/academic/subjects', icon: 'mdi:book-open-page-variant' },
                        { name: 'Timetable', path: '/academic/timetable', icon: 'mdi:calendar-clock' },
                        { name: 'Exam List', path: '/exams', icon: 'mdi:file-document-edit' },
                        { name: 'Exam Results', path: '/exams/results', icon: 'mdi:chart-bar' },
                        { name: 'Exam Reports', path: '/exams/reports', icon: 'mdi:card-account-details' },
                    ],
                },

                {
                    title: 'Student Fees',
                    items: [
                        { name: 'Fee Statistics', path: '/finance/statistics', icon: 'mdi:chart-box' },
                        { name: 'Fee Structure', path: '/finance/fees', icon: 'mdi:currency-usd' },
                        { name: 'Fee Receipts', path: '/finance/receipts', icon: 'mdi:receipt-text-check' },
                    ],
                },
                {
                    title: 'HR & Staff',
                    items: [
                        { name: 'Staff Management', path: '/staff', icon: 'mdi:account-tie' },
                        { name: 'Staff Attendance', path: '/staff/attendance', icon: 'mdi:calendar-check' },
                        { name: 'Payroll', path: '/staff/payroll', icon: 'mdi:cash-multiple' },
                        { name: 'Leave Management', path: '/leave-management', icon: 'mdi:calendar-check-outline' },
                    ],
                },
                {
                    title: 'Transport',
                    items: [
                        { name: 'Bus Tracking', path: '/transport/tracking', icon: 'mdi:bus-marker' },
                        { name: 'Manage Buses', path: '/transport/buses', icon: 'mdi:bus' },
                        { name: 'Manage Routes', path: '/transport/routes', icon: 'mdi:map-marker-path' },
                        { name: 'Bus Assignments', path: '/transport/assignments', icon: 'mdi:seat-passenger' },
                        { name: 'Driver Panel', path: '/transport/driver-panel', icon: 'mdi:steering' },
                        { name: 'Trip History', path: '/transport/trip-history', icon: 'mdi:history' },
                    ],
                },
            ],
            TEACHER: [
                {
                    title: 'My Workspace',
                    items: [
                        { name: "My Schedule", path: '/teacher/my-periods', icon: 'mdi:calendar-account' },
                        { name: "Mark Attendance", path: '/attendance/mark', icon: 'mdi:calendar-account' },
                        { name: "Attendance Reports", path: '/attendance/report', icon: 'mdi:calendar-account' },
                        { name: 'My Leaves', path: '/my-leaves', icon: 'mdi:calendar-account' },
                        { name: 'Complaints', path: '/complaints', icon: 'mdi:message-alert' },
                    ],
                }
            ],
            STAFF: [
                {
                    title: 'My Workspace',
                    items: [
                        { name: 'My Leaves', path: '/my-leaves', icon: 'mdi:calendar-account' },
                        { name: 'Driver Panel', path: '/transport/driver-panel', icon: 'mdi:steering' },
                        { name: 'My Profile', path: '/profile', icon: 'mdi:account' },
                    ],
                }
            ],

            PARENT: [
                {
                    title: 'My Children',
                    items: [
                        { name: 'Fee Payment', path: '/parent/fees', icon: 'mdi:cash-multiple' },
                        { name: 'Bus Tracking', path: '/transport/tracking', icon: 'mdi:bus-marker' },
                        { name: 'Complaints', path: '/complaints', icon: 'mdi:message-alert' },
                    ],
                },
            ],

            LIBRARIAN: [
                {
                    title: 'Library Management',
                    items: [
                        { name: 'Books', path: '/library/books', icon: 'mdi:book-open-page-variant' },
                        { name: 'Sections', path: '/library/sections', icon: 'mdi:bookshelf' },
                        { name: 'Issue Book', path: '/library/issue', icon: 'mdi:book-arrow-right' },
                        { name: 'Return Book', path: '/library/return', icon: 'mdi:book-arrow-left' },
                        { name: 'Renew Book', path: '/library/renew', icon: 'mdi:book-refresh' },
                    ],
                }
            ],
            BUS_DRIVER: [
                {
                    title: 'Transport',
                    items: [
                        { name: 'Driver Panel', path: '/transport/driver-panel', icon: 'mdi:steering' },
                        { name: 'Trip History', path: '/transport/trip-history', icon: 'mdi:history' },
                        { name: 'My Profile', path: '/profile', icon: 'mdi:account' },
                    ],
                }
            ],
        };

        const currentRoleSections = roleSectionsMap[user?.role] || roleSectionsMap['SCHOOL_ADMIN'] || []; // Default to School Admin for now if undefined

        return [...commonSections, ...currentRoleSections];
    };

    const sections = getNavigationSections();

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    const handleNavigation = () => {
        // Close drawer on mobile after navigation
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    const handleLogout = () => {
        logout();
        onClose();
        window.location.href = '/login';
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            placement="left"
            size="md"
            className="bg-white dark:bg-gray-900"
        >
            <DrawerContent>
                {(onClose) => (
                    <>
                        <DrawerHeader className="flex flex-col gap-3 p-6 border-b border-gray-200 dark:border-gray-800">
                            {/* Close Button */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Icon icon="mdi:check-circle-outline" className="text-2xl text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">School Management System</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Tagline</p>
                                    </div>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    onPress={onClose}
                                    className="lg:hidden"
                                >
                                    <Icon icon="mdi:close" className="text-2xl" />
                                </Button>
                            </div>

                            {/* User Info */}
                            {user && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <Avatar
                                        src={user.avatarUrl}
                                        name={user.name}
                                        size="md"
                                        isBordered
                                        color="primary"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            )}


                        </DrawerHeader>

                        <DrawerBody className="p-0">
                            <div className="py-4">
                                {sections.map((section, sectionIndex) => (
                                    <div key={sectionIndex} className="mb-6">
                                        <h3 className="px-6 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {section.title}
                                        </h3>
                                        <nav className="space-y-1 px-3">
                                            {section.items.map((item) => {
                                                const isActive = isActivePath(item.path);
                                                return (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        onClick={handleNavigation}
                                                    >
                                                        <motion.div
                                                            whileHover={{ x: 4 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                                }`}
                                                        >
                                                            <Icon
                                                                icon={item.icon}
                                                                className={`text-xl ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}
                                                            />
                                                            <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                                                                {item.name}
                                                            </span>
                                                            {isActive && (
                                                                <div className="ml-auto w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                                            )}
                                                        </motion.div>
                                                    </Link>
                                                );
                                            })}
                                        </nav>
                                    </div>
                                ))}

                                <Divider className="my-4" />

                                {/* Quick Links */}
                                <div className="px-3">
                                    <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Quick Links
                                    </h3>
                                    <nav className="space-y-1">
                                        <Link to="/profile" onClick={handleNavigation}>
                                            <motion.div
                                                whileHover={{ x: 4 }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <Icon icon="mdi:account" className="text-xl" />
                                                <span className="font-medium">My Profile</span>
                                            </motion.div>
                                        </Link>
                                        <Link to="/settings" onClick={handleNavigation}>
                                            <motion.div
                                                whileHover={{ x: 4 }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <Icon icon="mdi:cog" className="text-xl" />
                                                <span className="font-medium">Settings</span>
                                            </motion.div>
                                        </Link>
                                        <Link to="/settings/update-password" onClick={handleNavigation}>
                                            <motion.div
                                                whileHover={{ x: 4 }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <Icon icon="mdi:lock-reset" className="text-xl" />
                                                <span className="font-medium">Update Password</span>
                                            </motion.div>
                                        </Link>
                                        <Link to="/help" onClick={handleNavigation}>
                                            <motion.div
                                                whileHover={{ x: 4 }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <Icon icon="mdi:help-circle" className="text-xl" />
                                                <span className="font-medium">Help & Support</span>
                                            </motion.div>
                                        </Link>
                                    </nav>
                                </div>
                            </div>
                        </DrawerBody>

                        <DrawerFooter className="p-4 border-t border-gray-200 dark:border-gray-800">
                            <Button
                                color="danger"
                                variant="flat"
                                onPress={handleLogout}
                                className="w-full"
                                startContent={<Icon icon="mdi:logout" className="text-xl" />}
                            >
                                Logout
                            </Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
}
