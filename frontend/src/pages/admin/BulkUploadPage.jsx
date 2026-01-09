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
    const [response, setResponse] = useState(null);

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
            const response = await config.handler(file);
            if (response.data?.success) {
                setResponse(response.data.data);
            } else {
                // Handle generic server error structure if different
                setResponse({
                    total: 0,
                    success: 0,
                    failed: 0,
                    error: response.data?.message || "Upload Failed"
                });
            }
        } catch (error) {
            setResponse({
                success: false,
                message: "An unexpected error occurred.",
                details: error.message || null
            });
        } finally {
            setUploading(false);
            // setProgress(0); // Keep progress at 100% after success/failure, reset on new file selection
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

            {/* Response Section */}
            {response && (
                <Card className={`border shadow-sm ${response.success ? 'bg-success-50 border-success-200' : 'bg-danger-50 border-danger-200'}`}>
                    <CardBody className="p-6">
                        <div className="flex items-start gap-4">
                            <Icon
                                icon={response.success ? "mdi:check-circle" : "mdi:alert-circle"}
                                className={`text-3xl mt-0.5 ${response.success ? 'text-success-600' : 'text-danger-600'}`}
                            />
                            <div>
                                <h4 className={`text-lg font-bold mb-1 ${response.success ? 'text-success-800' : 'text-danger-800'}`}>
                                    {response.success ? 'Upload Successful' : 'Upload Failed'}
                                </h4>
                                <p className={response.success ? 'text-success-700' : 'text-danger-700'}>
                                    {response.message}
                                </p>
                                {response.details && (
                                    <div className="mt-4 p-3 bg-white/50 rounded-lg text-sm font-mono overflow-auto max-h-40">
                                        <pre>{JSON.stringify(response.details, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}

