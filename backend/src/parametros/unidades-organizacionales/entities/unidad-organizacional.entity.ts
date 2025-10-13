// src/parametros/unidades-organizacionales/entities/unidad-organizacional.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Area } from 'src/parametros/areas/entities/areas.entity';

@Entity('unidades_organizacionales')
export class UnidadOrganizacional {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    codigo: string;

    @Column()
    descripcion: string;

    @Column({ type: 'enum', enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
    estado: 'ACTIVO' | 'INACTIVO';

    @ManyToOne(() => Area, { eager: true })
    @JoinColumn({ name: 'area_id' })
    area: Area;

    // unidad-organizacional.entity.ts
    @Column({ name: 'area_id', nullable: true })
    area_id: number;


    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updated_at?: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at?: Date;

    @ManyToOne(() => Usuario, { eager: true })
    @JoinColumn({ name: 'creado_por_id' })
    creado_por: Usuario;

    @Column({ name: 'creado_por_id' })
    creado_por_id: number;

    @ManyToOne(() => Usuario, { eager: true, nullable: true })
    @JoinColumn({ name: 'actualizado_por_id' })
    actualizado_por?: Usuario;

    @Column({ name: 'actualizado_por_id', nullable: true })
    actualizado_por_id?: number;
}
