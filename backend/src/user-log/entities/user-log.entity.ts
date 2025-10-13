import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('user_logins')
export class UserLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    usuario_id: number;

    @Column()
    accion: string; // Ej: 'Creó un activo', 'Eliminó usuario', etc.

    @CreateDateColumn()
    fecha: Date;

    @Column({ nullable: true })
    detalles: string; // JSON o texto extendido

    @Column({ nullable: true })
    ip: string;

    @Column({ nullable: true })
    navegador: string;
}
