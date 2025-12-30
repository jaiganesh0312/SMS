const { SalaryStructure, Payroll, StaffAttendance, StaffProfile, User, School } = require("../models");
const { Op } = require("sequelize");
const { generatePDF } = require("../utils/pdfGenerator");
const generatePayslipTemplate = require("../utils/payslipTemplate");
const { sendPayslipEmail } = require("../services/emailService");


// --- Salary Structure ---

exports.upsertSalaryStructure = async (req, res) => {
    try {
        const { staffId, basicSalary, allowances, deductions } = req.body;
        const schoolId = req.user.schoolId;

        // Calc base net salary
        const totalAllowances = (allowances || []).reduce((sum, a) => sum + Number(a.amount), 0);
        const totalDeductions = (deductions || []).reduce((sum, d) => sum + Number(d.amount), 0);
        const netSalary = Number(basicSalary) + totalAllowances - totalDeductions;

        const [structure, created] = await SalaryStructure.upsert({
            schoolId,
            staffId,
            basicSalary,
            allowances,
            deductions,
            netSalary,
            effectiveDate: new Date()
        }); // Note: upsert returns array in some dialects, object in others. Sequelize standardizes this somewhat but check.

        res.status(200).json({ success: true, message: "Salary structure saved", data: structure });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSalaryStructure = async (req, res) => {
    try {
        const { staffId } = req.params;
        const structure = await SalaryStructure.findOne({ where: { staffId } });
        res.status(200).json({ success: true, data: structure });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Payroll Generation ---

exports.generatePayroll = async (req, res) => {
    try {
        const { month, year, staffIds } = req.body;
        const schoolId = req.user.schoolId;

        console.log(`Generating payroll for School: ${schoolId}, Month: ${month}, Year: ${year}`);

        // Helper to parse month
        let monthIndex; // 0-11
        if (!isNaN(month)) {
            monthIndex = parseInt(month) - 1;
        } else {
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const m = months.findIndex(m => m.toLowerCase() === month.toLowerCase());
            if (m !== -1) monthIndex = m;
            else throw new Error("Invalid month format");
        }

        const whereClause = { schoolId, status: "ACTIVE" };
        if (staffIds && staffIds.length > 0) whereClause.id = { [Op.in]: staffIds };

        const schoolInfo = await School.findByPk(schoolId);

        const staffList = await StaffProfile.findAll({
            where: whereClause,
            include: [
                { model: SalaryStructure },
                { model: User, attributes: ['name', 'email'] }
            ]
        });

        const generatedPayrolls = [];

        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0);
        const daysInMonth = endDate.getDate();

        console.log(`Payroll Period: ${startDate.toDateString()} to ${endDate.toDateString()} (${daysInMonth} days)`);

        for (const staff of staffList) {
            if (!staff.SalaryStructure) {
                console.log(`Skipping staff ${staff.employeeCode} - No Salary Structure`);
                continue;
            }

            const structure = staff.SalaryStructure;

            // --- 1. Calculate Gross Salary & Base ---
            const totalAllowances = (structure.allowances || []).reduce((sum, a) => sum + Number(a.amount), 0);
            const grossSalary = Number(structure.basicSalary) + totalAllowances;

            // Per-day pay is based on GROSS salary, not net
            const perDayPay = grossSalary / daysInMonth;

            console.log(`Processing ${staff.employeeCode}: Gross=${grossSalary}, PerDay=${perDayPay.toFixed(2)}`);

            // --- 2. Calculate Effective Days ---
            const joiningDate = new Date(staff.joiningDate);
            let staffMonthStartDate = startDate;

            if (joiningDate > startDate && joiningDate <= endDate) {
                staffMonthStartDate = joiningDate;
            }

            // Effective Employed Days (days they were theoretically employed this month)
            let effectiveEmployedDays = Math.floor((endDate - staffMonthStartDate) / (1000 * 60 * 60 * 24)) + 1;
            if (effectiveEmployedDays < 0) effectiveEmployedDays = 0;

            // --- 3. Attendance & LOP ---
            const attendanceRecords = await StaffAttendance.findAll({
                where: {
                    staffId: staff.id,
                    date: { [Op.between]: [startDate, endDate] }
                }
            });

            // Filter Valid Records (only count attendance after they joined)
            const validRecords = attendanceRecords.filter(a => new Date(a.date) >= staffMonthStartDate);

            let presentCount = 0;
            let halfDayCount = 0;
            let absentCount = 0;
            let leaveCount = 0;

            validRecords.forEach(a => {
                if (a.status === 'PRESENT') presentCount++;
                else if (a.status === 'HALF_DAY') halfDayCount++;
                else if (a.status === 'ABSENT') absentCount++;
                else if (a.status === 'LEAVE') leaveCount++;
            });

            // LOP Logic:
            // 2 Paid Leaves allowed => excess is deductible.
            // 2 Half Days allowed => excess is deductible (0.5 day each).
            // Absent => Fully deductible (1 day each).
            const allowedLeaves = 2;
            const allowedHalfDays = 2;

            const deductibleLeaves = Math.max(0, leaveCount - allowedLeaves);
            const deductibleHalfDays = Math.max(0, halfDayCount - allowedHalfDays);

            // Total LOP Days (Absent + Excess)
            const totalLOPDays = absentCount + deductibleLeaves + (deductibleHalfDays * 0.5);

            // --- 4. Calculate Deductions ---

            // A. Fixed Structure Deductions (PF, Tax, etc.) - These are constant unless LOP eats into them (but usually fixed)
            const totalFixedDeductions = (structure.deductions || []).reduce((sum, d) => sum + Number(d.amount), 0);

            // B. LOP Amount
            const lopAmount = Math.round(totalLOPDays * perDayPay);

            // C. Pro-rata Deduction (for days before joining in this month)
            // Days not employed = Total Days in Month - Effective Employed Days
            const proRataAmount = Math.round((daysInMonth - effectiveEmployedDays) * perDayPay);

            // Total Deductions
            const totalDeductionsValue = totalFixedDeductions + lopAmount + proRataAmount;

            // --- 5. Final Net Salary ---
            let finalNetSalary = grossSalary - totalDeductionsValue;

            // Safety clamp
            if (finalNetSalary < 0) finalNetSalary = 0;
            finalNetSalary = Math.round(finalNetSalary);

            // --- Data for Storage ---
            const attendanceSummary = {
                totalDays: daysInMonth,
                effectiveDays: effectiveEmployedDays,
                present: presentCount,
                absent: absentCount,
                halfDays: halfDayCount,
                leaves: leaveCount,
                lopDays: totalLOPDays
            };

            const deductionsBreakdown = {
                fixed: structure.deductions || [],
                lopAmount: lopAmount,
                proRataAmount: proRataAmount,
                details: `Loss of Pay for ${totalLOPDays} days`
            };

            // Upsert Logic
            const existing = await Payroll.findOne({
                where: { schoolId, staffId: staff.id, month: String(month), year }
            });

            const payrollData = {
                schoolId,
                staffId: staff.id,
                month: String(month),
                year,
                basicSalary: structure.basicSalary,
                allowances: structure.allowances || [],
                deductionsBreakdown,
                attendanceSummary,
                bonus: 0,
                deductions: totalDeductionsValue,
                netSalary: finalNetSalary,
                status: "GENERATED"
            };

            if (existing) {
                await existing.update(payrollData);
                generatedPayrolls.push(existing);
            } else {
                const payroll = await Payroll.create({ ...payrollData, paymentDate: null });
                generatedPayrolls.push(payroll);
            }

            // Send Email with PDF
            try {
                // We need the payroll object with IDs, which we have (existing or payroll)
                const currentPayroll = existing || generatedPayrolls[generatedPayrolls.length - 1]; // if created, it's the last one

                const html = generatePayslipTemplate(currentPayroll, staff, schoolInfo, req.protocol, req.get('host'));
                const pdfBuffer = await generatePDF(html);

                const schoolLogoUrl = schoolInfo.logo ? `${req.protocol}://${req.get('host')}/api/${schoolInfo.logo}` : null;
                await sendPayslipEmail(staff.User.email, String(month), String(year), pdfBuffer, schoolInfo.name, schoolLogoUrl);
            } catch (emailError) {
                console.error(`Failed to send email to ${staff.User.email}:`, emailError);
                // Continue with other staff even if email fails
            }
        }

        res.status(200).json({ success: true, message: `Generated/Updated ${generatedPayrolls.length} records` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPayrolls = async (req, res) => {
    try {
        const { month, year, staffId } = req.query;
        const schoolId = req.user.schoolId;

        const whereClause = { schoolId };
        if (month) whereClause.month = String(month);
        if (year) whereClause.year = Number(year);
        if (staffId) whereClause.staffId = staffId;

        const payrolls = await Payroll.findAll({
            where: whereClause,
            include: [
                {
                    model: StaffProfile,
                    include: [{ model: User, attributes: ['name', 'email'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ success: true, data: payrolls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await Payroll.findByPk(id, {
            include: [
                {
                    model: StaffProfile,
                    include: [{ model: User, attributes: ['name', 'email'] }]
                },
                { model: School }
            ]
        });

        if (!payroll) return res.status(404).json({ message: "Payroll not found" });

        const staff = payroll.StaffProfile;
        const school = payroll.School;

        // Get protocol and host for image URLs
        const protocol = req.protocol;
        const host = req.get('host');

        // Generate HTML using template
        const html = generatePayslipTemplate(payroll, staff, school, protocol, host);


        const pdfBuffer = await generatePDF(html);
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=Payslip_${payroll.month}_${payroll.year}_${staff.employeeCode}.pdf`,
            "Content-Length": pdfBuffer.length
        });
        res.send(pdfBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
