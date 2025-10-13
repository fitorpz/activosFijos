import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
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

    @Column({ nullable: true })
    creadoPorId: number;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'creadoPorId' })
    creadoPor: Usuario;

    @CreateDateColumn()
    creadoEn: Date;
    
    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date | null;
}
