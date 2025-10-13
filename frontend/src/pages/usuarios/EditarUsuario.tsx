import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listarRoles } from '../../api/roles';
import { Usuario } from '../../interfaces/usuario';

interface Rol {
    id: number;
    nombre: string;
    slug?: string;
    descripcion?: string;
}

export const EditarUsuario = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [correo, setCorreo] = useState('');
    const [nombre, setNombre] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [rol_id, setRolId] = useState<number | ''>('');
    const [roles, setRoles] = useState<Rol[]>([]);
    const [cargando, setCargando] = useState(true);

    // Cargar datos del usuario y roles
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Token no encontrado');

                // Cargar roles
                const rolesRes = await listarRoles(token);
                setRoles(rolesRes.data.data || []);

                // Cargar usuario
                const res = await fetch(`http://localhost:3001/usuarios/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error('Error al obtener datos del usuario');
                const data: Usuario = await res.json();

                setCorreo(data.correo);
                setNombre(data.nombre || '');
                setRolId(typeof data.rol === 'object' && data.rol ? data.rol.id : '');
                setCargando(false);
            } catch (err) {
                alert('Error al cargar usuario o roles');
                navigate('/usuarios');
            }
        };

        cargarDatos();
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token no encontrado');

            const payload: any = {
                correo,
                nombre,
                rol_id,
            };

            // Solo incluir contraseña si fue escrita
            if (contrasena.trim() !== '') {
                payload.contrasena = contrasena;
            }

            const res = await fetch(`http://localhost:3001/usuarios/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Error al actualizar usuario');
            alert('Usuario actualizado con éxito');
            navigate('/usuarios');
        } catch (error: any) {
            alert(error.message || 'Error al actualizar');
        }
    };

    if (cargando) return <p className="text-center mt-5">Cargando...</p>;

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card shadow-sm p-4" style={{ maxWidth: '500px', width: '100%' }}>
                <h4 className="mb-4 text-center">Editar Usuario</h4>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Correo</label>
                        <input
                            type="email"
                            className="form-control"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Nueva contraseña (opcional)</label>
                        <input
                            type="password"
                            className="form-control"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            placeholder="Dejar en blanco si no se cambia"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label">Rol</label>
                        <select
                            className="form-select"
                            value={rol_id}
                            onChange={(e) => setRolId(Number(e.target.value))}
                            required
                        >
                            <option value="">Seleccione un rol</option>
                            {roles.map((rol) => (
                                <option key={rol.id} value={rol.id}>
                                    {rol.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
