import React, { useEffect, useState } from 'react';
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';
import libraryService from '@/services/libraryService';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const sectionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    location: z.string().optional(),
});

export default function ManageSections() {
    const [sections, setSections] = useState([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [currentSection, setCurrentSection] = useState(null); // For edit
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(sectionSchema),
        defaultValues: {
            name: '',
            description: '',
            location: ''
        }
    });

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            setIsLoading(true);
            const response = await libraryService.getSections();
            if (response.data?.success) {
                setSections(response.data.data);
            } else {
                addToast({ title: "Error", description: "Failed to load sections", color: "danger" });
            }
        } catch (error) {
            console.error(error);
            addToast({ title: "Error", description: "An error occurred while fetching sections", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data, onClose) => {
        try {
            setIsLoading(true);
            let response;
            if (currentSection) {
                response = await libraryService.updateSection(currentSection.id, data);
            } else {
                response = await libraryService.createSection(data);
            }

            if (response.data?.success) {
                addToast({ title: "Success", description: currentSection ? "Section updated" : "Section created", color: "success" });
                fetchSections();
                onClose();
            } else {
                addToast({ title: "Error", description: response.message || "An error occurred", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "Unexpected error occurred", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (section) => {
        setCurrentSection(section);
        setValue('name', section.name);
        setValue('description', section.description);
        setValue('location', section.location);
        onOpen();
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this section?")) {
            try {
                setIsLoading(true);
                const response = await libraryService.deleteSection(id);
                if (response.data?.success) {
                    addToast({ title: "Success", description: "Section deleted", color: "success" });
                    fetchSections();
                } else {
                    addToast({ title: "Error", description: response.message || "Cannot delete section with books", color: "danger" });
                }
            } catch (error) {
                addToast({ title: "Error", description: "An error occurred while deleting", color: "danger" });
            } finally {
                setIsLoading(false);
            }
        }
    }

    const openAddHelper = () => {
        setCurrentSection(null);
        reset({ name: '', description: '', location: '' });
        onOpen();
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Sections</h1>
                <div className="flex gap-2">
                    <Button color="secondary" variant="flat" startContent={<Icon icon="mdi:upload" />} onPress={() => navigate('/admin/bulk-upload/library-sections')}>
                        Bulk Upload
                    </Button>
                    <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={openAddHelper}>
                        Add Section
                    </Button>
                </div>
            </div>

            <Table aria-label="Sections Table">
                <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>DESCRIPTION</TableColumn>
                    <TableColumn>LOCATION</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No sections found."}>
                    {sections.map((section) => (
                        <TableRow key={section.id}>
                            <TableCell>{section.name}</TableCell>
                            <TableCell>{section.description}</TableCell>
                            <TableCell>{section.location}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button isIconOnly size="sm" color="success" variant="light" onPress={() => navigate(`/library/section/${section.id}/books`)} title="View Books">
                                        <Icon icon="mdi:bookshelf" width={20} />
                                    </Button>
                                    <Button isIconOnly size="sm" color="primary" variant="light" onPress={() => handleEdit(section)}>
                                        <Icon icon="mdi:pencil" width={20} />
                                    </Button>
                                    <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => handleDelete(section.id)}>
                                        <Icon icon="mdi:trash" width={20} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit((data) => onSubmit(data, onClose))}>
                            <ModalHeader className="flex flex-col gap-1">{currentSection ? "Edit Section" : "Add Section"}</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Name"
                                    placeholder="e.g. Premchand Collection"
                                    startContent={<Icon icon="mdi:rename-box" className="text-default-400" />}
                                    {...register("name")}
                                    isInvalid={!!errors.name}
                                    errorMessage={errors.name?.message}
                                    isRequired
                                />
                                <Input
                                    label="Description"
                                    placeholder="e.g. Works of Munshi Premchand"
                                    startContent={<Icon icon="mdi:text" className="text-default-400" />}
                                    {...register("description")}
                                />
                                <Input
                                    label="Location"
                                    placeholder="e.g. Second Floor, Aisle 3"
                                    startContent={<Icon icon="mdi:map-marker" className="text-default-400" />}
                                    {...register("location")}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit">
                                    Save
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
