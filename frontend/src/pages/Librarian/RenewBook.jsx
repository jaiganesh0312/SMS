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
        } catch (error) { console.error(error); }
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
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Renew Book</h1>

            <Table aria-label="Renewable Books">
                <TableHeader>
                    <TableColumn>BOOK</TableColumn>
                    <TableColumn>ISSUED TO</TableColumn>
                    <TableColumn>CURRENT DUE DATE</TableColumn>
                    <TableColumn>ACTION</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No active issued books found">
                    {transactions.map(tx => (
                        <TableRow key={tx.id}>
                            <TableCell>
                                <p className="font-semibold">{tx.Book.title}</p>
                            </TableCell>
                            <TableCell>
                                <p>{tx.User?.name || tx.Student?.name}</p>
                                <p className="text-xs text-gray-500">
                                    {tx.User ? tx.User.role : `Student (${tx.Student?.admissionNumber})`}
                                </p>
                            </TableCell>
                            <TableCell>
                                {new Date(tx.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <Button size="sm" color="primary" onPress={() => onSelectRenew(tx)}>Renew</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {selectedTx && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-bold mb-4">Confirm Renewal</h3>
                        <p><strong>Book:</strong> {selectedTx.Book.title}</p>

                        <div className="mt-4">
                            <Input type="date" label="New Due Date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
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
