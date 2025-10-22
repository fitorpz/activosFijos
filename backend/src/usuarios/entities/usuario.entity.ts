import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Rol } from './rol.entity';

@Entity('usuarios')
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    correo: string;

    @Column()
    contrasena: string;

    @ManyToOne(() => Rol, { eager: true, nullable: true })
    @JoinColumn({ name: 'rol_id' })
    rol: Rol;

    @Column({ nullable: true })
    rol_id: number;

    @Column({ nullable: true })
    nombre: string;

    @Column({ type: 'timestamp', nullable: true })
    fecha_inicio?: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    fecha_expiracion?: Date | null;

    @Column({ nullable: true })
    creadoPorId: number;

    @ManyToOne(() => Usuario, { nullable: true, eager: false })
    @JoinColumn({ name: 'creadoPorId' })
    creadoPor: Usuario;

    @CreateDateColumn({ type: 'timestamp' })
    creadoEn: Date;

    @Column({ nullable: true, type: 'int' })
    modificadoPorId: number | null;

    @ManyToOne(() => Usuario, { nullable: true, eager: false })
    @JoinColumn({ name: 'modificadoPorId' })
    modificadoPor: Usuario;

    @UpdateDateColumn({ type: 'timestamp' })
    modificadoEn: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date | null;
}
