import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UnidadOrganizacional } from 'src/parametros/unidades-organizacionales/entities/unidad-organizacional.entity';

@Entity('ambientes')
export class Ambiente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index()
    codigo: string;

    @Column()
    descripcion: string;

    @Column({
        type: 'enum',
        enum: ['ACTIVO', 'INACTIVO'],
        default: 'ACTIVO',
    })
    @Index()
    estado: 'ACTIVO' | 'INACTIVO';

    @ManyToOne(() => UnidadOrganizacional, { eager: false })
    @JoinColumn({ name: 'unidad_organizacional_id' })
    unidad_organizacional: UnidadOrganizacional;

    @Column()
    @Index()
    unidad_organizacional_id: number;

    @ManyToOne(() => Usuario, { eager: false })
    @JoinColumn({ name: 'creado_por_id' })
    creado_por: Usuario;

    @Column()
    creado_por_id: number;

    @ManyToOne(() => Usuario, {
        eager: false,
        nullable: true,
    })
    @JoinColumn({ name: 'actualizado_por_id' })
    actualizado_por?: Usuario;

    @Column({ nullable: true })
    actualizado_por_id?: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updated_at?: Date;
}
