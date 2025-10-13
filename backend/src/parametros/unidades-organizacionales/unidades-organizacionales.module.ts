import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesOrganizacionalesController } from './unidades-organizacionales.controller';
import { UnidadesOrganizacionalesService } from './unidades-organizacionales.service';
import { UnidadOrganizacional } from './entities/unidad-organizacional.entity';
import { Area } from '../areas/entities/areas.entity'; // 👈 Asegúrate de importar el Area
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UnidadOrganizacional,
      Area, // 👈 REGÍSTRALO AQUÍ
      Usuario,
    ]),
  ],
  exports: [TypeOrmModule],
  controllers: [UnidadesOrganizacionalesController],
  providers: [UnidadesOrganizacionalesService],
})
export class UnidadesOrganizacionalesModule { }
