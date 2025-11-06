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
    const [rol_id, setRolId] = useState<number>(0);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaExpiracion, setFechaExpiracion] = useState('');
    const [tieneLimite, setTieneLimite] = useState(false);
    const [cargando, setCargando] = useState(true);

    // 🔹 Cargar datos del usuario y roles
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Token no encontrado');

                // Cargar roles
                const rolesRes = await listarRoles(token);
                setRoles(rolesRes.data.data || []);

                // Cargar datos del usuario
                const res = await fetch(`http://localhost:3001/usuarios/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error('Error al obtener datos del usuario');
                const data: Usuario = await res.json();

                setCorreo(data.correo);
                setNombre(data.nombre || '');
                setRolId(typeof data.rol === 'object' && data.rol ? data.rol.id : data.rol ?? 0);


                if (data.fecha_inicio || data.fecha_expiracion) {
                    setTieneLimite(true);
                    if (data.fecha_inicio) {
                        setFechaInicio(new Date(data.fecha_inicio).toISOString().split('T')[0]);
                    }
                    if (data.fecha_expiracion) {
                        setFechaExpiracion(new Date(data.fecha_expiracion).toISOString().split('T')[0]);
                    }
                }

                setCargando(false);
            } catch (err) {
                alert('Error al cargar usuario o roles');
                navigate('/usuarios');
            }
        };

        cargarDatos();
    }, [id, navigate]);

    // 🔹 Enviar actualización
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

            if (contrasena.trim() !== '') {
                payload.contrasena = contrasena;
            }

            if (tieneLimite) {
                payload.fecha_inicio = fechaInicio || null;
                payload.fecha_expiracion = fechaExpiracion || null;
            } else {
                payload.fecha_inicio = null;
                payload.fecha_expiracion = null;
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

            alert('✅ Usuario actualizado con éxito');
            navigate('/usuarios');
        } catch (error: any) {
            alert(error.message || 'Error al actualizar usuario');
        }
    };

    if (cargando) return <p className="text-center mt-5">Cargando...</p>;

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card shadow-sm p-4" style={{ maxWidth: '550px', width: '100%' }}>
                <h4 className="mb-4 text-center">Editar Usuario</h4>

                <form onSubmit={handleSubmit}>
                    {/* Correo */}
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

                    {/* Nombre */}
                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>

                    {/* Contraseña */}
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

                    {/* Rol */}
                    <div className="mb-4">
                        <label className="form-label">Rol</label>
                        <select
                            className="form-select"
                            value={rol_id}
                            onChange={(e) => setRolId(Number(e.target.value))}
                            required
                        >
                            <option value={0}>Seleccione un rol</option>
                            {roles.map((rol) => (
                                <option key={rol.id} value={rol.id}>
                                    {rol.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Acceso limitado */}
                    <div className="form-check mb-3">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="limiteAcceso"
                            checked={tieneLimite}
                            onChange={(e) => {
                                setTieneLimite(e.target.checked);
                                if (!e.target.checked) {
                                    setFechaInicio('');
                                    setFechaExpiracion('');
                                }
                            }}
                        />
                        <label htmlFor="limiteAcceso" className="form-check-label">
                            Acceso limitado por tiempo
                        </label>
                    </div>

                    {/* Fechas */}
                    {tieneLimite && (
                        <>
                            <div className="mb-3">
                                <label className="form-label">Fecha de inicio</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Fecha de expiración</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={fechaExpiracion}
                                    onChange={(e) => setFechaExpiracion(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Guardar y Cancelar */}
                    <div className="d-flex justify-content-between mt-4">
                        <button type="submit" className="btn btn-primary">
                            <i className="bi bi-save me-2"></i> Guardar Cambios
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/usuarios')}
                        >
                            <i className="bi bi-x-circle me-2"></i> Cancelar
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
