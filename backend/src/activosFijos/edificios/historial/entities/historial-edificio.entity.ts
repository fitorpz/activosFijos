import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Edificio } from '../../entities/edificio.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity('historial_edificios')
export class HistorialEdificio {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Edificio)
    @JoinColumn({ name: 'edificio_id' })
    edificio: Edificio;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @Column()
    accion: string;

    @CreateDateColumn({ type: 'timestamp' })
    fecha: Date;
}
