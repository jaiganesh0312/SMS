import React, { useEffect, useState } from 'react';
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Select, SelectItem, Pagination, PaginationItem, PaginationCursor, addToast
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from 'react-router-dom';
import libraryService from '@/services/libraryService';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const bookSchema = z.object({
    title: z.string().min(1, "Title is required"),
    author: z.string().min(1, "Author is required"),
    isbn: z.string().optional(),
    sectionId: z.string().min(1, "Section is required"),
    publisher: z.string().optional(),
    category: z.string().optional(),
    quantity: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1, "Quantity must be at least 1")),
    description: z.string().optional(),
});

export default function ManageBooks() {
    const [books, setSections] = useState([]);
    const [sections, setSectionsList] = useState([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [currentBook, setCurrentBook] = useState(null);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(bookSchema),
        defaultValues: {
            title: '',
            author: '',
            isbn: '',
            sectionId: '',
            publisher: '',
            category: '',
            quantity: 1,
            description: ''
        }
    });

    useEffect(() => {
        fetchData();
    }, [search]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [booksRes, sectionsRes] = await Promise.all([
                libraryService.getBooks({ search }),
                libraryService.getSections()
            ]);
            if (booksRes.data?.success) {
                setSections(booksRes.data.data);
            } else {
                addToast({ title: "Error", description: "Failed to load books", color: "danger" });
            }
            if (sectionsRes.data?.success) {
                setSectionsList(sectionsRes.data.data);
            } else {
                addToast({ title: "Error", description: "Failed to load sections", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An error occurred while fetching data", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data, onClose) => {
        try {
            setIsLoading(true);
            let response;
            if (currentBook) {
                response = await libraryService.updateBook(currentBook.id, data);
            } else {
                response = await libraryService.createBook(data);
            }

            if (response.data?.success) {
                addToast({ title: "Success", description: currentBook ? "Book updated" : "Book created", color: "success" });
                fetchData();
                onClose();
            } else {
                addToast({ title: "Error", description: response.message || "Error saving book", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An unexpected error occurred", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (book) => {
        setCurrentBook(book);
        setValue('title', book.title);
        setValue('author', book.author);
        setValue('isbn', book.isbn);
        setValue('sectionId', book.sectionId ? String(book.sectionId) : '');
        setValue('publisher', book.publisher || '');
        setValue('category', book.category || '');
        setValue('quantity', book.quantity);
        setValue('description', book.description || '');
        onOpen();
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this book?")) {
            try {
                setIsLoading(true);
                const response = await libraryService.deleteBook(id);
                if (response.data?.success) {
                    addToast({ title: "Success", description: "Book deleted", color: "success" });
                    fetchData();
                } else {
                    addToast({ title: "Error", description: response.message || "Cannot delete book", color: "danger" });
                }
            } catch (error) {
                addToast({ title: "Error", description: "An error occurred while deleting", color: "danger" });
            } finally {
                setIsLoading(false);
            }
        }
    }

    const openAddHelper = () => {
        setCurrentBook(null);
        reset({ title: '', author: '', isbn: '', sectionId: '', publisher: '', category: '', quantity: 1, description: '' });
        onOpen();
    }

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Manage Books</h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Search books..."
                        startContent={<Icon icon="mdi:magnify" />}
                        value={search}
                        onValueChange={setSearch}
                        className="w-full md:w-64"
                    />
                    <Button color="secondary" variant="flat" startContent={<Icon icon="mdi:upload" />} onPress={() => navigate('/admin/bulk-upload/library-books')}>
                        Bulk Upload
                    </Button>
                    <Button color="primary" startContent={<Icon icon="mdi:plus" />} onPress={openAddHelper}>
                        Add Book
                    </Button>
                </div>
            </div>

            <Table aria-label="Books Table">
                <TableHeader>
                    <TableColumn>TITLE</TableColumn>
                    <TableColumn>AUTHOR</TableColumn>
                    <TableColumn>ISBN</TableColumn>
                    <TableColumn>SECTION</TableColumn>
                    <TableColumn>AVAIL / TOTAL</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No books found."}>
                    {books.map((book) => (
                        <TableRow key={book.id}>
                            <TableCell>{book.title}</TableCell>
                            <TableCell>{book.author}</TableCell>
                            <TableCell>{book.isbn}</TableCell>
                            <TableCell>{book.LibrarySection?.name}</TableCell>
                            <TableCell>{book.available} / {book.quantity}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button isIconOnly size="sm" color="success" variant="light" onPress={() => navigate(`/library/book/${book.id}`)} title="View Details">
                                        <Icon icon="mdi:eye" width={20} />
                                    </Button>
                                    <Button isIconOnly size="sm" color="primary" variant="light" onPress={() => handleEdit(book)}>
                                        <Icon icon="mdi:pencil" width={20} />
                                    </Button>
                                    <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => handleDelete(book.id)}>
                                        <Icon icon="mdi:trash" width={20} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit((data) => onSubmit(data, onClose))}>
                            <ModalHeader className="flex flex-col gap-1">{currentBook ? "Edit Book" : "Add Book"}</ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Title"
                                        placeholder="e.g. Malgudi Days"
                                        startContent={<Icon icon="mdi:format-title" className="text-default-400" />}
                                        {...register("title")}
                                        isInvalid={!!errors.title}
                                        errorMessage={errors.title?.message}
                                        isRequired
                                    />
                                    <Input
                                        label="Author"
                                        placeholder="e.g. R.K. Narayan"
                                        startContent={<Icon icon="mdi:account" className="text-default-400" />}
                                        {...register("author")}
                                        isInvalid={!!errors.author}
                                        errorMessage={errors.author?.message}
                                        isRequired
                                    />
                                    <Input
                                        label="ISBN"
                                        placeholder="e.g. 978-81-85986-17-3"
                                        startContent={<Icon icon="mdi:barcode" className="text-default-400" />}
                                        {...register("isbn")}
                                    />
                                    <Controller
                                        name="sectionId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                label="Section"
                                                placeholder="Select a section"
                                                startContent={<Icon icon="mdi:bookshelf" className="text-default-400" />}
                                                selectedKeys={field.value ? [field.value] : []}
                                                onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                                                isInvalid={!!errors.sectionId}
                                                errorMessage={errors.sectionId?.message}
                                                isRequired
                                            >
                                                {sections.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    <Input
                                        label="Publisher"
                                        placeholder="e.g. Indian Thought Publications"
                                        startContent={<Icon icon="mdi:domain" className="text-default-400" />}
                                        {...register("publisher")}
                                    />
                                    <Input
                                        label="Category"
                                        placeholder="e.g. Fiction"
                                        startContent={<Icon icon="mdi:tag-text-outline" className="text-default-400" />}
                                        {...register("category")}
                                    />
                                    <Input
                                        type="number"
                                        label="Quantity"
                                        placeholder="e.g. 10"
                                        startContent={<Icon icon="mdi:numeric" className="text-default-400" />}
                                        {...register("quantity")}
                                        isInvalid={!!errors.quantity}
                                        errorMessage={errors.quantity?.message}
                                        isRequired
                                        min={1}
                                    />
                                </div>
                                <Input
                                    label="Description"
                                    placeholder="e.g. A collection of short stories..."
                                    startContent={<Icon icon="mdi:text" className="text-default-400" />}
                                    {...register("description")}
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
