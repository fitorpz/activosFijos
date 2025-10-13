import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriaRolesPermisos } from './entities/auditoria-roles-permisos.entity';

@Injectable()
export class AuditoriaRolesPermisosService {
    constructor(
        @InjectRepository(AuditoriaRolesPermisos)
        private readonly repo: Repository<AuditoriaRolesPermisos>,
    ) { }

    // Registro principal
    async registrarCambio(payload: {
        usuario_id: number,
        accion: string,
        detalle: string,
        rol_afectado_id?: number,
        permiso_afectado_id?: number,
        datos_antes?: any,
        datos_despues?: any,
        ip?: string,
        user_agent?: string,
        equipo?: string,
    }) {
        return this.repo.save(payload);
    }
}
