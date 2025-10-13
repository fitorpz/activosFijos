import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';

export interface Usuario {
    id: number;
    nombre: string;
    rol?: string;
}

interface Edificio {
    id_311: number;
    codigo_311: string;
    ingreso_311: string;
    ingreso_des_311: string;
    clasificacion_311: string;
    uso_actual_311: string;
    fecha_alta_311: string;
    estado: 'ACTIVO' | 'INACTIVO';

    // NUEVOS CAMPOS
    descripcion_edificio?: string;
    estado_activo?: string;
    superficie_311_1?: number;
    observaciones_ubi?: string;

    nombre_area?: string;
    unidad_organizacional?: string;
    ambiente?: string;
    cargo?: string;
    nombre_auxiliar?: string;
    nucleo?: string;
    distrito?: string;
    direccion_administrativa?: string;
    ciudad?: string;

    energia_electrica?: boolean;
    gas_domiciliario?: boolean;
    alcantarillado?: boolean;
    agua?: boolean;
    telefono?: boolean;
    celular?: boolean;
    internet?: boolean;

    // Otros si aplica
    creadoPor?: Usuario;
    actualizadoPor?: Usuario;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
}


const ListaEdificios = () => {
    const [edificios, setEdificios] = useState<Edificio[]>([]);
    const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const [edificioSeleccionado, setEdificioSeleccionado] = useState<Edificio | null>(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [estadoFiltro, setEstadoFiltro] = useState('activos');
    const navigate = useNavigate();

    useEffect(() => {
        obtenerEdificios();
    }, [estadoFiltro]);

    const obtenerEdificios = async () => {
        try {
            const res = await axiosInstance.get('/edificios', {
                params: {
                    estado:
                        estadoFiltro === 'activos'
                            ? 'ACTIVO'
                            : estadoFiltro === 'inactivos'
                                ? 'INACTIVO'
                                : 'todos',
                },
            });
            const data = res.data as { data: Edificio[] };
            setEdificios(data.data);
        } catch (error) {
            console.error('❌ Error al obtener edificios:', error);
        }
    };

    const cambiarEstadoEdificio = async (id: number, estado: string) => {
        if (!window.confirm(`¿Seguro que deseas ${estado === 'ACTIVO' ? 'inactivar' : 'activar'} este edificio?`)) return;
        try {
            if (estado === 'ACTIVO') {
                await axiosInstance.delete(`/edificios/${id}`);
            } else {
                await axiosInstance.put(`/edificios/restaurar/${id}`);
            }
            obtenerEdificios();
        } catch (error) {
            console.error('❌ Error al cambiar estado:', error);
        }
    };

    const exportarPDF = async () => {
        const estadoParam =
            estadoFiltro === 'activos' ? 'ACTIVO' : estadoFiltro === 'inactivos' ? 'INACTIVO' : 'todos';
        try {
            const res = await axiosInstance.get(`/edificios/exportar/pdf?estado=${estadoParam}`, {
                responseType: 'blob',
            });
            const blob = new Blob([res.data as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('❌ Error al exportar PDF:', error);
            alert('Ocurrió un error al exportar el PDF.');
        }
    };

    const abrirModal = (edificio: Edificio) => {
        setEdificioSeleccionado(edificio);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setEdificioSeleccionado(null);
    };

    const imprimirSeleccionados = async () => {
        if (seleccionados.length === 0) {
            alert('Selecciona al menos un edificio para imprimir.');
            return;
        }

        try {
            const res = await axiosInstance.get('/tickets/imprimir-multiple', {
                params: { ids: seleccionados.join(',') },
                responseType: 'blob',
            });

            const blob = new Blob([res.data as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error: any) {
            console.error('Error al generar PDF:', error);
            alert(error?.response?.data?.message || '❌ Error al generar los stickers.');
        }
    };

    const camposVisibles = [
        { key: 'nombre_area', label: 'Área' },
        { key: 'unidad_organizacional_nombre', label: 'Unidad Organizacional' },
        { key: 'ambiente_nombre', label: 'Ambiente' },
        { key: 'nombre_cargo', label: 'Cargo' },
        { key: 'nombre_auxiliar', label: 'Auxiliar' },
        { key: 'nombre_nucleo', label: 'Núcleo' },
        { key: 'nombre_distrito', label: 'Distrito' },
        { key: 'nombre_direccion_administrativa', label: 'Dirección Administrativa' },
        { key: 'nombre_ciudad', label: 'Ciudad' },

        { key: 'codigo_311', label: 'Código' },
        { key: 'estado_activo', label: 'Estado del Activo' },
        { key: 'descripcion_edificio', label: 'Descripción' },
        { key: 'ingreso_311', label: 'Tipo de Ingreso' },
        { key: 'ingreso_des_311', label: 'Descripción del Ingreso' },
        { key: 'fecha_alta_311', label: 'Fecha de Alta' },

        { key: 'clasificacion_311_1', label: 'Clasificación' },
        { key: 'uso_311_1', label: 'Uso' },
        { key: 'superficie_311_1', label: 'Superficie (m²)' },

        // Servicios básicos
        { key: 'energia_electrica', label: 'Energía Eléctrica' },
        { key: 'gas_domiciliario', label: 'Gas Domiciliario' },
        { key: 'alcantarillado', label: 'Alcantarillado' },
        { key: 'agua', label: 'Agua' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'celular', label: 'Celular' },
        { key: 'internet', label: 'Internet' },

        { key: 'observaciones_ubi', label: 'Observaciones Técnicas' },
    ];


    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0">Edificios – Grupo Contable 311.00</h4>
                    <p className="text-muted small">Gestión de activos fijos registrados</p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    <button className="btn btn-primary" onClick={() => navigate('/edificios/nuevo')}>
                        <i className="bi bi-plus-lg me-1"></i> Nuevo Edificio
                    </button>

                    <button className="btn btn-outline-success" onClick={exportarPDF}>
                        <i className="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
                    </button>

                    <button className="btn btn-outline-secondary" onClick={() => navigate('/Dashboard')}>
                        <i className="bi bi-arrow-left me-1"></i> Volver a Activos Fijos
                    </button>

                    <div style={{ minWidth: '160px' }}>
                        <select
                            id="filtro-estado"
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value)}
                            className="form-select"
                        >
                            <option value="todos">Todos</option>
                            <option value="activos">Solo Activos</option>
                            <option value="inactivos">Solo Inactivos</option>
                        </select>
                    </div>
                </div>
            </div>

            {seleccionados.length > 0 && (
                <div className="mb-3">
                    <button className="btn btn-success" onClick={imprimirSeleccionados}>
                        <i className="bi bi-printer-fill me-1"></i> Imprimir Stickers Seleccionados
                    </button>
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>Nro.</th>
                            <th>Código</th>
                            <th>Fecha Alta</th>
                            <th>Ingreso</th>
                            <th>Clasificación</th>
                            <th>Uso Actual</th>
                            <th>Estado</th>
                            <th>Creado por</th>
                            <th>Creación</th>
                            <th>Actualizado por</th>
                            <th>Actualización</th>
                            <th>Acciones</th>
                            <th>Seleccionar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {edificios.length > 0 ? (
                            edificios.map((e, index) => (
                                <tr key={e.id_311}>
                                    <td>{index + 1}</td>
                                    <td>{e.codigo_311 || '—'}</td>
                                    <td>{e.fecha_alta_311 ? new Date(e.fecha_alta_311).toLocaleDateString('es-BO') : '—'}</td>
                                    <td>{`${e.ingreso_311 || '—'} - ${e.ingreso_des_311 || '—'}`}</td>
                                    <td>{e.clasificacion_311 || 'Sin clasificar'}</td>
                                    <td>{e.uso_actual_311 || 'N/D'}</td>
                                    <td>
                                        <span className={`badge ${e.estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}`}>
                                            {e.estado}
                                        </span>
                                    </td>
                                    <td>{e.creadoPor?.nombre || '—'}</td>
                                    <td>{e.fecha_creacion ? new Date(e.fecha_creacion).toLocaleDateString('es-BO') : '—'}</td>
                                    <td>{e.actualizadoPor?.nombre || '—'}</td>
                                    <td>{e.fecha_actualizacion ? new Date(e.fecha_actualizacion).toLocaleDateString('es-BO') : '—'}</td>
                                    <td>
                                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                                            <button
                                                className="btn btn-warning btn-sm"
                                                title="Editar"
                                                onClick={() => navigate(`/edificios/editar/${e.id_311}`)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                            <button
                                                className={`btn btn-sm ${e.estado === 'ACTIVO' ? 'btn-outline-secondary' : 'btn-success'}`}
                                                title={e.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                                                onClick={() => cambiarEstadoEdificio(e.id_311, e.estado)}
                                            >
                                                <i className="bi bi-arrow-repeat"></i>
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm text-white"
                                                title="Ver"
                                                onClick={() => abrirModal(e)}
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={seleccionados.includes(e.id_311)}
                                            onChange={(ev) => {
                                                if (ev.target.checked) {
                                                    setSeleccionados([...seleccionados, e.id_311]);
                                                } else {
                                                    setSeleccionados(seleccionados.filter(id => id !== e.id_311));
                                                }
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={13} className="text-center">
                                    No hay edificios registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Ver */}
            {mostrarModal && edificioSeleccionado && (
                <div className="modal show d-block" tabIndex={-1} role="dialog">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Detalles del Edificio</h5>
                                <button type="button" className="btn-close" onClick={cerrarModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    {camposVisibles.map(({ key, label }) => (
                                        <div className="col-md-6 mb-2" key={key}>
                                            <strong>{label}:</strong><br />
                                            <span>{(edificioSeleccionado as any)[key] ?? '—'}</span>
                                        </div>
                                    ))}

                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={cerrarModal}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaEdificios;
