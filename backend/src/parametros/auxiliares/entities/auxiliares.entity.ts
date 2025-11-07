import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity('auxiliares')
@Unique(['codigo'])
export class Auxiliar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column()
  descripcion: string;

  @Column({ type: 'enum', enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  estado: 'ACTIVO' | 'INACTIVO';

  @Column({ nullable: true })
  codigo_grupo: string;

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
}
