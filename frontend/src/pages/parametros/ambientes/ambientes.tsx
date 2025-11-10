import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';
import { obtenerPermisosUsuario } from '../../../utils/permisos';

export interface Usuario {
    id: number;
    nombre: string;
    correo: string;
    rol?: string;
}

export interface Area {
    id: number;
    codigo: string;
    descripcion: string;
}

export interface UnidadOrganizacional {
    id: number;
    codigo: string;
    descripcion: string;
    area: Area;
}

export interface Ambiente {
    id: number;
    codigo: string;
    descripcion: string;
    estado: 'ACTIVO' | 'INACTIVO';
    unidad_organizacional: UnidadOrganizacional;
    creado_por: Usuario;
    actualizado_por?: Usuario | null;
    created_at: string;
    updated_at?: string | null;
}

const Ambientes = () => {
    const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
    const [estadoFiltro, setEstadoFiltro] = useState<string>('activos');
    const [cargando, setCargando] = useState(true);
    const [permisos, setPermisos] = useState<string[]>([]);
    const [filtros, setFiltros] = useState({
        codigo: '',
        descripcion: '',
        estado: '',
        unidad_organizacional: '',
        area: '',
        creado_por: '',
        actualizado_por: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        const permisosUsuario = obtenerPermisosUsuario();
        setPermisos(permisosUsuario);
    }, []);

    useEffect(() => {
        if (permisos.includes('ambientes:listar')) {
            obtenerAmbientes();
        } else {
            setCargando(false);
        }
    }, [estadoFiltro, permisos]);

    const manejarCambioFiltro = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFiltros((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const obtenerAmbientes = async () => {
        setCargando(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<Ambiente[]>('/parametros/ambientes', {
                params: {
                    estado:
                        estadoFiltro === 'activos'
                            ? 'ACTIVO'
                            : estadoFiltro === 'inactivos'
                                ? 'INACTIVO'
                                : 'todos',
                },
                headers: { Authorization: `Bearer ${token}` },
            });
            setAmbientes(res.data);
        } catch (error) {
            console.error('❌ Error al obtener ambientes:', error);
        } finally {
            setCargando(false);
        }
    };

    const cambiarEstado = async (id: number) => {
        if (!window.confirm('¿Estás seguro de cambiar el estado de este ambiente?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/ambientes/${id}/cambiar-estado`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            obtenerAmbientes();
        } catch (error) {
            console.error('❌ Error al cambiar estado:', error);
        }
    };

    const exportarPDF = async () => {
        const token = localStorage.getItem('token');
        const estadoSeleccionado =
            estadoFiltro === 'activos'
                ? 'ACTIVO'
                : estadoFiltro === 'inactivos'
                    ? 'INACTIVO'
                    : 'todos';

        try {
            const response = await axios.get(
                `/parametros/ambientes/exportar/pdf?estado=${estadoSeleccionado}`,
                { responseType: 'blob', headers: { Authorization: `Bearer ${token}` } }
            );

            const blob = new Blob([response.data as Blob], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('❌ Error al exportar PDF:', error);
            alert('Ocurrió un error al exportar el PDF.');
        }
    };

    if (!permisos.includes('ambientes:listar')) {
        return (
            <div className="container mt-5 text-center">
                <h4 className="text-danger">
                    <i className="bi bi-shield-lock-fill me-2"></i> Acceso denegado
                </h4>
                <p>No tienes permiso para ver los ambientes.</p>
            </div>
        );
    }

    const ambientesFiltrados = ambientes
        .sort((a, b) => a.codigo.localeCompare(b.codigo))
        .filter((ambiente) => {
            const filtroCodigo = ambiente.codigo.toLowerCase().includes(filtros.codigo.toLowerCase());
            const filtroDescripcion = ambiente.descripcion.toLowerCase().includes(filtros.descripcion.toLowerCase());
            const filtroEstado = filtros.estado
                ? ambiente.estado.toLowerCase() === filtros.estado.toLowerCase()
                : true;
            const filtroUnidad = ambiente.unidad_organizacional?.codigo
                ?.toLowerCase()
                .includes(filtros.unidad_organizacional.toLowerCase());
            const filtroArea = ambiente.unidad_organizacional?.area?.codigo
                ?.toLowerCase()
                .includes(filtros.area.toLowerCase());
            const filtroCreadoPor = filtros.creado_por
                ? ambiente.creado_por?.nombre.toLowerCase().includes(filtros.creado_por.toLowerCase()) ?? false
                : true;
            const filtroActualizadoPor = filtros.actualizado_por
                ? ambiente.actualizado_por?.nombre.toLowerCase().includes(filtros.actualizado_por.toLowerCase()) ?? false
                : true;

            return (
                filtroCodigo &&
                filtroDescripcion &&
                filtroEstado &&
                filtroUnidad &&
                filtroArea &&
                filtroCreadoPor &&
                filtroActualizadoPor
            );
        });

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0">Ambientes</h4>
                    <p className="text-muted small">Gestión de registros por ambiente</p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    {permisos.includes('ambientes:crear') && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/parametros/ambientes/registrar')}
                        >
                            <i className="bi bi-plus-lg me-1"></i> Nuevo Ambiente
                        </button>
                    )}

                    {permisos.includes('ambientes:exportar-pdf') && (
                        <button
                            className="btn btn-outline-success"
                            onClick={exportarPDF}
                        >
                            <i className="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
                        </button>
                    )}

                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/parametros')}
                    >
                        <i className="bi bi-arrow-left me-1"></i> Volver
                    </button>

                    <div style={{ minWidth: '160px' }}>
                        <select
                            id="filtro-estado"
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value)}
                            className="form-select"
                        >
                            <option value="todos">Todos</option>
                            <option value="activos">Solo Activos</option>
                            <option value="inactivos">Solo Inactivos</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Nro.</th>
                            <th>Área</th>
                            <th>Unidad Organizacional</th>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Creado por</th>
                            <th>Fecha de Registro</th>
                            <th>Actualizado por</th>
                            <th>Fecha de Actualización</th>
                            <th>Acciones</th>
                        </tr>

                        {/* 🔍 FILTROS */}
                        <tr>
                            <th></th>
                            <th>
                                <input
                                    type="text"
                                    name="area"
                                    value={filtros.area}
                                    onChange={manejarCambioFiltro}
                                    className="form-control form-control-sm"
                                    placeholder="Buscar área"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    name="unidad_organizacional"
                                    value={filtros.unidad_organizacional}
                                    onChange={manejarCambioFiltro}
                                    className="form-control form-control-sm"
                                    placeholder="Buscar unidad"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    name="codigo"
                                    value={filtros.codigo}
                                    onChange={manejarCambioFiltro}
                                    className="form-control form-control-sm"
                                    placeholder="Buscar código"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    name="descripcion"
                                    value={filtros.descripcion}
                                    onChange={manejarCambioFiltro}
                                    className="form-control form-control-sm"
                                    placeholder="Buscar descripción"
                                />
                            </th>
                            <th></th>
                            <th>
                                <input
                                    type="text"
                                    name="creado_por"
                                    value={filtros.creado_por}
                                    onChange={manejarCambioFiltro}
                                    className="form-control form-control-sm"
                                    placeholder="Buscar creador"
                                />
                            </th>
                            <th></th>
                            <th>
                                <input
                                    type="text"
                                    name="actualizado_por"
                                    value={filtros.actualizado_por}
                                    onChange={manejarCambioFiltro}
                                    className="form-control form-control-sm"
                                    placeholder="Buscar actualizador"
                                />
                            </th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan={11} className="text-center">Cargando datos...</td>
                            </tr>
                        ) : ambientesFiltrados.length > 0 ? (
                            ambientesFiltrados.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{item.unidad_organizacional?.area?.codigo || '—'}</td>
                                    <td>{item.unidad_organizacional?.codigo || '—'}</td>
                                    <td>{item.codigo}</td>
                                    <td>{item.descripcion}</td>
                                    <td>{item.estado}</td>
                                    <td>{item.creado_por?.nombre || '—'}</td>
                                    <td>{new Date(item.created_at).toLocaleDateString('es-BO')}</td>
                                    <td>{item.actualizado_por?.nombre || '—'}</td>
                                    <td>{item.updated_at ? new Date(item.updated_at).toLocaleDateString('es-BO') : '—'}</td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
                                            {permisos.includes('ambientes:editar') && (
                                                <button
                                                    className="btn btn-sm btn-warning"
                                                    onClick={() => navigate(`/parametros/ambientes/editar/${item.id}`)}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                            )}

                                            {(permisos.includes('ambientes:cambiar-estado') ||
                                                permisos.includes('ambientes:eliminar')) && (
                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm ${item.estado === 'ACTIVO' ? 'btn-success' : 'btn-danger'}`}
                                                        title={item.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                                                        onClick={() => cambiarEstado(item.id)}
                                                        aria-label={item.estado === 'ACTIVO' ? 'Inactivar ambiente' : 'Activar ambiente'}
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
                                <td colSpan={11} className="text-center">No hay registros.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Ambientes;
