import { useState } from 'react';
import logo from '../assets/img/logo_gamsucre_negro.png'
import { refrescarPermisosUsuario } from '../utils/permisos';

const Login = () => {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [errores, setErrores] = useState<string[]>([]);

    const validarCampos = () => {
        const erroresTemp: string[] = [];

        if (!correo) {
            erroresTemp.push('El correo es obligatorio.');
        } else if (!/\S+@\S+\.\S+/.test(correo)) {
            erroresTemp.push('El correo no tiene un formato válido.');
        }

        if (!contrasena) {
            erroresTemp.push('La contraseña es obligatoria.');
        }

        setErrores(erroresTemp);
        return erroresTemp.length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validarCampos()) return;

        try {
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contrasena }),
            });

            const data = await response.json();

            if (!response.ok || !data.access_token || !data.usuario) {
                setErrores([data.message || 'Credenciales incorrectas.']);
                return;
            }

            // ✅ Guardar token y datos del usuario en localStorage
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            // 🔄 Refrescar los permisos desde el backend (ruta: /usuarios/permisos/actualizados)
            await refrescarPermisosUsuario();

            // ✅ Redirigir al usuario (por ejemplo, al módulo de parámetros)
            window.location.href = '/parametros';
        } catch (error) {
            console.error('Error en login:', error);
            setErrores(['Error al conectar con el servidor.']);
        }
    };

    return (
        <div
            className="container-fluid d-flex justify-content-center align-items-center"
            style={{ minHeight: '100vh', backgroundColor: 'var(--color-secondary-100)' }}
        >
            <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '12px' }}>
                <div className="text-center mb-4">
                    <img
                        src={logo}
                        alt="Logo GAMS"
                        style={{
                            width: '300px',
                            height: 'auto',
                            display: 'block',
                            margin: '0 auto',
                        }}
                    />
                </div>



                {errores.length > 0 && (
                    <div className="alert alert-danger">
                        <ul className="mb-0">
                            {errores.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Correo</label>
                        <input
                            type="email"
                            className="form-control"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            placeholder="Ingrese su contraseña"
                            required
                        />
                    </div>
                    <div className="d-grid mb-3">
                        <button
                            type="submit"
                            className="btn"
                            style={{
                                backgroundColor: 'var(--color-success-500)',
                                color: 'white'
                            }}
                        >
                            Acceder
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <small className="d-block mb-1 text-muted">
                        ¿Primera vez? <a href="/primera-vez">Solicite su cuenta</a>
                    </small>
                    <small className="d-block mb-1 text-muted">
                        ¿Olvidaste tu contraseña? <a href="/recuperar">Recupérala</a>
                    </small>
                    <small className="d-block text-danger">
                        ¿Tu cuenta está deshabilitada? <a href="/deshabilitada">Solicita reactivación</a>
                    </small>
                </div>
            </div>
        </div>
    );
};

export default Login;