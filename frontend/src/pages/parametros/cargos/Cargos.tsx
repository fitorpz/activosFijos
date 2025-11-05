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

export interface Cargo {
    id: number;
    codigo: string;
    cargo: string;
    descripcion?: string;
    estado: 'ACTIVO' | 'INACTIVO';
    creado_por: Usuario;
    created_at: string;
    actualizado_por?: Usuario | null;
    updated_at?: string | null;
}

const Cargos = () => {
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [cargosFiltrados, setCargosFiltrados] = useState<Cargo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [estadoFiltro, setEstadoFiltro] = useState<string>('activos');
    const [permisos, setPermisos] = useState<string[]>([]);
    const navigate = useNavigate();

    const [filtroCodigo, setFiltroCodigo] = useState('');
    const [filtroDescripcion, setFiltroDescripcion] = useState('');
    const [filtroCreadoPor, setFiltroCreadoPor] = useState('');
    const [filtroActualizadoPor, setFiltroActualizadoPor] = useState('');

    useEffect(() => {
        const permisosUsuario = obtenerPermisosUsuario();
        setPermisos(permisosUsuario);
    }, []);

    useEffect(() => {
        if (permisos.includes('cargos:listar')) {
            obtenerCargos();
        } else {
            setCargando(false);
        }
    }, [estadoFiltro, permisos]);

    useEffect(() => {
        aplicarFiltros();
    }, [cargos, filtroCodigo, filtroDescripcion, filtroCreadoPor, filtroActualizadoPor]);

    const obtenerCargos = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get<Cargo[]>('/parametros/cargos', {
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
            setCargos(res.data);
        } catch (error) {
            console.error('Error al obtener cargos:', error);
        } finally {
            setCargando(false);
        }
    };

    const aplicarFiltros = () => {
        let resultado = [...cargos];

        if (filtroCodigo.trim() !== '') {
            resultado = resultado.filter((c) => c.codigo.toLowerCase().includes(filtroCodigo.toLowerCase()));
        }
        if (filtroDescripcion.trim() !== '') {
            resultado = resultado.filter((c) =>
                (c.descripcion || c.cargo).toLowerCase().includes(filtroDescripcion.toLowerCase())
            );
        }
        if (filtroCreadoPor.trim() !== '') {
            resultado = resultado.filter((c) =>
                c.creado_por?.nombre?.toLowerCase().includes(filtroCreadoPor.toLowerCase())
            );
        }
        if (filtroActualizadoPor.trim() !== '') {
            resultado = resultado.filter((c) =>
                c.actualizado_por?.nombre?.toLowerCase().includes(filtroActualizadoPor.toLowerCase())
            );
        }

        resultado.sort((a, b) => a.codigo.localeCompare(b.codigo));
        setCargosFiltrados(resultado);
    };

    const cambiarEstado = async (id: number) => {
        if (!window.confirm('¿Estás seguro de cambiar el estado de este cargo?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/cargos/${id}/cambiar-estado`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            obtenerCargos();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
        }
    };

    const exportarPDF = async () => {
        const token = localStorage.getItem('token');
        const estado = estadoFiltro === 'activos' ? 'ACTIVO' : estadoFiltro === 'inactivos' ? 'INACTIVO' : 'todos';
        try {
            const res = await axios.get(`/parametros/cargos/exportar/pdf?estado=${estado}`, {
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

    if (!permisos.includes('cargos:listar')) {
        return (
            <div className="container mt-5 text-center">
                <h4 className="text-danger">
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Acceso denegado
                </h4>
                <p>No tienes permiso para ver los cargos.</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0">Cargos</h4>
                    <p className="text-muted small">Gestión de cargos registrados</p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    {permisos.includes('cargos:crear') && (
                        <button className="btn btn-primary" onClick={() => navigate('/parametros/cargos/registrar')}>
                            <i className="bi bi-plus-lg me-1"></i> Nuevo Cargo
                        </button>
                    )}

                    {permisos.includes('cargos:exportar-pdf') && (
                        <button className="btn btn-outline-success" onClick={exportarPDF}>
                            <i className="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
                        </button>
                    )}

                    <button className="btn btn-outline-secondary" onClick={() => navigate('/parametros')}>
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
                            <th>#</th>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Creado por</th>
                            <th>F. Registro</th>
                            <th>Actualizado por</th>
                            <th>F. Actualización</th>
                            <th>Acciones</th>
                        </tr>
                        <tr>
                            <th></th>
                            <th>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={filtroCodigo}
                                    onChange={(e) => setFiltroCodigo(e.target.value)}
                                    placeholder="Filtrar código"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={filtroDescripcion}
                                    onChange={(e) => setFiltroDescripcion(e.target.value)}
                                    placeholder="Filtrar descripción"
                                />
                            </th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr><td colSpan={9} className="text-center">Cargando...</td></tr>
                        ) : cargosFiltrados.length > 0 ? (
                            cargosFiltrados.map((cargo, index) => (
                                <tr key={cargo.id}>
                                    <td>{index + 1}</td>
                                    <td>{cargo.codigo}</td>
                                    <td>{cargo.cargo}</td>
                                    <td>{cargo.estado}</td>
                                    <td>{cargo.creado_por?.nombre || '—'}</td>
                                    <td>{new Date(cargo.created_at).toLocaleDateString('es-BO')}</td>
                                    <td>{cargo.actualizado_por?.nombre || '—'}</td>
                                    <td>{cargo.updated_at ? new Date(cargo.updated_at).toLocaleDateString('es-BO') : '—'}</td>
                                    <td>
                                        {permisos.includes('cargos:editar') && (
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => navigate(`/parametros/cargos/editar/${cargo.id}`)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                        )}

                                        {(permisos.includes('cargos:cambiar-estado') ||
                                            permisos.includes('cargos:eliminar')) && (
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${cargo.estado === 'ACTIVO' ? 'btn-success' : 'btn-danger'}`}
                                                    title={cargo.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                                                    onClick={() => cambiarEstado(cargo.id)}
                                                    aria-label={cargo.estado === 'ACTIVO' ? 'Inactivar cargo' : 'Activar cargo'}
                                                >
                                                    <i className="bi bi-arrow-repeat" style={{ color: '#000' }}></i>
                                                </button>
                                            )}

                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={9} className="text-center">No hay registros.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Cargos;