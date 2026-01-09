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
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <Button onPress={() => navigate(-1)} variant="light" startContent={<Icon icon="mdi:arrow-left" />} className="mb-2">Back</Button>

            <Card className="bg-content1 border border-default-200 shadow-sm">
                <CardBody className="flex flex-col md:flex-row gap-6 p-6">
                    <div className="flex-1">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-foreground mb-2">{book.title}</h1>
                            <p className="text-xl text-default-500 font-medium">{book.author}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                            <div>
                                <p className="text-sm text-default-500 uppercase tracking-wider">ISBN</p>
                                <p className="font-semibold text-foreground font-mono">{book.isbn}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500 uppercase tracking-wider">Publisher</p>
                                <p className="font-semibold text-foreground">{book.publisher || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500 uppercase tracking-wider">Category</p>
                                <p className="font-semibold text-foreground">{book.category || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500 uppercase tracking-wider">Section</p>
                                <p className="font-semibold text-primary">{book.LibrarySection?.name}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="px-5 py-3 bg-secondary/10 rounded-lg text-center border border-secondary/20">
                                <p className="text-xs text-secondary mb-1 font-bold uppercase">Total Copies</p>
                                <p className="text-2xl font-extrabold text-secondary-700">{book.quantity}</p>
                            </div>
                            <div className={`px-5 py-3 rounded-lg text-center border ${book.available > 0 ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'}`}>
                                <p className={`text-xs mb-1 font-bold uppercase ${book.available > 0 ? 'text-success' : 'text-danger'}`}>Available</p>
                                <p className={`text-2xl font-extrabold ${book.available > 0 ? 'text-success-700' : 'text-danger-700'}`}>{book.available}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 border-t md:border-t-0 md:border-l border-default-200 pt-6 md:pt-0 md:pl-6">
                        <p className="text-sm text-default-500 uppercase tracking-wider mb-3">Description</p>
                        <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">{book.description || "No description provided."}</p>
                    </div>
                </CardBody>
            </Card>

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                    <Icon icon="mdi:history" />
                    Transaction History
                </h2>
                <Card className="bg-content1 border border-default-200 shadow-sm">
                    <CardBody className="p-0">
                        <Table aria-label="Transaction History" shadow="none" classNames={{
                            wrapper: "bg-content1 shadow-none",
                            th: "bg-default-100 text-default-500 font-medium",
                            td: "text-foreground group-hover:bg-default-50"
                        }}>
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
                                    <TableRow key={tx.id} className="border-b border-default-100 last:border-none">
                                        <TableCell>
                                            <p className="font-semibold text-foreground">{tx.User?.name || tx.Student?.name}</p>
                                            <p className="text-xs text-default-500">
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
                                        <TableCell>{tx.fineAmount > 0 ? `₹${tx.fineAmount}` : '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
