import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
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

  // 🔹 Documento oficial (por ejemplo, carnet o registro interno)
  @Column({ type: 'bigint', nullable: true })
  documento?: number;

  // 🔹 Carnet de identidad sin extensión
  @Column({ type: 'varchar', length: 50, nullable: true })
  ci?: string;

  // 🔹 Nombre completo del personal
  @Column({ type: 'varchar', length: 255, nullable: true }) // ← cambiado a true para evitar error por datos existentes
  nombre?: string;

  // 🔹 Usuario vinculado (login del sistema)
  @ManyToOne(() => Usuario, { nullable: true, eager: false })
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

  // 🔹 Estado lógico del registro (ACTIVO/INACTIVO)
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
  estciv?: number; // 1=Soltero, 2=Casado, etc.

  @Column({ type: 'int', nullable: true })
  sexo?: number; // 1=Masculino, 2=Femenino, etc.

  // 🔹 Auditoría
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at?: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  // 🔹 Usuario que creó el registro
  @ManyToOne(() => Usuario, { nullable: true, eager: false })
  @JoinColumn({ name: 'creado_por_id' })
  creado_por?: Usuario | null;

  @Column({ name: 'creado_por_id', nullable: true })
  creado_por_id?: number;

  // 🔹 Usuario que actualizó el registro
  @ManyToOne(() => Usuario, { nullable: true, eager: false })
  @JoinColumn({ name: 'actualizado_por_id' })
  actualizado_por?: Usuario | null;

  @Column({ name: 'actualizado_por_id', nullable: true })
  actualizado_por_id?: number;
}
