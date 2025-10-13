import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable
} from 'typeorm';
import { Permiso } from './permiso.entity';

@Entity('roles')
export class Rol {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    nombre: string;

    @Column()
    slug: string;

    @Column({ nullable: true })
    descripcion: string;

    @ManyToMany(() => Permiso, { eager: true })
    @JoinTable({
        name: 'roles_permisos',
        joinColumn: { name: 'rol_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permiso_id', referencedColumnName: 'id' },
    })
    permisos: Permiso[];
}