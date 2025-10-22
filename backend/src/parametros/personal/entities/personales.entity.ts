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

@Entity('Personales')
export class Personal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', nullable: true })
  documento: number;

  @Column()
  ci: string;

  @Column({ nullable: false })
  nombre: string;

  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  @Column({ nullable: true })
  usuario_id?: number;

  @Column({ nullable: false })
  estado: string;

  @Column({ nullable: true })
  expedido: string;

  @Column({ nullable: true })
  profesion: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ nullable: true })
  celular: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  fecnac: string;

  @Column({ nullable: true })
  estciv: number;

  @Column({ nullable: true })
  sexo: number;

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
