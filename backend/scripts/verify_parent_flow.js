const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let parentToken = '';
let studentId = '';
let schoolId = '';

const log = (msg) => const err = (msg, e) =>
    async function runTest() {
        try {
            // 1. Register School & Admin
            log("Registering School...");
            const uniqueSuffix = Date.now();
            try {
                const registerRes = await axios.post(`${BASE_URL}/auth/register-school`, {
                    schoolName: `Test School ${uniqueSuffix}`,
                    schoolAddress: "123 Test St",
                    schoolBoard: "CBSE",
                    adminName: "Admin User",
                    adminEmail: `admin${uniqueSuffix}@test.com`,
                    adminPhone: "1234567890",
                    adminPassword: "password123"
                });
                adminToken = registerRes.data.token;
                schoolId = registerRes.data.data.school.id;
                log("School Registered. Token received.");
            } catch (e) {
                err("Registration failed", e);
                return;
            }

            // 2. Create Student
            log("Creating Student...");
            try {
                const studentRes = await axios.post(`${BASE_URL}/students`, {
                    name: "John Student",
                    admissionNumber: `ADM-${uniqueSuffix}`,
                    dob: "2015-01-01",
                    gender: "Male",
                    classId: null // Optional for now
                }, {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                studentId = studentRes.data.data.student.id;
                log(`Student Created: ${studentId}`);
            } catch (e) {
                err("Student creation failed", e);
                return;
            }

            // 3. Create Parent & Link Student
            log("Creating Parent...");
            const parentEmail = `parent${uniqueSuffix}@test.com`;
            try {
                await axios.post(`${BASE_URL}/parents/register`, {
                    name: "Mama Bear",
                    email: parentEmail,
                    phone: "9876543210",
                    password: "parentpass",
                    occupation: "Engineer",
                    studentIds: [studentId]
                }, {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                log("Parent Created and Student Linked.");
            } catch (e) {
                err("Parent creation failed", e);
                return;
            }

            // 4. Parent Login/Validation
            log("Logging in as Parent...");
            try {
                const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                    email: parentEmail,
                    password: "parentpass"
                });
                parentToken = loginRes.data.token;

                if (loginRes.data.data.parent) {
                    log("Login Successful. Parent profile received.");
                } else {
                    throw new Error("Parent profile missing in login response");
                }
            } catch (e) {
                err("Parent login failed", e);
                return;
            }

            // 5. Fetch Children
            log("Fetching My Children...");
            try {
                const childrenRes = await axios.get(`${BASE_URL}/parents/children`, {
                    headers: { Authorization: `Bearer ${parentToken}` }
                });
                const children = childrenRes.data.data.students;
                if (children.length === 1 && children[0].id === studentId) {
                    log("SUCCESS: Children fetched correctly.");
                } else {
                    throw new Error("Children verification failed");
                }
            } catch (e) {
                err("Fetch children failed", e);
                return;
            }


        } catch (error) {
        }
    }

    runTest();
