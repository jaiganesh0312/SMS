import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Progress,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { bulkUploadService } from '@/services';
import { PageHeader } from '@/components/common';
import * as XLSX from 'xlsx';

const UPLOAD_TYPES = {
    students: {
        title: "Bulk Upload Students & Parents",
        description: "Upload Excel file containing Student and Parent details.",
        handler: bulkUploadService.uploadStudents,
        template: [
            ["StudentName", "AdmissionNumber", "DOB", "Gender", "ParentName", "ParentEmail", "ParentPhone", "Occupation", "ClassName"]
        ]
    },
    attendance: {
        title: "Bulk Upload Attendance",
        description: "Upload Excel file with Student Attendance records.",
        handler: bulkUploadService.uploadAttendance,
        template: [
            ["AdmissionNumber", "Date", "Status", "Remarks"]
        ]
    },
    exams: {
        title: "Bulk Upload Exam List",
        description: "Upload Excel file to create multiple exams.",
        handler: bulkUploadService.uploadExams,
        template: [
            ["Name", "Type", "StartDate", "EndDate", "ClassName"]
        ]
    },
    results: {
        title: "Bulk Upload Exam Results",
        description: "Upload marks for students.",
        handler: bulkUploadService.uploadResults,
        template: [
            ["ExamName", "AdmissionNumber", "SubjectCode", "Marks", "TotalMarks", "Grade", "Remarks"]
        ]
    },
    'library-sections': {
        title: "Bulk Upload Library Sections",
        description: "Upload sections for the library.",
        handler: bulkUploadService.uploadLibrarySections,
        template: [
            ["Name", "Description", "Location"]
        ]
    },
    'library-books': {
        title: "Bulk Upload Books",
        description: "Upload books specific to sections.",
        handler: bulkUploadService.uploadBooks,
        template: [
            ["Title", "Author", "ISBN", "Publisher", "Category", "Quantity", "SectionName", "Description"]
        ]
    }
};

export default function BulkUploadPage() {
    const { type } = useParams();
    const navigate = useNavigate();
    const config = UPLOAD_TYPES[type];

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    if (!config) return <div>Invalid Upload Type</div>;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleDownloadTemplate = () => {
        const ws = XLSX.utils.aoa_to_sheet(config.template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, `${type}_template.xlsx`);
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const response = await config.handler(file);
            if (response.data?.success) {
                setResult(response.data.data);
            } else {
                // Handle generic server error structure if different
                setResult({
                    total: 0,
                    success: 0,
                    failed: 0,
                    error: response.data?.message || "Upload Failed"
                });
            }
        } catch (error) {
            console.error("Upload error:", error);
            setResult({ error: "An unexpected error occurred." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-5xl mx-auto">
            <PageHeader
                title={config.title}
                description={config.description}
                showBack={true}
            />

            {/* Step 1: Download Template */}
            <Card>
                <CardHeader className="flex gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary">1</span>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-md font-bold">Download Template</p>
                        <p className="text-small text-default-500">Use this template to format your data correctly.</p>
                    </div>
                </CardHeader>
                <CardBody>
                    <Button
                        color="primary"
                        variant="flat"
                        startContent={<Icon icon="mdi:download" />}
                        onPress={handleDownloadTemplate}
                    >
                        Download {type} Template.xlsx
                    </Button>
                </CardBody>
            </Card>

            {/* Step 2: Upload File */}
            <Card>
                <CardHeader className="flex gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary">2</span>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-md font-bold">Upload File</p>
                        <p className="text-small text-default-500">Select your filled Excel file to upload.</p>
                    </div>
                </CardHeader>
                <CardBody className="gap-4">
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary-50 file:text-primary-700
                            hover:file:bg-primary-100"
                    />

                    {file && (
                        <Button
                            color="primary"
                            isLoading={loading}
                            startContent={!loading && <Icon icon="mdi:cloud-upload" />}
                            onPress={handleUpload}
                            isDisabled={!file}
                        >
                            Upload and Process
                        </Button>
                    )}
                </CardBody>
            </Card>

            {/* Step 3: Results */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <Card className={result.failed > 0 ? "border-danger" : "border-success"}>
                        <CardHeader className="flex gap-3">
                            <div className="w-8 h-8 bg-default/10 rounded-full flex items-center justify-center">
                                <span className="font-bold text-default-600">3</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-md font-bold">Processing Results</p>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-default-50 rounded-lg text-center">
                                    <p className="text-sm text-default-500">Total Records</p>
                                    <p className="text-2xl font-bold">{result.total || 0}</p>
                                </div>
                                <div className="p-4 bg-success-50 rounded-lg text-center">
                                    <p className="text-sm text-success-600">Successful</p>
                                    <p className="text-2xl font-bold text-success-700">{result.success || 0}</p>
                                </div>
                                <div className="p-4 bg-danger-50 rounded-lg text-center">
                                    <p className="text-sm text-danger-600">Failed</p>
                                    <p className="text-2xl font-bold text-danger-700">{result.failed || 0}</p>
                                </div>
                            </div>

                            {result.errors && result.errors.length > 0 && (
                                <div className="space-y-2">
                                    <p className="font-bold text-danger">Error Details:</p>
                                    <Table aria-label="Error Table" color="danger">
                                        <TableHeader>
                                            <TableColumn>ROW</TableColumn>
                                            <TableColumn>ERROR MESSAGE</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {result.errors.map((err, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{err.row}</TableCell>
                                                    <TableCell>{err.message}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {result.error && (
                                <div className="bg-danger-50 p-4 rounded-lg text-danger">
                                    {result.error}
                                </div>
                            )}

                            {!result.error && result.success > 0 && result.failed === 0 && (
                                <div className="bg-success-50 p-4 rounded-lg text-success flex items-center gap-2">
                                    <Icon icon="mdi:check-circle" className="text-xl" />
                                    All records processed successfully!
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
}
