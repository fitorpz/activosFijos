import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';
import { obtenerPermisosUsuario } from '../../../utils/permisos'; // ✅ Control de permisos

export interface Usuario {
    id: number;
    nombre: string;
    correo: string;
    rol?: string;
}

interface Personal {
    id: number;
    documento: number;
    expedido: string;
    ci: string;
    nombre: string;
    profesion?: string;
    direccion?: string;
    celular?: string;
    telefono?: string;
    email?: string;
    fecnac?: string;
    estciv?: number;
    sexo?: number;
    estado: string;
    creado_por?: { nombre: string };
    actualizado_por?: { nombre: string };
    created_at: string;
    updated_at?: string;
    usuario?: Usuario | null; // ✅ Relación con Usuario
}

const Personales = () => {
    const [personales, setPersonales] = useState<Personal[]>([]);
    const [estadoFiltro, setEstadoFiltro] = useState<string>('activos');
    const [cargando, setCargando] = useState(true);
    const [permisos, setPermisos] = useState<string[]>([]);
    const navigate = useNavigate();

    // ✅ Cargar permisos del usuario
    useEffect(() => {
        const permisosUsuario = obtenerPermisosUsuario();
        setPermisos(permisosUsuario);
    }, []);

    // ✅ Cargar registros si tiene permiso
    useEffect(() => {
        if (permisos.includes('personales:listar')) {
            obtenerPersonales();
        } else {
            setCargando(false);
        }
    }, [estadoFiltro, permisos]);

    // 🔹 Obtener personales desde el backend
    const obtenerPersonales = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get<Personal[]>('/parametros/personal', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const filtrados = res.data.filter((p) =>
                estadoFiltro === 'todos'
                    ? true
                    : estadoFiltro === 'activos'
                        ? p.estado === 'ACTIVO'
                        : p.estado === 'INACTIVO'
            );
            setPersonales(filtrados);
        } catch (error) {
            console.error('❌ Error al obtener personales:', error);
        } finally {
            setCargando(false);
        }
    };

    // 🔹 Texto de estado civil
    const obtenerTextoEstadoCivil = (valor?: number): string => {
        switch (valor) {
            case 1:
                return 'Soltero';
            case 2:
                return 'Casado';
            case 3:
                return 'Viudo';
            case 4:
                return 'Divorciado';
            case 5:
                return 'Unión libre';
            default:
                return '—';
        }
    };

    // 🔹 Texto de sexo
    const obtenerTextoSexo = (valor?: number): string => {
        switch (valor) {
            case 1:
                return 'Masculino';
            case 2:
                return 'Femenino';
            default:
                return '—';
        }
    };

    // 🔹 Formatear fechas de forma segura
    const formatearFecha = (fecha?: string) => {
        if (!fecha) return '—';
        const d = new Date(fecha);
        return isNaN(d.getTime())
            ? '—'
            : d.toLocaleDateString('es-BO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
    };

    // 🔹 Cambiar estado (activar/inactivar)
    const cambiarEstado = async (id: number) => {
        if (!window.confirm('¿Estás seguro de cambiar el estado de este personal?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/personal/${id}/estado`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            obtenerPersonales();
        } catch (error) {
            console.error('❌ Error al cambiar estado:', error);
        }
    };

    // 🔹 Exportar PDF
    const exportarPDF = async () => {
        const token = localStorage.getItem('token');
        const estado =
            estadoFiltro === 'activos'
                ? 'ACTIVO'
                : estadoFiltro === 'inactivos'
                    ? 'INACTIVO'
                    : 'todos';
        try {
            const res = await axios.get(`/parametros/personal/exportar/pdf?estado=${estado}`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` },
            });
            const blob = new Blob([res.data as Blob], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('❌ Error al exportar PDF:', error);
        }
    };

    // 🔒 Si no tiene permiso para listar
    if (!permisos.includes('personales:listar')) {
        return (
            <div className="container mt-5 text-center">
                <h4 className="text-danger">
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Acceso denegado
                </h4>
                <p>No tienes permiso para ver los registros de personal.</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* 🔹 Encabezado */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0">Registro de Personal</h4>
                    <p className="text-muted small">Gestión y control del personal del sistema</p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    {permisos.includes('personales:crear') && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/parametros/personales/registrar')}
                        >
                            <i className="bi bi-plus-lg me-1"></i> Nuevo Personal
                        </button>
                    )}

                    {permisos.includes('personales:exportar-pdf') && (
                        <button className="btn btn-outline-success" onClick={exportarPDF}>
                            <i className="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
                        </button>
                    )}

                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/parametros')}
                    >
                        <i className="bi bi-arrow-left me-1"></i> Volver a Parámetros
                    </button>

                    <div style={{ minWidth: '160px' }}>
                        <select
                            className="form-select"
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value)}
                        >
                            <option value="todos">Todos</option>
                            <option value="activos">Solo Activos</option>
                            <option value="inactivos">Solo Inactivos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 🔹 Tabla */}
            <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle text-center">
                    <thead className="table-light">
                        <tr>
                            <th>Nro.</th>
                            <th>Usuario Asignado</th>
                            <th>Nro. Documento</th>
                            <th>Expedido</th>
                            <th>CI</th>
                            <th>Nombre Completo</th>
                            <th>Profesión</th>
                            <th>Dirección</th>
                            <th>Celular</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Fec. Nac.</th>
                            <th>Estado Civil</th>
                            <th>Sexo</th>
                            <th>Estado</th>
                            <th>Creado por</th>
                            <th>Fecha de Registro</th>
                            <th>Actualizado por</th>
                            <th>Fecha de Actualización</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan={20} className="text-center">
                                    Cargando datos...
                                </td>
                            </tr>
                        ) : personales.length > 0 ? (
                            personales.map((p, index) => (
                                <tr key={p.id}>
                                    <td>{index + 1}</td>

                                    {/* 🧩 Usuario asignado */}
                                    <td>
                                        {p.usuario
                                            ? `${p.usuario.nombre} (${p.usuario.correo})`
                                            : 'Sin usuario'}
                                    </td>

                                    <td>{p.documento ?? '—'}</td>
                                    <td>{p.expedido ?? '—'}</td>
                                    <td>{p.ci ?? '—'}</td>
                                    <td>{p.nombre ?? '—'}</td>
                                    <td>{p.profesion ?? '—'}</td>
                                    <td>{p.direccion ?? '—'}</td>
                                    <td>{p.celular ?? '—'}</td>
                                    <td>{p.telefono ?? '—'}</td>
                                    <td>{p.email ?? '—'}</td>
                                    <td>{formatearFecha(p.fecnac)}</td>
                                    <td>{obtenerTextoEstadoCivil(p.estciv)}</td>
                                    <td>{obtenerTextoSexo(p.sexo)}</td>
                                    <td>{p.estado}</td>
                                    <td>{p.creado_por?.nombre ?? '—'}</td>
                                    <td>{formatearFecha(p.created_at)}</td>
                                    <td>{p.actualizado_por?.nombre ?? '—'}</td>
                                    <td>{formatearFecha(p.updated_at)}</td>

                                    <td>
                                        {permisos.includes('personales:editar') && (
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() =>
                                                    navigate(`/parametros/personales/editar/${p.id}`)
                                                }
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                        )}

                                        {(permisos.includes('personales:cambiar-estado') ||
                                            permisos.includes('personales:eliminar')) && (
                                                <button
                                                    className={`btn btn-sm ${p.estado === 'ACTIVO'
                                                        ? 'btn-secondary'
                                                        : 'btn-success'
                                                        }`}
                                                    title={
                                                        p.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'
                                                    }
                                                    onClick={() => cambiarEstado(p.id)}
                                                >
                                                    <i className="bi bi-arrow-repeat"></i>
                                                </button>
                                            )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={20} className="text-center">
                                    No hay registros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Personales;
