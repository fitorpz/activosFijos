import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Personal } from 'src/parametros/personal/entities/personales.entity';
import { UnidadOrganizacional } from 'src/parametros/unidades-organizacionales/entities/unidad-organizacional.entity';
import { Cargo } from 'src/parametros/cargos/entities/cargos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity('edificios')
export class Edificio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nro_da: string;

  @ManyToOne(() => Personal)
  @JoinColumn({ name: 'responsable_id' })
  responsable: Personal;

  @ManyToOne(() => Cargo)
  @JoinColumn({ name: 'cargo_id' })
  cargo: Cargo;

  @ManyToOne(() => UnidadOrganizacional)
  @JoinColumn({ name: 'unidad_organizacional_id' })
  unidad_organizacional: UnidadOrganizacional;

  @Column()
  ubicacion: string;

  @Column()
  ingreso: string;

  @Column('text')
  descripcion_ingreso: string;

  @Column({ type: 'date' })
  fecha_factura_donacion: string;

  @Column({ nullable: true })
  nro_factura: string;

  @Column({ nullable: true })
  proveedor_donante: string;

  @Column()
  nombre_bien: string;

  @Column()
  respaldo_legal: string;

  @Column('text')
  descripcion_respaldo_legal: string;

  @Column()
  clasificacion: string;

  @Column()
  uso: string;

  @Column('decimal')
  superficie: number;

  @Column('simple-array')
  servicios: string[];

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column()
  estado_conservacion: string;

  @Column('decimal')
  valor_bs: number;

  @Column('int')
  vida_util_anios: number;

  @Column('simple-array')
  fotos_edificio: string[];

  @Column()
  archivo_respaldo_pdf: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'creado_por_id' })
  creado_por: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'actualizado_por_id' })
  actualizado_por: Usuario;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'enum', enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  estado: 'ACTIVO' | 'INACTIVO';
}
