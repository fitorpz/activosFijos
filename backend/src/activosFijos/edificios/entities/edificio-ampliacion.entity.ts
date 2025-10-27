import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Edificio } from './edificio.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity('edificios_ampliaciones')
export class EdificioAmpliacion {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Edificio, (edificio) => edificio.ampliaciones, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'edificio_id' })
    edificio: Edificio;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ type: 'date', nullable: true })
    fecha_ingreso: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    proveedor_donante: string;

    @Column({ type: 'decimal', nullable: true })
    superficie_ampliacion: number;

    @Column({ type: 'decimal', nullable: true })
    valor_ampliacion: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    respaldo_legal: string;

    @Column({ type: 'text', nullable: true })
    descripcion_respaldo_legal: string;

    @Column('simple-array', { nullable: true })
    fotos_ampliacion: string[];

    @Column({ type: 'varchar', length: 255, nullable: true })
    archivo_pdf: string;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'creado_por_id' })
    creado_por: Usuario;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'actualizado_por_id' })
    actualizado_por: Usuario;

    @Column({ type: 'enum', enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
    estado: 'ACTIVO' | 'INACTIVO';

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updated_at: Date;
}
