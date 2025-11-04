import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UnidadOrganizacional } from 'src/parametros/unidades-organizacionales/entities/unidad-organizacional.entity';

import { Exclude } from 'class-transformer';



@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column()
  descripcion: string;

  @Column({ type: 'enum', enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  estado: 'ACTIVO' | 'INACTIVO';

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at?: Date;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'creado_por_id' })
  creado_por: Usuario;

  @Column({ name: 'creado_por_id' })
  creado_por_id: number;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'actualizado_por_id' })
  actualizado_por: Usuario;

  @Column({ name: 'actualizado_por_id', nullable: true })
  actualizado_por_id?: number;


  @OneToMany(() => UnidadOrganizacional, (unidad) => unidad.area, { eager: false })
  @Exclude()
  unidades_organizacionales: UnidadOrganizacional[];

  //@Column({ type: 'timestamp', nullable: true })
  //deleted_at: Date;
}
