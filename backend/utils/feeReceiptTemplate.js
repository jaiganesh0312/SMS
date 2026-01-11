
const generateFeeReceiptTemplate = (payment, student, feeStructure, school, host, protocol) => {

    const logoSrc = school.logo ? `${protocol}://${host}/api/${school.logo}` : '';

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                @page {
                    size: A5 landscape;
                    margin: 10mm;
                }
                
                body { 
                    font-family: 'Roboto', Arial, sans-serif; 
                    color: #333;
                    background: #ffffff;
                    font-size: 10px;
                    line-height: 1.4;
                    -webkit-print-color-adjust: exact;
                }
                
                .receipt-container {
                    width: 100%;
                    max-width: 95%;
                    margin: 0 auto;
                    border: 1px solid #ddd;
                    background: white;
                }
                
                .header { 
                    background: #2c3e50;
                    color: white;
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    border-bottom: 2px solid #34495e;
                }
                
                .school-logo {
                    width: 40px;
                    height: 40px;
                    object-fit: contain;
                    background: #fff;
                    border-radius: 50%;
                    padding: 4px;
                    margin-right: 15px;
                }
                
                .school-info h1 { 
                    font-size: 16px; 
                    font-weight: 700; 
                    margin-bottom: 2px;
                    text-transform: uppercase;
                }
                
                .school-info p { 
                    font-size: 9px; 
                    opacity: 0.9;
                }

                .title-bar {
                    background: #f8f9fa;
                    padding: 8px 15px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .receipt-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #2c3e50;
                    text-transform: uppercase;
                }

                .receipt-date {
                    font-size: 10px;
                    color: #666;
                    font-weight: 500;
                }
                
                .content {
                    padding: 20px;
                }

                .main-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 25px;
                }

                .info-box {
                    margin-bottom: 15px;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px dashed #eee;
                    padding-bottom: 4px;
                    margin-bottom: 6px;
                }

                .info-row:last-child {
                    border-bottom: none;
                }

                .label {
                    color: #666;
                    font-weight: 500;
                }

                .value {
                    color: #2c3e50;
                    font-weight: 700;
                    text-align: right;
                }

                .payment-box {
                    background: #f8f9fa;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    padding: 15px;
                }

                .amount-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .amount-label {
                    font-size: 11px;
                    color: #555;
                    font-weight: 600;
                }

                .amount-value {
                    font-size: 12px;
                    font-weight: 700;
                    font-family: 'Consolas', monospace;
                }

                .total-row {
                    border-top: 2px solid #ddd;
                    margin-top: 10px;
                    padding-top: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .total-label {
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .total-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: #2c3e50;
                }

                .badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 8px;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .badge-success { background: #d4edda; color: #155724; }
                .badge-pending { background: #f8d7da; color: #721c24; }

                .footer {
                    margin-top: 25px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    padding-top: 15px;
                    border-top: 1px solid #eee;
                }

                .signature {
                    text-align: center;
                    width: 120px;
                }

                .sig-line {
                    border-top: 1px solid #999;
                    margin-bottom: 4px;
                }

                .sig-text {
                    font-size: 8px;
                    color: #777;
                }

                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 60px;
                    font-weight: 900;
                    color: rgba(0,0,0,0.03);
                    pointer-events: none;
                    text-transform: uppercase;
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="header">
                    ${school.logo ? `<img src="${logoSrc}" class="school-logo" alt="Logo">` : ''}
                    <div class="school-info">
                        <h1>${school.name}</h1>
                        <p>${school.address || ''}</p>
                    </div>
                </div>

                <div class="title-bar">
                    <div class="receipt-title">Payment Receipt</div>
                    <div class="receipt-date">
                        Issued: ${new Date().toLocaleDateString()}
                    </div>
                </div>

                <div class="content">
                    <div class="watermark">${payment.status}</div>

                    <div class="main-grid">
                        <div class="left-col">
                            <div class="info-box">
                                <div class="info-row"><span class="label">Receipt No</span><span class="value">#${payment.transactionId || payment.id}</span></div>
                                <div class="info-row"><span class="label">Payment Date</span><span class="value">${new Date(payment.paymentDate).toLocaleDateString()}</span></div>
                                <div class="info-row"><span class="label">Payment Mode</span><span class="value">${payment.paymentMethod}</span></div>
                                <div class="info-row"><span class="label">Status</span><span class="value"><span class="badge badge-${payment.status === 'PAID' ? 'success' : 'pending'}">${payment.status}</span></span></div>
                            </div>

                            <div class="info-box" style="margin-top: 20px;">
                                <div style="font-weight: 700; color: #2c3e50; margin-bottom: 8px; font-size: 11px; text-transform: uppercase;">Received From</div>
                                <div class="info-row"><span class="label">Student Name</span><span class="value">${student.name}</span></div>
                                <div class="info-row"><span class="label">Admission No</span><span class="value">${student.admissionNumber}</span></div>
                                <div class="info-row"><span class="label">Class</span><span class="value">${student.Class ? `${student.Class.name} ${student.ClassSection ? '- ' + student.ClassSection.name : ''}` : 'N/A'}</span></div>
                                <div class="info-row"><span class="label">Guardian</span><span class="value">${student.Parent ? student.Parent.guardianName : 'N/A'}</span></div>
                            </div>
                        </div>

                        <div class="right-col">
                            <div class="payment-box">
                                <div style="font-weight: 700; color: #2c3e50; margin-bottom: 12px; font-size: 11px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">PAYMENT DETAILS</div>
                                
                                <div class="amount-row">
                                    <span class="amount-label">Fee Description</span>
                                    <span class="value" style="font-size: 11px;">${feeStructure.name}</span>
                                </div>
                                <div class="amount-row">
                                    <span class="amount-label">Frequency</span>
                                    <span class="value" style="font-size: 11px;">${feeStructure.frequency}</span>
                                </div>
                                <div class="amount-row">
                                    <span class="amount-label">Total Fee Amount</span>
                                    <span class="amount-value">${formatCurrency(feeStructure.amount)}</span>
                                </div>

                                <div class="total-row">
                                    <span class="total-label">Amount Paid</span>
                                    <span class="total-value">${formatCurrency(payment.amountPaid)}</span>
                                </div>
                                <div style="text-align: right; font-size: 9px; color: #666; margin-top: 5px;">
                                    (Inclusive of all taxes)
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <div class="signature">
                            <div class="sig-line"></div>
                            <div class="sig-text">Depositor Signature</div>
                        </div>
                        <div class="signature">
                            <div class="sig-line"></div>
                            <div class="sig-text">Authorized Signatory</div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = generateFeeReceiptTemplate;
