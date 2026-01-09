import React, { useState } from 'react';
import { Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, addToast } from "@heroui/react";
import libraryService from '@/services/libraryService';

export default function RenewBook() {
    const [transactions, setTransactions] = useState([]);
    const [selectedTx, setSelectedTx] = useState(null);
    const [newDueDate, setNewDueDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchIssued = async () => {
        try {
            const res = await libraryService.getTransactions({ status: 'ISSUED' });
            if (res.data?.success) setTransactions(res.data.data);
        } catch (error) { }
    };

    React.useEffect(() => {
        fetchIssued();
    }, []);

    const onSelectRenew = (tx) => {
        setSelectedTx(tx);
        // Default to +7 days
        const d = new Date(tx.dueDate);
        d.setDate(d.getDate() + 7);
        setNewDueDate(d.toISOString().split('T')[0]);
    };

    const confirmRenew = async () => {
        try {
            setIsLoading(true);
            const response = await libraryService.renewBook({
                transactionId: selectedTx.id,
                newDueDate
            });
            if (response.data?.success) {
                addToast({ title: "Success", description: "Book renewed successfully", color: "success" });
                setSelectedTx(null);
                setNewDueDate('');
                fetchIssued();
            } else {
                addToast({ title: "Error", description: response.message || "Failed to renew book", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An unexpected error occurred", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Renew Book</h1>

            <Card className="bg-content1 border border-default-200 shadow-sm">
                <CardBody className="p-0">
                    <Table aria-label="Renewable Books" shadow="none" classNames={{
                        wrapper: "bg-content1 shadow-none",
                        th: "bg-default-100 text-default-500 font-medium",
                        td: "text-foreground group-hover:bg-default-50"
                    }}>
                        <TableHeader>
                            <TableColumn>BOOK</TableColumn>
                            <TableColumn>ISSUED TO</TableColumn>
                            <TableColumn>CURRENT DUE DATE</TableColumn>
                            <TableColumn>ACTION</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No active issued books found">
                            {transactions.map(tx => (
                                <TableRow key={tx.id} className="border-b border-default-100 last:border-none">
                                    <TableCell>
                                        <p className="font-semibold text-foreground">{tx.Book.title}</p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-foreground">{tx.User?.name || tx.Student?.name}</p>
                                        <p className="text-xs text-default-500">
                                            {tx.User ? tx.User.role : `Student (${tx.Student?.admissionNumber})`}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-foreground">
                                        {new Date(tx.dueDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" color="primary" variant="flat" onPress={() => onSelectRenew(tx)}>Renew</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {selectedTx && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-content1 p-6 rounded-lg shadow-xl w-96 border border-default-200">
                        <h3 className="text-xl font-bold mb-4 text-foreground">Confirm Renewal</h3>
                        <p className="text-default-700"><strong>Book:</strong> {selectedTx.Book.title}</p>

                        <div className="mt-6">
                            <Input
                                type="date"
                                label="New Due Date"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                                variant="bordered"
                                labelPlacement="outside"
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button color="danger" variant="light" onPress={() => setSelectedTx(null)}>Cancel</Button>
                            <Button color="primary" onPress={confirmRenew} isLoading={isLoading}>Confirm</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
