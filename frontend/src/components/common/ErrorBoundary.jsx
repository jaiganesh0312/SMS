import React, { Component } from 'react';
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    toggleDetails = () => {
        this.setState(prevState => ({ showDetails: !prevState.showDetails }));
    };

    render() {
        if (this.state.hasError) {
            const isDevelopment = import.meta.env.DEV;
            const { error, errorInfo, showDetails } = this.state;

            return (
                <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans selection:bg-red-500/30">
                    {/* Animated Background */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-red-400/20 to-orange-300/20 blur-3xl dark:from-red-900/20 dark:to-orange-900/20"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1
                            }}
                            className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-300/20 blur-3xl dark:from-blue-900/20 dark:to-purple-900/20"
                        />
                    </div>

                    {/* Glass Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="relative z-10 w-full max-w-2xl mx-4"
                    >
                        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                            <div className="p-8 md:p-12 text-center">
                                {/* Icon Animation */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        delay: 0.2
                                    }}
                                    className="w-24 h-24 mx-auto mb-8 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center"
                                >
                                    <Icon icon="solar:danger-triangle-bold-duotone" className="w-12 h-12 text-red-500 dark:text-red-400" />
                                </motion.div>

                                {/* Text Content */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                                        Something went wrong
                                    </h1>
                                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
                                        An unexpected error has occurred. We've been notified and are working to fix it.
                                    </p>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                                >
                                    <Button
                                        onClick={this.handleReload}
                                        size="lg"
                                        color="danger"
                                        variant="shadow"
                                        className="w-full sm:w-auto font-medium px-8"
                                        startContent={<Icon icon="solar:restart-bold" className="w-5 h-5" />}
                                    >
                                        Reload Page
                                    </Button>
                                    <Button
                                        onClick={this.handleGoHome}
                                        size="lg"
                                        variant="bordered"
                                        className="w-full sm:w-auto font-medium px-8 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        startContent={<Icon icon="solar:home-2-bold" className="w-5 h-5" />}
                                    >
                                        Go Home
                                    </Button>
                                </motion.div>

                                {/* Developer Details Toggle */}
                                {isDevelopment && error && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                        className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800"
                                    >
                                        <button
                                            onClick={this.toggleDetails}
                                            className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-2 mx-auto"
                                        >
                                            <Icon icon={showDetails ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} />
                                            {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
                                        </button>
                                    </motion.div>
                                )}
                            </div>

                            {/* Technical Details Panel */}
                            <AnimatePresence>
                                {showDetails && isDevelopment && error && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800"
                                    >
                                        <div className="p-8 text-left overflow-x-auto">
                                            <div className="mb-6">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2">Error Message</h3>
                                                <div className="font-mono text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                                                    {error.toString()}
                                                </div>
                                            </div>
                                            {errorInfo && (
                                                <div>
                                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Stack Trace</h3>
                                                    <pre className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-pre-wrap">
                                                        {errorInfo.componentStack}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
