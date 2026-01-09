import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Spinner, Image, addToast } from "@heroui/react";
import { Icon } from '@iconify/react';
import { galleryService } from '@/services';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import PhotoViewer from './PhotoViewer';

// API URL for images
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const GalleryDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [gallery, setGallery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

    useEffect(() => {
        fetchGallery();
    }, [id]);

    const fetchGallery = async () => {
        setLoading(true);
        try {
            const response = await galleryService.getGalleryById(id);
            if (response?.data?.success) {
                setGallery(response.data.data.gallery);
            } else {
                addToast({ title: "Error", description: "Failed to load gallery", color: "danger" });
                navigate('/gallery');
            }
        } catch (error) {
            navigate('/gallery');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this album? This cannot be undone.")) {
            try {
                const response = await galleryService.deleteGallery(id);
                if (response?.data?.success) {
                    addToast({ title: "Success", description: "Gallery deleted", color: "success" });
                    navigate('/gallery');
                }
            } catch (error) {
                addToast({ title: "Error", description: "Failed to delete gallery", color: "danger" });
            }
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;
    if (!gallery) return null;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button isIconOnly variant="light" onPress={() => navigate('/gallery')} className="text-default-500 hover:text-primary">
                    <Icon icon="lucide:arrow-left" width={24} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{gallery.title}</h1>
                    <p className="text-default-500">
                        {gallery.eventDate ? format(new Date(gallery.eventDate), 'MMMM d, yyyy') : ''}
                        {gallery.description && <span className="mx-2">•</span>}
                        {gallery.description}
                    </p>
                </div>
                {isAdmin && (
                    <Button color="danger" variant="flat" className="ml-auto" onPress={handleDelete} startContent={<Icon icon="lucide:trash-2" />}>
                        Delete Album
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.images?.map((img) => (
                    <Card
                        key={img.id}
                        isPressable
                        onPress={() => setSelectedImage(img.imageUrl)}
                        className="bg-content1 border border-default-200 hover:scale-[1.02] transition-transform shadow-sm"
                    >
                        <CardBody className="p-0 overflow-hidden aspect-square bg-default-100">
                            <Image
                                removeWrapper
                                alt="Gallery Image"
                                className="z-0 w-full h-full object-cover"
                                src={img.imageUrl.startsWith('http') ? img.imageUrl : `${API_URL}${img.imageUrl}`}
                            />
                        </CardBody>
                    </Card>
                ))}
            </div>

            {gallery.images?.length === 0 && (
                <div className="text-center py-20 text-default-400 bg-content1 border border-dashed border-default-200 rounded-xl">
                    <Icon icon="lucide:image-off" className="mx-auto text-4xl mb-2 opacity-50" />
                    <p>No images in this album yet.</p>
                </div>
            )}

            <PhotoViewer
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                imageUrl={selectedImage}
                title={gallery.title}
            />
        </div>
    );
};

export default GalleryDetails;
