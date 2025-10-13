import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Edificio } from './entities/edificio.entity';
import { Area } from '../../parametros/areas/entities/areas.entity';
import { UnidadOrganizacional } from '../../parametros/unidades-organizacionales/entities/unidad-organizacional.entity';
import { Ambiente } from '../../parametros/ambientes/entities/ambiente.entity';
import { Cargo } from '../../parametros/cargos/entities/cargos.entity';
import { Auxiliar } from '../../parametros/auxiliares/entities/auxiliares.entity';
import { Nucleo } from '../../parametros/nucleos/entities/nucleos.entity';
import { Distrito } from '../../parametros/distritos/entities/distritos.entity';
import { DireccionAdministrativa } from '../../parametros/direcciones-administrativas/entities/direcciones-administrativas.entity';
import { Ciudad } from '../../parametros/ciudades/entities/ciudades.entity';

import { EdificiosService } from './edificios.service';
import { EdificiosController } from './edificios.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Edificio,
      Area,
      UnidadOrganizacional,
      Ambiente,
      Cargo,
      Auxiliar,
      Nucleo,
      Distrito,
      DireccionAdministrativa,
      Ciudad,
    ]),
  ],
  controllers: [EdificiosController],
  providers: [EdificiosService],
})
export class EdificiosModule { }
