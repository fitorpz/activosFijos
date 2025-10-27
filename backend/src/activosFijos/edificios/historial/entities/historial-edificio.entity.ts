import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Edificio } from '../../entities/edificio.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity('historial_edificios')
export class HistorialEdificio {
    @PrimaryGeneratedColumn()
    id: number;

    // 🔹 Relación con Edificio (borrado en cascada)
    @ManyToOne(() => Edificio, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'edificio_id' })
    edificio: Edificio;

    // 🔹 Relación con Usuario (no eliminar historial si usuario se borra)
    @ManyToOne(() => Usuario, { onDelete: 'SET NULL', eager: true })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    // 🔹 Tipo de acción (CREAR, EDITAR, AMPLIAR, REMODELAR, BAJA, etc.)
    @Column({ type: 'varchar', length: 50 })
    accion: string;

    // 🔹 Descripción detallada del cambio
    @Column({ type: 'text', nullable: true })
    descripcion?: string;

    // 🔹 Fecha en que se ejecutó la acción
    @CreateDateColumn({ type: 'timestamp', name: 'fecha_accion' })
    fecha_accion: Date;
}
