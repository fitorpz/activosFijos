import { Module } from '@nestjs/common';
import { EquipoOficinaController } from './equipo-oficina.controller';
import { EquipoOficinaService } from './equipo-oficina.service';

@Module({
  controllers: [EquipoOficinaController],
  providers: [EquipoOficinaService]
})
export class EquipoOficinaModule {}
