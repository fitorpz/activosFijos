import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';
import { obtenerPermisosUsuario } from '../../../utils/permisos'; // ✅ Importación para control de permisos

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
    estado: 'ACTIVO' | 'INACTIVO';
    creado_por: Usuario;
    created_at: string;
    actualizado_por?: Usuario | null;
    updated_at?: string | null;
}

const Areas = () => {
    const [areas, setAreas] = useState<Area[]>([]);
    const [permisos, setPermisos] = useState<string[]>([]); // ✅ permisos del usuario
    const [cargando, setCargando] = useState(true);
    const [estadoFiltro, setEstadoFiltro] = useState<string>('activos');
    const [filtros, setFiltros] = useState({
        codigo: '',
        descripcion: '',
        estado: '',
        creado_por: '',
        actualizado_por: '',
    });

    const navigate = useNavigate();

    // ✅ Cargar permisos del usuario
    useEffect(() => {
        const permisosUsuario = obtenerPermisosUsuario();
        setPermisos(permisosUsuario);
    }, []);

    // ✅ Obtener áreas solo si el usuario tiene permiso
    useEffect(() => {
        if (permisos.includes('areas:listar')) {
            obtenerAreas();
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

    const obtenerAreas = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get<Area[]>('/parametros/areas', {
                params: estadoFiltro
                    ? {
                        estado:
                            estadoFiltro === 'activos'
                                ? 'ACTIVO'
                                : estadoFiltro === 'inactivos'
                                    ? 'INACTIVO'
                                    : 'todos',
                    }
                    : {},
                headers: { Authorization: `Bearer ${token}` },
            });
            setAreas(res.data);
        } catch (error) {
            console.error('Error al obtener áreas:', error);
        } finally {
            setCargando(false);
        }
    };

    const cambiarEstado = async (id: number) => {
        if (!window.confirm('¿Estás seguro de cambiar el estado de esta área?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/areas/${id}/cambiar-estado`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            obtenerAreas();
        } catch (error) {
            console.error('Error al cambiar el estado del área:', error);
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
                `/parametros/areas/exportar/pdf?estado=${estadoSeleccionado}`,
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

    // 🔒 Bloqueo total si el usuario no tiene permiso para listar
    if (!permisos.includes('areas:listar')) {
        return (
            <div className="container mt-5 text-center">
                <h4 className="text-danger">
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Acceso denegado
                </h4>
                <p>No tienes permiso para ver las áreas.</p>
            </div>
        );
    }

    // ✅ Aplicar filtros
    const areasFiltradas = [...areas]
        .sort((a, b) => a.codigo.localeCompare(b.codigo))
        .filter((area) => {
            const filtroCodigo = area.codigo.toLowerCase().includes(filtros.codigo.toLowerCase());
            const filtroDescripcion = area.descripcion.toLowerCase().includes(filtros.descripcion.toLowerCase());
            const filtroEstado = filtros.estado
                ? area.estado.toLowerCase() === filtros.estado.toLowerCase()
                : true;
            const filtroCreadoPor = filtros.creado_por
                ? area.creado_por?.nombre.toLowerCase().includes(filtros.creado_por.toLowerCase()) ?? false
                : true;
            const filtroActualizadoPor = filtros.actualizado_por
                ? area.actualizado_por?.nombre.toLowerCase().includes(filtros.actualizado_por.toLowerCase()) ?? false
                : true;

            return (
                filtroCodigo &&
                filtroDescripcion &&
                filtroEstado &&
                filtroCreadoPor &&
                filtroActualizadoPor
            );
        });

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0">Áreas</h4>
                    <p className="text-muted small">Gestión de registros por área</p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    {permisos.includes('areas:crear') && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/parametros/areas/registrar')}
                        >
                            <i className="bi bi-plus-lg me-1"></i> Nueva Área
                        </button>
                    )}

                    {permisos.includes('areas:exportar-pdf') && (
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
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Creado por</th>
                            <th>Fecha de Registro</th>
                            <th>Actualizado por</th>
                            <th>Fecha de Actualización</th>
                            <th>Acciones</th>
                        </tr>

                        {/* 🔍 Fila de filtros (sin estado) */}
                        <tr>
                            <th></th>
                            <th>
                                <input
                                    type="text"
                                    name="codigo"
                                    className="form-control form-control-sm"
                                    value={filtros.codigo}
                                    onChange={manejarCambioFiltro}
                                    placeholder="Buscar código"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    name="descripcion"
                                    className="form-control form-control-sm"
                                    value={filtros.descripcion}
                                    onChange={manejarCambioFiltro}
                                    placeholder="Buscar descripción"
                                />
                            </th>
                            <th></th> {/* Estado sin filtro */}
                            <th>
                                <input
                                    type="text"
                                    name="creado_por"
                                    className="form-control form-control-sm"
                                    value={filtros.creado_por}
                                    onChange={manejarCambioFiltro}
                                    placeholder="Buscar creador"
                                />
                            </th>
                            <th></th>
                            <th>
                                <input
                                    type="text"
                                    name="actualizado_por"
                                    className="form-control form-control-sm"
                                    value={filtros.actualizado_por}
                                    onChange={manejarCambioFiltro}
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
                                <td colSpan={9} className="text-center">Cargando datos...</td>
                            </tr>
                        ) : areasFiltradas.length > 0 ? (
                            areasFiltradas.map((area, index) => (
                                <tr key={area.id}>
                                    <td>{index + 1}</td>
                                    <td>{area.codigo}</td>
                                    <td>{area.descripcion}</td>
                                    <td>{area.estado}</td>
                                    <td>{area.creado_por?.nombre || '—'}</td>
                                    <td>{new Date(area.created_at).toLocaleDateString('es-BO')}</td>
                                    <td>{area.actualizado_por?.nombre || '—'}</td>
                                    <td>{area.updated_at ? new Date(area.updated_at).toLocaleDateString('es-BO') : '—'}</td>
                                    <td>
                                        {permisos.includes('areas:editar') && (
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => navigate(`/parametros/areas/editar/${area.id}`)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                        )}

                                        {(permisos.includes('areas:cambiar-estado') ||
                                            permisos.includes('areas:eliminar')) && (
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${area.estado === 'ACTIVO' ? 'btn-success' : 'btn-danger'}`}
                                                    title={area.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                                                    onClick={() => cambiarEstado(area.id)}
                                                    aria-label={area.estado === 'ACTIVO' ? 'Inactivar área' : 'Activar área'}
                                                >
                                                    <i className="bi bi-arrow-repeat" style={{ color: '#000' }}></i>
                                                </button>

                                            )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="text-center">No hay registros.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Areas;
