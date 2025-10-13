const PanelControl = () => {
    const secciones = [
        { titulo: 'INSTITUCIÓN', items: ['Ubicaciones', 'Unidades Organizacionales', 'Cargos'], icono: 'bi-building' },
        { titulo: 'PERSONAL', items: ['Gestión de Personas', 'Gestión de Funcionarios', 'Gestión de Usuarios', 'Gestión de Mi Cuenta'], icono: 'bi-people' },
        { titulo: 'DATOS GENERALES', items: ['UFV'], icono: 'bi-cash-coin' },
        { titulo: 'CRONOGRAMAS', items: ['Cronograma de Inventariación'], icono: 'bi-clock-history' },
        { titulo: 'CONTROL DE USUARIOS', items: ['Bitácora de Ingresos', 'Registro de Acciones'], icono: 'bi-clipboard-check' },
        { titulo: 'GESTIÓN DE DATOS', items: ['Copia de Seguridad'], icono: 'bi-hdd-network' },
        { titulo: 'AYUDA', items: ['Guía de Usuario', 'Guía de Instalación', 'Acerca de...'], icono: 'bi-question-circle' },
    ];

    return (
        <div className="container mt-4">
            <h3 className="text-primary mb-4">Panel de Control</h3>
            <div className="row">
                {secciones.map((seccion, index) => (
                    <div className="col-md-4 mb-4" key={index}>
                        <div className="card shadow h-100">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <i className={`bi ${seccion.icono} me-2 text-primary`}></i>
                                    {seccion.titulo}
                                </h5>
                                <ul className="list-unstyled">
                                    {seccion.items.map((item, i) => (
                                        <li key={i}>
                                            <a href="#" className="text-decoration-none">
                                                <i className="bi bi-chevron-right me-2"></i>
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PanelControl;
