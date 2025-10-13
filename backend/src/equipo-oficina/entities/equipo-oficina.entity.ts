import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('equipo_oficina')
export class EquipoOficina {
    @PrimaryGeneratedColumn()
    id_312: number;

    @Column() codigo_312: string;
    @Column() ingreso_312: string;
    @Column() ingreso_des_312: string;
    @Column({ type: 'date' }) fecha_alta_312: Date;

    @Column({ nullable: true }) proveedor_312: string;
    @Column({ type: 'date', nullable: true }) fecha_factura_312: Date;
    @Column({ nullable: true }) num_factura_312: string;
    @Column({ nullable: true }) observaciones_312: string;
    @Column({ nullable: true }) estado_conservacion_312: string;
    @Column('decimal', { nullable: true }) valor_312: number;
    @Column('int', { nullable: true }) vida_util_312: number;

    @Column({ type: 'date', nullable: true }) fecha_estado_312: Date;
    @Column({ nullable: true }) descripcion_estado_312: string;
    @Column({ nullable: true }) estado_312: string;
    @Column({ type: 'date', nullable: true }) estado_faltante_312: Date;

    @Column({ nullable: true }) alto_312_1: string;
    @Column({ nullable: true }) ancho_312_1: string;
    @Column({ nullable: true }) largo_312_1: string;
    @Column({ nullable: true }) peso_312_1: string;
    @Column({ nullable: true }) material_des_312_1: string;

    // Datos personales
    @Column({ nullable: true }) id_per: number;
    @Column({ nullable: true }) tdi_per: string;
    @Column({ nullable: true }) ndi_per: string;
    @Column({ nullable: true }) expedido_per: string;
    @Column({ nullable: true }) nombre_per: string;
    @Column({ nullable: true }) ap_paterno_per: string;
    @Column({ nullable: true }) ap_materno_per: string;
    @Column({ nullable: true }) ap_conyuge_per: string;
    @Column({ nullable: true }) sexo_per: string;
    @Column({ type: 'date', nullable: true }) f_nacimiento_per: Date;
    @Column({ nullable: true }) c_civil_per: string;
    @Column({ nullable: true }) profesion_per: string;
    @Column({ nullable: true }) direccion_per: string;
    @Column({ nullable: true }) telefono_per: string;
    @Column({ nullable: true }) celular_per: string;
    @Column({ nullable: true }) email_per: string;
    @Column({ nullable: true }) estado_per: string;

    // Clasificación
    @Column({ nullable: true }) id_clasi: number;
    @Column({ nullable: true }) codigo_clasi: string;
    @Column({ nullable: true }) nombre_clasi: string;
    @Column({ nullable: true }) descripcion_clasi: string;
    @Column({ nullable: true }) id_sg_clasi: number;
    @Column({ nullable: true }) nombre_sg_clasi: string;

    // Funcionario
    @Column({ nullable: true }) id_func: number;
    @Column({ nullable: true }) tipo_func: string;
    @Column({ nullable: true }) num_file: string;
    @Column({ nullable: true }) item_func: string;
    @Column({ nullable: true }) telefono_func: string;
    @Column({ nullable: true }) interno_func: string;
    @Column({ nullable: true }) estado_func: string;

    // Cargo
    @Column({ nullable: true }) id_cargo_func: number;
    @Column({ nullable: true }) id_ubi_func: number;
    @Column({ nullable: true }) id_act_func: number;

    @Column({ nullable: true }) id_cargo: number;
    @Column({ nullable: true }) codigo_cargo: string;
    @Column({ nullable: true }) nombre_cargo: string;
    @Column({ nullable: true }) descripcion_cargo: string;
    @Column({ nullable: true }) estado_cargo: string;
    @Column({ nullable: true }) id_af_cargo: number;

    // Ubicación
    @Column({ nullable: true }) id_ubi: number;
    @Column({ nullable: true }) codigo_ubi: string;
    @Column({ nullable: true }) nombre_ubi: string;
    @Column({ nullable: true }) direccion_ubi: string;
    @Column({ nullable: true }) distrito_ubi: string;
    @Column({ nullable: true }) observaciones_ubi: string;
    @Column({ nullable: true }) estado_ubi: string;

    // Agrupación Física
    @Column({ nullable: true }) id_af: number;
    @Column({ nullable: true }) codigo_af: string;
    @Column({ nullable: true }) nombre_af: string;
    @Column({ nullable: true }) estado_af: string;
}
