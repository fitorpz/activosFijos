import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { Rol } from './rol.entity';
import { FechaAuditada } from 'src/common/entities/FechaAuditada';
import { Personal } from 'src/parametros/personal/entities/personales.entity';


@Entity('usuarios')
export class Usuario extends FechaAuditada {
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

    @Column({ nullable: true, type: 'int' })
    modificadoPorId: number | null;

    @ManyToOne(() => Usuario, { nullable: true, eager: false })
    @JoinColumn({ name: 'modificadoPorId' })
    modificadoPor: Usuario;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date | null;

    @OneToOne(() => Personal, (personal) => personal.usuario, { nullable: true })
    personal?: Personal | null;

    @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
    estado: string;

}
