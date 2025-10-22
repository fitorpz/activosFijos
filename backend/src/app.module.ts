import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { UserLogModule } from './user-log/user-log.module';
import { AuthModule } from './auth/auth.module';
import { EdificiosModule } from './activosFijos/edificios/edificios.module';
import { UfvsModule } from './activosFijos/ufvs/ufvs.module';
import { EquipoOficinaModule } from './equipo-oficina/equipo-oficina.module';
import { DireccionesAdministrativasModule } from './parametros/direcciones-administrativas/direcciones-administrativas.module';
import { UnidadesOrganizacionalesModule } from './parametros/unidades-organizacionales/unidades-organizacionales.module';
import { AmbientesModule } from './parametros/ambientes/ambientes.module';
import { AreasModule } from './parametros/areas/areas.module';
import { GruposContablesModule } from './parametros/grupos-contables/grupos-contables.module';
import { AuxiliaresModule } from './parametros/auxiliares/auxiliares.module';
import { PersonalesModule } from './parametros/personal/personales.module';
import { CargosModule } from './parametros/cargos/cargos.module';
import { NucleosModule } from './parametros/nucleos/nucleos.module';
import { CiudadesModule } from './parametros/ciudades/ciudades.module';
import { TicketsModule } from './tickets/tickets.module';
import { DistritosModule } from './parametros/distritos/distritos.module';
import { DatabaseModule } from './database/database.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password123',
      database: 'activos_fijos',
      synchronize: true,     
      dropSchema: false,   
      autoLoadEntities: true, 
    }),

    /* TypeOrmModule.forRoot({
       type: 'postgres',
       host: process.env.DB_HOST,
       port: parseInt(process.env.DB_PORT || '5432', 10),
       username: process.env.DB_USERNAME,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_DATABASE,
 
       synchronize: true,
       dropSchema: false,
       autoLoadEntities: true,
     }),
 */
    UsuariosModule,
    UserLogModule,
    AuthModule,
    DatabaseModule,
    EdificiosModule,
    UfvsModule,
    EquipoOficinaModule,
    DireccionesAdministrativasModule,
    UnidadesOrganizacionalesModule,
    AmbientesModule,
    AreasModule,
    GruposContablesModule,
    AuxiliaresModule,
    PersonalesModule,
    CargosModule,
    NucleosModule,
    DistritosModule,
    CiudadesModule,
    TicketsModule,
  ],
  
})
export class AppModule { }
