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
    const [personalesFiltrados, setPersonalesFiltrados] = useState<Personal[]>([]);
    const [estadoFiltro, setEstadoFiltro] = useState<string>('activos');
    const [cargando, setCargando] = useState(true);
    const [permisos, setPermisos] = useState<string[]>([]);
    const navigate = useNavigate();

    // 🔹 Filtros
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroCI, setFiltroCI] = useState('');
    const [filtroCelular, setFiltroCelular] = useState('');
    const [filtroEmail, setFiltroEmail] = useState('');
    const [filtroCreadoPor, setFiltroCreadoPor] = useState('');
    const [filtroActualizadoPor, setFiltroActualizadoPor] = useState('');

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
            const ci = p.ci?.toLowerCase() ?? '';
            const nombre = p.nombre?.toLowerCase() ?? '';
            const celular = p.celular?.toLowerCase() ?? '';
            const email = p.email?.toLowerCase() ?? '';
            const creadoPor = p.creado_por?.nombre?.toLowerCase() ?? '';
            const actualizadoPor = p.actualizado_por?.nombre?.toLowerCase() ?? '';

            return (
                ci.includes(filtroCI.toLowerCase()) &&
                nombre.includes(filtroNombre.toLowerCase()) &&
                celular.includes(filtroCelular.toLowerCase()) &&
                email.includes(filtroEmail.toLowerCase()) &&
                creadoPor.includes(filtroCreadoPor.toLowerCase()) &&
                actualizadoPor.includes(filtroActualizadoPor.toLowerCase())
            );
        });
        setPersonalesFiltrados(filtrados);
    }, [filtroCI, filtroNombre, filtroCelular, filtroEmail, filtroCreadoPor, filtroActualizadoPor, personales]);

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

    // 🔹 Formateadores
    const formatearFecha = (fecha?: string) => {
        if (!fecha) return '—';
        const d = new Date(fecha);
        return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-BO');
    };

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

    // 🔹 Cambiar estado
    const cambiarEstado = async (id: number, estadoActual: string) => {
        const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        if (!window.confirm(`¿Seguro que deseas cambiar el estado a ${nuevoEstado}?`)) return;

        try {
            await axiosInstance.put(`/parametros/personal/${id}/estado`, { estado: nuevoEstado });
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

    // 🔹 Verificación de permisos
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
            {/* Encabezado */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <div>
                    <h4 className="mb-0 text-primary fw-bold">Personal</h4>
                    <p className="text-muted small mb-0">Gestión de registros de personal</p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2 mt-2 mt-md-0">
                    {permisos.includes('personales:crear') && (
                        <button className="btn btn-primary" onClick={() => navigate('/parametros/personales/registrar')}>
                            <i className="bi bi-plus-lg me-1"></i> Nuevo Personal
                        </button>
                    )}

                    {permisos.includes('personales:exportar-pdf') && (
                        <button className="btn btn-outline-success" onClick={exportarPDF}>
                            <i className="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
                        </button>
                    )}

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

                        {/* Filtros */}
                        <tr>
                            <th></th>
                            <th><input type="text" className="form-control form-control-sm" placeholder="Nombre" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} /></th>
                            <th><input type="text" className="form-control form-control-sm" placeholder="CI" value={filtroCI} onChange={(e) => setFiltroCI(e.target.value)} /></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th><input type="text" className="form-control form-control-sm" placeholder="Celular" value={filtroCelular} onChange={(e) => setFiltroCelular(e.target.value)} /></th>
                            <th></th>
                            <th><input type="text" className="form-control form-control-sm" placeholder="Email" value={filtroEmail} onChange={(e) => setFiltroEmail(e.target.value)} /></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th><input type="text" className="form-control form-control-sm" placeholder="Creado por" value={filtroCreadoPor} onChange={(e) => setFiltroCreadoPor(e.target.value)} /></th>
                            <th></th>
                            <th><input type="text" className="form-control form-control-sm" placeholder="Actualizado por" value={filtroActualizadoPor} onChange={(e) => setFiltroActualizadoPor(e.target.value)} /></th>
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
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
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
                                                        className={`btn btn-sm ${p.estado === 'ACTIVO' ? 'btn-success' : 'btn-danger'}`}
                                                        title={p.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                                                        onClick={() => cambiarEstado(p.id, p.estado)}
                                                        aria-label={p.estado === 'ACTIVO' ? 'Inactivar personal' : 'Activar personal'}
                                                    >
                                                        <i className="bi bi-arrow-repeat" style={{ color: '#000' }}></i>
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
