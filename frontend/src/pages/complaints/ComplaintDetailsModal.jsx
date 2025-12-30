import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, User, Divider } from "@heroui/react";
import { format } from 'date-fns';
import { Icon } from '@iconify/react';

const STATUS_COLOR_MAP = {
    PENDING: "warning",
    IN_PROGRESS: "primary",
    RESOLVED: "success",
    REJECTED: "danger"
};

const ComplaintDetailsModal = ({ isOpen, onClose, complaint }) => {
    if (!complaint) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            scrollBehavior="inside"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h3>Complaint Details</h3>
                            <p className="text-small text-default-500">ID: {complaint.id?.slice(0, 8)}</p>
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-6">
                                {/* Header Info */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold">{complaint.title}</h2>
                                        <div className="flex gap-2">
                                            <Chip size="sm" variant="flat" color={complaint.priority === 'High' ? 'danger' : complaint.priority === 'Medium' ? 'warning' : 'success'}>
                                                {complaint.priority} Priority
                                            </Chip>
                                            <Chip size="sm" color={STATUS_COLOR_MAP[complaint.status] || "default"} variant="dot">
                                                {complaint.status?.replace('_', ' ')}
                                            </Chip>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-small text-default-500">Submitted on</p>
                                        <p className="font-medium">{complaint.createdAt ? format(new Date(complaint.createdAt), 'PPT') : '-'}</p>
                                    </div>
                                </div>

                                <Divider />

                                {/* Description */}
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Icon icon="fluent:text-description-24-regular" className="text-lg" />
                                        Description
                                    </h4>
                                    <div className="p-4 bg-default-50 rounded-lg whitespace-pre-wrap text-default-700">
                                        {complaint.description}
                                    </div>
                                </div>

                                {/* Parent Info (if available) */}
                                {complaint.Parent && (
                                    <>
                                        <Divider />
                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                <Icon icon="fluent:person-24-regular" className="text-lg" />
                                                Raised By
                                            </h4>
                                            <User
                                                name={complaint.Parent?.fatherName || complaint.Parent?.motherName || "Parent"}
                                                description={
                                                    <div className="flex flex-col">
                                                        <span>{complaint.Parent?.email}</span>
                                                        <span>{complaint.Parent?.phone}</span>
                                                    </div>
                                                }
                                                avatarProps={{
                                                    src: complaint.Parent?.profileImage,
                                                    size: "md"
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ComplaintDetailsModal;
