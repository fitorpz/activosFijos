import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarUsuarios } from '../../api/usuarios';
import { Usuario } from '../../interfaces/usuario';
import { obtenerPermisosUsuario } from '../../utils/permisos'; // ✅ decodifica permisos del token
import axios from '../../utils/axiosConfig';

export const ListaUsuarios = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [cargando, setCargando] = useState(true);
    const [permisos, setPermisos] = useState<string[]>([]);
    const navigate = useNavigate();

    // 🔐 Cargar permisos del usuario autenticado
    useEffect(() => {
        const permisosToken = obtenerPermisosUsuario();
        setPermisos(permisosToken);
    }, []);

    const puedeListar = permisos.includes('usuarios:listar');
    const puedeEditar = permisos.includes('usuarios:editar');
    const puedeCrear = permisos.includes('usuarios:crear');
    const puedeEliminar = permisos.includes('usuarios:eliminar');

    // 🔄 Cargar usuarios si tiene permiso
    useEffect(() => {
        if (puedeListar) cargarUsuarios();
        else setCargando(false);
    }, [puedeListar]);

    const cargarUsuarios = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token no encontrado');

            const res = await listarUsuarios(token);
            const usuariosNormalizados: Usuario[] = res.data.map((u: any) => ({
                ...u,
                rol:
                    typeof u.rol === 'string'
                        ? { id: 0, nombre: u.rol }
                        : u.rol || null,
            }));

            setUsuarios(usuariosNormalizados);
        } catch (error) {
            console.error('❌ Error al cargar usuarios:', error);
            alert('Ocurrió un error al obtener los usuarios.');
        } finally {
            setCargando(false);
        }
    };

    // 🚫 Mostrar mensaje de acceso denegado si no tiene permiso de listar
    if (!puedeListar) {
        return (
            <div className="container mt-5 text-center">
                <h4 className="text-danger">
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Acceso denegado
                </h4>
                <p>No tienes permiso para ver el módulo de usuarios.</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Usuarios Registrados</h3>

                {puedeCrear && (
                    <button
                        className="btn btn-success"
                        onClick={() => navigate('/usuarios/crear')}
                    >
                        <i className="bi bi-person-plus-fill me-2"></i> Nuevo Usuario
                    </button>
                )}
            </div>

            <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Correo</th>
                            <th>Nombre</th>
                            <th>Rol</th>
                            <th>Creado Por</th>
                            <th>Fecha Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan={7} className="text-center">
                                    Cargando usuarios...
                                </td>
                            </tr>
                        ) : usuarios.length > 0 ? (
                            usuarios.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td>{usuario.id}</td>
                                    <td>{usuario.correo}</td>
                                    <td>{usuario.nombre || '—'}</td>
                                    <td>
                                        {typeof usuario.rol === 'object' && usuario.rol !== null
                                            ? usuario.rol.nombre
                                            : 'Sin rol'}
                                    </td>
                                    <td>
                                        {usuario.creadoPor?.nombre
                                            ? `${usuario.creadoPor.nombre} (${usuario.creadoPor.correo})`
                                            : '—'}
                                    </td>
                                    <td>
                                        {usuario.creadoEn
                                            ? new Date(usuario.creadoEn).toLocaleDateString('es-BO')
                                            : '—'}
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            {puedeEditar && (
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                                                >
                                                    <i className="bi bi-pencil-square"></i> Editar
                                                </button>
                                            )}

                                            {puedeEliminar && (
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => alert('Función de eliminar pendiente')}
                                                >
                                                    <i className="bi bi-trash"></i> Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center text-muted">
                                    No hay usuarios registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
