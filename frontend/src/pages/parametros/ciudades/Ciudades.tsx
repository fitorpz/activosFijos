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

interface Ciudad {
    id: number;
    codigo: string;
    descripcion: string;
    estado: 'ACTIVO' | 'INACTIVO';
    creado_por: Usuario;
    actualizado_por?: Usuario;
    created_at: string;
    updated_at?: string;
}

const Ciudades = () => {
    const [ciudades, setCiudades] = useState<Ciudad[]>([]);
    const [estadoFiltro, setEstadoFiltro] = useState<string>('activos');
    const [cargando, setCargando] = useState(true);
    const [permisos, setPermisos] = useState<string[]>([]);
    const [filtros, setFiltros] = useState({
        codigo: '',
        descripcion: '',
        creado_por: '',
        actualizado_por: '',
    });

    const navigate = useNavigate();

    // ✅ Cargar permisos del usuario
    useEffect(() => {
        const permisosUsuario = obtenerPermisosUsuario();
        setPermisos(permisosUsuario);
    }, []);

    // ✅ Obtener ciudades solo si tiene permiso
    useEffect(() => {
        if (permisos.includes('ciudades:listar')) {
            obtenerCiudades();
        } else {
            setCargando(false);
        }
    }, [estadoFiltro, permisos]);

    const obtenerCiudades = async () => {
        setCargando(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<Ciudad[]>('/parametros/ciudades', {
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
            setCiudades(res.data);
        } catch (error) {
            console.error('❌ Error al obtener ciudades:', error);
        } finally {
            setCargando(false);
        }
    };

    const cambiarEstado = async (id: number) => {
        if (!window.confirm('¿Estás seguro de cambiar el estado de esta ciudad?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/ciudades/${id}/cambiar-estado`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            obtenerCiudades();
        } catch (error) {
            console.error('❌ Error al cambiar estado:', error);
        }
    };

    const exportarPDF = async () => {
        const token = localStorage.getItem('token');
        const estado =
            estadoFiltro === 'activos'
                ? 'ACTIVO'
                : estadoFiltro === 'inactivos'
                    ? 'INACTIVO'
                    : 'todos';
        try {
            const res = await axios.get<Blob>(`/parametros/ciudades/exportar/pdf?estado=${estado}`, {
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

    const manejarCambioFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFiltros((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 🔎 Aplicar filtros dinámicos
    const ciudadesFiltradas = ciudades
        .sort((a, b) => a.codigo.localeCompare(b.codigo))
        .filter((ciudad) => {
            const filtroCodigo = ciudad.codigo
                .toLowerCase()
                .includes(filtros.codigo.toLowerCase());
            const filtroDescripcion = ciudad.descripcion
                .toLowerCase()
                .includes(filtros.descripcion.toLowerCase());
            const filtroCreadoPor = filtros.creado_por
                ? ciudad.creado_por?.nombre
                    ?.toLowerCase()
                    .includes(filtros.creado_por.toLowerCase()) ?? false
                : true;
            const filtroActualizadoPor = filtros.actualizado_por
                ? ciudad.actualizado_por?.nombre
                    ?.toLowerCase()
                    .includes(filtros.actualizado_por.toLowerCase()) ?? false
                : true;

            return (
                filtroCodigo &&
                filtroDescripcion &&
                filtroCreadoPor &&
                filtroActualizadoPor
            );
        });

    // 🔒 Si no tiene permiso para listar
    if (!permisos.includes('ciudades:listar')) {
        return (
            <div className="container mt-5 text-center">
                <h4 className="text-danger">
                    <i className="bi bi-shield-lock-fill me-2"></i> Acceso denegado
                </h4>
                <p>No tienes permiso para ver las ciudades.</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0">Ciudades</h4>
                    <p className="text-muted small">Gestión de ciudades registradas</p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    {permisos.includes('ciudades:crear') && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/parametros/ciudades/nuevo')}
                        >
                            <i className="bi bi-plus-lg me-1"></i> Nueva Ciudad
                        </button>
                    )}

                    {permisos.includes('ciudades:exportar-pdf') && (
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

                        {/* 🔍 FILTROS DENTRO DE LA TABLA */}
                        <tr>
                            <th></th>
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
                                <td colSpan={9} className="text-center">
                                    Cargando...
                                </td>
                            </tr>
                        ) : ciudadesFiltradas.length > 0 ? (
                            ciudadesFiltradas.map((ciudad, i) => (
                                <tr key={ciudad.id}>
                                    <td>{i + 1}</td>
                                    <td>{ciudad.codigo}</td>
                                    <td>{ciudad.descripcion}</td>
                                    <td>{ciudad.estado}</td>
                                    <td>{ciudad.creado_por?.nombre || '—'}</td>
                                    <td>{new Date(ciudad.created_at).toLocaleDateString('es-BO')}</td>
                                    <td>{ciudad.actualizado_por?.nombre || '—'}</td>
                                    <td>
                                        {ciudad.updated_at
                                            ? new Date(ciudad.updated_at).toLocaleDateString('es-BO')
                                            : '—'}
                                    </td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
                                            {permisos.includes('ciudades:editar') && (
                                                <button
                                                    className="btn btn-sm btn-warning"
                                                    onClick={() =>
                                                        navigate(`/parametros/ciudades/editar/${ciudad.id}`)
                                                    }
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                            )}

                                            {(permisos.includes('ciudades:cambiar-estado') ||
                                                permisos.includes('ciudades:eliminar')) && (
                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm ${ciudad.estado === 'ACTIVO'
                                                                ? 'btn-success'
                                                                : 'btn-danger'
                                                            }`}
                                                        onClick={() => cambiarEstado(ciudad.id)}
                                                        title={
                                                            ciudad.estado === 'ACTIVO'
                                                                ? 'Inactivar'
                                                                : 'Activar'
                                                        }
                                                        aria-label={
                                                            ciudad.estado === 'ACTIVO'
                                                                ? 'Inactivar ciudad'
                                                                : 'Activar ciudad'
                                                        }
                                                    >
                                                        <i
                                                            className="bi bi-arrow-repeat"
                                                            style={{ color: '#000' }}
                                                        ></i>
                                                    </button>
                                                )}
                                        </div>
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="text-center">
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

export default Ciudades;