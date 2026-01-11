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
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [progress, setProgress] = useState(0);

    if (!config) return <div>Invalid Upload Type</div>;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResponse(null);
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

        setUploading(true);
        try {
            const response = await config.handler(file, setProgress);
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
            setUploading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4 md:space-y-6">
            <PageHeader
                title={config.title}
                subtitle={config.description}
                backUrl="/admin/dashboard"
            />

            {/* Step 1: Download Template */}
            <Card className="bg-content1 border border-default-200 shadow-sm">
                <CardHeader className="px-6 pt-6 pb-0 flex flex-col items-start gap-2">
                    <h3 className="text-lg font-semibold text-foreground">Step 1: Download Template</h3>
                    <p className="text-small text-default-500">
                        Download the excel template to ensure your data is formatted correctly.
                    </p>
                </CardHeader>
                <CardBody className="px-4 md:px-6 py-4">
                    <div className="p-4 bg-default-50 border border-default-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:file-excel-box" className="text-3xl text-success" />
                            <div>
                                <p className="font-medium text-foreground">Excel Template</p>
                                <p className="text-xs text-default-500">.xlsx format</p>
                            </div>
                        </div>
                        <Button
                            color="success"
                            variant="flat"
                            startContent={<Icon icon="mdi:download" />}
                            onPress={handleDownloadTemplate}
                            className="font-medium w-full sm:w-auto"
                        >
                            Download Template
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Step 2: Upload File */}
            <Card className="bg-content1 border border-default-200 shadow-sm">
                <CardHeader className="px-6 pt-6 pb-0 flex flex-col items-start gap-2">
                    <h3 className="text-lg font-semibold text-foreground">Step 2: Upload Data</h3>
                    <p className="text-small text-default-500">
                        Upload your filled excel file here. Max size 5MB.
                    </p>
                </CardHeader>
                <CardBody className="px-4 md:px-6 py-4">
                    <div className={`border-2 border-dashed rounded-xl p-6 md:p-8 flex flex-col items-center justify-center transition-colors ${file ? 'border-primary bg-primary/5' : 'border-default-300 hover:border-primary hover:bg-default-50'}`}>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center cursor-pointer w-full h-full"
                        >
                            {file ? (
                                <>
                                    <Icon icon="mdi:file-check" className="text-4xl md:text-5xl text-primary mb-3" />
                                    <p className="text-base md:text-lg font-semibold text-foreground">{file.name}</p>
                                    <p className="text-sm text-default-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                                    <Button size="sm" color="primary" variant="flat" className="mt-4">
                                        Change File
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Icon icon="mdi:cloud-upload" className="text-4xl md:text-5xl text-default-300 mb-3" />
                                    <p className="text-base md:text-lg font-semibold text-foreground">Click to upload or drag and drop</p>
                                    <p className="text-sm text-default-500 mt-1">Excel files only (.xlsx, .xls)</p>
                                </>
                            )}
                        </label>
                    </div>

                    {uploading && (
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-default-500">Uploading...</span>
                                <span className="font-medium text-primary">{progress}%</span>
                            </div>
                            <Progress value={progress} color="primary" className="h-2" />
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button
                            color="primary"
                            onPress={handleUpload}
                            isDisabled={!file || uploading}
                            isLoading={uploading}
                            className="font-semibold w-full sm:w-auto"
                            startContent={!uploading && <Icon icon="mdi:upload" />}
                        >
                            {uploading ? 'Processing...' : 'Upload File'}
                        </Button>
                    </div>
                </CardBody>
            </Card>

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

