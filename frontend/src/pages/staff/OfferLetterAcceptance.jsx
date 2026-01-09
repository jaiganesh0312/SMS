import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Spinner, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { staffService, authService } from "@/services";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const OfferLetterAcceptance = () => {
    const { user, updateUser } = useAuth(); // Assuming refreshUser exists, or logout/login needed
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadOfferLetter();
        return () => {
            if (pdfUrl) {
                window.URL.revokeObjectURL(pdfUrl);
            }
        };
    }, []);

    const loadOfferLetter = async () => {
        setLoading(true);
        try {
            // Should add a "getMyOfferLetter" to service or use existing by ID if user has ID
            // Assuming the logged in user context has ID.
            if (!user?.id) return;

            const response = await staffService.generateOfferLetter(user.id);
            if (response?.data) {
                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                setPdfUrl(url);
            } else {
                setError("Failed to load Offer Letter.");
            }
        } catch (err) {
            setError("Error loading document.");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        setActionLoading(true);
        try {
            const response = await staffService.acceptOffer();
            if (response?.data?.success) {
                addToast({ title: "Welcome!", description: "You have successfully joined the team.", color: "success" });
                const userData = user;
                userData.staffProfile.status = "ACTIVE";
                updateUser(userData);
                navigate('/dashboard');
            } else {
                addToast({ title: "Error", description: response?.data?.message || "Failed to accept offer.", color: "danger" });
            }
        } catch (err) {
            addToast({ title: "Error", description: "An unexpected error occurred.", color: "danger" });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <Card className="w-full max-w-5xl h-[85vh] shadow-xl">
                <CardBody className="flex flex-col h-full p-0">
                    <div className="flex justify-between items-center p-4 border-b border-default-200 bg-content1">
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Review Offer Letter</h1>
                            <p className="text-sm text-default-500">Please review and accept your offer to proceed.</p>
                        </div>
                        <Button
                            color="success"
                            size="lg"
                            startContent={<Icon icon="lucide:check-circle" />}
                            isLoading={actionLoading}
                            onPress={handleAccept}
                            isDisabled={!pdfUrl}
                        >
                            Accept Offer & Join
                        </Button>
                    </div>

                    <div className="flex-1 bg-default-50 flex items-center justify-center relative overflow-hidden">
                        {loading && <Spinner size="lg" label="Loading Document..." />}
                        {error && <div className="text-danger flex flex-col items-center"><Icon icon="lucide:alert-circle" width={48} /><p>{error}</p></div>}
                        {!loading && !error && pdfUrl && (
                            <iframe
                                src={pdfUrl}
                                className="w-full h-full border-0"
                                title="Offer Letter"
                            />
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default OfferLetterAcceptance;
