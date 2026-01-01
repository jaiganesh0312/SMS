import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Button,
    Chip,
    Spinner,
    addToast,
    useDisclosure,
    Tooltip
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { announcementService } from "@/services";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { motion } from "framer-motion";
import AnnouncementModal from "@/components/AnnouncementModal";

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);

    const loadAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await announcementService.getAnnouncements();
            if (response?.success) {
                setAnnouncements(response.data);
            } else {
                addToast({ title: "Error", description: "Failed to load announcements", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "Unexpected error loading announcements", color: "danger" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const handleCreateClick = () => {
        setEditingAnnouncement(null);
        onOpen();
    };

    const handleEditClick = (announcement) => {
        setEditingAnnouncement(announcement);
        onOpen();
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            const response = await announcementService.deleteAnnouncement(id);
            if (response?.success) {
                addToast({ title: "Success", description: "Announcement deleted", color: "success" });
                loadAnnouncements();
            } else {
                addToast({ title: "Error", description: response?.message || "Delete failed", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "Delete failed", color: "danger" });
        }
    };

    const handleSubmit = async (formData) => {
        try {
            let response;
            if (editingAnnouncement) {
                response = await announcementService.updateAnnouncement(editingAnnouncement.id, formData);
            } else {
                response = await announcementService.createAnnouncement(formData);
            }

            if (response?.success) {
                addToast({
                    title: "Success",
                    description: editingAnnouncement ? "Announcement updated" : "Announcement created",
                    color: "success"
                });
                onOpenChange(false);
                loadAnnouncements();
            } else {
                addToast({ title: "Error", description: response?.message || "Operation failed", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "Operation failed", color: "danger" });
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "HIGH": return "danger";
            case "MEDIUM": return "warning";
            case "LOW": return "primary";
            default: return "default";
        }
    };

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

    return (
        <motion.div
            className="space-y-6 p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Stay updated with latest school news</p>
                </div>
                {(user?.role === "SUPER_ADMIN" || user?.role === "SCHOOL_ADMIN") && (
                    <Button
                        color="primary"
                        startContent={<Icon icon="lucide:plus" />}
                        onPress={handleCreateClick}
                    >
                        New
                    </Button>
                )}
            </motion.div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Spinner label="Loading announcements..." size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.length > 0 ? (
                        announcements.map((announcement, index) => (
                            <motion.div key={announcement.id} variants={itemVariants}>
                                <Card className="h-full">
                                    <CardBody className="p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <Chip
                                                    size="sm"
                                                    color={getPriorityColor(announcement.priority)}
                                                    variant="flat"
                                                >
                                                    {announcement.priority}
                                                </Chip>
                                                <span className="text-tiny text-gray-500">
                                                    {format(new Date(announcement.createdAt), "MMM dd, yyyy")}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">{announcement.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                                {announcement.message}
                                            </p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-end">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-tiny text-gray-500">
                                                    <Icon icon="lucide:user" className="w-3 h-3" />
                                                    <span>{announcement.author?.name || "Admin"}</span>
                                                    <Chip size="sm" variant="dot" className="border-none ml-1 bg-transparent">
                                                        {announcement.authorRole}
                                                    </Chip>
                                                </div>
                                                {user?.role === "SUPER_ADMIN" && (
                                                    <div className="flex items-center gap-1 text-tiny text-gray-500">
                                                        <Icon icon="lucide:school" className="w-3 h-3" />
                                                        <span>{announcement.school?.name}</span>
                                                    </div>
                                                )}
                                                {announcement.expiryDate && (
                                                    <div className="flex items-center gap-1 text-tiny text-danger-500 font-medium">
                                                        <Icon icon="lucide:calendar-clock" className="w-3 h-3" />
                                                        <span>Expires: {format(new Date(announcement.expiryDate), "MMM dd")}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {user?.id === announcement.authorId && (
                                                <div className="flex gap-1">
                                                    <Tooltip content="Edit">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            onPress={() => handleEditClick(announcement)}
                                                        >
                                                            <Icon icon="lucide:edit-2" className="text-primary-500" />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip content="Delete">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            onPress={() => handleDeleteClick(announcement.id)}
                                                        >
                                                            <Icon icon="lucide:trash-2" className="text-danger-500" />
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed">
                            <Icon icon="lucide:megaphone-off" className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-lg">No announcements found</p>
                        </div>
                    )}
                </div>
            )}

            <AnnouncementModal
                isOpen={isOpen}
                onClose={() => onOpenChange(false)}
                onSubmit={handleSubmit}
                editingAnnouncement={editingAnnouncement}
                userRole={user?.role}
            />
        </motion.div>
    );
};

export default Announcements;
