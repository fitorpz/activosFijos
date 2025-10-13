import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalesService } from './personales.service';
import { PersonalesController } from './personales.controller';
import { Personal } from './entities/personales.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Personal, 
      Usuario,
    ]),
  ],
  controllers: [PersonalesController],
  providers: [PersonalesService],
})
export class PersonalesModule { }
