import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Card, CardBody } from "@heroui/react";
import { Icon } from '@iconify/react';
import libraryService from '@/services/libraryService';
import { useParams, useNavigate } from 'react-router-dom';

export default function SectionBooks() {
    const { sectionId } = useParams(); // Note: Route should be /library/section/:sectionId/books ?? Or just list sections and click to view?
    // User asked for "Books with sectionId page". 
    // Let's assume we navigate here.

    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, [sectionId]);

    const fetchBooks = async () => {
        try {
            setIsLoading(true);
            const res = await libraryService.getBooks({ sectionId });
            if (res.data?.success) {
                setBooks(res.data.data);
            } else {
                addToast({ title: "Error", description: "Failed to load books", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An error occurred", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-foreground">Books in Section</h1>
                <Button onPress={() => navigate(-1)} variant="light" startContent={<Icon icon="mdi:arrow-left" />}>Back</Button>
            </div>

            <Card className="bg-content1 border border-default-200 shadow-sm">
                <CardBody className="p-0">
                    <Table aria-label="Section Books" shadow="none" classNames={{
                        wrapper: "bg-content1 shadow-none",
                        th: "bg-default-100 text-default-500 font-medium",
                        td: "text-foreground group-hover:bg-default-50"
                    }}>
                        <TableHeader>
                            <TableColumn>TITLE</TableColumn>
                            <TableColumn>AUTHOR</TableColumn>
                            <TableColumn>ISBN</TableColumn>
                            <TableColumn>AVAILABLE</TableColumn>
                            <TableColumn>ACTION</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={isLoading ? "Loading..." : "No books in this section."} isLoading={isLoading}>
                            {books.map((book) => (
                                <TableRow key={book.id} className="border-b border-default-100 last:border-none">
                                    <TableCell>
                                        <p className="font-semibold text-foreground">{book.title}</p>
                                    </TableCell>
                                    <TableCell>{book.author}</TableCell>
                                    <TableCell className="font-mono text-xs text-default-500">{book.isbn}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={book.available > 0 ? "text-success font-bold" : "text-danger font-bold"}>{book.available}</span>
                                            <span className="text-default-400">/ {book.quantity}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="flat" color="primary" onPress={() => navigate(`/library/book/${book.id}`)}>
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
}
