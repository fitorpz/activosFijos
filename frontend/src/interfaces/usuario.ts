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
    permisos?: Permiso[];
}

export interface Usuario {
    id: number;
    correo: string;
    nombre?: string | null;
    rol: Rol | string | null;
    creadoPor?: {
        nombre?: string | null;
        correo?: string;
    };
    creadoEn?: string;
}
