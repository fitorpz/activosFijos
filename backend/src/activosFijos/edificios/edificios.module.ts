import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// 🔹 Entidades principales
import { Edificio } from './entities/edificio.entity';
import { EdificioAmpliacion } from './entities/edificio-ampliacion.entity';
import { EdificioRemodelacion } from './entities/edificio-remodelacion.entity';
import { HistorialEdificio } from './historial/entities/historial-edificio.entity';

// 🔹 Entidades externas (paramétricas)
import { Personal } from 'src/parametros/personal/entities/personales.entity';
import { UnidadOrganizacional } from 'src/parametros/unidades-organizacionales/entities/unidad-organizacional.entity';
import { Cargo } from 'src/parametros/cargos/entities/cargos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

// 🔹 Módulos externos
import { PersonalesModule } from 'src/parametros/personal/personales.module';
import { UnidadesOrganizacionalesModule } from 'src/parametros/unidades-organizacionales/unidades-organizacionales.module';
import { CargosModule } from 'src/parametros/cargos/cargos.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

// 🔹 Servicios y controladores principales
import { EdificiosService } from './edificios.service';
import { EdificiosController } from './edificios.controller';

// 🔹 Submódulos internos
import { HistorialEdificioService } from './historial/historial-edificio.service';
import { AmpliacionesService } from './ampliaciones/ampliaciones.service';
import { AmpliacionesController } from './ampliaciones/ampliaciones.controller';
import { RemodelacionesService } from './remodelaciones/remodelaciones.service';
import { RemodelacionesController } from './remodelaciones/remodelaciones.controller';


import { BajasService } from './bajas/bajas.service';
import { BajasController } from './bajas/bajas.controller';
import { EdificioBaja } from './entities/edificio-baja.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Edificio,
      EdificioAmpliacion,
      EdificioRemodelacion,
      EdificioBaja,
      HistorialEdificio,
      Personal,
      UnidadOrganizacional,
      Cargo,
      Usuario,
    ]),
    PersonalesModule,
    UnidadesOrganizacionalesModule,
    CargosModule,
    UsuariosModule,
  ],
  controllers: [
    EdificiosController,
    AmpliacionesController,
    RemodelacionesController,
    BajasController,
  ],
  providers: [
    EdificiosService,
    AmpliacionesService,
    RemodelacionesService,
    HistorialEdificioService,
    BajasService,
  ],
  exports: [
    AmpliacionesService,
    RemodelacionesService,
    HistorialEdificioService,
  ],
})
export class EdificiosModule { }
