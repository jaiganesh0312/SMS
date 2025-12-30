import api from "@/config/axiosConfig"

const createBus = async (data) => {
    return await api.post('/transport/buses', data);
};

const getAllBuses = async (params) => {
    return await api.get('/transport/buses', { params });
};

const getBusById = async (id) => {
    return await api.get(`/transport/buses/${id}`);
};

const getDriverBus = async () => {
    return await api.get('/transport/buses/my-bus');
};

const updateBus = async (busId, busData) => {
    return await api.patch(`/transport/buses/${busId}`, busData);
};

const deleteBus = async (busId) => {
    return await api.delete(`/transport/buses/${busId}`);
};

// =====================
// ROUTES
// =====================

const createRoute = async (routeData) => {
    return await api.post(`/transport/routes`, routeData);
};

const getRoutes = async (busId) => {
    const params = busId ? `?busId=${busId}` : '';
    return await api.get(`/transport/routes${params}`);
};

const updateRoute = async (routeId, routeData) => {
    return await api.patch(`/transport/routes/${routeId}`, routeData);
};

const deleteRoute = async (routeId) => {
    return await api.delete(`/transport/routes/${routeId}`);
};

// =====================
// TRIPS
// =====================

const startTrip = async (busId, tripData) => {
    return await api.post(`/transport/trips/${busId}/start`, tripData);
};

const endTrip = async (tripId, notes) => {
    return await api.post(`/transport/trips/${tripId}/end`, { notes });
};

const getTripHistory = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/transport/trips/history?${queryString}`);
};

// =====================
// LOCATION
// =====================

const updateLocation = async (locationData) => {
    return await api.post(`/transport/location`, locationData);
};

const getLiveLocation = async (busId) => {
    return await api.get(`/transport/location/live?busId=${busId}`);
};

const getLocationHistory = async (tripId) => {
    return await api.get(`/transport/location/history/${tripId}`);
};

// =====================
// STUDENT ASSIGNMENTS
// =====================

const assignStudentToBus = async (assignmentData) => {
    return await api.post(`/transport/assignments`, assignmentData);
};

const getBusAssignments = async (busId) => {
    const params = busId ? `?busId=${busId}` : '';
    return await api.get(`/transport/assignments${params}`);
};

const getAssignedBus = async () => {
    return await api.get(`/transport/assignments/my-bus`);
};

const removeStudentFromBus = async (studentId) => {
    return await api.delete(`/transport/assignments/${studentId}`);
};
const transportService = {
    // Buses
    createBus,
    getAllBuses,
    getBusById,
    updateBus,
    deleteBus,
    // Routes
    createRoute,
    getRoutes,
    updateRoute,
    deleteRoute,
    // Trips
    startTrip,
    endTrip,
    getTripHistory,
    // Location
    updateLocation,
    getLiveLocation,
    getLocationHistory,
    // Assignments
    assignStudentToBus,
    getBusAssignments,
    getAssignedBus,
    removeStudentFromBus,
    getDriverBus,
};

export default transportService;

