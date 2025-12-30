const generatePayslipTemplate = (payroll, staff, school, protocol, host) => {
    // Prepare logo source
    const logoSrc = school.logo ? `${protocol}://${host}/api/${school.logo}` : '';

    // Data Preparation
    const allowances = payroll.allowances || [];
    const fixedDeductions = payroll.deductionsBreakdown?.fixed || [];
    const lopAmount = payroll.deductionsBreakdown?.lopAmount || 0;
    const proRataAmount = payroll.deductionsBreakdown?.proRataAmount || 0;

    // Calculate Totals for Display
    const basicSalary = parseFloat(payroll.basicSalary);
    const totalAllowances = allowances.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
    const grossSalary = basicSalary + totalAllowances;

    const totalFixedDeductions = fixedDeductions.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    const totalDeductions = payroll.deductions;

    // Formatting Helper
    const formatCurrency = (amount) => parseFloat(amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                @page { size: A4; margin: 15mm; }
                body { 
                    font-family: 'Roboto', Arial, sans-serif; 
                    color: #333; 
                    background: #fff; 
                    font-size: 11px; 
                    line-height: 1.4;
                    -webkit-print-color-adjust: exact;
                }
                
                .container { max-width: 210mm; margin: 0 auto; border: 1px solid #d0d0d0; }
                
                .header { 
                    background: #2c3e50; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
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
                    font-size: 22px; 
                    font-weight: 700; 
                    text-transform: uppercase; 
                    margin-bottom: 5px; 
                }
                
                .school-address { 
                    font-size: 11px; 
                    opacity: 0.9; 
                }
                
                .content { padding: 25px; }
                
                .title-section { 
                    text-align: center; 
                    margin-bottom: 25px; 
                    border-bottom: 1px solid #eee; 
                    padding-bottom: 10px; 
                }
                
                .report-title { 
                    font-size: 18px; 
                    font-weight: 700; 
                    color: #2c3e50; 
                    text-transform: uppercase; 
                    letter-spacing: 1px; 
                }
                
                .pay-period { 
                    font-size: 12px; 
                    color: #666; 
                    font-weight: 600; 
                    margin-top: 5px; 
                }

                .grid-section { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 30px; 
                    margin-bottom: 25px; 
                }
                
                .info-box { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    border: 1px solid #e0e0e0; 
                    border-radius: 4px; 
                }
                
                .info-row { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 8px; 
                    border-bottom: 1px dashed #e0e0e0; 
                    padding-bottom: 4px; 
                }
                
                .info-row:last-child { border-bottom: none; margin-bottom: 0; }
                .label { font-weight: 600; color: #555; }
                .value { font-weight: 700; color: #333; }

                .salary-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 0; 
                    border: 1px solid #d0d0d0; 
                    margin-bottom: 25px; 
                }
                
                .salary-col { padding: 0; }
                
                .salary-col-header { 
                    background: #2c3e50; 
                    color: white; 
                    padding: 8px 15px; 
                    font-weight: 700; 
                    text-transform: uppercase; 
                    font-size: 10px; 
                }
                
                .salary-table { width: 100%; border-collapse: collapse; }
                .salary-table td { padding: 8px 15px; border-bottom: 1px solid #eee; font-size: 11px; }
                .salary-table tr:last-child td { border-bottom: none; }
                .amount { text-align: right; font-family: 'Consolas', monospace; font-weight: 600; }
                .total-row { background: #e9ecef; font-weight: 700; }
                .total-row td { border-top: 2px solid #dde2e6; color: #333; }
                
                .net-pay-section { 
                    background: #2c3e50; 
                    color: white; 
                    padding: 15px 25px; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 30px; 
                    border-radius: 4px; 
                }
                
                .net-label { 
                    font-size: 14px; 
                    text-transform: uppercase; 
                    font-weight: 600; 
                }
                
                .net-amount { 
                    font-size: 20px; 
                    font-weight: 700; 
                    font-family: 'Consolas', monospace; 
                }

                .footer-grid { 
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 20px; 
                    margin-top: 40px; 
                    padding-top: 20px; 
                    border-top: 1px solid #eee; 
                }
                
                .signature-block { text-align: center; }
                .signature-line { 
                    border-top: 1px solid #333; 
                    width: 80%; 
                    margin: 0 auto 5px; 
                }
                
                .signature-text { 
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
            <div class="container">
                <div class="header">
                    ${school.logo ? `<img src="${logoSrc}" class="school-logo" alt="School Logo">` : ''}
                    <div class="school-name">${school.name}</div>
                    <div class="school-address">${school.address || ''}</div>
                </div>
                
                <div class="content">
                    <div class="title-section">
                        <div class="report-title">Payslip</div>
                        <div class="pay-period">${payroll.month} ${payroll.year}</div>
                    </div>

                    <div class="grid-section">
                        <div class="info-box">
                            <div class="info-row"><span class="label">Employee ID</span><span class="value">${staff.employeeCode}</span></div>
                            <div class="info-row"><span class="label">Name</span><span class="value">${staff.User.name}</span></div>
                            <div class="info-row"><span class="label">Designation</span><span class="value">${staff.designation || '-'}</span></div>
                            <div class="info-row"><span class="label">Department</span><span class="value">${staff.department || '-'}</span></div>
                        </div>
                        <div class="info-box">
                            <div class="info-row"><span class="label">Total Days</span><span class="value">${payroll.attendanceSummary?.totalDays || '-'}</span></div>
                            <div class="info-row"><span class="label">Effective Days</span><span class="value">${payroll.attendanceSummary?.effectiveDays || '-'}</span></div>
                            <div class="info-row"><span class="label">LOP Days</span><span class="value">${payroll.attendanceSummary?.lopDays || 0}</span></div>
                            <div class="info-row"><span class="label">Payment Date</span><span class="value">${payroll.paymentDate || new Date().toLocaleDateString()}</span></div>
                        </div>
                    </div>

                    <div class="salary-grid">
                        <div class="salary-col" style="border-right: 1px solid #d0d0d0;">
                            <div class="salary-col-header">Earnings</div>
                            <table class="salary-table">
                                <tr>
                                    <td>Basic Salary</td>
                                    <td class="amount">${formatCurrency(basicSalary)}</td>
                                </tr>
                                ${allowances.map(a => `
                                <tr>
                                    <td>${a.name}</td>
                                    <td class="amount">${formatCurrency(a.amount)}</td>
                                </tr>`).join('')}
                                ${allowances.length === 0 ? '<tr><td>Other Allowances</td><td class="amount">₹0.00</td></tr>' : ''}
                                <tr><td colspan="2" style="height: 20px;"></td></tr>
                                <tr class="total-row">
                                    <td>Gross Salary</td>
                                    <td class="amount">${formatCurrency(grossSalary)}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="salary-col">
                            <div class="salary-col-header">Deductions</div>
                            <table class="salary-table">
                                ${fixedDeductions.map(d => `
                                <tr>
                                    <td>${d.name}</td>
                                    <td class="amount">${formatCurrency(d.amount)}</td>
                                </tr>`).join('')}
                                
                                ${lopAmount > 0 ? `
                                <tr>
                                    <td>Loss of Pay (LOP)</td>
                                    <td class="amount">${formatCurrency(lopAmount)}</td>
                                </tr>` : ''}

                                ${proRataAmount > 0 ? `
                                <tr>
                                    <td>Pro-rata Adjustment</td>
                                    <td class="amount">${formatCurrency(proRataAmount)}</td>
                                </tr>` : ''}

                                ${fixedDeductions.length === 0 && lopAmount === 0 && proRataAmount === 0 ? '<tr><td>No Deductions</td><td class="amount">₹0.00</td></tr>' : ''}
                                
                                <tr><td colspan="2" style="height: 20px;"></td></tr>
                                <tr class="total-row">
                                    <td>Total Deductions</td>
                                    <td class="amount">${formatCurrency(totalDeductions)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <div class="net-pay-section">
                        <span class="net-label">Net Payable Salary</span>
                        <span class="net-amount">${formatCurrency(payroll.netSalary)}</span>
                    </div>

                    <div class="footer-grid">
                        <div class="signature-block">
                            <div class="signature-line"></div>
                            <div class="signature-text">Employee Signature</div>
                        </div>
                        <div class="signature-block"></div>
                        <div class="signature-block">
                            <div class="signature-line"></div>
                            <div class="signature-text">Authority Signature</div>
                        </div>
                    </div>

                    <div class="note">
                        This is a computer-generated payslip and does not require a physical signature.
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = generatePayslipTemplate;
