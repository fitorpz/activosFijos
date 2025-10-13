// src/parametros/ambientes/entities/ambiente.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UnidadOrganizacional } from 'src/parametros/unidades-organizacionales/entities/unidad-organizacional.entity';

@Entity('ambientes')
export class Ambiente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    codigo: string;

    @Column()
    descripcion: string;

    @Column({ type: 'enum', enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
    estado: 'ACTIVO' | 'INACTIVO';

    // Relación con Unidad Organizacional
    @ManyToOne(() => UnidadOrganizacional, { eager: true })
    @JoinColumn({ name: 'unidad_organizacional_id' })
    unidad_organizacional: UnidadOrganizacional;

    @Column()
    unidad_organizacional_id: number;

    // Relación con usuario que crea
    @ManyToOne(() => Usuario, { eager: true })
    @JoinColumn({ name: 'creado_por_id' })
    creado_por: Usuario;

    @Column()
    creado_por_id: number;

    // Relación con usuario que actualiza
    @ManyToOne(() => Usuario, { eager: true, nullable: true })
    @JoinColumn({ name: 'actualizado_por_id' })
    actualizado_por?: Usuario;

    @Column({ nullable: true })
    actualizado_por_id?: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updated_at?: Date;
}
