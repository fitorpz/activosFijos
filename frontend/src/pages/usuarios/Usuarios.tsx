import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mejor centralizar esto en src/interfaces/usuario.ts
type Rol = {
    id: number;
    nombre: string;
    slug?: string;
    descripcion?: string;
};

type Usuario = {
    id: number;
    correo: string;
    rol: Rol | null; // Ahora es objeto, no string
    nombre: string | null;
    creadoPor?: { nombre: string | null; correo: string };
    creadoEn?: string;
};

const Usuarios = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [error, setError] = useState<string | null>(null);

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
    };

    const cargarUsuarios = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No autenticado');

            const response = await fetch('http://localhost:3001/usuarios', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                throw new Error('No autorizado');
            }

            if (!response.ok) {
                throw new Error('Error al obtener usuarios');
            }

            const data = await response.json();
            setUsuarios(data);
        } catch (err: any) {
            console.error(err.message);
            setError(err.message || 'Ocurrió un error');
            cerrarSesion(); // ⚠️ Redirige si no autorizado
        }
    };

    const eliminarUsuario = async (id: number) => {
        const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este usuario?');
        if (!confirmar) return;

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3001/usuarios/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                throw new Error('No autorizado');
            }

            if (!response.ok) {
                throw new Error('Error al eliminar usuario');
            }

            const data = await response.json();
            alert(data.message);
            cargarUsuarios(); // Recarga la lista actualizada
        } catch (err: any) {
            alert(err.message || 'Ocurrió un error al eliminar el usuario');
            if (err.message === 'No autorizado') {
                cerrarSesion();
            }
        }
    };

    useEffect(() => {
        cargarUsuarios();
        // eslint-disable-next-line
    }, []);

    return (
        <div className="container mt-4">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Usuarios registrados</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/usuarios/crear')}
                >
                    + Nuevo Usuario
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>Nro.</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Nombre</th>
                            <th>Creado por</th>
                            <th>Fecha de creación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((usuario, index) => (
                            <tr key={usuario.id}>
                                <td>{index + 1}</td>
                                <td>{usuario.correo}</td>
                                <td>{usuario.rol?.nombre ?? '—'}</td>
                                <td>{usuario.nombre ?? '—'}</td>
                                <td>{usuario.creadoPor?.nombre ?? usuario.creadoPor?.correo ?? '—'}</td>
                                <td>{usuario.creadoEn ? new Date(usuario.creadoEn).toLocaleString() : '—'}</td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => eliminarUsuario(usuario.id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Usuarios;
