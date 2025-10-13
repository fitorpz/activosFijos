import axios from 'axios';
import { Usuario } from '../interfaces/usuario';

const API_URL = 'http://localhost:3001';

export const listarUsuarios = (token: string) => {
  return axios.get<Usuario[]>('http://localhost:3001/usuarios', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const registrarUsuario = (data: any) => {
  return axios.post(`${API_URL}/usuarios`, data);
};
