export interface Area {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface UnidadOrganizacional {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface Ambiente {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface Cargo {
  id: number;
  codigo: string;
  cargo: string;
  descripcion: string;
}

export interface Nucleo {
  id: number;
  codigo: string;
  descripcion: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface DireccionAdministrativa {
  id: number;
  codigo: string;
  descripcion: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface FormDataEdificio {
  descripcion_edificio: string;
  area_id: string;
  unidad_organizacional_id: string;
  unidad_organizacional: string;
  ambiente_id: string;
  ambiente: string;
  cargo: string;
  cargo_id: string | number;

  codigo_311: string;
  ingreso_311: string;
  ingreso_des_311: string;
  fecha_alta_311: string;
  proveedor_311: string;
  fecha_factura_311: string;
  num_factura_311: string;
  observaciones_311: string;
  estado_conservacion_311: string;
  valor_311: string;
  vida_util_311: string;
  fecha_estado_311: string;
  descripcion_estado_311: string;
  estado_311: string;
  estado_faltante_311: string;

  id_per: string;
  tdi_per: string;
  ndi_per: string;
  expedido_per: string;
  nombre_per: string;
  ap_paterno_per: string;
  ap_materno_per: string;
  ap_conyuge_per: string;
  sexo_per: string;
  f_nacimiento_per: string;
  c_civil_per: string;
  profesion_per: string;
  direccion_per: string;
  telefono_per: string;
  celular_per: string;
  email_per: string;
  estado_per: string;

  id_clasi_2: string;
  codigo_clasi: string;
  nombre_clasi: string;
  descripcion_clasi: string;
  id_sg_clasi: string;
  nombre_sg_clasi: string;

  id_func: string;
  tipo_func: string;
  num_file: string;
  item_func: string;
  telefono_func: string;
  interno_func: string;
  estado_func: string;

  id_cargo_func: string;
  id_ubi_func: string;
  id_act_func: string;
  id_cargo: string;
  codigo_cargo: string;
  nombre_cargo: string;
  descripcion_cargo: string;
  estado_cargo: string;
  id_af_cargo: string;

  id_ubi: string;
  codigo_ubi: string;
  nombre_ubi: string;
  direccion_ubi: string;
  distrito_ubi: string;
  observaciones_ubi: string;
  estado_ubi: string;

  id_af: string;
  codigo_af: string;
  nombre_af: string;
  estado_af: string;

  // Opcionales
  creado_por_id?: number;
  actualizado_por_id?: number;
  auxiliar_id?: string;
  auxiliar?: string;

  nucleo_id: string;
  distrito: string;
  direccion_administrativa_id: string;
  ciudad_id: number | '';
  direccion_administrativa: string;
  estado_activo: string;

  clasificacion_311_1: string;
  uso_311_1: string;
  superficie_311_1: string;

  energia_electrica: boolean;
  gas_domiciliario: boolean;
  alcantarillado: boolean;
  agua: boolean;
  telefono: boolean;
  celular: boolean;
  internet: boolean;

  [key: string]: any;
}

export interface Auxiliar {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface Ciudad {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface Distrito {
  id: number;
  codigo: string;
  descripcion: string;
}

// Interfaz para los permisos (puedes expandirla)
export interface Permiso {
  id: number;
  nombre: string;
  // otros campos si tu backend los retorna...
}

// Interfaz para los roles
export interface Rol {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  permisos: Permiso[];
}


export interface Permiso {
  id: number;
  nombre: string;
  descripcion?: string;
  modulo?: string;
}


