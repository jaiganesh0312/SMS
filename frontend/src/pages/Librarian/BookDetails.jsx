import React, { useEffect, useState } from 'react';
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button, addToast } from "@heroui/react";
import libraryService from '@/services/libraryService';
import { useParams, useNavigate } from 'react-router-dom';

export default function BookDetails() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            setIsLoading(true);
            const res = await libraryService.getBookDetails(id);
            if (res.data?.success) {
                setBook(res.data.data);
            } else {
                addToast({ title: "Error", description: "Failed to load book details", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An error occurred fetching book details", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (!book) return <div className="p-6">Book not found</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Button onPress={() => navigate(-1)} className="mb-4">Back</Button>

            <Card className="mb-6">
                <CardBody className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                        <p className="text-xl text-gray-600 mb-4">{book.author}</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">ISBN</p>
                                <p className="font-semibold">{book.isbn}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Publisher</p>
                                <p className="font-semibold">{book.publisher || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Category</p>
                                <p className="font-semibold">{book.category || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Section</p>
                                <p className="font-semibold">{book.LibrarySection?.name}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <div className="px-4 py-2 bg-blue-50 rounded-lg text-center">
                                <p className="text-sm text-blue-500">Total Quantity</p>
                                <p className="text-xl font-bold text-blue-700">{book.quantity}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-lg text-center ${book.available > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                <p className={`text-sm ${book.available > 0 ? 'text-green-500' : 'text-red-500'}`}>Available</p>
                                <p className={`text-xl font-bold ${book.available > 0 ? 'text-green-700' : 'text-red-700'}`}>{book.available}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-2">Description</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{book.description}</p>
                    </div>
                </CardBody>
            </Card>

            <h2 className="text-xl font-bold mb-4">Transaction History</h2>
            <Table aria-label="Transaction History">
                <TableHeader>
                    <TableColumn>USER</TableColumn>
                    <TableColumn>ISSUE DATE</TableColumn>
                    <TableColumn>DUE DATE</TableColumn>
                    <TableColumn>RETURN DATE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>FINE</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No history for this book.">
                    {book.LibraryTransactions?.map((tx) => (
                        <TableRow key={tx.id}>
                            <TableCell>
                                <p className="font-semibold">{tx.User?.name || tx.Student?.name}</p>
                                <p className="text-xs text-gray-500">
                                    {tx.User ? `${tx.User.role} (${tx.User.email})` : `Student (${tx.Student?.admissionNumber})`}
                                </p>
                            </TableCell>
                            <TableCell>{new Date(tx.issueDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(tx.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell>{tx.returnDate ? new Date(tx.returnDate).toLocaleDateString() : '-'}</TableCell>
                            <TableCell>
                                <Chip size="sm" color={tx.status === 'RETURNED' ? 'success' : tx.status === 'OVERDUE' ? 'danger' : 'warning'} variant="flat">
                                    {tx.status}
                                </Chip>
                            </TableCell>
                            <TableCell>{tx.fineAmount > 0 ? tx.fineAmount : '-'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
