import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import { Button } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { Modal } from 'react-bootstrap';



interface UnidadOrganizacional {
    descripcion: string;
}

interface Edificio {
    id: number;
    codigo_completo: string;
    nombre_bien: string;
    clasificacion: string;
    unidad_organizacional?: UnidadOrganizacional;
    ubicacion: string;
    estado: 'ACTIVO' | 'INACTIVO';
}

const exportarFichaPDF = async (id: number) => {
    try {
        const token = localStorage.getItem('token');
        const url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/activos-fijos/edificios/${id}/ficha-pdf`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Error al generar ficha PDF');

        // Crear blob y abrir el PDF en una nueva pestaña
        const blob = await res.blob();
        const pdfURL = URL.createObjectURL(blob);
        window.open(pdfURL, '_blank');
    } catch (error) {
        console.error('❌ Error al exportar ficha PDF:', error);
        toast.error('Error al exportar ficha técnica del edificio');
    }
};



const ListaEdificios = () => {
    const [edificios, setEdificios] = useState<Edificio[]>([]);
    const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'ACTIVO' | 'INACTIVO'>('todos');
    const [descargando, setDescargando] = useState(false);
    //  Estados para el modal de detalle
    const [showModal, setShowModal] = useState(false);
    const [edificioSeleccionado, setEdificioSeleccionado] = useState<any | null>(null);


    const abrirModal = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.get(`/activos-fijos/edificios/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEdificioSeleccionado(res.data.data || res.data);
            setShowModal(true);
        } catch (error) {
            console.error('❌ Error al obtener detalles del edificio:', error);
            toast.error('No se pudo cargar la información del edificio.');
        }
    };

    useEffect(() => {
        fetchEdificios();
    }, []);

    const fetchEdificios = async () => {
        try {
            const res = await axiosInstance.get('/activos-fijos/edificios');
            // 🧩 Backend devuelve { total, data }
            setEdificios(res.data.data || []);
        } catch (error) {
            console.error('❌ Error al obtener edificios:', error);
        }
    };

    const exportarPDF = async () => {
        try {
            const token = localStorage.getItem('token');
            const estadoSeleccionado = ''; // si tienes un filtro de estado
            const url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/activos-fijos/edificios/exportar/pdf${estadoSeleccionado && estadoSeleccionado !== 'Todos' ? `?estado=${estadoSeleccionado}` : ''
                }`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Error al generar PDF');

            const blob = await res.blob();
            const pdfURL = URL.createObjectURL(blob);
            window.open(pdfURL, '_blank');
        } catch (error) {
            console.error('❌ Error al exportar PDF:', error);
            toast.error('Error al exportar PDF de edificios');
        }
    };



    const edificiosFiltrados =
        estadoFiltro === 'todos'
            ? edificios
            : edificios.filter((e) => e.estado === estadoFiltro);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Listado de Edificios</h2>
                <Link to="/edificios/registrar" className="btn btn-success">
                    + Registrar Edificio
                </Link>
            </div>

            <div className="mb-3">
                <label className="me-2">Filtrar por estado:</label>
                <select
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value as any)}
                    className="form-select w-auto d-inline-block"
                >
                    <option value="todos">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                </select>
                <button className="btn btn-outline-primary" onClick={exportarPDF}>
                    Exportar PDF
                </button>

            </div>

            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Código GAMS</th>
                        <th>Nombre del Bien</th>
                        <th>Clasificación</th>
                        <th>Unidad Organizacional</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {edificiosFiltrados.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="text-center">No hay registros</td>
                        </tr>
                    ) : (
                        edificiosFiltrados.map((edificio, index) => (
                            <tr
                                key={edificio.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => abrirModal(edificio.id)}
                            >
                                <td>{index + 1}</td>
                                <td>{edificio.codigo_completo}</td>
                                <td>{edificio.nombre_bien}</td>
                                <td>{edificio.clasificacion}</td>
                                <td>{edificio.unidad_organizacional?.descripcion || ''}</td>
                                <td>{edificio.ubicacion}</td>
                                <td>
                                    <span
                                        className={`badge ${edificio.estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}`}
                                    >
                                        {edificio.estado}
                                    </span>
                                </td>
                                <td>
                                    <Link
                                        to={`/edificios/editar/${edificio.id}`}
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={(e) => e.stopPropagation()} // evita que se abra el modal al editar
                                    >
                                        Editar
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {/* 🏢 Modal Detalle de Edificio */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="lg"
                centered
                scrollable
            >
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>Ficha Técnica del Edificio</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {!edificioSeleccionado ? (
                        <div className="text-center py-4">Cargando datos...</div>
                    ) : (
                        <div className="container-fluid">
                            {/* 🔹 Sección: Información General */}
                            <h6 className="text-primary fw-bold mt-2 mb-3">📄 Información General</h6>
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <strong>Código GAMS:</strong>
                                    <div className="text-muted small">{edificioSeleccionado.codigo_completo}</div>
                                </div>

                                <div className="col-md-12">
                                    <strong>Nombre del Bien:</strong>
                                    <div>{edificioSeleccionado.nombre_bien}</div>
                                </div>

                                <div className="col-md-6">
                                    <strong>Clasificación:</strong>
                                    <div>{edificioSeleccionado.clasificacion}</div>
                                </div>
                                <div className="col-md-6">
                                    <strong>Uso:</strong>
                                    <div>{edificioSeleccionado.uso}</div>
                                </div>
                            </div>

                            <hr />

                            {/* 🔹 Sección: Ubicación y Administración */}
                            <h6 className="text-primary fw-bold mt-3 mb-3">🏢 Ubicación y Administración</h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <strong>Unidad Organizacional:</strong>
                                    <div>{edificioSeleccionado.unidad_organizacional?.descripcion || '—'}</div>
                                </div>
                                <div className="col-md-6">
                                    <strong>Responsable:</strong>
                                    <div>{edificioSeleccionado.responsable?.nombre || '—'}</div>
                                </div>
                                <div className="col-md-6">
                                    <strong>Cargo:</strong>
                                    <div>{edificioSeleccionado.cargo?.cargo || '—'}</div>
                                </div>
                                <div className="col-md-6">
                                    <strong>Ubicación:</strong>
                                    <div>{edificioSeleccionado.ubicacion}</div>
                                </div>
                                <div className="col-md-6">
                                    <strong>Dirección Administrativa:</strong>
                                    <div>{edificioSeleccionado.codigo_direccion_administrativa || '—'}</div>
                                </div>
                                <div className="col-md-6">
                                    <strong>Distrito:</strong>
                                    <div>{edificioSeleccionado.codigo_distrito || '—'}</div>
                                </div>
                                <div className="col-md-6">
                                    <strong>Sector / Área:</strong>
                                    <div>{edificioSeleccionado.codigo_sector_area || '—'}</div>
                                </div>
                                <div className="col-md-6">
                                    <strong>Ambiente:</strong>
                                    <div>{edificioSeleccionado.codigo_ambiente || '—'}</div>
                                </div>
                            </div>

                            <hr />

                            {/* 🔹 Sección: Datos de Ingreso */}
                            <h6 className="text-primary fw-bold mt-3 mb-3">🧾 Datos de Ingreso</h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <strong>Ingreso:</strong>
                                    <div>{edificioSeleccionado.ingreso || '—'}</div>
                                </div>
                                <div className="col-md-6">
                                    <strong>Descripción Ingreso:</strong>
                                    <div>{edificioSeleccionado.descripcion_ingreso || '—'}</div>
                                </div>
                                <div className="col-md-4">
                                    <strong>Fecha Factura / Donación:</strong>
                                    <div>{edificioSeleccionado.fecha_factura_donacion || '—'}</div>
                                </div>
                                <div className="col-md-4">
                                    <strong>Nro. Factura:</strong>
                                    <div>{edificioSeleccionado.nro_factura || '—'}</div>
                                </div>
                                <div className="col-md-4">
                                    <strong>Proveedor / Donante:</strong>
                                    <div>{edificioSeleccionado.proveedor_donante || '—'}</div>
                                </div>
                            </div>

                            <hr />

                            {/* 🔹 Sección: Aspectos Legales */}
                            <h6 className="text-primary fw-bold mt-3 mb-3">📚 Respaldo Legal</h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <strong>Respaldo Legal:</strong>
                                    <div>{edificioSeleccionado.respaldo_legal || '—'}</div>
                                </div>
                                <div className="col-md-6">
                                    <strong>Descripción Respaldo:</strong>
                                    <div>{edificioSeleccionado.descripcion_respaldo_legal || '—'}</div>
                                </div>
                            </div>

                            <hr />

                            {/* 🔹 Sección: Características Físicas */}
                            <h6 className="text-primary fw-bold mt-3 mb-3">🏗️ Características Físicas</h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <strong>Superficie (m²):</strong>
                                    <div>{edificioSeleccionado.superficie || '—'}</div>
                                </div>
                                <div className="col-md-4">
                                    <strong>Valor (Bs):</strong>
                                    <div>{edificioSeleccionado.valor_bs || '—'}</div>
                                </div>
                                <div className="col-md-4">
                                    <strong>Vida útil (años):</strong>
                                    <div>{edificioSeleccionado.vida_util_anios || '—'}</div>
                                </div>
                                <div className="col-md-6">
                                    <strong>Estado de Conservación:</strong>
                                    <div>{edificioSeleccionado.estado_conservacion || '—'}</div>
                                </div>
                                <div className="col-md-6">
                                    <strong>Servicios:</strong>
                                    <div>{edificioSeleccionado.servicios?.join(', ') || '—'}</div>
                                </div>
                            </div>

                            <hr />

                            {/* 🔹 Sección: Observaciones y Estado */}
                            <h6 className="text-primary fw-bold mt-3 mb-3">📝 Observaciones</h6>
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <div className="border rounded p-2 bg-light">
                                        {edificioSeleccionado.observaciones || 'Sin observaciones'}
                                    </div>
                                </div>
                            </div>

                            <div className="row g-3 mt-3">
                                <div className="col-md-6">
                                    <strong>Estado:</strong>
                                    <div>
                                        <span
                                            className={`badge ${edificioSeleccionado.estado === 'ACTIVO'
                                                ? 'bg-success'
                                                : 'bg-secondary'
                                                }`}
                                        >
                                            {edificioSeleccionado.estado}
                                        </span>
                                    </div>
                                </div>

                                {edificioSeleccionado.codigo_qr && (
                                    <div className="col-md-12 text-center mt-4">
                                        <strong>QR de Identificación:</strong>
                                        <div className="mt-2">
                                            <img
                                                src={edificioSeleccionado.codigo_qr}
                                                alt="QR del Edificio"
                                                width="150"
                                                height="150"
                                                style={{ border: '2px solid #ddd', borderRadius: '8px', padding: '5px', backgroundColor: '#fff' }}
                                            />
                                        </div>
                                        <div className="small text-muted mt-2">
                                            Escanea para ver detalles del edificio
                                        </div>
                                    </div>
                                )}


                                <div className="col-md-6 text-end text-muted small">
                                    <div>
                                        <strong>Creado:</strong>{' '}
                                        {new Date(edificioSeleccionado.created_at).toLocaleDateString('es-BO')}
                                    </div>
                                    {edificioSeleccionado.updated_at && (
                                        <div>
                                            <strong>Actualizado:</strong>{' '}
                                            {new Date(edificioSeleccionado.updated_at).toLocaleDateString('es-BO')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="outline-danger"
                        onClick={() => exportarFichaPDF(edificioSeleccionado.id)}
                    >
                        Exportar Ficha PDF
                    </Button>


                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default ListaEdificios;
