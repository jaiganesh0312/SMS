const generateIDCardTemplate = (student, school, protocol, host) => {
    // Basic styling for a professional ID card (portrait usually)

    // Fallback for missing data
    // Use proper template literals
    const logoSrc = school.logo ? `${protocol}://${host}/api/${school.logo}` : '';
    const photoSrc = student.profilePicture ? `${protocol}://${host}/api/${student.profilePicture}` : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
    

        body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            background: #fff;
            -webkit-print-color-adjust: exact;
        }
        
        .id-card-container {
            width: 100%;
            height: 100%; /* Matches PDF page size */
            border: 1px solid #ccc;
            border-radius: 8px;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }

        .header {
            background-color: #1a237e;
            color: #fff;
            padding: 10px 10px; /* Reduced padding */
            text-align: center;
            flex-shrink: 0;
        }

        .school-logo {
            width: 45px; /* Slightly reduced */
            height: 45px;
            object-fit: contain;
            background: #fff;
            border-radius: 50%;
            padding: 2px;
            margin-bottom: 5px; /* Reduced margin */
        }

        .school-name {
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            margin: 0;
            line-height: 1.2;
        }

        .school-address {
            font-size: 9px; /* Slightly smaller */
            font-weight: 400;
            margin-top: 2px;
            opacity: 0.9;
        }

        .photo-section {
            text-align: center;
            margin-top: 10px; /* Adjusted margin */
            flex-shrink: 0;
            display: flex; /* Ensure centering works for flex children */
            justify-content: center;
        }

        .profile-photo {
            width: 100px;
            height: 125px;
            object-fit: cover;
            border: 3px solid #1a237e;
            border-radius: 6px;
            background-color: #f5f5f5;
        }

        .student-details {
            text-align: center;
            margin-top: 10px;
            padding: 0 15px;
            flex-shrink: 0;
        }

        .student-name {
            font-size: 20px;
            font-weight: 700;
            color: #1a237e;
            margin: 0;
            text-transform: capitalize;
        }

        .class-info {
            font-size: 14px;
            color: #555;
            font-weight: 500;
            margin: 5px 0 0;
        }

        .details-grid {
            margin: 20px 20px;
            padding-top: 15px;
            border-top: 2px dashed #eee;
            /* flex-grow: 1; Removed to simplify debugging */
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 4px;
            /* background-color: #f9f9f9; Debugging visibility */
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            font-weight: 600;
            color: #555;
            font-size: 12px;
        }

        .detail-value {
            color: #000;
            font-weight: 500;
            font-size: 12px;
            text-align: right;
        }

        .footer {
            height: 35px; /* Slightly reduced */
            background: #1a237e;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: auto; /* Ensures it stays at bottom */
            width: 100%;
            flex-shrink: 0;
        }
        
        .footer-text {
            color: #fff;
            font-size: 10px;
            letter-spacing: 2px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="id-card-container">
        <div class="header">
            ${school.logo ? `<img src="${logoSrc}" class="school-logo" alt="Logo">` : ''}
            <h1 class="school-name">${school.name}</h1>
            <div class="school-address">${school.address || ''}</div>
        </div>

        <div class="photo-section">
            ${student.profilePicture
            ? `<img src="${photoSrc}" class="profile-photo" alt="Student Photo">`
            : `<div class="profile-photo" style="display:flex;align-items:center;justify-content:center;font-size:10px;color:#aaa;">No Photo</div>`
        }
        </div>

        <div class="student-details">
            <h2 class="student-name">${student.name}</h2>
            <div class="class-info">${student.Class ? `${student.Class.name} - ${student.Class.section}` : 'N/A'}</div>
        </div>

        <div class="details-grid">
            <div class="detail-row">
                <span class="detail-label">Admission No:</span>
                <span class="detail-value">${student.admissionNumber || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date of Birth:</span>
                <span class="detail-value">${student.dob || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Guardian:</span>
                <span class="detail-value">${student.Parent ? student.Parent.guardianName : 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Contact:</span>
                <span class="detail-value">
                    ${student.Parent && student.Parent.User ? (student.Parent.User.phone || 'N/A') : 'No Parent/User'}
                </span>
            </div>
        </div>   
    </div>
</body>
</html>
    `;
};

module.exports = generateIDCardTemplate;
