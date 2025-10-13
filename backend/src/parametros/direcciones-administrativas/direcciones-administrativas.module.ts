import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DireccionesAdministrativasService } from './direcciones-administrativas.service';
import { DireccionesAdministrativasController } from './direcciones-administrativas.controller';
import { DireccionAdministrativa } from './entities/direcciones-administrativas.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DireccionAdministrativa, // 👈 este es el repositorio que estaba faltando
      Usuario,
    ]),
  ],
  controllers: [DireccionesAdministrativasController],
  providers: [DireccionesAdministrativasService],
})
export class DireccionesAdministrativasModule { }
