import { Outlet, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/colors.css';
import '../styles/layout.css';
import { useState, useEffect } from 'react';
import logo from '../assets/img/escudo.png';
import { jwtDecode } from 'jwt-decode';
import axios from '../utils/axiosConfig';

interface DecodedToken {
    id: number;
    correo: string;
    nombre?: string;
    rol?: {
        nombre?: string;
    };
}

const Layout = () => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [usuario, setUsuario] = useState<DecodedToken | null>(null);
    const [ufv, setUfv] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchUFV = async () => {
            try {
                interface UfvResponse {
                    valor: string | number;
                    fecha?: string;
                }

                const token = localStorage.getItem('token');
                const res = await axios.get<UfvResponse>('/parametros/ufvs/actual', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const valorNumerico = parseFloat(res.data.valor as string);
                if (!isNaN(valorNumerico)) {
                    setUfv(valorNumerico);
                } else {
                    setUfv(null);
                }

            } catch (error) {
                console.error("Error al obtener UFV:", error);
            }
        };


        fetchUFV();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="vscode-layout">
            <aside
                className={`vscode-sidebar ${expanded ? 'expanded' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
                onMouseEnter={() => window.innerWidth > 768 && setExpanded(true)}
                onMouseLeave={() => window.innerWidth > 768 && setExpanded(false)}
            >
                <div className="sidebar-top">
                    <div
                        className="d-flex justify-content-center align-items-center mb-4"
                        style={{ width: '100%' }}
                    >
                        <img
                            src={logo}
                            alt="Logo GAMS"
                            style={{
                                maxWidth: '50%',
                                height: 'auto',
                                objectFit: 'contain',
                            }}
                        />
                    </div>
                </div>

                <ul className="sidebar-menu">
                    <li>
                        <a href="/parametros">
                            <i className="bi bi-gear-fill"></i>
                            <span>Parámetros</span>
                        </a>
                    </li>
                    <li>
                        <a href="/dashboard">
                            <i className="bi bi-speedometer2"></i>
                            <span>Activos Fijos</span>
                        </a>
                    </li>
                    <li>
                        <a href="/tickets/imprimir">
                            <i className="bi bi-printer-fill"></i>
                            <span>Tickets</span>
                        </a>
                    </li>
                    <li className="nav-item dropdown">
                        <a
                            className="nav-link dropdown-toggle"
                            href="#"
                            id="usuariosDropdown"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <i className="bi bi-people-fill"></i>
                            <span>Usuarios</span>
                        </a>
                        <ul className="dropdown-menu" aria-labelledby="usuariosDropdown">
                            <li>
                                <a className="dropdown-item" href="/usuarios">
                                    <i className="bi bi-person-lines-fill me-2"></i>
                                    Gestión de Usuarios
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/usuarios/roles">
                                    <i className="bi bi-shield-lock-fill me-2"></i>
                                    Roles
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>

                <div className="sidebar-bottom">
                    <button onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)}></div>}

            <main className="vscode-content">
                <header className="vscode-topbar d-flex justify-content-between align-items-center px-3 py-2">
                    <div className="d-flex align-items-center">
                        <button
                            className="toggle-btn btn btn-link text-white me-3"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <i className="bi bi-list fs-4"></i>
                        </button>
                        <h5 className="mb-0 text-dark">Sistema de Activos Fijos</h5>
                    </div>

                    <div className="d-flex align-items-center text-dark">
                        {ufv !== null && (
                            <span className="me-4">
                                <i className="bi bi-graph-up"></i> UFV: <strong>{ufv.toFixed(5)}</strong>
                            </span>
                        )}
                        {usuario && (
                            <span>
                                <i className="bi bi-person-circle"></i>{' '}
                                {usuario.nombre || usuario.correo}
                                {usuario.rol?.nombre && (
                                    <small className="text-muted ms-2">
                                        ({usuario.rol.nombre})
                                    </small>
                                )}
                            </span>
                        )}
                    </div>
                </header>

                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
