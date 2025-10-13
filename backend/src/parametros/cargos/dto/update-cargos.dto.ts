import { PartialType } from '@nestjs/mapped-types';
import { CreateCargosDto } from './create-cargos.dto';
import { IsOptional, IsNumber } from 'class-validator'; // 👈 asegúrate de tener estos imports

export class UpdateCargosDto extends PartialType(CreateCargosDto) {
    @IsOptional()
    @IsNumber()
    ambiente_id?: number;
}
