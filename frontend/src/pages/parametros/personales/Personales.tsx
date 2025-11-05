import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import { obtenerPermisosUsuario } from '../../../utils/permisos';

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
    usuario?: Usuario | null;
}

const Personales = () => {
    const [personales, setPersonales] = useState<Personal[]>([]);
    const [estadoFiltro, setEstadoFiltro] = useState<string>('activos');
    const [cargando, setCargando] = useState(true);
    const [permisos, setPermisos] = useState<string[]>([]);
    const [filtroCI, setFiltroCI] = useState('');
    const [filtroNombre, setFiltroNombre] = useState('');
    const [personalesFiltrados, setPersonalesFiltrados] = useState<Personal[]>([]);
    const navigate = useNavigate();

    // 🔹 Cargar permisos del usuario
    useEffect(() => {
        const permisosUsuario = obtenerPermisosUsuario();
        setPermisos(permisosUsuario);
    }, []);

    // 🔹 Obtener registros si tiene permiso
    useEffect(() => {
        if (permisos.includes('personales:listar')) {
            obtenerPersonales();
        } else {
            setCargando(false);
        }
    }, [estadoFiltro, permisos]);

    // 🔹 Aplicar filtros por CI y nombre
    useEffect(() => {
        const filtrados = personales.filter((p) => {
            const coincideCI = p.ci?.toLowerCase().includes(filtroCI.toLowerCase());
            const coincideNombre = p.nombre?.toLowerCase().includes(filtroNombre.toLowerCase());
            return coincideCI && coincideNombre;
        });
        setPersonalesFiltrados(filtrados);
    }, [filtroCI, filtroNombre, personales]);

    // 🔹 Obtener todos los personales
    const obtenerPersonales = async () => {
        try {
            const res = await axiosInstance.get<Personal[]>('/parametros/personal');
            const filtrados = res.data.filter((p) =>
                estadoFiltro === 'todos'
                    ? true
                    : estadoFiltro === 'activos'
                        ? p.estado === 'ACTIVO'
                        : p.estado === 'INACTIVO'
            );
            setPersonales(filtrados);
        } catch (error) {
            console.error('Error al obtener personales:', error);
        } finally {
            setCargando(false);
        }
    };

    // 🔹 Formateadores visuales
    const obtenerTextoEstadoCivil = (valor?: number): string => {
        switch (valor) {
            case 1: return 'Soltero';
            case 2: return 'Casado';
            case 3: return 'Viudo';
            case 4: return 'Divorciado';
            case 5: return 'Unión libre';
            default: return '—';
        }
    };

    const obtenerTextoSexo = (valor?: number): string => {
        switch (valor) {
            case 1: return 'Masculino';
            case 2: return 'Femenino';
            default: return '—';
        }
    };

    const formatearFecha = (fecha?: string) => {
        if (!fecha) return '—';
        const d = new Date(fecha);
        return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-BO');
    };

    // 🔹 Cambiar estado (activo/inactivo)
    const cambiarEstado = async (id: number) => {
        if (!window.confirm('¿Estás seguro de cambiar el estado de este personal?')) return;
        try {
            await axiosInstance.put(`/parametros/personal/${id}/estado`);
            obtenerPersonales();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
        }
    };

    // 🔹 Exportar PDF
    const exportarPDF = async () => {
        const estado =
            estadoFiltro === 'activos'
                ? 'ACTIVO'
                : estadoFiltro === 'inactivos'
                    ? 'INACTIVO'
                    : 'todos';
        try {
            const res = await axiosInstance.get(`/parametros/personal/exportar/pdf?estado=${estado}`, {
                responseType: 'blob',
            });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('❌ Error al exportar PDF:', error);
        }
    };

    // 🔹 Si no tiene permiso de listar
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
            {/* Encabezado y acciones */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <div>
                    <h4 className="mb-0 text-primary fw-bold">Personal</h4>
                    <p className="text-muted small mb-0">Gestión de registros de personal</p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2 mt-2 mt-md-0">
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

                    <select
                        className="form-select"
                        style={{ minWidth: '160px' }}
                        value={estadoFiltro}
                        onChange={(e) => setEstadoFiltro(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="activos">Solo Activos</option>
                        <option value="inactivos">Solo Inactivos</option>
                    </select>
                </div>
            </div>

            {/* Tabla de datos */}
            <div className="table-responsive">
                <table className="table table-bordered table-hover table-striped align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Nro.</th>
                            <th>Nombre</th>
                            <th>CI</th>
                            <th>Expedido</th>
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
                            <th>F. Registro</th>
                            <th>Actualizado por</th>
                            <th>F. Actualización</th>
                            <th>Acciones</th>
                        </tr>
                        <tr>
                            <th colSpan={4}></th>
                            <th>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Filtrar CI"
                                    value={filtroCI}
                                    onChange={(e) => setFiltroCI(e.target.value)}
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Filtrar nombre"
                                    value={filtroNombre}
                                    onChange={(e) => setFiltroNombre(e.target.value)}
                                />
                            </th>
                            <th colSpan={13}></th>
                        </tr>
                    </thead>

                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan={20} className="text-center py-3">
                                    Cargando datos...
                                </td>
                            </tr>
                        ) : personalesFiltrados.length > 0 ? (
                            personalesFiltrados.map((p, index) => (
                                <tr key={p.id}>
                                    <td>{index + 1}</td>
                                    <td>{p.nombre ?? '—'}</td>
                                    <td>{p.ci ?? '—'}</td>
                                    <td>{p.expedido ?? '—'}</td>
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
                                    <td className="text-center">
                                        {permisos.includes('personales:editar') && (
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => navigate(`/parametros/personales/editar/${p.id}`)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                        )}

                                        {(permisos.includes('personales:cambiar-estado') ||
                                            permisos.includes('personales:eliminar')) && (
                                                <button
                                                    className={`btn btn-sm ${p.estado === 'ACTIVO' ? 'btn-secondary' : 'btn-success'
                                                        }`}
                                                    title={p.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
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
                                <td colSpan={20} className="text-center py-3">
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
