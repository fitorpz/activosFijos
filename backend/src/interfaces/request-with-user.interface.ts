// src/interfaces/request-with-user.interface.ts
import { Request } from 'express';
import { Rol } from '../usuarios/entities/rol.entity';

export interface RequestWithUser extends Request {
  user: {
    id: number;
    correo: string;
    rol: Rol;
    // puedes agregar más campos si tu token los incluye
  };
}
