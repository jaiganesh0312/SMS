import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@heroui/react";
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Books in Section</h1>
                <Button onPress={() => navigate(-1)}>Back</Button>
            </div>

            <Table aria-label="Section Books">
                <TableHeader>
                    <TableColumn>TITLE</TableColumn>
                    <TableColumn>AUTHOR</TableColumn>
                    <TableColumn>ISBN</TableColumn>
                    <TableColumn>AVAILABLE</TableColumn>
                    <TableColumn>ACTION</TableColumn>
                </TableHeader>
                <TableBody emptyContent={isLoading ? "Loading..." : "No books in this section."} isLoading={isLoading}>
                    {books.map((book) => (
                        <TableRow key={book.id}>
                            <TableCell>{book.title}</TableCell>
                            <TableCell>{book.author}</TableCell>
                            <TableCell>{book.isbn}</TableCell>
                            <TableCell>{book.available} / {book.quantity}</TableCell>
                            <TableCell>
                                <Button size="sm" onPress={() => navigate(`/library/book/${book.id}`)}>
                                    View Details
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
