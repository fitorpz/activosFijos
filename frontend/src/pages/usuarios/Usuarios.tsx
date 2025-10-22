import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Usuario } from '../../interfaces/usuario';



const Usuarios = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState<boolean>(true);

    // 🔹 Cerrar sesión (por seguridad)
    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
    };

    // 🔹 Cargar usuarios desde el backend
    const cargarUsuarios = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No autenticado');

            const response = await fetch('http://localhost:3001/usuarios', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) throw new Error('No autorizado');
            if (!response.ok) throw new Error('Error al obtener usuarios');

            const data: Usuario[] = await response.json();
            setUsuarios(data);
        } catch (err: any) {
            console.error('❌ Error al cargar usuarios:', err.message);
            setError(err.message || 'Error al obtener usuarios');
            if (err.message === 'No autorizado') cerrarSesion();
        } finally {
            setCargando(false);
        }
    };

    // 🔹 Eliminar usuario
    const eliminarUsuario = async (id: number) => {
        if (!window.confirm('¿Deseas eliminar este usuario?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No autenticado');

            const response = await fetch(`http://localhost:3001/usuarios/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) throw new Error('No autorizado');
            if (!response.ok) throw new Error('Error al eliminar usuario');

            const data = await response.json();
            alert(data.message);
            cargarUsuarios(); // Refrescar
        } catch (err: any) {
            alert(err.message || 'Error al eliminar usuario');
            if (err.message === 'No autorizado') cerrarSesion();
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    return (
        <div className="container mt-4">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Usuarios registrados</h2>
                <button className="btn btn-primary" onClick={() => navigate('/usuarios/crear')}>
                    + Nuevo Usuario
                </button>
            </div>

            {cargando ? (
                <div className="text-center mt-4">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2">Cargando usuarios...</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Nro.</th>
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Nombre</th>
                                <th>Expira</th>
                                <th>Creado por</th>
                                <th>Fecha de creación</th>
                                <th>Modificado por</th>
                                <th>Fecha de modificación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.length > 0 ? (
                                usuarios.map((usuario, index) => {
                                    const expira = usuario.fecha_expiracion ? new Date(usuario.fecha_expiracion) : null;
                                    const hoy = new Date();

                                    return (
                                        <tr key={usuario.id}>
                                            <td>{index + 1}</td>
                                            <td>{usuario.correo}</td>
                                            <td>{typeof usuario.rol === 'object' ? usuario.rol?.nombre : '—'}</td>
                                            <td>{usuario.nombre ?? '—'}</td>
                                            <td>
                                                {expira ? (
                                                    expira > hoy ? (
                                                        <span className="badge bg-success">
                                                            Activo hasta {expira.toLocaleDateString('es-BO')}
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-danger">Expirado</span>
                                                    )
                                                ) : (
                                                    <span className="badge bg-secondary">Ilimitado</span>
                                                )}
                                            </td>
                                            <td>{usuario.creadoPor?.nombre ?? usuario.creadoPor?.correo ?? '—'}</td>
                                            <td>{usuario.creadoEn ? new Date(usuario.creadoEn).toLocaleString('es-BO') : '—'}</td>
                                            <td>{usuario.modificadoPor?.nombre ?? usuario.modificadoPor?.correo ?? '—'}</td>
                                            <td>{usuario.modificadoEn ? new Date(usuario.modificadoEn).toLocaleString('es-BO') : '—'}</td>
                                            <td>
                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => eliminarUsuario(usuario.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={10} className="text-center text-muted">
                                        No hay usuarios registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Usuarios;
