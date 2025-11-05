import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity('personales')
export class Personal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ci?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre?: string;

  // 🔹 Relación 1:1 con Usuario (login)
  @OneToOne(() => Usuario, (usuario) => usuario.personal, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario | null;

  @Column({ name: 'usuario_id', nullable: true })
  usuario_id?: number;

  // 🔹 Usuario asignado responsable del bien o área
  @ManyToOne(() => Usuario, { nullable: true, eager: false })
  @JoinColumn({ name: 'usuario_asignado_id' })
  usuario_asignado?: Usuario | null;

  @Column({ name: 'usuario_asignado_id', nullable: true })
  usuario_asignado_id?: number;

  // 🔹 Estado lógico
  @Column({ type: 'varchar', length: 20, nullable: true, default: 'ACTIVO' })
  estado?: string;

  // 🔹 Datos personales
  @Column({ type: 'varchar', length: 100, nullable: true })
  expedido?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  profesion?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  celular?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string;

  @Column({ type: 'date', nullable: true })
  fecnac?: string;

  @Column({ type: 'int', nullable: true })
  estciv?: number;

  @Column({ type: 'int', nullable: true })
  sexo?: number;

  // 🔹 Auditoría
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at?: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @ManyToOne(() => Usuario, { nullable: true, eager: false })
  @JoinColumn({ name: 'creado_por_id' })
  creado_por?: Usuario | null;

  @Column({ name: 'creado_por_id', nullable: true })
  creado_por_id?: number;

  @ManyToOne(() => Usuario, { nullable: true, eager: false })
  @JoinColumn({ name: 'actualizado_por_id' })
  actualizado_por?: Usuario | null;

  @Column({ name: 'actualizado_por_id', nullable: true })
  actualizado_por_id?: number;
}
