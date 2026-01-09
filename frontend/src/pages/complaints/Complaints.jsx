import { PageHeader } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import ComplaintList from './ComplaintList';
import CreateComplaint from './CreateComplaint';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

const Complaints = () => {
    const { user } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const isParent = user?.role === 'PARENT';

    const handleComplaintCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <motion.div
            className="p-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <PageHeader
                title="Complaints & Feedback"
                subtitle="Manage and track issues raised by parents"
            />

            {isParent ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <CreateComplaint onSuccess={handleComplaintCreated} />
                    </div>
                    <div className="lg:col-span-2">
                        <ComplaintList refreshTrigger={refreshTrigger} />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <ComplaintList refreshTrigger={refreshTrigger} />
                </div>
            )}
        </motion.div>
    );
};

export default Complaints;
