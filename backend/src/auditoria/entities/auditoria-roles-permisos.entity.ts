import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('auditoria_roles_permisos')
export class AuditoriaRolesPermisos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    usuario_id: number; // quién hizo el cambio

    @Column()
    accion: string; // ej: 'CREAR_ROL', 'ASIGNAR_PERMISO', etc.

    @Column()
    detalle: string; // descripción legible

    @Column({ nullable: true })
    rol_afectado_id: number;

    @Column({ nullable: true })
    permiso_afectado_id: number;

    @Column({ type: 'json', nullable: true })
    datos_antes?: any;

    @Column({ type: 'json', nullable: true })
    datos_despues?: any;

    @Column({ nullable: true })
    ip?: string;

    @Column({ nullable: true })
    user_agent?: string; // Ej: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...

    @Column({ nullable: true })
    equipo?: string; // Extracto del user-agent (ej: "Windows 10", "Android 10", "Chrome 117")

    @CreateDateColumn({ type: 'timestamp' })
    fecha: Date; // Fecha y hora exacta (con zona del server)
}
