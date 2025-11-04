// src/parametros/unidades-organizacionales/entities/unidad-organizacional.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Area } from 'src/parametros/areas/entities/areas.entity';
import { Ambiente } from 'src/parametros/ambientes/entities/ambiente.entity';
import { Index } from 'typeorm';
import { Exclude } from 'class-transformer';





@Entity('unidades_organizacionales')
export class UnidadOrganizacional {
    @PrimaryGeneratedColumn()
    id: number;

    @Index('idx_codigo')
    @Column()
    codigo: string;

    @Column()
    descripcion: string;

    @Column({ type: 'enum', enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
    estado: 'ACTIVO' | 'INACTIVO';

    @ManyToOne(() => Area, (area) => area.unidades_organizacionales, { eager: false })
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

    @OneToMany(() => Ambiente, (ambiente) => ambiente.unidad_organizacional, { eager: false })
    @Exclude()
    ambientes: Ambiente[];
}
