import api from "@/config/axiosConfig";

const payrollService = {
    upsertSalaryStructure: async (data) => {
        const response = await api.post(`/payroll/structure`, data);
        return response.data;
    },

    getSalaryStructure: async (staffId) => {
        const response = await api.get(`/payroll/structure/${staffId}`);
        return response.data;
    },

    generatePayroll: async (data) => {
        // data: { month, year, staffIds? }
        const response = await api.post(`/payroll/generate`, data);
        return response.data;
    },

    getPayslip: async (id) => {
        const response = await api.get(`/payroll/payslip/${id}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    getPayrolls: async (params) => {
        const response = await api.get(`/payroll/list`, { params });
        return response.data;
    }
};

export default payrollService;
