import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface Usuario {
    id: number;
    nombre: string;
    rol: string;
    correo: string;
}

interface Ufv {
    id: number;
    fecha: string;
    tc: number;
    estado: 'ACTIVO' | 'INACTIVO';
    creado_por: Usuario;
    actualizado_por?: Usuario;
    created_at: string;
    updated_at?: string;
}

const Ufvs = () => {
    const [ufvs, setUfvs] = useState<Ufv[]>([]);
    const [estadoFiltro, setEstadoFiltro] = useState<string>('activos');
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        obtenerUfvs();
    }, [estadoFiltro]);

    const obtenerUfvs = async () => {
        setCargando(true);
        try {
            const res = await axios.get<Ufv[]>('/parametros/ufvs', {
                params: {
                    estado:
                        estadoFiltro === 'activos'
                            ? 'ACTIVO'
                            : estadoFiltro === 'inactivos'
                                ? 'INACTIVO'
                                : 'todos',
                },
            });
            setUfvs(res.data);
        } catch (error) {
            console.error('❌ Error al obtener ufvs:', error);
        } finally {
            setCargando(false);
        }
    };

    const cambiarEstado = async (id: number) => {
        if (!window.confirm('¿Estás seguro de cambiar el estado de esta ufv?')) return;
        try {
            await axios.put(`/parametros/ufvs/${id}/cambiar-estado`);
            obtenerUfvs();
        } catch (error) {
            console.error('❌ Error al cambiar estado:', error);
        }
    };

    const exportarPDF = async () => {
        //const estado = estadoFiltro === 'activos' ? 'ACTIVO' : estadoFiltro === 'inactivos' ? 'INACTIVO' : 'todos';
        const estado = 'todos';
        try {
            //const res = await axios.get<Blob>(`/parametros/ufvs/exportar/pdf?estado=${estado}`, {
            const res = await axios.get<Blob>(`/parametros/ufvs/exportar/pdf`, {
                responseType: 'blob',
            });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('❌ Error al exportar PDF:', error);
        }
    };

const eliminarUfv = async (id: number) => {
  if (!window.confirm('¿Estás seguro de eliminar esta ufv? Esta acción no se puede deshacer.')) return;
  
  try {
    await axios.delete(`/parametros/ufvs/${id}`);
    // Actualizar la lista luego de eliminar
    obtenerUfvs();
  } catch (error) {
    console.error('❌ Error al eliminar la ufv:', error);
    alert('Ocurrió un error al eliminar la ufv.');
  }
};

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0">Ufvs</h4>
                    <p className="text-muted small">Gestión de Ufvs registradas</p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    <button className="btn btn-primary" onClick={() => navigate('/ufvs/nuevo')}>
                        <i className="bi bi-plus-lg me-1"></i> Nueva Ufv
                    </button>

                    <button className="btn btn-outline-success" onClick={exportarPDF}>
                        <i className="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
                    </button>

                    <button className="btn btn-outline-secondary" onClick={() => navigate('/parametros')}>
                        <i className="bi bi-arrow-left me-1"></i> Volver a Parametros
                    </button>

                    
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Fecha</th>
                            <th>UFV</th>
                            <th>Estado</th>
                            <th>Creado por</th>
                            <th>F. Registro</th>
                            <th>Actualizado por</th>
                            <th>F. Actualización</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan={9} className="text-center">Cargando...</td>
                            </tr>
                        ) : ufvs.length > 0 ? (
                            ufvs.map((ufv, i) => (
                                <tr key={ufv.id}>
                                    <td>{i + 1}</td>
                                    <td>{new Date(ufv.fecha).toLocaleDateString()}</td>
                                    <td>{parseFloat(ufv.tc as any).toFixed(5)}</td>
                                    <td>{ufv.estado}</td>
                                    <td>{ufv.creado_por?.nombre || '—'}</td>
                                    <td>{new Date(ufv.created_at).toLocaleDateString('es-BO')}</td>
                                    <td>{ufv.actualizado_por?.nombre || '—'}</td>
                                    <td>{ufv.updated_at ? new Date(ufv.updated_at).toLocaleDateString('es-BO') : '—'}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => navigate(`/ufvs/editar/${ufv.id}`)}
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                        </button>
                                       <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => eliminarUfv(ufv.id)}
                                            title="Eliminar"
                                            >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                      
                                    </td>
                                        
                                      
                                    
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="text-center">No hay registros.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Ufvs;
