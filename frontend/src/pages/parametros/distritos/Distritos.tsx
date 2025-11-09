import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';
import { obtenerPermisosUsuario } from '../../../utils/permisos'; // ✅ Importar permisos

interface Usuario {
    id: number;
    nombre: string;
    rol: string;
    correo: string;
}

interface Distrito {
    id: number;
    codigo: string;
    descripcion: string;
    estado: 'ACTIVO' | 'INACTIVO';
    creado_por: Usuario;
    actualizado_por?: Usuario;
    created_at: string;
    updated_at?: string;
}

const Distritos = () => {
    const [distritos, setDistritos] = useState<Distrito[]>([]);
    const [filtrados, setFiltrados] = useState<Distrito[]>([]);
    const [cargando, setCargando] = useState(true);
    const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'activos' | 'inactivos'>('activos');
    const [permisos, setPermisos] = useState<string[]>([]); // ✅ Permisos del usuario
    const navigate = useNavigate();

    const [filtroCodigo, setFiltroCodigo] = useState('');
    const [filtroDescripcion, setFiltroDescripcion] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
    const [filtroCreadoPor, setFiltroCreadoPor] = useState('');
    const [filtroActualizadoPor, setFiltroActualizadoPor] = useState('');

    // ✅ Cargar permisos del usuario
    useEffect(() => {
        const permisosUsuario = obtenerPermisosUsuario();
        setPermisos(permisosUsuario);
    }, []);

    // ✅ Obtener distritos solo si tiene permiso
    useEffect(() => {
        if (permisos.includes('distritos:listar')) {
            obtenerDistritos();
        } else {
            setCargando(false);
        }
    }, [estadoFiltro, permisos]);

    useEffect(() => {
        aplicarFiltros();
    }, [distritos, filtroCodigo, filtroDescripcion, filtroEstado, filtroCreadoPor, filtroActualizadoPor]);

    const obtenerDistritos = async () => {
        setCargando(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<Distrito[]>('/parametros/distritos', {
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
            setDistritos(res.data);
        } catch (error) {
            console.error('❌ Error al obtener distritos:', error);
        } finally {
            setCargando(false);
        }
    };

    const aplicarFiltros = () => {
        let resultado = [...distritos];

        if (filtroEstado !== 'TODOS') {
            resultado = resultado.filter(d => d.estado === filtroEstado);
        }

        if (filtroCodigo.trim() !== '') {
            resultado = resultado.filter(d => d.codigo.toLowerCase().includes(filtroCodigo.toLowerCase()));
        }

        if (filtroDescripcion.trim() !== '') {
            resultado = resultado.filter(d => d.descripcion.toLowerCase().includes(filtroDescripcion.toLowerCase()));
        }

        if (filtroCreadoPor.trim() !== '') {
            resultado = resultado.filter(d => d.creado_por?.nombre.toLowerCase().includes(filtroCreadoPor.toLowerCase()));
        }

        if (filtroActualizadoPor.trim() !== '') {
            resultado = resultado.filter(d => d.actualizado_por?.nombre?.toLowerCase().includes(filtroActualizadoPor.toLowerCase()));
        }

        resultado.sort((a, b) => a.codigo.localeCompare(b.codigo));
        setFiltrados(resultado);
    };

    const cambiarEstado = async (id: number) => {
        if (!window.confirm('¿Estás seguro de cambiar el estado de este distrito?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/distritos/${id}/cambiar-estado`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            obtenerDistritos();
        } catch (error) {
            console.error('❌ Error al cambiar distrito:', error);
        }
    };

    const exportarPDF = async () => {
        const token = localStorage.getItem('token');
        const estado = estadoFiltro === 'activos' ? 'ACTIVO' : estadoFiltro === 'inactivos' ? 'INACTIVO' : 'todos';
        try {
            const res = await axios.get<Blob>(`/parametros/distritos/exportar/pdf?estado=${estado}`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` },
            });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('❌ Error al exportar PDF:', error);
        }
    };

    // 🔒 Si no tiene permiso para listar
    if (!permisos.includes('distritos:listar')) {
        return (
            <div className="container mt-5 text-center">
                <h4 className="text-danger">
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Acceso denegado
                </h4>
                <p>No tienes permiso para ver los distritos.</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0">Distritos</h4>
                    <p className="text-muted small">Gestión de distritos registrados</p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    {permisos.includes('distritos:crear') && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/parametros/distritos/nuevo')}
                        >
                            <i className="bi bi-plus-lg me-1"></i> Nuevo Distrito
                        </button>
                    )}

                    {permisos.includes('distritos:exportar-pdf') && (
                        <button className="btn btn-outline-success" onClick={exportarPDF}>
                            <i className="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
                        </button>
                    )}

                    <button className="btn btn-outline-secondary" onClick={() => navigate('/parametros')}>
                        <i className="bi bi-arrow-left me-1"></i> Volver a Parámetros
                    </button>

                    <div style={{ minWidth: '160px' }}>
                        <select
                            className="form-select"
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value as 'todos' | 'activos' | 'inactivos')}
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
                        ) : filtrados.length > 0 ? (
                            filtrados.map((distrito, i) => (
                                <tr key={distrito.id}>
                                    <td>{i + 1}</td>
                                    <td>{distrito.codigo}</td>
                                    <td>{distrito.descripcion}</td>
                                    <td>{distrito.estado}</td>
                                    <td>{distrito.creado_por?.nombre || '—'}</td>
                                    <td>{new Date(distrito.created_at).toLocaleDateString('es-BO')}</td>
                                    <td>{distrito.actualizado_por?.nombre || '—'}</td>
                                    <td>{distrito.updated_at ? new Date(distrito.updated_at).toLocaleDateString('es-BO') : '—'}</td>
                                    <td>
                                        {permisos.includes('distritos:editar') && (
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => navigate(`/parametros/distritos/editar/${distrito.id}`)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                        )}

                                        {(permisos.includes('distritos:cambiar-estado') ||
                                            permisos.includes('distritos:eliminar')) && (
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${distrito.estado === 'ACTIVO' ? 'btn-success' : 'btn-danger'}`}
                                                    onClick={() => cambiarEstado(distrito.id)}
                                                    title={distrito.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                                                    aria-label={distrito.estado === 'ACTIVO' ? 'Inactivar distrito' : 'Activar distrito'}
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

export default Distritos;
