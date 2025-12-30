import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    CheckboxGroup,
    Checkbox,
    Autocomplete,
    AutocompleteItem
} from "@heroui/react";
import { format } from "date-fns";
import dashboardService from "@/services/dashboardService";

const AnnouncementModal = ({ isOpen, onClose, onSubmit, editingAnnouncement, userRole }) => {
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        priority: "MEDIUM",
        expiryDate: "",
        targetSchoolIds: []
    });
    const [schools, setSchools] = useState([]);
    const [loadingSchools, setLoadingSchools] = useState(false);

    useEffect(() => {
        if (editingAnnouncement) {
            setFormData({
                title: editingAnnouncement.title || "",
                message: editingAnnouncement.message || "",
                priority: editingAnnouncement.priority || "MEDIUM",
                expiryDate: editingAnnouncement.expiryDate ? format(new Date(editingAnnouncement.expiryDate), "yyyy-MM-dd") : "",
                targetSchoolIds: editingAnnouncement.schoolId ? [editingAnnouncement.schoolId] : []
            });
        } else {
            setFormData({
                title: "",
                message: "",
                priority: "MEDIUM",
                expiryDate: "",
                targetSchoolIds: []
            });
        }
    }, [editingAnnouncement, isOpen]);

    useEffect(() => {
        if (userRole === "SUPER_ADMIN" && isOpen) {
            fetchSchools();
        }
    }, [userRole, isOpen]);

    const fetchSchools = async () => {
        setLoadingSchools(true);
        try {
            const response = await dashboardService.getAllSchools();
            if (response?.data?.success) {
                setSchools(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching schools:", error);
        } finally {
            setLoadingSchools(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSchoolChange = (values) => {
        setFormData(prev => ({ ...prev, targetSchoolIds: values }));
    };

    const handleSubmitLocal = () => {
        if (!formData.title || !formData.message) {
            alert("Title and message are required");
            return;
        }
        if (userRole === "SUPER_ADMIN" && !editingAnnouncement && formData.targetSchoolIds.length === 0) {
            alert("Please select at least one school");
            return;
        }
        onSubmit(formData);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Title"
                                    name="title"
                                    placeholder="Enter announcement title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    isRequired
                                />
                                <Textarea
                                    label="Message"
                                    name="message"
                                    placeholder="Enter announcement message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    isRequired
                                />
                                <div className="flex gap-4">
                                    <Select
                                        label="Priority"
                                        name="priority"
                                        selectedKeys={[formData.priority]}
                                        onChange={handleChange}
                                        className="flex-1"
                                    >
                                        <SelectItem key="LOW" value="LOW">Low</SelectItem>
                                        <SelectItem key="MEDIUM" value="MEDIUM">Medium</SelectItem>
                                        <SelectItem key="HIGH" value="HIGH">High</SelectItem>
                                    </Select>
                                    <Input
                                        label="Expiry Date (Optional)"
                                        name="expiryDate"
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        className="flex-1"
                                    />
                                </div>

                                {userRole === "SUPER_ADMIN" && !editingAnnouncement && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium">Select Target Schools</p>
                                        <CheckboxGroup
                                            orientation="horizontal"
                                            value={formData.targetSchoolIds}
                                            onValueChange={handleSchoolChange}
                                            className="max-h-40 overflow-y-auto p-2 border rounded-md"
                                        >
                                            {schools.map(school => (
                                                <Checkbox key={school.id} value={school.id}>
                                                    {school.name}
                                                </Checkbox>
                                            ))}
                                        </CheckboxGroup>
                                        {loadingSchools && <p className="text-xs text-gray-500">Loading schools...</p>}
                                    </div>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={handleSubmitLocal}>
                                {editingAnnouncement ? "Update" : "Create"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default AnnouncementModal;
