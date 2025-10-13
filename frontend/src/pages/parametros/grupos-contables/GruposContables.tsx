import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

export interface Usuario {
    id: number;
    nombre: string;
    correo: string;
    rol?: string;
}

export interface GrupoContable {
    id: number;
    codigo: string;
    descripcion: string;
    tiempo: number;
    porcentaje: number;
    estado: 'ACTIVO' | 'INACTIVO';
    creado_por: Usuario;
    created_at: string;
    actualizado_por?: Usuario | null;
    updated_at?: string | null;
}

const GruposContables = () => {
    const [grupos, setGrupos] = useState<GrupoContable[]>([]);
    const [cargando, setCargando] = useState(true);
    const [estadoFiltro, setEstadoFiltro] = useState<string>('activos');
    const [filtrados, setFiltrados] = useState<GrupoContable[]>([]);
    const navigate = useNavigate();

    const [filtroCodigo, setFiltroCodigo] = useState('');
    const [filtroDescripcion, setFiltroDescripcion] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
    const [filtroCreadoPor, setFiltroCreadoPor] = useState('');
    const [filtroActualizadoPor, setFiltroActualizadoPor] = useState('');

    // 🔐 Obtener permisos del usuario desde localStorage (guardados en el login)
    const userPermisos: string[] = JSON.parse(localStorage.getItem('permisos') || '[]');

    const puedeCrear = userPermisos.includes('grupos-contables:crear');
    const puedeEditar = userPermisos.includes('grupos-contables:editar');
    const puedeCambiarEstado = userPermisos.includes('grupos-contables:cambiar-estado');
    const puedeExportarPDF = userPermisos.includes('grupos-contables:exportar-pdf');
    const puedeListar = userPermisos.includes('grupos-contables:listar');

    useEffect(() => {
        if (puedeListar) obtenerGrupos();
        else setCargando(false);
    }, [estadoFiltro]);

    useEffect(() => {
        aplicarFiltros();
    }, [grupos, filtroCodigo, filtroDescripcion, filtroEstado, filtroCreadoPor, filtroActualizadoPor]);

    const aplicarFiltros = () => {
        let resultado = [...grupos];

        if (filtroEstado !== 'TODOS') {
            resultado = resultado.filter(g => g.estado === filtroEstado);
        }

        if (filtroCodigo.trim() !== '') {
            resultado = resultado.filter(g =>
                g.codigo.toLowerCase().includes(filtroCodigo.toLowerCase()),
            );
        }

        if (filtroDescripcion.trim() !== '') {
            resultado = resultado.filter(g =>
                g.descripcion.toLowerCase().includes(filtroDescripcion.toLowerCase()),
            );
        }

        if (filtroCreadoPor.trim() !== '') {
            resultado = resultado.filter(g =>
                g.creado_por?.nombre.toLowerCase().includes(filtroCreadoPor.toLowerCase()),
            );
        }

        if (filtroActualizadoPor.trim() !== '') {
            resultado = resultado.filter(g =>
                g.actualizado_por?.nombre?.toLowerCase().includes(filtroActualizadoPor.toLowerCase()),
            );
        }

        resultado.sort((a, b) => a.codigo.localeCompare(b.codigo));
        setFiltrados(resultado);
    };

    const obtenerGrupos = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get<GrupoContable[]>('/parametros/grupos-contables', {
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
            setGrupos(res.data);
        } catch (error) {
            console.error('Error al obtener grupos contables:', error);
        } finally {
            setCargando(false);
        }
    };

    const cambiarEstado = async (id: number) => {
        if (!puedeCambiarEstado) {
            alert('No tienes permiso para cambiar el estado de un grupo contable.');
            return;
        }

        if (!window.confirm('¿Estás seguro de cambiar el estado de este grupo contable?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/grupos-contables/${id}/cambiar-estado`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            obtenerGrupos();
        } catch (error) {
            console.error('Error al cambiar el estado del grupo contable:', error);
            alert('No tienes permiso para realizar esta acción.');
        }
    };

    const exportarPDF = async () => {
        if (!puedeExportarPDF) {
            alert('No tienes permiso para exportar el reporte.');
            return;
        }

        const token = localStorage.getItem('token');
        const estadoSeleccionado =
            estadoFiltro === 'activos'
                ? 'ACTIVO'
                : estadoFiltro === 'inactivos'
                    ? 'INACTIVO'
                    : 'todos';

        try {
            const response = await axios.get(
                `/parametros/grupos-contables/exportar/pdf?estado=${estadoSeleccionado}`,
                {
                    responseType: 'blob',
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            const blob = new Blob([response.data as Blob], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('❌ Error al exportar PDF:', error);
            alert('Ocurrió un error al exportar el PDF.');
        }
    };

    if (!puedeListar) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center">
                    <strong>🚫 Acceso denegado.</strong> No tienes permiso para ver los grupos contables.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0">Grupos Contables</h4>
                    <p className="text-muted small">Gestión de grupos contables registrados</p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    {puedeCrear && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/parametros/grupos-contables/registrar')}
                        >
                            <i className="bi bi-plus-lg me-1"></i> Nuevo Grupo
                        </button>
                    )}

                    {puedeExportarPDF && (
                        <button className="btn btn-outline-success" onClick={exportarPDF}>
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
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Tiempo de Vida Útil (Años)</th>
                            <th>% Depreciación</th>
                            <th>Estado</th>
                            <th>Creado por</th>
                            <th>Registro</th>
                            <th>Actualizado por</th>
                            <th>Actualización</th>
                            <th>Acciones</th>
                        </tr>
                        <tr>
                            <th></th>
                            <th>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Filtrar código"
                                    value={filtroCodigo}
                                    onChange={(e) => setFiltroCodigo(e.target.value)}
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Filtrar descripción"
                                    value={filtroDescripcion}
                                    onChange={(e) => setFiltroDescripcion(e.target.value)}
                                />
                            </th>
                            <th></th>
                            <th></th>
                            <th>
                                <select
                                    className="form-select form-select-sm"
                                    value={filtroEstado}
                                    onChange={(e) =>
                                        setFiltroEstado(e.target.value as 'TODOS' | 'ACTIVO' | 'INACTIVO')
                                    }
                                >
                                    <option value="TODOS">Todos</option>
                                    <option value="ACTIVO">Activo</option>
                                    <option value="INACTIVO">Inactivo</option>
                                </select>
                            </th>
                            <th>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Creado por"
                                    value={filtroCreadoPor}
                                    onChange={(e) => setFiltroCreadoPor(e.target.value)}
                                />
                            </th>
                            <th></th>
                            <th>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Actualizado por"
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
                                <td colSpan={11} className="text-center">
                                    Cargando datos...
                                </td>
                            </tr>
                        ) : filtrados.length > 0 ? (
                            filtrados.map((grupo, index) => {
                                const estiloFila =
                                    /^\d{3}$/.test(grupo.codigo)
                                        ? { fontWeight: 'bold', fontSize: '0.8em' }
                                        : grupo.codigo.length > 3
                                            ? { fontSize: '0.7em' }
                                            : undefined;

                                return (
                                    <tr key={grupo.id} style={estiloFila}>
                                        <td>{index + 1}</td>
                                        <td>{grupo.codigo}</td>
                                        <td>{grupo.descripcion}</td>
                                        <td>{grupo.tiempo}</td>
                                        <td>{grupo.porcentaje}%</td>
                                        <td>{grupo.estado}</td>
                                        <td>{grupo.creado_por?.nombre || '—'}</td>
                                        <td>{new Date(grupo.created_at).toLocaleDateString('es-BO')}</td>
                                        <td>{grupo.actualizado_por?.nombre || '—'}</td>
                                        <td>
                                            {grupo.updated_at
                                                ? new Date(grupo.updated_at).toLocaleDateString('es-BO')
                                                : '—'}
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                {puedeEditar && (
                                                    <button
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() =>
                                                            navigate(`/parametros/grupos-contables/editar/${grupo.id}`)
                                                        }
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>
                                                )}
                                                {puedeCambiarEstado && (
                                                    <button
                                                        className={`btn btn-sm ${grupo.estado === 'ACTIVO'
                                                                ? 'btn-secondary'
                                                                : 'btn-success'
                                                            }`}
                                                        title={
                                                            grupo.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'
                                                        }
                                                        onClick={() => cambiarEstado(grupo.id)}
                                                    >
                                                        <i className="bi bi-arrow-repeat"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={11} className="text-center">
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

export default GruposContables;
