import React, { useState, useEffect } from 'react';
import { Input, Button, Card, CardBody, User as UserAvatar, Select, SelectItem, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import libraryService from '@/services/libraryService';
import { studentService, staffService } from '@/services';

export default function IssueBook() {
    const [searchBook, setSearchBook] = useState('');
    const [foundBooks, setFoundBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);

    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [dueDate, setDueDate] = useState('');

    // Search Books
    useEffect(() => {
        if (searchBook.length > 2) {
            const timer = setTimeout(async () => {
                try {
                    const res = await libraryService.getBooks({ search: searchBook });
                    if (res.data?.success) setFoundBooks(res.data.data);
                    else {
                        addToast({ title: "Error", description: res.data.message, color: "danger" });
                    }
                } catch (error) {
                    addToast({ title: "Error", description: error.message, color: "danger" });
                }
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setFoundBooks([]);
        }
    }, [searchBook]);

    const onIssue = async () => {
        if (!selectedBook || !selectedUser || !dueDate) {
            addToast({ title: "Error", description: "All fields required", color: "danger" });
            return;
        }

        try {
            setIsLoading(true);
            const payload = {
                bookId: selectedBook.id,
                dueDate
            };

            if (selectedUser.type === 'student') {
                payload.studentId = selectedUser.id;
            } else {
                payload.userId = selectedUser.id;
            }

            const response = await libraryService.issueBook(payload);
            if (response.data?.success) {
                addToast({ title: "Success", description: "Book Issued Successfully", color: "success" });
                setSelectedBook(null);
                setSelectedUser(null);
                setSearchBook('');
                setDueDate('');
            } else {
                addToast({ title: "Error", description: response.message || "Failed to issue book", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An unexpected error occurred", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    }

    // Temporary User Search Component
    const UserSearch = () => {
        const [type, setType] = useState('student');
        const [query, setQuery] = useState('');
        const [results, setResults] = useState([]);

        const handleSearch = async () => {
            try {
                if (type === 'student') {
                    const response = await studentService.getAllStudents({ search: query });
                    if (response.data?.success) {
                        setResults(response.data.data.students || response.data.data);
                    }
                } else {
                    const response = await staffService.getAllStaff({ search: query });
                    if (response.data?.success) {
                        setResults(response.data.data.staff || response.data.data);
                    }
                }
            } catch (e) { }
        }

        return (
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <Select selectedKeys={[type]} onChange={(e) => setType(e.target.value)} aria-label="User Type" className="w-32" variant="bordered">
                        <SelectItem key="student" value="student">Student</SelectItem>
                        <SelectItem key="staff" value="staff">Staff</SelectItem>
                    </Select>
                    <Input
                        placeholder={type === 'student' ? "Search Name/AdmNo" : "Search Name/EmpCode"}
                        value={query}
                        onValueChange={setQuery}
                        startContent={<Icon icon="mdi:account-search" className="text-default-400" />}
                        variant="bordered"
                    />
                    <Button isIconOnly onPress={handleSearch} color="primary" variant="flat"><Icon icon="mdi:magnify" /></Button>
                </div>
                <div className="max-h-40 overflow-y-auto border border-default-200 rounded-medium p-2 bg-default-50">
                    {results.map(u => (
                        <div key={u.id || u.userId} className="p-2 hover:bg-default-100 cursor-pointer flex justify-between rounded-small transition-colors"
                            onClick={() => setSelectedUser({
                                id: u.userId || u.id,
                                name: u.name || (u.firstName + ' ' + u.lastName),
                                email: u.email || u.admissionNumber,
                                type: type
                            })}>
                            <span className="text-foreground">{u.name || (u.firstName + ' ' + u.lastName)}</span>
                            <span className="text-xs text-default-400">{u.admissionNo || u.employeeCode}</span>
                        </div>
                    ))}
                    {results.length === 0 && <p className="text-xs text-default-400 text-center py-2">No users found</p>}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Issue Book</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardBody className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon icon="mdi:book-open-page-variant" className="text-primary text-xl" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">1. Select Book</h3>
                        </div>
                        <Input
                            placeholder="Search by title, author, ISBN..."
                            value={searchBook}
                            onValueChange={setSearchBook}
                            startContent={<Icon icon="mdi:book-search" className="text-default-400" />}
                            className="mb-4"
                            variant="bordered"
                        />
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {foundBooks.map(book => (
                                <div
                                    key={book.id}
                                    onClick={() => setSelectedBook(book)}
                                    className={`p-3 border rounded-medium cursor-pointer flex justify-between items-center transition-all ${selectedBook?.id === book.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-default-200 hover:bg-default-50'
                                        }`}
                                >
                                    <div>
                                        <p className="font-semibold text-foreground">{book.title}</p>
                                        <p className="text-xs text-default-500">{book.author} | ISBN: {book.isbn}</p>
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full ${book.available > 0 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                        {book.available} Available
                                    </div>
                                </div>
                            ))}
                            {foundBooks.length === 0 && searchBook.length > 2 && (
                                <p className="text-center text-default-400 text-sm py-4">No books found</p>
                            )}
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardBody className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-secondary/10 rounded-lg">
                                <Icon icon="mdi:account" className="text-secondary text-xl" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">2. Select User</h3>
                        </div>
                        <UserSearch />
                        {selectedUser && (
                            <div className="mt-4 p-4 bg-secondary/10 border border-secondary/20 rounded-medium">
                                <p className="font-semibold text-secondary-700">Selected: {selectedUser.name}</p>
                                <p className="text-xs text-secondary-600">{selectedUser.email}</p>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            <Card className="bg-content1 border border-default-200 shadow-sm">
                <CardBody className="flex flex-col md:flex-row gap-4 items-end p-6">
                    <Input
                        type="date"
                        label="Due Date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="max-w-xs"
                        isRequired
                        variant="bordered"
                        labelPlacement="outside"
                    />
                    <Button
                        color="primary"
                        size="lg"
                        onPress={onIssue}
                        isDisabled={!selectedBook || !selectedUser || !dueDate || isLoading}
                        isLoading={isLoading}
                        className="w-full md:w-auto font-semibold shadow-md shadow-primary/20"
                    >
                        Confirm Issue
                    </Button>
                </CardBody>
            </Card>
        </div>
    );
}
