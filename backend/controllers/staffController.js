const { User, StaffProfile, School, SalaryStructure, sequelize } = require("../models");
const bcrypt = require("bcryptjs");
const { generatePDF } = require("../utils/pdfGenerator");
const { sendStaffCreationEmail } = require("../services/emailService");

exports.getAllStaff = async (req, res) => {
  try {
    let schoolId = req.user.schoolId;
    const { schoolId: querySchoolId } = req.query;

    if (req.user.role === 'SUPER_ADMIN' && querySchoolId) {
      schoolId = querySchoolId;
    }

    const where = {
      role: ["TEACHER", "STAFF", "LIBRARIAN"],
      isActive: true
    };

    if (schoolId) {
      where.schoolId = schoolId;
    }

    const staff = await User.findAll({
      where,
      include: [
        {
          model: StaffProfile
        }
      ],
      attributes: { exclude: ["passwordHash"] }
    });

    res.status(200).json({
      success: true,
      data: { staff }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await User.findOne({
      where: { id, schoolId: req.user.schoolId, isActive: true },
      include: [{ model: StaffProfile }],
      attributes: { exclude: ["passwordHash"] }
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.status(200).json({ success: true, data: { staff } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, designation, department, workingAs } = req.body;

    const user = await User.findOne({ where: { id, schoolId: req.user.schoolId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    // Update User details
    if (name) user.name = name;
    if (email) user.email = email; // Note: Should check uniqueness if email changes
    if (phone) user.phone = phone;

    // Update Role if 'workingAs' changes (careful with this)
    if (workingAs) {
      if (workingAs === "TEACHER") user.role = "TEACHER";
      else if (workingAs === "LIBRARIAN") user.role = "LIBRARIAN";
      else user.role = "STAFF";
    }

    await user.save();

    // Update Profile details
    const profile = await StaffProfile.findOne({ where: { userId: id } });
    if (profile) {
      if (designation) profile.designation = designation;
      if (department) profile.department = department;
      if (workingAs) profile.workingAs = workingAs;
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: { user, profile }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id, schoolId: req.user.schoolId } });

    if (!user) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    user.isActive = false; // Soft delete
    await user.save();

    res.status(200).json({
      success: true,
      message: "Staff member deactivated successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStaff = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // 1. Personal Details, 2. Salary Structure, 3. Login Credentials
    const {
      // Personal
      name, email, phone, designation, department, joiningDate, workingAs, gender, dob, address,
      // Salary
      basicSalary, allowances, deductions,
      // Login
      password
    } = req.body;

    const schoolId = req.user.schoolId;

    // Validation
    if (!name || !email || !password || !joiningDate || !workingAs) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Create User
    let role = "STAFF";
    if (workingAs === "TEACHER") role = "TEACHER";
    if (workingAs === "LIBRARIAN") role = "LIBRARIAN";
    const newUser = await User.create({
      name,
      schoolId,
      email,
      phone,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      isActive: true
    }, { transaction: t });

    // Create Staff Profile
    // workingAs is already validated/provided from frontend as TEACHER, STAFF, or LIBRARIAN
    const profileWorkingAs = workingAs;
    const employeeCode = `EMP-${Date.now().toString().slice(-6)}`;

    const newProfile = await StaffProfile.create({
      schoolId,
      userId: newUser.id,
      employeeCode,
      designation,
      department,
      joiningDate,
      workingAs: profileWorkingAs,
      status: 'PRE_BOARDING'
    }, { transaction: t });

    // Create Salary Structure
    if (basicSalary !== undefined) {
      await SalaryStructure.create({
        schoolId,
        staffId: newProfile.id,
        basicSalary,
        allowances: allowances || [],
        deductions: deductions || [],
        effectiveDate: joiningDate
      }, { transaction: t });
    }

    await t.commit();

    // Send Welcome Email
    const school = await School.findByPk(schoolId);
    const schoolLogoUrl = school.logo ? `${req.protocol}://${req.get('host')}/api/${school.logo}` : null;
    await sendStaffCreationEmail(school.name, name, email, password, designation, department, schoolLogoUrl);

    res.status(201).json({
      success: true,
      message: "Staff created successfully. Status: PRE_BOARDING",
      data: {
        user: newUser,
        profile: newProfile
      }
    });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.acceptOffer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id; // Logged in user (PRE_BOARDING status)

    // Check if User exists and logic (Though Auth middleware likely handles existence)
    const profile = await StaffProfile.findOne({ where: { userId } });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Staff profile not found" });
    }

    if (profile.status !== 'PRE_BOARDING') {
      return res.status(400).json({ success: false, message: "Offer already accepted or invalid status" });
    }

    // Update Status to ACTIVE
    profile.status = 'ACTIVE';
    await profile.save({ transaction: t });

    // We might want to ensure SalaryStructure is "activated" or just confirm it exists? 
    // For now, just changing status is enough. 
    // Joining Date is already set in Profile.

    await t.commit();

    res.status(200).json({
      success: true,
      message: "Offer accepted. You are now ACTIVE.",
      data: {
        status: 'ACTIVE'
      }
    });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateOfferLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await User.findOne({
      where: { id, schoolId: req.user.schoolId },
      include: [
        {
          model: StaffProfile,
          include: [{ model: SalaryStructure }]
        },
        { model: School }
      ]
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    const salaryStructure = staff.StaffProfile?.SalaryStructure;

    // Calculate total earnings for table
    let totalEarnings = parseFloat(salaryStructure?.basicSalary || 0);
    if (salaryStructure?.allowances) {
      salaryStructure.allowances.forEach(a => totalEarnings += parseFloat(a.amount || 0));
    }

    const salaryDetailsRows = salaryStructure ? `
        <tr>
          <td>Basic Salary</td>
          <td class="amount">${parseFloat(salaryStructure.basicSalary).toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</td>
        </tr>
        ${salaryStructure.allowances?.map(a => `
        <tr>
          <td>${a.name}</td>
          <td class="amount">${parseFloat(a.amount).toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</td>
        </tr>`).join('') || ''}
        <tr class="total-row">
            <td>Gross Monthly Salary</td>
            <td class="amount">${totalEarnings.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</td>
        </tr>
    ` : '<tr><td colspan="2">Salary structure to be finalized.</td></tr>';

    const schoolLogoSrc = `${req.protocol}://${req.get('host')}/api/${staff.School.logo}`;
    const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 11pt;
                        line-height: 1.4;
                        color: #333;
                        padding: 30px; 
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 10px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 15px;
                    }
                    .school-logo {
                        width: 60px;
                        height: 60px;
                        object-fit: contain;
                    }
                    .school-info {
                        text-align: center;
                    }
                    .school-name {
                        font-size: 20pt;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin-bottom: 5px;
                        color: #2c3e50;
                    }
                    .school-details {
                        font-size: 9pt;
                        color: #666;
                    }
                    .ref-date {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        font-size: 10pt;
                    }
                    .recipient-address {
                        margin-bottom: 15px;
                        font-size: 11pt;
                    }
                    .subject {
                        font-weight: bold;
                        text-decoration: underline;
                        margin-bottom: 15px;
                    }
                    .content {
                        margin-bottom: 20px;
                        text-align: justify;
                    }
                    p {
                        margin-bottom: 10px;
                    }
                    .salary-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                        font-size: 10pt;
                    }
                    .salary-table th, .salary-table td {
                        border: 1px solid #ddd;
                        padding: 6px 10px;
                    }
                    .salary-table th {
                        background-color: #f4f4f4;
                        text-align: left;
                    }
                    .salary-table .amount {
                        text-align: right;
                    }
                    .salary-table .total-row {
                        font-weight: bold;
                        background-color: #f9f9f9;
                    }
                    .closing {
                        margin-top: 25px;
                    }
                    .signature {
                        margin-top: 35px;
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 8pt;
                        text-align: center;
                        color: #888;
                        border-top: 1px solid #eee;
                        padding-top: 8px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${staff.School.logo ? `<img src="${schoolLogoSrc}" class="school-logo" alt="School Logo"/>` : ''}
                        <div class="school-info">
                            <div class="school-name">${staff.School.name}</div>
                            <div class="school-details">
                                ${staff.School.address || 'Address Line 1, City, State, Zip'}<br>
                                ${staff.School.email || 'contact@school.edu'} | ${staff.School.phone || '+1 234 567 8900'}
                            </div>
                        </div>
                    </div>

                    <div class="ref-date">
                        <div><strong>Ref:</strong> OF/${new Date().getFullYear()}/${staff.StaffProfile.employeeCode}</div>
                        <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>

                    <div class="recipient-address">
                        To,<br>
                        <strong>${staff.name}</strong><br>
                        ${staff.StaffProfile.address || 'Address on file'}<br>
                        ${staff.email}
                    </div>

                    <div class="subject">Subject: Offer of Employment</div>

                    <div class="content">
                        <p>Dear <strong>${staff.name}</strong>,</p>
                        
                        <p>We are pleased to offer you the position of <strong>${staff.StaffProfile.designation || 'Teacher'}</strong> at <strong>${staff.School.name}</strong>. We were impressed with your qualifications and experience, and we believe you will be a valuable asset.</p>
                        
                        <p>This offer is effective from your date of joining, <strong>${new Date(staff.StaffProfile.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>. You will be reporting to the <strong>${staff.StaffProfile.department || 'Academic'} Department</strong>.</p>
                        
                        <p><strong>Compensation Package (CTC Breakdown):</strong></p>
                        
                        <table class="salary-table">
                            <thead>
                                <tr>
                                    <th>Component</th>
                                    <th class="amount">Monthly Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${salaryDetailsRows}
                            </tbody>
                        </table>

                        <p><strong>Terms and Conditions:</strong></p>
                        <ul>
                            <li>Subject to verification of your documents and credentials.</li>
                            <li>Employment governed by the staff service rules of the school.</li>
                        </ul>

                        <p>Please sign and return the duplicate copy of this letter as acceptance.</p>
                        
                        <p>We look forward to welcoming you to the <strong>${staff.School.name}</strong> family.</p>
                    </div>

                    <div class="closing">
                        <p>Sincerely,</p>
                        <div class="signature">
                            <p>_________________________</p>
                            <p><strong>Principal / Director</strong></p>
                            <p>${staff.School.name}</p>
                        </div>
                    </div>

                    <div class="footer">
                        Computer-generated document. No physical signature required for digital format.
                    </div>
                </div>
            </body>
            </html>
        `;

    const pdfBuffer = await generatePDF(html);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Offer_Letter_${staff.name.replace(/\s+/g, '_')}.pdf`,
      "Content-Length": pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateJoiningLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await User.findOne({
      where: { id, schoolId: req.user.schoolId },
      include: [{ model: StaffProfile }, { model: School }]
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    const schoolLogoSrc = `${req.protocol}://${req.get('host')}/api/${staff.School.logo}`;

    const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 11pt;
                        line-height: 1.4;
                        color: #333;
                        padding: 30px; 
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 10px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 15px;
                    }
                    .school-logo {
                        width: 60px;
                        height: 60px;
                        object-fit: contain;
                    }
                    .school-info {
                        text-align: center;
                    }
                    .school-name {
                        font-size: 20pt;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin-bottom: 5px;
                        color: #2c3e50;
                    }
                    .school-details {
                        font-size: 9pt;
                        color: #666;
                    }
                    .title {
                        text-align: center;
                        font-size: 14pt;
                        font-weight: bold;
                        text-decoration: underline;
                        margin: 20px 0;
                        color: #2c3e50;
                    }
                    .ref-date {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        font-size: 10pt;
                    }
                    .recipient-address {
                        margin-bottom: 15px;
                        font-size: 11pt;
                    }
                    .subject {
                        font-weight: bold;
                        text-decoration: underline;
                        margin-bottom: 15px;
                    }
                    .content {
                        margin-bottom: 20px;
                        text-align: justify;
                    }
                    p {
                        margin-bottom: 10px;
                    }
                    .info-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                        font-size: 10pt;
                    }
                    .info-table td {
                        padding: 8px;
                        border: 1px solid #ddd;
                    }
                    .info-table td:first-child {
                        font-weight: bold;
                        width: 40%;
                        background-color: #f4f4f4;
                    }
                    .closing {
                        margin-top: 25px;
                    }
                    .signature {
                        margin-top: 35px;
                    }
                    .signature-section {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 40px;
                    }
                    .sign-block {
                        text-align: center;
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 8pt;
                        text-align: center;
                        color: #888;
                        border-top: 1px solid #eee;
                        padding-top: 8px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        ${staff.School.logo ? `<img src="${schoolLogoSrc}" class="school-logo" alt="School Logo"/>` : ''}
                        <div class="school-info">
                            <div class="school-name">${staff.School.name}</div>
                            <div class="school-details">
                                ${staff.School.address || 'Address Line 1, City, State, Zip'}<br>
                                ${staff.School.email || 'contact@school.edu'} | ${staff.School.phone || '+1 234 567 8900'}
                            </div>
                        </div>
                    </div>

                    <div class="title">JOINING REPORT</div>

                    <div class="ref-date">
                        <div><strong>Ref:</strong> JN/${new Date().getFullYear()}/${staff.StaffProfile.employeeCode}</div>
                        <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>

                    <div class="recipient-address">
                        To,<br>
                        <strong>The Principal / Director</strong><br>
                        ${staff.School.name}<br>
                        ${staff.School.address || ''}
                    </div>

                    <div class="subject">Subject: Joining Report</div>

                    <div class="content">
                        <p>Respected Sir/Madam,</p>
                        
                        <p>I, <strong>${staff.name}</strong>, am hereby reporting for duty as <strong>${staff.StaffProfile.designation || 'Teacher'}</strong> in the <strong>${staff.StaffProfile.department || 'Academic'} Department</strong> at <strong>${staff.School.name}</strong>.</p>
                        
                        <p>I have joined the institution today, <strong>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>, as per the terms of my appointment.</p>
                        
                        <p><strong>My details are as follows:</strong></p>
                        
                        <table class="info-table">
                            <tr>
                                <td>Employee Code</td>
                                <td>${staff.StaffProfile.employeeCode}</td>
                            </tr>
                            <tr>
                                <td>Name</td>
                                <td>${staff.name}</td>
                            </tr>
                            <tr>
                                <td>Designation</td>
                                <td>${staff.StaffProfile.designation || 'Teacher'}</td>
                            </tr>
                            <tr>
                                <td>Department</td>
                                <td>${staff.StaffProfile.department || 'Academic'}</td>
                            </tr>
                            <tr>
                                <td>Date of Joining</td>
                                <td>${new Date(staff.StaffProfile.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            </tr>
                            <tr>
                                <td>Email</td>
                                <td>${staff.email}</td>
                            </tr>
                            <tr>
                                <td>Contact Number</td>
                                <td>${staff.phone || 'N/A'}</td>
                            </tr>
                        </table>

                        <p>I hereby declare that I have read and accept all the terms and conditions mentioned in the appointment letter. I shall abide by the rules and regulations of the institution and discharge my duties to the best of my abilities.</p>
                        
                        <p>I look forward to contributing positively to the growth and development of <strong>${staff.School.name}</strong>.</p>
                    </div>

                    <div class="signature-section">
                        <div class="sign-block">
                            <p>_________________________</p>
                            <p><strong>${staff.name}</strong></p>
                            <p>${staff.StaffProfile.designation || 'Teacher'}</p>
                            <p>Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div class="sign-block">
                            <p>_________________________</p>
                            <p><strong>Verified By</strong></p>
                            <p>Principal / HR Manager</p>
                            <p>${staff.School.name}</p>
                        </div>
                    </div>

                    <div class="footer">
                        Computer-generated document. No physical signature required for digital format.
                    </div>
                </div>
            </body>
            </html>
        `;

    const pdfBuffer = await generatePDF(html);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Joining_Letter_${staff.name.replace(/\s+/g, '_')}.pdf`,
      "Content-Length": pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
