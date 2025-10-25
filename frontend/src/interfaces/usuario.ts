export interface Permiso {
    id: number;
    nombre: string;
    descripcion?: string;
    modulo?: string;
}

export interface Rol {
    id: number;
    nombre: string;
    slug?: string;
    descripcion?: string;
    permisos?: string[];
}

export interface Usuario {
    id: number;
    correo: string;
    nombre?: string;
    contrasena?: string;
    rol: Rol | number;
    rol_id?: number;
    fecha_inicio?: string | null;
    fecha_expiracion?: string | null;

    creadoEn?: string;
    creadoPorId?: number | null;
    creadoPor?: {
        id: number;
        nombre?: string;
        correo?: string;
    }; // ✅ agregado

    modificadoPorId?: number | null;
    modificadoPor?: {
        id: number;
        nombre?: string;
        correo?: string;
    }; // ✅ agregado

    modificadoEn?: string | null;
    deletedAt?: string | null;
}
