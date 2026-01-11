import React, { useState, useEffect } from 'react';
import { Card, CardBody, Spinner, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { academicService } from '@/services';
import { useNavigate, useParams, Link } from 'react-router-dom';
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

export default function StudyMaterialClassSections() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [sections, setSections] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null); // Store class info if needed
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (classId) {
            fetchSections();
        }
    }, [classId]);

    const fetchSections = async () => {
        try {
            // We need a way to get sections by Class ID. 
            // Currently academicService.getAllSections returns all sections. 
            // Ideally backend supports filtering or we filter frontend side.
            // Let's assume getAllSections returns nested Class info we can filter on, 
            // OR we use the existing endpoint and filter in JS for now or see if backend supports query.
            // Looking at academicController.getAllSections, it takes schoolId from user. 
            // It doesn't seem to support query params for classId based on previous analysis (Step 250).
            // So we fetch all and filter.
            const response = await academicService.getAllSections();
            if (response.data?.success) {
                const allSections = response.data.data || [];
                // Filter by classId
                const classSections = allSections.filter(sec => sec.classId === classId);
                setSections(classSections);

                // Try to derive class name from first section
                if (classSections.length > 0 && classSections[0].Class) {
                    setSelectedClass(classSections[0].Class);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <motion.div variants={itemVariants}>
                <div className="flex flex-col gap-2">
                    <Link to="/study-materials" className="text-default-500 hover:text-primary text-sm flex items-center gap-1 w-fit">
                        <Icon icon="mdi:arrow-left" /> Back to Classes
                    </Link>
                    <PageHeader
                        title={selectedClass ? `${selectedClass.name} - Select Section` : "Select Section"}
                        subtitle="Choose a section to view available study materials"
                    />
                </div>
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Spinner size="lg" color="primary" />
                </div>
            ) : sections.length === 0 ? (
                <div className="text-center py-16 bg-content1 rounded-lg border border-dashed border-default-200">
                    <Icon icon="mdi:google-classroom" className="text-6xl text-default-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No sections found for this class</h3>
                    <Button color="primary" variant="light" className="mt-4" onPress={() => navigate('/study-materials')}>
                        Go Back
                    </Button>
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {sections.map((sec) => (
                        <motion.div key={sec.id} variants={itemVariants}>
                            <Card
                                isPressable
                                onPress={() => navigate(`/study-materials/section/${sec.id}`)}
                                className="h-full hover:scale-[1.02] transition-transform bg-content1 border border-default-200 shadow-sm hover:shadow-md"
                            >
                                <CardBody className="p-6 flex flex-col items-center justify-center text-center gap-4">
                                    <div className="p-4 rounded-full bg-secondary/10 text-secondary">
                                        <Icon icon="mdi:google-classroom" width={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">Section {sec.name}</h3>
                                        <p className="text-sm text-default-500">{sec.Class?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-default-500">
                                        <span>View Materials</span>
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
