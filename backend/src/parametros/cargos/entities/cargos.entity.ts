import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Ambiente } from 'src/parametros/ambientes/entities/ambiente.entity';

@Entity('Cargos')
export class Cargo {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ NUEVO: Campo necesario para filtrar por ambiente
  @Column({ name: 'ambiente_id', type: 'int', nullable: true })
  ambiente_id: number;

  // ✅ OPCIONAL: Relación si deseas acceder a datos del ambiente desde aquí
  @ManyToOne(() => Ambiente, { eager: false, nullable: true })
  @JoinColumn({ name: 'ambiente_id' })
  ambiente_relacion?: Ambiente;

  @Column()
  area: string;

  @Column({ nullable: true })
  unidad_organizacional: string;

  @Column({ nullable: false })
  estado: string;

  @Column({ nullable: true })
  ambiente: string;

  @Column({ nullable: true })
  codigo: string;

  @Column({ nullable: true })
  cargo: string;

  @Column({ nullable: true })
  personal1: string;

  @Column({ nullable: true })
  personal2: string;

  @Column({ nullable: true })
  personal3: string;

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

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
