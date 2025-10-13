import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const categorias = [
    {
        titulo: 'EDIFICIOS - TIERRAS Y TERRENOS',
        icono: 'bi-building',
        color: 'primary',
        items: ['Edificios',],
    },
    {
        titulo: 'EQUIPO DE OFICINA Y MUEBLES',
        icono: 'bi-lamp',
        color: 'info',
        items: ['Muebles', 'Equipos de Oficina'],
    },
    {
        titulo: 'EQUIPOS DE COMPUTACIÓN',
        icono: 'bi-pc-display',
        color: 'success',
        items: ['Equipos de Computación', 'CPU', 'Equipos Portátiles'],
    },
    {
        titulo: 'MAQUINARIA Y EQUIPO DE PRODUCCIÓN',
        icono: 'bi-gear',
        color: 'secondary',
        items: ['Equipo de Producción'],
    },
    {
        titulo: 'EQUIPO DE TRANSPORTE',
        icono: 'bi-truck',
        color: 'warning',
        items: ['Equipos de Transporte', 'Otros'],
    },
    {
        titulo: 'EQUIPO MÉDICO Y DE LABORATORIO',
        icono: 'bi-heart-pulse',
        color: 'danger',
        items: ['Equipo Médico', 'Instrumental Médico'],
    },
    {
        titulo: 'EQUIPO DE COMUNICACIÓN',
        icono: 'bi-wifi',
        color: 'dark',
        items: ['Equipos de Comunicación'],
    },
    {
        titulo: 'EQUIPO EDUCACIONAL Y RECREATIVO',
        icono: 'bi-joystick',
        color: 'primary',
        items: ['Mobiliario Educacional', 'Equipo Educacional/Recreativo'],
    },
    {
        titulo: 'OTRA MAQUINARIA Y EQUIPO',
        icono: 'bi-tools',
        color: 'info',
        items: ['Otra Maquinaria y Equipo'],
    },
    {
        titulo: 'OTROS BIENES DE CONTROL',
        icono: 'bi-boxes',
        color: 'secondary',
        items: ['Activos de Control', 'Fungibles', 'Acc Rep Vehículos'],
    },
    {
        titulo: 'CONSULTAS Y ACCIONES',
        icono: 'bi-search',
        color: 'success',
        items: ['Código', 'Transferencia de Todo'],
    },
    {
        titulo: 'REPORTES POR...',
        icono: 'bi-graph-up',
        color: 'warning',
        items: ['Persona', 'Unidad Organizacional', 'Grupo', 'UFV'],
    },
];

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('auth');
        navigate('/login');
    };

    return (
        <>


            {/* Panel principal */}
            <div className="container mt-4">
                <div className="row">
                    {categorias.map((cat, index) => (
                        <div className="col-md-4 mb-4" key={index}>
                            <div className={`card shadow h-100 border-${cat.color}`}>
                                <div className="card-body">
                                    <div className="text-center mb-3">
                                        <i className={`bi ${cat.icono} display-4 text-${cat.color}`}></i>
                                    </div>
                                    <h5 className="card-title text-center">{cat.titulo}</h5>
                                    <ul className="list-unstyled">
                                        {cat.items.map((item, i) => (
                                            <li key={i}>
                                                <button
                                                    className="btn btn-link text-decoration-none p-0"
                                                    onClick={() => {
                                                        if (item === 'Edificios') navigate('/edificios');
                                                        if (item === 'UFV') navigate('/ufvs');   // ✅ nueva ruta
                                                    }}

                                                >
                                                    <i className="bi bi-chevron-right me-2"></i> {item}
                                                </button>
                                            </li>
                                        ))}

                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
