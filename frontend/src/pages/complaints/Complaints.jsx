import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import CreateComplaint from './CreateComplaint';
import ComplaintList from './ComplaintList';
import { Tabs, Tab } from "@heroui/react";
import { Icon } from '@iconify/react';

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
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complaints & Feedback</h1>
                <p className="text-gray-500">Manage and track issues raised by parents.</p>
            </div>

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
