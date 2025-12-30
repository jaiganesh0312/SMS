import React from 'react';
import { Progress, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

/**
 * PasswordStrengthIndicator Component
 * Displays password strength with visual progress bar and feedback
 */
export default function PasswordStrengthIndicator({ password, showTips = true }) {
    if (!password) return null;

    // Calculate strength (same logic as utility)
    let score = 0;
    const feedback = [];
    const checks = {
        length: false,
        lowercase: false,
        uppercase: false,
        numbers: false,
        special: false,
    };

    // Length check (0-40 points)
    if (password.length >= 8) {
        score += 20;
        checks.length = true;
    }
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    if (password.length < 8) feedback.push('Use at least 8 characters');

    // Lowercase letters (10 points)
    if (/[a-z]/.test(password)) {
        score += 10;
        checks.lowercase = true;
    } else {
        feedback.push('Add lowercase letters');
    }

    // Uppercase letters (10 points)
    if (/[A-Z]/.test(password)) {
        score += 10;
        checks.uppercase = true;
    } else {
        feedback.push('Add uppercase letters');
    }

    // Numbers (15 points)
    if (/\d/.test(password)) {
        score += 15;
        checks.numbers = true;
    } else {
        feedback.push('Add numbers');
    }

    // Special characters (15 points)
    if (/[^A-Za-z0-9]/.test(password)) {
        score += 15;
        checks.special = true;
    } else {
        feedback.push('Add special characters (!@#$%^&*)');
    }

    // Bonus for variety (10 points)
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) {
        score += 10;
    }

    // Determine strength level
    let strength, label, color;
    if (score < 30) {
        strength = 'weak';
        label = 'Weak';
        color = 'danger';
    } else if (score < 50) {
        strength = 'fair';
        label = 'Fair';
        color = 'warning';
    } else if (score < 70) {
        strength = 'good';
        label = 'Good';
        color = 'primary';
    } else if (score < 90) {
        strength = 'strong';
        label = 'Strong';
        color = 'success';
    } else {
        strength = 'very-strong';
        label = 'Very Strong';
        color = 'success';
    }

    const percentage = Math.min(score, 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Password Strength:</span>
                <Chip size="sm" color={color} variant="flat">
                    {label}
                </Chip>
            </div>

            <Progress
                size="sm"
                value={percentage}
                color={color}
                className="mb-2"
                aria-label="Password strength"
            />

            {showTips && (
                <div className="space-y-1 mt-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">
                        Password Requirements:
                    </div>
                    {[
                        { key: 'length', label: 'At least 8 characters' },
                        { key: 'lowercase', label: 'Lowercase letter (a-z)' },
                        { key: 'uppercase', label: 'Uppercase letter (A-Z)' },
                        { key: 'numbers', label: 'Number (0-9)' },
                        { key: 'special', label: 'Special character (!@#$%^&*)' },
                    ].map((req) => (
                        <div key={req.key} className="flex items-center gap-2">
                            <Icon
                                icon={checks[req.key] ? 'mdi:check-circle' : 'mdi:circle-outline'}
                                className={`text-sm ${checks[req.key]
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-400 dark:text-gray-600'
                                    }`}
                            />
                            <span
                                className={`text-xs ${checks[req.key]
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                {req.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {feedback.length === 0 && (
                <div className="flex items-center gap-2 mt-2 text-green-600 dark:text-green-400">
                    <Icon icon="mdi:shield-check" className="text-sm" />
                    <span className="text-xs">Great password!</span>
                </div>
            )}
        </motion.div>
    );
}
