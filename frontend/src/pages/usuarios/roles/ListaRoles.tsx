import React, { useEffect, useState } from 'react';
import { listarRoles } from '../../../api/roles';
import { Rol } from '../../../interfaces/interfaces';
import { useNavigate } from "react-router-dom";

const ListaRoles: React.FC = () => {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const cargarRoles = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Token no encontrado');

                const res = await listarRoles(token);
                setRoles(res.data.data || []);
            } catch (err: any) {
                console.error('Error al cargar roles:', err);
                setError('Error al cargar roles');
            } finally {
                setLoading(false); // ← Esto evita que se quede en "Cargando..."
            }
        };

        cargarRoles();
    }, []);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Roles Registrados</h2>
                <button
                    className="btn btn-success"
                    onClick={() => navigate('/usuarios/roles/crear')}
                >
                    <i className="bi bi-plus-circle me-2"></i> Nuevo Rol
                </button>
            </div>

            {loading && <p>Cargando...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && roles.length === 0 && (
                <p>No hay roles registrados.</p>
            )}

            {!loading && roles.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead className="table-dark">
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Slug</th>
                                <th>Permisos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((rol) => (
                                <tr key={rol.id}>
                                    <td>{rol.nombre}</td>
                                    <td>{rol.descripcion || <i className="text-muted">—</i>}</td>
                                    <td>{rol.slug || <i className="text-muted">—</i>}</td>
                                    <td>
                                        {rol.permisos && rol.permisos.length > 0 ? (
                                            <>
                                                {rol.permisos.slice(0, 3).map(p => p.nombre).join(', ')}
                                                {rol.permisos.length > 3 && (
                                                    <span className="text-muted"> y {rol.permisos.length - 3} más</span>
                                                )}
                                            </>
                                        ) : (
                                            <i className="text-muted">Sin permisos</i>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => navigate(`/usuarios/roles/editar/${rol.id}`)}
                                        >
                                            <i className="bi bi-pencil-square"></i> Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ListaRoles;
