const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper: Generate HTML Template
const generateEmailTemplate = (schoolName, schoolLogoUrl, title, bodyContent, primaryColor = '#2c3e50') => {
    // Fallback if no logo
    const logoHtml = schoolLogoUrl
        ? `<img src="${schoolLogoUrl}" alt="${schoolName} Logo" style="max-height: 80px; max-width: 150px; margin-bottom: 10px;">`
        : `<h2 style="color: ${primaryColor}; margin: 0;">${schoolName}</h2>`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 3px solid ${primaryColor}; }
            .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
            .content h3 { color: ${primaryColor}; margin-top: 0; }
            .content p { margin-bottom: 15px; }
            .content ul { background-color: #f9f9f9; padding: 20px 40px; border-radius: 5px; border-left: 4px solid ${primaryColor}; }
            .content ul li { margin-bottom: 10px; list-style-type: none; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
            .footer p { margin: 5px 0; }
            .btn { display: inline-block; padding: 10px 20px; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                ${logoHtml}
                ${schoolLogoUrl ? `<div style="font-size: 18px; font-weight: bold; color: #555; margin-top: 5px;">${schoolName}</div>` : ''}
            </div>
            <div class="content">
                ${bodyContent}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${schoolName}. All rights reserved.</p>
                <p>This is an automated system email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Helper to send email (internal)
const sendEmail = async (to, subject, html, attachments = []) => {
    try {
        const mailOptions = {
            from: `"${process.env.SCHOOL_NAME || 'School Admin'}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        return null;
    }
};

const sendSchoolRegistrationEmail = async (schoolName, adminEmail, password, schoolLogoUrl = null) => {
    const subject = `Welcome to School Management Portal`;
    const body = `
        <h3>Registration Successful</h3>
        <p>Congratulations! Your school <strong>${schoolName}</strong> has been successfully registered on our specific platform.</p>
        <p>Here are your admin login credentials:</p>
        <ul>
            <li><strong>Email:</strong> ${adminEmail}</li>
            <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>You can now log in and start managing your school operations.</p>
        <a href="#" class="btn" style="color: #fff !important;">Login to Dashboard</a>
    `;
    const html = generateEmailTemplate(schoolName, schoolLogoUrl, subject, body);
    await sendEmail(adminEmail, subject, html);
};

const sendStaffRegistrationEmail = async (schoolName, staffName, staffEmail, password, designation, department, schoolLogoUrl = null) => {
    const subject = `Welcome to ${schoolName} Family`;
    const body = `
        <h3>Welcome Aboard, ${staffName}!</h3>
        <p>We are pleased to inform you that your staff account has been created.</p>
        <p><strong>Appointment Details:</strong></p>
        <ul>
            <li><strong>Designation:</strong> ${designation}</li>
            <li><strong>Department:</strong> ${department}</li>
        </ul>
        <p><strong>Your Login Credentials:</strong></p>
        <ul>
            <li><strong>Email:</strong> ${staffEmail}</li>
            <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Please log in and update your password immediately for security.</p>
    `;
    const html = generateEmailTemplate(schoolName, schoolLogoUrl, subject, body);
    await sendEmail(staffEmail, subject, html);
};

const sendParentAccountEmail = async (schoolName, parentName, parentEmail, password, studentNames, schoolLogoUrl = null) => {
    const subject = `Parent Portal Access - ${schoolName}`;
    const body = `
        <h3>Welcome, ${parentName}</h3>
        <p>Your parent account has been successfully created and linked to the following student(s):</p>
        <p align="center" style="font-weight: bold; font-size: 16px; color: #555;">${studentNames.join(' & ')}</p>
        <p>You can now access the Parent Portal to track attendance, fee payments, and academic progress.</p>
        <p><strong>Login Credentials:</strong></p>
        <ul>
            <li><strong>Email:</strong> ${parentEmail}</li>
            <li><strong>Password:</strong> ${password}</li>
        </ul>
    `;
    const html = generateEmailTemplate(schoolName, schoolLogoUrl, subject, body);
    await sendEmail(parentEmail, subject, html);
};

const sendStaffCreationEmail = async (schoolName, staffName, staffEmail, password, designation, department, schoolLogoUrl = null) => {
    // Reuse logic but potentially different tone if needed. For now, matching Registration.
    await sendStaffRegistrationEmail(schoolName, staffName, staffEmail, password, designation, department, schoolLogoUrl);
};

const sendFeePaymentReceiptEmail = async (studentEmail, feeName, pdfBuffer, schoolName, schoolLogoUrl = null) => {
    const subject = `Fee Receipt: ${feeName} - ${schoolName}`;
    const body = `
        <h3>Payment Confirmed</h3>
        <p>Dear Parent/Student,</p>
        <p>We acknowledge with thanks the receipt of your payment for <strong>${feeName}</strong>.</p>
        <p>Please find the official receipt attached to this email.</p>
        <p>If you have any questions, please contact the accounts department.</p>
    `;
    const html = generateEmailTemplate(schoolName, schoolLogoUrl, subject, body);

    const attachments = [
        {
            filename: `Receipt-${feeName.replace(/\s+/g, '_')}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }
    ];

    await sendEmail(studentEmail, subject, html, attachments);
};

const sendPayslipEmail = async (staffEmail, month, year, pdfBuffer, schoolName, schoolLogoUrl = null) => {
    const subject = `Payslip: ${month}, ${year}`;
    const body = `
        <h3>Monthly Payslip Generated</h3>
        <p>Please find attached your payslip for <strong>${month}, ${year}</strong>.</p>
        <p>For any discrepancies, please contact the HR/Accounts department immediately.</p>
        <p>Thank you for your hard work and dedication.</p>
    `;
    const html = generateEmailTemplate(schoolName, schoolLogoUrl, subject, body);

    const attachments = [
        {
            filename: `Payslip-${month}-${year}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }
    ];

    await sendEmail(staffEmail, subject, html, attachments);
};

module.exports = {
    sendSchoolRegistrationEmail,
    sendStaffRegistrationEmail,
    sendParentAccountEmail,
    sendStaffCreationEmail,
    sendFeePaymentReceiptEmail,
    sendPayslipEmail,
};
