import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLog } from './entities/user-log.entity';

@Injectable()
export class UserLogService {
    constructor(
        @InjectRepository(UserLog)
        private logRepository: Repository<UserLog>,
    ) { }

    async registrarLog(
        usuario_id: number,
        accion: string,
        detalles?: string,
        ip?: string,
        navegador?: string,
    ): Promise<void> {
        const log = this.logRepository.create({
            usuario_id,
            accion,
            detalles,
            ip,
            navegador,
        });

        await this.logRepository.save(log);
    }
}
