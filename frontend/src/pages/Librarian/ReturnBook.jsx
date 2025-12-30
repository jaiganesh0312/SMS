import React, { useState } from 'react';
import { Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import libraryService from '@/services/libraryService';

export default function ReturnBook() {
    const [search, setSearch] = useState(''); // can be book isbn, user name...
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // New state for return modal/process
    const [selectedTx, setSelectedTx] = useState(null);
    const [fine, setFine] = useState(0);
    const [remarks, setRemarks] = useState('');

    const handleSearch = async () => {
        // In a real app we'd pass search query to getTransactions
        // For now, let's just fetch all 'ISSUED' and filter in valid range or assume backend handles query
        // I added userId/status to getTransactions params.
        try {
            const res = await libraryService.getTransactions({ status: 'ISSUED' }); // Fetch all issued
            if (res.data?.success) {
                // Client side filter if search is present
                //   setTransactions(res.data.filter(t => 
                //       t.Book.title.toLowerCase().includes(search.toLowerCase()) || 
                //       t.User.name.toLowerCase().includes(search.toLowerCase())
                //   ));
                setTransactions(res.data.data);
            }
        } catch (error) { console.error(error); }
    };

    const calculateFine = (dueDate) => {
        const due = new Date(dueDate);
        const today = new Date();
        if (today > due) {
            const diffTime = Math.abs(today - due);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays * 10; // e.g., 10 currency units per day
        }
        return 0;
    };

    const onSelectReturn = (tx) => {
        setSelectedTx(tx);
        setFine(calculateFine(tx.dueDate));
        setRemarks('');
    };

    const confirmReturn = async () => {
        try {
            setIsLoading(true);
            const response = await libraryService.returnBook({
                transactionId: selectedTx.id,
                fineAmount: fine,
                remarks,
                returnDate: new Date()
            });

            if (response.data?.success) {
                addToast({ title: "Success", description: "Book returned successfully", color: "success" });
                setSelectedTx(null);
                handleSearch(); // Refresh
            } else {
                addToast({ title: "Error", description: response.message || "Failed to return book", color: "danger" });
            }
        } catch (error) {
            addToast({ title: "Error", description: "An unexpected error occurred", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Return Book</h1>

            <div className="flex gap-4 mb-6">
                <Input
                    placeholder="Search issued books..."
                    value={search}
                    onValueChange={setSearch}
                    className="max-w-md"
                />
                <Button color="primary" onPress={handleSearch}>Search</Button>
            </div>

            <Table aria-label="Issued Books">
                <TableHeader>
                    <TableColumn>BOOK</TableColumn>
                    <TableColumn>ISSUED TO</TableColumn>
                    <TableColumn>DUE DATE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTION</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No active issued books found">
                    {transactions.map(tx => (
                        <TableRow key={tx.id}>
                            <TableCell>
                                <p className="font-semibold">{tx.Book.title}</p>
                                <p className="text-xs text-gray-500">{tx.Book.isbn}</p>
                            </TableCell>
                            <TableCell>
                                <p>{tx.User?.name || tx.Student?.name}</p>
                                <p className="text-xs text-gray-500">
                                    {tx.User ? tx.User.role : `Student (${tx.Student?.admissionNumber})`}
                                </p>
                            </TableCell>
                            <TableCell>
                                <span className={new Date(tx.dueDate) < new Date() ? "text-red-500 font-bold" : ""}>
                                    {new Date(tx.dueDate).toLocaleDateString()}
                                </span>
                            </TableCell>
                            <TableCell><Chip size="sm" color="warning" variant="flat">{tx.status}</Chip></TableCell>
                            <TableCell>
                                <Button size="sm" color="success" onPress={() => onSelectReturn(tx)}>Return</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Return Confirmation Area - Simple inline or modal. using inline for speed */}
            {selectedTx && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-bold mb-4">Confirm Return</h3>
                        <p><strong>Book:</strong> {selectedTx.Book.title}</p>
                        <p><strong>Issued To:</strong> {selectedTx.User?.name || selectedTx.Student?.name}</p>

                        <div className="mt-4">
                            <Input type="number" label="Fine Amount" value={fine} onValueChange={setFine} />
                        </div>
                        <div className="mt-2">
                            <Input label="Remarks" value={remarks} onValueChange={setRemarks} />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button color="danger" variant="light" onPress={() => setSelectedTx(null)}>Cancel</Button>
                            <Button color="primary" onPress={confirmReturn} isLoading={isLoading}>Confirm</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
