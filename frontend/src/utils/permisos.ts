import { Permiso } from '../interfaces/interfaces';
import { jwtDecode } from 'jwt-decode';
import axios from './axiosConfig';

/**
 * Agrupa los permisos por módulo para mostrarlos en acordeones.
 */
export function agruparPermisosPorModulo(permisos: Permiso[]) {
    return permisos.reduce((acc: Record<string, Permiso[]>, permiso) => {
        const modulo = permiso.modulo || 'Otros';
        if (!acc[modulo]) acc[modulo] = [];
        acc[modulo].push(permiso);
        return acc;
    }, {});
}

/**
 * Verifica si un usuario tiene un permiso específico.
 */
export function tienePermiso(usuario: any, permiso: string): boolean {
    return usuario?.rol?.permisos?.includes(permiso);
}

/**
 * Obtiene los permisos del usuario desde el token JWT almacenado.
 */
export function obtenerPermisosUsuario(): string[] {
    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
        const decoded: any = jwtDecode(token);
        return decoded.permisos || [];
    } catch {
        return [];
    }
}


/**
 * 🔄 Refresca los permisos del usuario directamente desde el backend
 * sin cerrar sesión ni romper flujo si no tiene permisos asignados.
 */
export const refrescarPermisosUsuario = async (): Promise<string[]> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return [];

        const res = await axios.get<{ permisos: string[] }>(
            '/usuarios/permisos/actualizados',
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const permisos = res.data?.permisos || [];
        localStorage.setItem('permisos', JSON.stringify(permisos));
        console.log('✅ Permisos actualizados:', permisos);
        return permisos;
    } catch (error: any) {
        // ⚠️ Si no tiene permisos, mantener sesión activa
        if (error?.response?.status === 403) {
            console.warn('⚠️ Usuario sin permisos asignados actualmente.');
            return [];
        }

        // Otros errores (por red, backend, etc.)
        console.error('❌ Error al refrescar permisos:', error);
        return [];
    }
};
