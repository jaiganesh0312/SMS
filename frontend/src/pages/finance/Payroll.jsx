import React from 'react';
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function Payroll() {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Payroll</h1>
                    <p className="text-sm text-gray-500">Manage employee salaries and payslips</p>
                </div>
                <Button color="primary" startContent={<Icon icon="mdi:plus" />}>
                    Process Payroll
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardBody>
                        <p className="text-blue-100">Total Salary (This Month)</p>
                        <h3 className="text-2xl font-bold mt-2">$0.00</h3>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <p className="text-gray-500">Pending Payments</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">0</h3>
                    </CardBody>
                </Card>
            </div>

            <Card className="min-h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                <CardBody className="text-center">
                    <p className="text-gray-500">No payroll records found for this month.</p>
                </CardBody>
            </Card>
        </div>
    );
}
