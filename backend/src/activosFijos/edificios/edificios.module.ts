import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdificiosService } from './edificios.service';
import { EdificiosController } from './edificios.controller';
import { Edificio } from './entities/edificio.entity';

import { Personal } from 'src/parametros/personal/entities/personales.entity';
import { UnidadOrganizacional } from 'src/parametros/unidades-organizacionales/entities/unidad-organizacional.entity';
import { Cargo } from 'src/parametros/cargos/entities/cargos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

// ✅ Importar módulos que exporten esos repositorios
import { PersonalesModule } from 'src/parametros/personal/personales.module';
import { UnidadesOrganizacionalesModule } from 'src/parametros/unidades-organizacionales/unidades-organizacionales.module';
import { CargosModule } from 'src/parametros/cargos/cargos.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

import { HistorialEdificioModule } from './historial/historial-edificio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Edificio, Personal, UnidadOrganizacional, Cargo, Usuario]),
    PersonalesModule,
    UnidadesOrganizacionalesModule,
    CargosModule,
    UsuariosModule,
    HistorialEdificioModule,
  ],
  controllers: [EdificiosController],
  providers: [EdificiosService],
})
export class EdificiosModule { }
