import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarRoles } from '../../api/roles';

interface Rol {
    id: number;
    nombre: string;
    slug?: string;
    descripcion?: string;
}

export const RegistroUsuario = () => {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [nombre, setNombre] = useState('');
    const [rol_id, setRolId] = useState<number>(0);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [tieneLimite, setTieneLimite] = useState(false);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaExpiracion, setFechaExpiracion] = useState('');

    const navigate = useNavigate();

    // 🔹 Cargar roles disponibles
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Token no encontrado');
                const res = await listarRoles(token);
                setRoles(res.data.data || []);
            } catch (error) {
                alert('Error al cargar roles');
            }
        };

        fetchRoles();
    }, []);

    // 🔹 Enviar formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Token no encontrado. Por favor inicia sesión nuevamente.');
            return;
        }

        try {
            const payload: any = {
                correo,
                contrasena,
                nombre,
                rol_id,
            };

            if (tieneLimite) {
                payload.fecha_inicio = fechaInicio || null;
                payload.fecha_expiracion = fechaExpiracion || null;
            }

            const res = await fetch('http://localhost:3001/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error al registrar usuario');
            }

            alert('✅ Usuario registrado con éxito');
            navigate('/usuarios');
        } catch (err: any) {
            alert('Error al registrar usuario: ' + (err.message || 'Error desconocido'));
        }
    };

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card shadow-sm p-4" style={{ maxWidth: '550px', width: '100%' }}>
                <h4 className="mb-4 text-center">Registrar Usuario</h4>
                <form onSubmit={handleSubmit}>
                    {/* Correo */}
                    <div className="mb-3">
                        <label className="form-label">Correo electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </div>

                    {/* Contraseña */}
                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            required
                        />
                    </div>

                    {/* Nombre */}
                    <div className="mb-3">
                        <label className="form-label">Nombre completo</label>
                        <input
                            type="text"
                            className="form-control"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
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

                    {/* 🔹 Checkbox acceso limitado */}
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

                    {/* 🔹 Fechas si acceso limitado */}
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

                    {/* Botón de guardar */}
                    <div className="d-grid mt-4">
                        <button type="submit" className="btn btn-success">
                            <i className="bi bi-save me-2"></i> Guardar Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
