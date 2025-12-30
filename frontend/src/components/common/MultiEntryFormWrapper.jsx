import React, { useState } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';

/**
 * MultiEntryFormWrapper - Reusable component for forms supporting multiple entries
 * @param {Object} props
 * @param {Array} props.entries - Existing entries
 * @param {Function} props.onSave - Save handler for new/edited entries
 * @param {Function} props.onDelete - Delete handler for entries
 * @param {Function} props.onSkip - Skip handler to proceed without saving
 * @param {Function} props.renderForm - Render function for the form (receives {initialData, onSubmit, onCancel})
 * @param {Function} props.renderEntry - Render function for each entry in list (receives {entry, index})
 * @param {string} props.addButtonText - Text for "Add Entry" button
 * @param {string} props.emptyMessage - Message to show when no entries exist
 */
const MultiEntryFormWrapper = ({
    entries = [],
    onSave,
    onDelete,
    onSkip,
    renderForm,
    renderEntry,
    addButtonText = 'Add Entry',
    emptyMessage = 'No entries added yet.',
    loading = false,
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const handleAddNew = () => {
        setEditingIndex(null);
        setShowForm(true);
    };

    const handleEdit = (index) => {
        setEditingIndex(index);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingIndex(null);
    };

    const handleSubmit = async (data) => {
        await onSave(data, editingIndex);
        setShowForm(false);
        setEditingIndex(null);
    };

    return (
        <div className="space-y-6">
            {/* List of existing entries */}
            {entries.length > 0 && (
                <div className="space-y-3">
                    {entries.map((entry, index) => (
                        <Card key={index} className="shadow-sm">
                            <CardBody className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        {renderEntry({ entry, index })}
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            color="primary"
                                            startContent={<Icon icon="lucide:edit" />}
                                            onClick={() => handleEdit(index)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            color="danger"
                                            startContent={<Icon icon="lucide:trash-2" />}
                                            onClick={() => onDelete(entry.id, index)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {entries.length === 0 && !showForm && (
                <div className="text-center py-8 text-default-500">
                    <Icon icon="lucide:inbox" className="mx-auto mb-2" width="48" height="48" />
                    <p>{emptyMessage}</p>
                </div>
            )}

            {/* Form for adding/editing */}
            {showForm && (
                <Card className="shadow-sm border-2 border-primary">
                    <CardBody className="p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingIndex !== null ? 'Edit Entry' : 'Add New Entry'}
                        </h3>
                        {renderForm({
                            initialData: editingIndex !== null ? entries[editingIndex] : null,
                            onSubmit: handleSubmit,
                            onCancel: handleCancel,
                        })}
                    </CardBody>
                </Card>
            )}

            {/* Action buttons */}
            {!showForm && (
                <div className="flex justify-between gap-4">
                    <Button
                        color="primary"
                        variant="bordered"
                        startContent={<Icon icon="lucide:plus" />}
                        onClick={handleAddNew}
                        isDisabled={loading}
                    >
                        {addButtonText}
                    </Button>
                    <div className="flex gap-4">
                        <Button
                            variant="flat"
                            onClick={onSkip}
                            isDisabled={loading}
                        >
                            Skip
                        </Button>
                        <Button
                            color="primary"
                            onClick={onSkip}
                            isDisabled={loading}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiEntryFormWrapper;
