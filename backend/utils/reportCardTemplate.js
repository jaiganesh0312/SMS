const generateReportCardTemplate = (student, exam, results, school, rank, totalStudents, overallPercentage, overallGrade, protocol, host) => {
    // Prepare logo and profile picture sources
    const logoSrc = school.logo ? `${protocol}://${host}/api/${school.logo}` : '';
    const photoSrc = student.profilePicture ? `${protocol}://${host}/api/${student.profilePicture}` : '';

    // Calculate totals
    const totalMarksObtained = results.reduce((sum, r) => sum + r.marksObtained, 0);
    const totalMaxMarks = results.reduce((sum, r) => sum + r.maxMarks, 0);

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                @page {
                    size: A4;
                    margin: 15mm;
                }
                
                body { 
                    font-family: 'Roboto', Arial, sans-serif; 
                    color: #333;
                    background: #ffffff;
                    font-size: 11px;
                    line-height: 1.4;
                    -webkit-print-color-adjust: exact;
                }
                
                .report-container {
                    max-width: 210mm;
                    margin: 0 auto;
                    background: white;
                    border: 1px solid #d0d0d0;
                }
                
                .header { 
                    background: #2c3e50;
                    color: white;
                    text-align: center; 
                    padding: 15px 20px;
                    border-bottom: 3px solid #34495e;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .school-logo {
                    width: 60px;
                    height: 60px;
                    object-fit: contain;
                    background: #fff;
                    border-radius: 50%;
                    padding: 5px;
                    margin-bottom: 10px;
                }
                
                .school-name { 
                    font-size: 20px; 
                    font-weight: 700; 
                    margin-bottom: 3px;
                    letter-spacing: 0.5px;
                }
                
                .school-address { 
                    font-size: 10px; 
                    opacity: 0.9;
                    margin-bottom: 2px;
                }
                
                .report-content {
                    padding: 20px 25px;
                }
                
                .report-title { 
                    text-align: center; 
                    font-size: 16px; 
                    font-weight: 700; 
                    margin-bottom: 3px;
                    color: #2c3e50;
                    text-transform: uppercase; 
                    letter-spacing: 1.5px;
                }
                
                .exam-title {
                    text-align: center;
                    font-size: 13px;
                    color: #555;
                    margin-bottom: 15px;
                    font-weight: 600;
                }
                
                .student-section {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                    padding: 15px;
                    background: #f8f9fa;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                }
                
                .student-photo-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .student-photo {
                    width: 100px;
                    height: 120px;
                    object-fit: cover;
                    border: 3px solid #2c3e50;
                    border-radius: 6px;
                    background-color: #f5f5f5;
                }
                
                .student-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                
                .info-item {
                    display: flex;
                    padding: 6px 0;
                    border-bottom: 1px dashed #ddd;
                }
                
                .info-label {
                    font-weight: 600;
                    color: #555;
                    min-width: 120px;
                }
                
                .info-value {
                    font-weight: 500;
                    color: #333;
                }
                
                .performance-summary {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }
                
                .summary-card {
                    background: #2c3e50;
                    color: white;
                    padding: 12px;
                    border-radius: 4px;
                    text-align: center;
                    border: 1px solid #34495e;
                }
                
                .summary-label {
                    font-size: 9px;
                    opacity: 0.9;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 5px;
                }
                
                .summary-value {
                    font-size: 18px;
                    font-weight: 700;
                }
                
                .marks-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 1px solid #d0d0d0;
                }
                
                .marks-table thead {
                    background: #2c3e50;
                    color: white;
                }
                
                .marks-table th {
                    padding: 10px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 10px;
                    text-transform: uppercase;
                    border: 1px solid #d0d0d0;
                }
                
                .marks-table td {
                    padding: 10px;
                    border: 1px solid #d0d0d0;
                    font-size: 11px;
                }
                
                .marks-table tbody tr:nth-child(even) {
                    background: #f8f9fa;
                }
                
                .text-center {
                    text-align: center;
                }
                
                .text-right {
                    text-align: right;
                }
                
                .grade-badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-weight: 700;
                    font-size: 10px;
                    background: #e9ecef;
                    color: #333;
                }
                
                .grade-F { 
                    background: #f8d7da; 
                    color: #721c24; 
                }
                
                .total-row {
                    background: #e9ecef;
                    font-weight: 700;
                }
                
                .total-row td {
                    border-top: 2px solid #dde2e6;
                    color: #333;
                }
                
                .remarks-section {
                    margin-top: 10px;
                    padding: 6px;
                    background: #f8f9fa;
                    border-left: 4px solid #34495e;
                    align-items: center;
                    display: flex;
                    gap: 2px;
                }
                
                .remarks-label {
                    font-weight: 600;
                    color: #555;
                    margin-bottom: 8px;
                    font-size: 11px;
                }
                
                .remarks-text {
                    color: #333;
                    font-size: 11px;
                    line-height: 1.6;
                }
                
                .footer-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }
                
                .signature-block {
                    text-align: center;
                }
                
                .signature-line {
                    border-top: 1px solid #333;
                    width: 70%;
                    margin: 40px auto 8px;
                }
                
                .signature-label {
                    font-size: 10px;
                    color: #666;
                    font-weight: 600;
                }
                
                .note {
                    margin-top: 20px;
                    font-size: 9px;
                    color: #999;
                    text-align: center;
                    font-style: italic;
                }
            </style>
        </head>
        <body>
            <div class="report-container">
                <div class="header">
                    ${school.logo ? `<img src="${logoSrc}" class="school-logo" alt="School Logo">` : ''}
                    <div class="school-name">${school.name}</div>
                    <div class="school-address">${school.address || ''}</div>
                </div>
                
                <div class="report-content">
                    <div class="report-title">Student Report Card</div>
                    <div class="exam-title">${exam.name} - ${exam.academicYear}</div>
                    
                    <div class="student-section">
                        <div class="student-photo-wrapper">
                            ${student.profilePicture
            ? `<img src="${photoSrc}" class="student-photo" alt="Student Photo">`
            : `<div class="student-photo" style="display:flex;align-items:center;justify-content:center;font-size:10px;color:#aaa;">No Photo</div>`
        }
                        </div>
                        <div class="student-info">
                            <div class="info-item">
                                <span class="info-label">Student Name:</span>
                                <span class="info-value">${student.name}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Admission No:</span>
                                <span class="info-value">${student.admissionNumber || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Class:</span>
                                <span class="info-value">${student.Class ? `${student.Class.name} - ${student.Class.section}` : 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Date of Birth:</span>
                                <span class="info-value">${student.dob || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Guardian Name:</span>
                                <span class="info-value">${student.Parent ? student.Parent.guardianName : 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Contact:</span>
                                <span class="info-value">${student.Parent && student.Parent.User ? (student.Parent.User.phone || 'N/A') : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="performance-summary">
                        <div class="summary-card">
                            <div class="summary-label">Class Rank</div>
                            <div class="summary-value">${rank}/${totalStudents}</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Total Marks</div>
                            <div class="summary-value">${totalMarksObtained}/${totalMaxMarks}</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Percentage</div>
                            <div class="summary-value">${overallPercentage}%</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Grade</div>
                            <div class="summary-value">${overallGrade}</div>
                        </div>
                    </div>
                    
                    <table class="marks-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th class="text-center">Marks Obtained</th>
                                <th class="text-center">Maximum Marks</th>
                                <th class="text-center">Percentage</th>
                                <th class="text-center">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(r => `
                            <tr>
                                <td>${r.Subject ? r.Subject.name : 'N/A'}</td>
                                <td class="text-center">${r.marksObtained}</td>
                                <td class="text-center">${r.maxMarks}</td>
                                <td class="text-center">${r.percentage}%</td>
                                <td class="text-center">
                                    <span class="grade-badge grade-${r.grade}">${r.grade}</span>
                                </td>
                            </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td><strong>Total</strong></td>
                                <td class="text-center"><strong>${totalMarksObtained}</strong></td>
                                <td class="text-center"><strong>${totalMaxMarks}</strong></td>
                                <td class="text-center"><strong>${overallPercentage}%</strong></td>
                                <td class="text-center">
                                    <span class="grade-badge grade-${overallGrade}"><strong>${overallGrade}</strong></span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="remarks-section">
                    <p class="remarks-text">
                    <span class="remarks-label">Remark:</span>
                            ${overallPercentage >= 90 ? 'Outstanding performance! Keep up the excellent work.' :
            overallPercentage >= 75 ? 'Good performance. Continue your efforts to reach excellence.' :
                overallPercentage >= 60 ? 'Satisfactory performance. Focus on areas needing improvement.' :
                    'Needs improvement. Additional support recommended.'}
                        </p>
                    </div>
                    
                    <div class="footer-section">
                        <div class="signature-block">
                            <div class="signature-line"></div>
                            <div class="signature-label">Parent's Signature</div>
                        </div>
                        <div class="signature-block">
                            <div class="signature-line"></div>
                            <div class="signature-label">Principal's Signature</div>
                        </div>
                    </div>
                    
                    <div class="note">
                        This is a computer-generated report card. For any queries, please contact the school administration.
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = generateReportCardTemplate;
