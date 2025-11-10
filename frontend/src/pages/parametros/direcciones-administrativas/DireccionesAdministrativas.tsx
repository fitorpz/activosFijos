import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';
import { obtenerPermisosUsuario } from '../../../utils/permisos'; // ✅ Importa permisos

export interface Usuario {
    id: number;
    nombre: string;
    rol: string;
}

export interface DireccionAdministrativa {
    id: number;
    codigo: string;
    descripcion: string;
    estado: 'ACTIVO' | 'INACTIVO';
    creado_por: Usuario;
    created_at: string;
    actualizado_por?: Usuario | null;
    updated_at?: string | null;
}

const DireccionesAdministrativas = () => {
    const [direcciones, setDirecciones] = useState<DireccionAdministrativa[]>([]);
    const [direccionesFiltradas, setDireccionesFiltradas] = useState<DireccionAdministrativa[]>([]);
    const [permisos, setPermisos] = useState<string[]>([]); // ✅ Permisos del usuario
    const [cargando, setCargando] = useState(true);
    const [estadoFiltro, setEstadoFiltro] = useState<string>('activos');
    const [filtroCodigo, setFiltroCodigo] = useState('');
    const [filtroDescripcion, setFiltroDescripcion] = useState('');
    const [filtroCreadoPor, setFiltroCreadoPor] = useState('');
    const [filtroActualizadoPor, setFiltroActualizadoPor] = useState('');
    const navigate = useNavigate();

    // ✅ Cargar permisos del usuario
    useEffect(() => {
        const permisosUsuario = obtenerPermisosUsuario();
        setPermisos(permisosUsuario);
    }, []);

    // ✅ Obtener direcciones solo si tiene permiso
    useEffect(() => {
        if (permisos.includes('direcciones-administrativas:listar')) {
            obtenerDirecciones();
        } else {
            setCargando(false);
        }
    }, [estadoFiltro, permisos]);

    const obtenerDirecciones = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get<DireccionAdministrativa[]>(
                `/parametros/direcciones-administrativas`,
                {
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
                }
            );
            const ordenado = res.data.sort((a, b) => a.codigo.localeCompare(b.codigo));
            setDirecciones(ordenado);
        } catch (error) {
            console.error('Error al obtener direcciones:', error);
        } finally {
            setCargando(false);
        }
    };

    // ✅ Aplicar filtros
    useEffect(() => {
        let filtrado = [...direcciones];

        if (estadoFiltro === 'activos') {
            filtrado = filtrado.filter(dir => dir.estado === 'ACTIVO');
        } else if (estadoFiltro === 'inactivos') {
            filtrado = filtrado.filter(dir => dir.estado === 'INACTIVO');
        }

        if (filtroCodigo.trim() !== '') {
            filtrado = filtrado.filter(dir =>
                dir.codigo.toLowerCase().includes(filtroCodigo.trim().toLowerCase())
            );
        }
        if (filtroDescripcion.trim() !== '') {
            filtrado = filtrado.filter(dir =>
                dir.descripcion.toLowerCase().includes(filtroDescripcion.trim().toLowerCase())
            );
        }
        if (filtroCreadoPor.trim() !== '') {
            filtrado = filtrado.filter(dir =>
                dir.creado_por?.nombre.toLowerCase().includes(filtroCreadoPor.trim().toLowerCase())
            );
        }
        if (filtroActualizadoPor.trim() !== '') {
            filtrado = filtrado.filter(dir =>
                dir.actualizado_por?.nombre?.toLowerCase().includes(filtroActualizadoPor.trim().toLowerCase())
            );
        }

        setDireccionesFiltradas(filtrado);
    }, [direcciones, filtroCodigo, filtroDescripcion, filtroCreadoPor, filtroActualizadoPor, estadoFiltro]);

    const cambiarEstado = async (id: number) => {
        if (!window.confirm('¿Estás seguro de cambiar el estado de esta dirección administrativa?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/direcciones-administrativas/${id}/cambiar-estado`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            obtenerDirecciones();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
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
                `/parametros/direcciones-administrativas/exportar/pdf?estado=${estadoSeleccionado}`,
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

    // 🔒 Si no tiene permiso para listar
    if (!permisos.includes('direcciones-administrativas:listar')) {
        return (
            <div className="container mt-5 text-center">
                <h4 className="text-danger">
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Acceso denegado
                </h4>
                <p>No tienes permiso para ver las direcciones administrativas.</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0">Direcciones Administrativas</h4>
                    <p className="text-muted small">Gestión de registros de direcciones administrativas</p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    {permisos.includes('direcciones-administrativas:crear') && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/parametros/direcciones-administrativas/nueva')}
                        >
                            <i className="bi bi-plus-lg me-1"></i> Nueva Dirección
                        </button>
                    )}

                    {permisos.includes('direcciones-administrativas:exportar-pdf') && (
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
                    </thead>
                    <thead className="table-light">
                        {/* 🔍 Fila de filtros */}
                        <tr>
                            <th></th>
                            <th>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Buscar código"
                                    value={filtroCodigo}
                                    onChange={(e) => setFiltroCodigo(e.target.value)}
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Buscar descripción"
                                    value={filtroDescripcion}
                                    onChange={(e) => setFiltroDescripcion(e.target.value)}
                                />
                            </th>
                            <th></th>
                            <th>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Buscar creador"
                                    value={filtroCreadoPor}
                                    onChange={(e) => setFiltroCreadoPor(e.target.value)}
                                />
                            </th>
                            <th></th>
                            <th>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Buscar actualizador"
                                    value={filtroActualizadoPor}
                                    onChange={(e) => setFiltroActualizadoPor(e.target.value)}
                                />
                            </th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan={9} className="text-center">Cargando...</td>
                            </tr>
                        ) : direccionesFiltradas.length > 0 ? (
                            direccionesFiltradas.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{item.codigo}</td>
                                    <td>{item.descripcion}</td>
                                    <td>{item.estado}</td>
                                    <td>{item.creado_por?.nombre || '—'}</td>
                                    <td>{new Date(item.created_at).toLocaleDateString('es-BO')}</td>
                                    <td>{item.actualizado_por?.nombre || '—'}</td>
                                    <td>{item.updated_at ? new Date(item.updated_at).toLocaleDateString('es-BO') : '—'}</td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
                                            {permisos.includes('direcciones-administrativas:editar') && (
                                                <button
                                                    className="btn btn-sm btn-warning"
                                                    onClick={() => navigate(`/parametros/direcciones-administrativas/editar/${item.id}`)}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                            )}

                                            {(permisos.includes('direcciones-administrativas:cambiar-estado') ||
                                                permisos.includes('direcciones-administrativas:eliminar')) && (
                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm ${item.estado === 'ACTIVO' ? 'btn-success' : 'btn-danger'}`}
                                                        title={item.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                                                        onClick={() => cambiarEstado(item.id)}
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
                                <td colSpan={9} className="text-center">No hay registros.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DireccionesAdministrativas;
