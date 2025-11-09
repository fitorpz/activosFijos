import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import { Button } from 'react-bootstrap';

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

const ListaEdificios = () => {
    const [edificios, setEdificios] = useState<Edificio[]>([]);
    const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'ACTIVO' | 'INACTIVO'>('todos');
    const [descargando, setDescargando] = useState(false);

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
            setDescargando(true);
            const res = await axiosInstance.get('/activos-fijos/edificios/exportar/pdf', {
                responseType: 'blob',
                params: { estado: estadoFiltro },
            });

            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `edificios-${estadoFiltro}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('❌ Error al exportar PDF:', error);
        } finally {
            setDescargando(false);
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
                <Button
                    variant="outline-primary"
                    className="ms-3"
                    onClick={exportarPDF}
                    disabled={descargando}
                >
                    {descargando ? 'Exportando...' : 'Exportar PDF'}
                </Button>
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
                            <td colSpan={8} className="text-center">
                                No hay registros
                            </td>
                        </tr>
                    ) : (
                        edificiosFiltrados.map((edificio, index) => (
                            <tr key={edificio.id}>
                                <td>{index + 1}</td>
                                <td>{edificio.codigo_completo}</td>
                                <td>{edificio.nombre_bien}</td>
                                <td>{edificio.clasificacion}</td>
                                <td>{edificio.unidad_organizacional?.descripcion || ''}</td>
                                <td>{edificio.ubicacion}</td>
                                <td>
                                    <span
                                        className={`badge ${edificio.estado === 'ACTIVO'
                                                ? 'bg-success'
                                                : 'bg-secondary'
                                            }`}
                                    >
                                        {edificio.estado}
                                    </span>
                                </td>
                                <td>
                                    <Link
                                        to={`/edificios/editar/${edificio.id}`}
                                        className="btn btn-sm btn-warning me-2"
                                    >
                                        Editar
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ListaEdificios;
