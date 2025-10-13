import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('permisos')
export class Permiso {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ nullable: true })
    descripcion: string;

    @Column({ nullable: true })
    modulo: string; // 👈 este campo DEBE existir
}
