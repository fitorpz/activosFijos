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

@Entity('Distritos')
export class Distrito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
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
}
