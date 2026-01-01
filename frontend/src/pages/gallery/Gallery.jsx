import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardFooter, Button, Spinner, Image } from "@heroui/react";
import { Icon } from '@iconify/react';
import { galleryService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import CreateGalleryModal from './CreateGalleryModal';

// API URL for images
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Gallery = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

    useEffect(() => {
        fetchGalleries();
    }, []);

    const fetchGalleries = async () => {
        setLoading(true);
        try {
            const response = await galleryService.getAllGalleries();
            if (response?.data?.success) {
                setGalleries(response.data.data.galleries || []);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Photo Gallery</h1>
                    <p className="text-gray-500">School events and memories</p>
                </div>
                {isAdmin && (
                    <Button color="primary" onPress={() => setIsCreateModalOpen(true)} startContent={<Icon icon="lucide:plus" />}>
                        Create New Album
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {galleries.map((gallery) => {
                        const thumbnail = gallery.images?.[0]?.imageUrl;
                        const fullThumbnailUrl = thumbnail ? (thumbnail.startsWith('http') ? thumbnail : `${API_URL}${thumbnail}`) : null;

                        return (
                            <Card
                                key={gallery.id}
                                isPressable
                                onPress={() => navigate(`/gallery/${gallery.id}`)}
                                className="hover:shadow-lg transition-shadow"
                            >
                                <CardBody className="p-0 overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative">
                                    {fullThumbnailUrl ? (
                                        <Image
                                            removeWrapper
                                            alt={gallery.title}
                                            className="z-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            src={fullThumbnailUrl}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <Icon icon="lucide:image" size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                                        <h3 className="text-white font-bold text-lg line-clamp-1">{gallery.title}</h3>
                                        <p className="text-white/80 text-sm">
                                            {gallery.eventDate ? format(new Date(gallery.eventDate), 'MMM d, yyyy') : ''}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        );
                    })}
                </div>
            )}

            {!loading && galleries.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <Icon icon="lucide:images" className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-600">No albums yet</h3>
                    {isAdmin && <p className="text-gray-500 mt-2">Create your first album to get started!</p>}
                </div>
            )}

            <CreateGalleryModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    fetchGalleries();
                }}
            />
        </div>
    );
};

export default Gallery;
