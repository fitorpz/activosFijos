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

export enum EstadoActivo {
  EXCELENTE_NUEVO = 'EXCELENTE_NUEVO',
  BUENO = 'BUENO',
  REGULAR = 'REGULAR',
  MALO = 'MALO',
  PESIMO_DAR_DE_BAJA = 'PESIMO_DAR_DE_BAJA',
  NO_ENCONTRADO = 'NO_ENCONTRADO',
}

@Entity('edificios')
export class Edificio {
  @PrimaryGeneratedColumn()
  id_311: number;

  @Column({ nullable: true })
  descripcion_edificio: string;

  @Column({ nullable: true })
  area_id: number;

  @Column({ nullable: true })
  nombre_area: string;

  @Column({ nullable: true })
  codigo_area: string;

  @Column({ nullable: true })
  unidad_organizacional_id: number;

  @Column({ nullable: true })
  unidad_organizacional_nombre: string;

  @Column({ nullable: true })
  ambiente_id: number;

  @Column({ nullable: true })
  ambiente_nombre: string;

  @Column({ nullable: true })
  cargo_id: number;

  @Column({ nullable: true })
  nombre_cargo: string;

  @Column({ nullable: true })
  auxiliar_id: number;

  @Column({ nullable: true })
  nombre_auxiliar: string;

  @Column({ nullable: true })
  nucleo_id: number;

  @Column({ nullable: true })
  nombre_nucleo: string;

  @Column({ nullable: true })
  distrito_id: number;

  @Column({ nullable: true })
  nombre_distrito: string;

  @Column({ nullable: true })
  direccion_administrativa_id: number;

  @Column({ nullable: true })
  nombre_direccion_administrativa: string;

  @Column({ nullable: true })
  ciudad_id: number;

  @Column({ nullable: true })
  nombre_ciudad: string;

  @Column({ default: 'ACTIVO', nullable: true })
  estado: string;

  @Column({ nullable: true })
  codigo_311: string;

  @Column({ nullable: true })
  ingreso_311: string;

  // 📌 DATOS TÉCNICOS
  @Column({ nullable: true })
  nombre_bien_311: string;

  @Column({ nullable: true })
  clasificacion_311: string;

  @Column({ nullable: true })
  uso_tecnico_311: string;

  @Column('decimal', { nullable: true, precision: 10, scale: 2 })
  superficie_tecnica_311: number;

  // Servicios técnicos (checkbox)
  @Column({ default: false })
  tiene_energia: boolean;

  @Column({ default: false })
  tiene_gas: boolean;

  @Column({ default: false })
  tiene_alcantarillado: boolean;

  @Column({ default: false })
  tiene_agua: boolean;

  @Column({ default: false })
  tiene_telefono: boolean;

  @Column({ default: false })
  tiene_celular: boolean;

  @Column({ default: false })
  tiene_internet: boolean;

  // Observaciones
  @Column({ nullable: true, type: 'text' })
  observaciones_tecnicas: string;

  @Column({ nullable: true })
  ingreso_des_311: string;

  @Column({ type: 'date', nullable: true })
  fecha_alta_311: Date;

  @Column({ nullable: true })
  proveedor_311: string;

  @Column({ type: 'date', nullable: true })
  fecha_factura_311: Date;

  @Column({ nullable: true })
  num_factura_311: string;

  @Column({ nullable: true })
  observaciones_311: string;

  @Column({ nullable: true })
  estado_conservacion_311: string;

  @Column('decimal', { nullable: true })
  valor_311: number;

  @Column('int', { nullable: true })
  vida_util_311: number;

  @Column({ type: 'date', nullable: true })
  fecha_estado_311: Date;

  @Column({ nullable: true })
  descripcion_estado_311: string;

  @Column({ nullable: true })
  estado_311: string;

  @Column({ type: 'date', nullable: true })
  estado_faltante_311: Date;

  @Column({ nullable: true })
  id_func_311: number;

  @Column({ nullable: true })
  id_clasi_311: number;

  @Column({ nullable: true })
  id_ufv_311: number;

  @Column({ nullable: true })
  id_311_1: number;

  @Column({ nullable: true })
  d_legal_311_1: string;

  @Column({ nullable: true })
  clasificacion_311_1: string;

  @Column({ nullable: true })
  uso_311_1: string;

  @Column({ nullable: true })
  superficie_311_1: string;

  @Column({ nullable: true })
  servicio_311_1: string;

  @Column({ nullable: true })
  observaciones_ubi: string;

  @Column({
    type: 'enum',
    enum: EstadoActivo,
    nullable: true,
  })
  estado_activo: EstadoActivo;

  @CreateDateColumn()
  fecha_creacion: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;

  @Column({ name: 'creado_por', nullable: true })
  creado_por: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'creado_por' })
  creadoPor: Usuario;

  @Column({ name: 'actualizado_por', nullable: true })
  actualizado_por: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'actualizado_por' })
  actualizadoPor: Usuario;

  @Column({ nullable: true })
  codigo_grupo: string; // Ej: 311.00

  @Column({ nullable: true })
  codigo_auxiliar: string; // Ej: 311.00.0001
}
