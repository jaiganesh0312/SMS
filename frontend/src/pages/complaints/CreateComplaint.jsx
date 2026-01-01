import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Textarea, Button, Select, SelectItem, addToast } from "@heroui/react";
import { Icon } from '@iconify/react';
import { complaintService } from '@/services';
import { useAuth } from '@/context/AuthContext';

const PRIORITIES = [
    { value: 'Low', label: 'Low', color: 'success' },
    { value: 'Medium', label: 'Medium', color: 'warning' },
    { value: 'High', label: 'High', color: 'danger' }
];

const CreateComplaint = ({ onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        studentId: '' // Optional logic if parent has multiple students
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectionChange = (name, keys) => {
        if (!keys) return;
        const value = Array.from(keys)[0];
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation
        if (!formData.title || !formData.description) {
            addToast({ title: "Validation Error", description: "Please fill in all required fields", color: "warning" });
            setLoading(false);
            return;
        }

        try {
            const response = await complaintService.createComplaint(formData);
            if (response?.data?.success) {
                addToast({ title: "Success", description: "Complaint submitted successfully", color: "success" });
                setFormData({ title: '', description: '', priority: 'Medium', studentId: '' });
                if (onSuccess) onSuccess();
            } else {
                addToast({ title: "Error", description: response?.data?.message || "Failed to submit complaint", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An error occurred", color: "danger" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="flex gap-3 px-6 pt-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon icon="fluent:person-feedback-24-filled" width={24} className="text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Submit a Complaint</h2>
                    <p className="text-sm text-gray-500">We value your feedback. Please describe your concern.</p>
                </div>
            </CardHeader>
            <CardBody className="px-6 py-6 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Subject / Title"
                        placeholder="Brief summary of the issue"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        variant="bordered"
                        isRequired
                    />

                    <Textarea
                        label="Description"
                        placeholder="Detailed explanation of the complaint..."
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        variant="bordered"
                        minRows={4}
                        isRequired
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Priority"
                            placeholder="Select priority"
                            selectedKeys={new Set([formData.priority])}
                            onSelectionChange={(keys) => handleSelectionChange('priority', keys)}
                            variant="bordered"
                        >
                            {PRIORITIES.map(p => (
                                <SelectItem key={p.value} textValue={p.label} startContent={
                                    <div className={`w-2 h-2 rounded-full bg-${p.color}-500`} />
                                }>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            color="primary"
                            isLoading={loading}
                            startContent={!loading && <Icon icon="lucide:send" />}
                        >
                            Submit Complaint
                        </Button>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
};

export default CreateComplaint;
