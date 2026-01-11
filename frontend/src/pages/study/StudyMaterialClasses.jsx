import React, { useState, useEffect } from 'react';
import { Card, CardBody, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { academicService } from '@/services';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { PageHeader } from '@/components/common';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function StudyMaterialClasses() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await academicService.getAllClasses();
            if (response.data?.success) {
                setClasses(response.data.data?.classes || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <PageHeader
                title="Study Materials - Select Class"
                subtitle="Choose a class to view available study materials"
            />

            {loading ? (
                <div className="flex justify-center py-10">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : classes.length === 0 ? (
                <div className="text-center py-16 bg-content1 rounded-lg border border-dashed border-default-200">
                    <Icon icon="mdi:school-outline" className="text-6xl text-default-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No classes found</h3>
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {classes.map((cls) => (
                        <motion.div key={cls.id} variants={itemVariants}>
                            <Card
                                isPressable
                                onPress={() => navigate(`/study-materials/class/${cls.id}`)}
                                className="h-full hover:scale-[1.02] transition-transform bg-content1 border border-default-200 shadow-sm hover:shadow-md"
                            >
                                <CardBody className="p-6 flex flex-col items-center justify-center text-center gap-4">
                                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                                        <Icon icon="mdi:google-classroom" width={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{cls.name}</h3>
                                        {/* You can add more info here if available, e.g., number of students or sections */}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-default-500">
                                        <span>Click to view sections</span>
                                        <Icon icon="mdi:arrow-right" />
                                    </div>
                                </CardBody>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
