// src/api/roles.ts
import axios from 'axios';
import { Rol, Permiso } from '../interfaces/interfaces';


const API_URL = 'http://localhost:3001';

// Obtiene el token desde localStorage
const getToken = () => localStorage.getItem('token');

// Retorna el objeto headers con Authorization
const authHeaders = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

// Listar roles
export const listarRoles = (token: string) => {
    return axios.get<{ data: Rol[] }>('http://localhost:3001/roles', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// Listar permisos
export const listarPermisos = () =>
    axios.get<{ data: Permiso[] }>(`${API_URL}/permisos`, authHeaders());

// Crear un nuevo rol
export const crearRol = (rol: { nombre: string; slug: string; descripcion?: string; permisos: number[] }) =>
    axios.post(`${API_URL}/roles`, rol, authHeaders());

// Obtener un rol por ID
export const obtenerRol = (id: number) =>
    axios.get<{ data: Rol }>(`${API_URL}/roles/${id}`, authHeaders());

// Editar un rol por ID
export const editarRol = (id: number, rol: { nombre: string; slug: string; descripcion?: string; permisos: number[] }) =>
    axios.put(`${API_URL}/roles/${id}`, rol, authHeaders());
