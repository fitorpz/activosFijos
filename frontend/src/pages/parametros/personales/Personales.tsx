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

    // Filtros
    const [filtroCI, setFiltroCI] = useState('');
    const [filtroCelular, setFiltroCelular] = useState('');
    const [filtroEmail, setFiltroEmail] = useState('');
    const [filtroCreado_por, setFiltroCreado_por] = useState('');
    const [filtroActualizado_por, setFiltroActualizado_por] = useState('');
    const [filtroNombre, setFiltroNombre] = useState('');

    const [personalesFiltrados, setPersonalesFiltrados] = useState<Personal[]>([]);
    const navigate = useNavigate();

    // 🔹 Cargar permisos
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

    // 🔹 Aplicar filtros
    useEffect(() => {
        const filtrados = personales.filter((p) => {
            const coincideCI = p.ci?.toLowerCase().includes(filtroCI.toLowerCase()) ?? true;
            const coincideNombre = p.nombre?.toLowerCase().includes(filtroNombre.toLowerCase()) ?? true;
            const coincideCelular = p.celular?.toLowerCase().includes(filtroCelular.toLowerCase()) ?? true;
            const coincideEmail = p.email?.toLowerCase().includes(filtroEmail.toLowerCase()) ?? true;
            const coincideCreado_por =
                p.creado_por?.nombre?.toLowerCase().includes(filtroCreado_por.toLowerCase()) ?? true;
            const coincideActualizado_por =
                p.actualizado_por?.nombre?.toLowerCase().includes(filtroActualizado_por.toLowerCase()) ?? true;

            return (
                coincideCI &&
                coincideNombre &&
                coincideCelular &&
                coincideEmail &&
                coincideCreado_por &&
                coincideActualizado_por
            );
        });
        setPersonalesFiltrados(filtrados);
    }, [
        filtroCI,
        filtroNombre,
        filtroCelular,
        filtroEmail,
        filtroCreado_por,
        filtroActualizado_por,
        personales,
    ]);

    // 🔹 Obtener personales
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

    const formatearFecha = (fecha?: string) => {
        if (!fecha) return '—';
        const d = new Date(fecha);
        return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-BO');
    };

    // 🔹 Cambiar estado (activo/inactivo)
    const cambiarEstado = async (id: number, estadoActual: string) => {
        const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        if (!window.confirm(`¿Seguro que deseas cambiar el estado a ${nuevoEstado}?`)) return;

        try {
            //  Si tu API acepta un body con el nuevo estado:
            await axiosInstance.put(`/parametros/personal/${id}/cambiar-estado`);

            obtenerPersonales();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            alert('❌ Error al cambiar estado del personal.');
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

                    {/* Botón volver y filtro juntos */}
                    <div className="d-flex align-items-center gap-2 flex-nowrap">
                        <button
                            className="btn btn-outline-secondary text-nowrap"
                            style={{ whiteSpace: 'nowrap' }}
                            onClick={() => navigate('/parametros')}
                        >
                            <i className="bi bi-arrow-left me-1"></i> Volver a Parámetros
                        </button>

                        <select
                            className="form-select form-select-sm"
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
            </div>

            {/* Tabla */}
            <div className="table-responsive">
                <table className="table table-bordered table-hover table-striped align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Nro.</th>
                            <th>Nombre</th>
                            <th>CI</th>
                            <th>Dirección</th>
                            <th>Celular</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Creado por</th>
                            <th>F. Registro</th>
                            <th>Actualizado por</th>
                            <th>F. Actualización</th>
                            <th>Acciones</th>
                        </tr>

                        {/* Filtros */}
                        <tr>
                            <th></th>
                            <th><input type="text" className="form-control form-control-sm" placeholder="Nombre" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} /></th>
                            <th><input type="text" className="form-control form-control-sm" placeholder="CI" value={filtroCI} onChange={(e) => setFiltroCI(e.target.value)} /></th>
                            <th></th>
                            <th><input type="text" className="form-control form-control-sm" placeholder="Celular" value={filtroCelular} onChange={(e) => setFiltroCelular(e.target.value)} /></th>
                            <th><input type="text" className="form-control form-control-sm" placeholder="Email" value={filtroEmail} onChange={(e) => setFiltroEmail(e.target.value)} /></th>
                            <th></th>
                            <th><input type="text" className="form-control form-control-sm" placeholder="Creado por" value={filtroCreado_por} onChange={(e) => setFiltroCreado_por(e.target.value)} /></th>
                            <th></th>
                            <th><input type="text" className="form-control form-control-sm" placeholder="Actualizado por" value={filtroActualizado_por} onChange={(e) => setFiltroActualizado_por(e.target.value)} /></th>
                            <th colSpan={2}></th>
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
                                    <td>{p.direccion ?? '—'}</td>
                                    <td>{p.celular ?? '—'}</td>
                                    <td>{p.email ?? '—'}</td>
                                    <td>{p.estado}</td>
                                    <td>{p.creado_por?.nombre ?? '—'}</td>
                                    <td>{formatearFecha(p.created_at)}</td>
                                    <td>{p.actualizado_por?.nombre ?? '—'}</td>
                                    <td>{formatearFecha(p.updated_at)}</td>
                                    <td>
                                        <div className="d-flex justify-content-center align-items-center gap-2">
                                            {permisos.includes('personales:editar') && (
                                                <button
                                                    className="btn btn-sm btn-warning"
                                                    onClick={() => navigate(`/parametros/personales/editar/${p.id}`)}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                            )}

                                            {(permisos.includes('personales:cambiar-estado') ||
                                                permisos.includes('personales:eliminar')) && (
                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm ${p.estado === 'ACTIVO' ? 'btn-success' : 'btn-danger'
                                                            }`}
                                                        title={
                                                            p.estado === 'ACTIVO'
                                                                ? 'Inactivar'
                                                                : 'Activar'
                                                        }
                                                        onClick={() => cambiarEstado(p.id, p.estado)}
                                                    >
                                                        <i className="bi bi-arrow-repeat"></i>
                                                    </button>
                                                )}
                                        </div>
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
