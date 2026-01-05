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
                    { name: 'Study Materials', path: '/study-materials', icon: 'mdi:book-open-variant' },

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
            size="sm"
            className="bg-content1 dark:bg-black/90 backdrop-blur-md"
            motionProps={{
                variants: {
                    enter: {
                        x: 0,
                        opacity: 1,
                        transition: {
                            duration: 0.3,
                            ease: "easeOut",
                        },
                    },
                    exit: {
                        x: -100,
                        opacity: 0,
                        transition: {
                            duration: 0.2,
                            ease: "easeIn",
                        },
                    },
                },
            }}
        >
            <DrawerContent>
                {(onClose) => (
                    <>
                        <DrawerHeader className="flex flex-col gap-5 p-6 border-b border-default-200/50 dark:border-default-100/10 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-900/10 dark:to-transparent">
                            {/* Close Button */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                        <Icon icon="mdi:school" className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground">SMS Portal</h2>
                                        <p className="text-xs text-default-500 tracking-wide">ACADEMIC DASHBOARD</p>
                                    </div>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    onPress={onClose}
                                    className="lg:hidden text-default-400 hover:text-danger-500"
                                >
                                    <Icon icon="mdi:close" className="text-2xl" />
                                </Button>
                            </div>

                            {/* User Info */}
                            {user && (
                                <div className="flex items-center gap-3 p-3 bg-content-2 dark:bg-white/5 border border-default-200/50 dark:border-white/10 rounded-xl hover:border-primary-200 transition-colors cursor-default">
                                    <Avatar
                                        src={user.avatarUrl}
                                        name={user.name}
                                        size="md"
                                        isBordered
                                        color="primary"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">
                                            {user.name}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></span>
                                            <p className="text-xs text-default-500 truncate capitalize">
                                                {user.role?.replace(/_/g, ' ').toLowerCase()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DrawerHeader>

                        <DrawerBody className="p-0 overflow-y-auto custom-scrollbar">
                            <div className="py-6">
                                {sections.map((section, sectionIndex) => (
                                    <div key={sectionIndex} className="mb-6">
                                        <h3 className="px-6 mb-3 text-xs font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                                            {section.title}
                                            <div className="h-px bg-default-200 flex-1 opacity-50"></div>
                                        </h3>
                                        <nav className="space-y-0.5 px-3">
                                            {section.items.map((item) => {
                                                const isActive = isActivePath(item.path);
                                                return (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        onClick={handleNavigation}
                                                    >
                                                        <div className="relative">
                                                            <motion.div
                                                                whileHover={{ x: 4 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative z-10 ${isActive
                                                                    ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 shadow-sm'
                                                                    : 'text-default-900 hover:bg-default-100 dark:hover:bg-default-100/10 hover:text-foreground'
                                                                    }`}
                                                            >
                                                                <Icon
                                                                    icon={item.icon}
                                                                    className={`text-xl transition-colors ${isActive
                                                                        ? 'text-primary-600 dark:text-primary-400'
                                                                        : 'text-default-800 group-hover:text-default-900'
                                                                        }`}
                                                                />
                                                                <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                                                                    {item.name}
                                                                </span>
                                                            </motion.div>

                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </nav>
                                    </div>
                                ))}

                                <div className="px-6">
                                    <Divider className="my-4 bg-default-200/50" />
                                </div>

                                {/* Quick Links */}
                                <div className="px-3">
                                    <h3 className="px-3 mb-3 text-xs font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                                        Quick Links
                                        <div className="h-px bg-default-200 flex-1 opacity-50"></div>
                                    </h3>
                                    <nav className="space-y-0.5">
                                        {[
                                            { path: '/profile', name: 'My Profile', icon: 'mdi:account' },
                                            { path: '/settings', name: 'Settings', icon: 'mdi:cog' },
                                            { path: '/settings/update-password', name: 'Update Password', icon: 'mdi:lock-reset' },
                                            { path: '/help', name: 'Help & Support', icon: 'mdi:help-circle' }
                                        ].map((item) => (
                                            <Link key={item.path} to={item.path} onClick={handleNavigation}>
                                                <motion.div
                                                    whileHover={{ x: 4 }}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-default-900 hover:bg-default-100 dark:hover:bg-default-100/10 hover:text-foreground transition-all"
                                                >
                                                    <Icon icon={item.icon} className="text-xl text-default-800 group-hover:text-default-900" />
                                                    <span className="font-medium">{item.name}</span>
                                                </motion.div>
                                            </Link>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </DrawerBody>

                        <DrawerFooter className="p-4 border-t border-default-200 dark:border-default-100/10 backdrop-blur-sm bg-background/50">
                            <Button
                                color="danger"
                                variant="flat"
                                onPress={handleLogout}
                                className="w-full font-semibold shadow-sm hover:shadow-md transition-shadow"
                                startContent={<Icon icon="mdi:logout" className="text-xl" />}
                            >
                                Sign Out
                            </Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
}
