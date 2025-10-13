import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3001',
});

// 🟢 Agregar token a todas las solicitudes
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (!config.headers) config.headers = {};
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// 🔴 Manejar respuestas (sin cerrar sesión automáticamente)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            console.error('❌ Error de red o servidor no disponible');
            return Promise.reject(error);
        }

        const { status, config } = error.response;
        console.log(`📡 Código HTTP recibido (${status}) en ${config?.url}`);

        // 🚫 Si es 401 o 403, no borrar token NI redirigir
        if (status === 401 || status === 403) {
            console.warn(`🚫 Acceso restringido (${status}) → NO se cierra sesión.`);
            alert('🚫 No tienes permisos o tu sesión no tiene acceso a este módulo.');
            return Promise.resolve(error.response);
        }

        console.error(`⚠️ Error HTTP ${status}:`, error.response.data);
        return Promise.reject(error);
    }
);

export default axiosInstance;
