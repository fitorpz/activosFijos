import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso } from './entities/permiso.entity';
import { CreatePermisoDto } from './dto/create-permiso.dto';

@Injectable()
export class PermisosService {
    constructor(
        @InjectRepository(Permiso)
        private readonly permisoRepository: Repository<Permiso>,
    ) { }

    async findAll() {
        return await this.permisoRepository.find({
            order: { modulo: 'ASC' }, // 👈 importante para agrupar
        });
    }

    async create(createPermisoDto: CreatePermisoDto) {
        const permiso = this.permisoRepository.create(createPermisoDto);
        return await this.permisoRepository.save(permiso);
    }
}
