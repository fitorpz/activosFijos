import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface UnidadOrganizacional {
    id: number;
    codigo: string;
    descripcion: string;
}

interface Ambiente {
    id: number;
    codigo: string;
    descripcion: string;
}

interface CargoData {
    area: string;
    unidad_organizacional: string;
    ambiente: string;
    ambiente_id: string | number | null;
    codigo: string;
    cargo: string;
    estado: 'ACTIVO' | 'INACTIVO';
}

const EditarCargos = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<CargoData>({
        area: '',
        unidad_organizacional: '',
        ambiente: '',
        ambiente_id: '',
        codigo: '',
        cargo: '',
        estado: 'ACTIVO',
    });

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensajeError, setMensajeError] = useState<string | null>(null);

    // Headers autenticados
    const authHeaders = () => {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
    };

    // Busca el ID de una unidad organizacional a partir de su código
    const buscarUnidadOrganizacionalId = async (codigo: string): Promise<number | null> => {
        if (!codigo) return null;
        try {
            const res = await axios.get<UnidadOrganizacional[]>(
                '/parametros/unidades-organizacionales/buscar',
                {
                    headers: authHeaders(),
                    params: { q: codigo }
                }
            );
            if (Array.isArray(res.data) && res.data.length > 0) {
                return res.data[0].id;
            }
        } catch (e) {
            console.error('Error buscando unidad organizacional:', e);
        }
        return null;
    };

    // Busca el ID de un ambiente dado el ID de la unidad organizacional y el código de ambiente
    const buscarAmbienteId = async (
        unidad_organizacional_id: number,
        ambiente_codigo: string
    ): Promise<number | null> => {
        try {
            const res = await axios.get<Ambiente[]>(
                '/parametros/ambientes/buscar',
                {
                    headers: authHeaders(),
                    params: {
                        unidad_organizacional_id,
                        search: ambiente_codigo
                    }
                }
            );
            if (Array.isArray(res.data) && res.data.length > 0) {
                return res.data[0].id;
            }
        } catch (e) {
            console.error('Error buscando ambiente:', e);
        }
        return null;
    };

    useEffect(() => {
        const cargarCargo = async () => {
            setCargando(true);
            setMensajeError(null);

            try {
                // 1. Obtén los datos del cargo
                const res = await axios.get<CargoData>(
                    `/parametros/cargos/${id}`,
                    { headers: authHeaders() }
                );

                let ambiente_id: string | number | null = res.data.ambiente_id ?? '';
                // 2. Regulariza ambiente_id si es null pero hay códigos válidos
                if ((!ambiente_id || ambiente_id === '') && res.data.ambiente && res.data.unidad_organizacional) {
                    const unidad_organizacional_id = await buscarUnidadOrganizacionalId(res.data.unidad_organizacional);
                    if (unidad_organizacional_id) {
                        const nuevo_ambiente_id = await buscarAmbienteId(unidad_organizacional_id, res.data.ambiente);
                        if (nuevo_ambiente_id) {
                            ambiente_id = nuevo_ambiente_id;
                        }
                    }
                }

                setFormData({
                    area: res.data.area,
                    unidad_organizacional: res.data.unidad_organizacional,
                    ambiente: res.data.ambiente,
                    ambiente_id,
                    codigo: res.data.codigo,
                    cargo: res.data.cargo,
                    estado: res.data.estado || 'ACTIVO',
                });

            } catch (error) {
                console.error('Error al cargar cargo:', error);
                setMensajeError('No se pudo cargar el cargo.');
            } finally {
                setCargando(false);
            }
        };

        cargarCargo();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        setMensajeError(null);

        try {
            await axios.put(
                `/parametros/cargos/${id}`,
                {
                    cargo: formData.cargo,
                    estado: formData.estado,
                    ambiente_id: formData.ambiente_id ? Number(formData.ambiente_id) : null
                },
                { headers: authHeaders() }
            );
            alert('✅ Cargo actualizado correctamente');
            navigate('/parametros/cargos');
        } catch (error) {
            console.error('Error al actualizar cargo:', error);
            setMensajeError('Ocurrió un error al actualizar el cargo.');
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return <div className="container mt-4">Cargando datos...</div>;
    }

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header bg-warning text-dark">
                    <h5 className="mb-0">Editar Cargo</h5>
                </div>
                <div className="card-body">
                    {mensajeError && <div className="alert alert-danger">{mensajeError}</div>}
                    <form onSubmit={handleSubmit}>
                        {/* Campos no editables */}
                        <div className="mb-3">
                            <label className="form-label">Área</label>
                            <input type="text" className="form-control" value={formData.area} disabled />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Unidad Organizacional</label>
                            <input type="text" className="form-control" value={formData.unidad_organizacional} disabled />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Ambiente</label>
                            <input type="text" className="form-control" value={formData.ambiente} disabled />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Código</label>
                            <input type="text" className="form-control" value={formData.codigo} disabled />
                        </div>
                        {/* Campos editables */}
                        <div className="mb-3">
                            <label className="form-label">Descripción / Cargo</label>
                            <input
                                type="text"
                                className="form-control"
                                name="cargo"
                                value={formData.cargo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary" disabled={guardando}>
                                {guardando ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/parametros/cargos')}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarCargos;
