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
                    <h1 className="text-2xl font-bold text-foreground">Photo Gallery</h1>
                    <p className="text-default-500">School events and memories</p>
                </div>
                {isAdmin && (
                    <Button color="primary" onPress={() => setIsCreateModalOpen(true)} startContent={<Icon icon="lucide:plus" />} className="shadow-md shadow-primary/20">
                        Create New Album
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" color="primary" /></div>
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
                                className="bg-content1 border border-default-200 shadow-sm hover:shadow-md transition-all duration-300 group"
                            >
                                <CardBody className="p-0 overflow-hidden aspect-[4/3] bg-default-100 relative">
                                    {fullThumbnailUrl ? (
                                        <Image
                                            removeWrapper
                                            alt={gallery.title}
                                            className="z-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            src={fullThumbnailUrl}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-default-300">
                                            <Icon icon="lucide:image" size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                                        <h3 className="text-white font-bold text-lg line-clamp-1">{gallery.title}</h3>
                                        <div className="flex justify-between items-end mt-1">
                                            <p className="text-white/80 text-xs font-medium">
                                                {gallery.eventDate ? format(new Date(gallery.eventDate), 'MMM d, yyyy') : ''}
                                            </p>
                                            <p className="text-white/60 text-[10px] uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                                {gallery.images?.length || 0} Photos
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        );
                    })}
                </div>
            )}

            {!loading && galleries.length === 0 && (
                <div className="text-center py-20 bg-content1 border border-dashed border-default-200 rounded-xl">
                    <Icon icon="lucide:images" className="mx-auto text-6xl text-default-300 mb-4" />
                    <h3 className="text-xl font-medium text-default-500">No albums yet</h3>
                    {isAdmin && <p className="text-default-400 mt-2">Create your first album to get started!</p>}
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
