import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';
import AsyncSelect from 'react-select/async';

interface Area {
    id: number;
    codigo: string;
    descripcion: string;
}

interface UnidadOrganizacional {
    id: number;
    codigo: string;
    descripcion: string;
    area: Area;
}

interface Ambiente {
    id: number;
    codigo: string;
    descripcion: string;
    unidad_organizacional: UnidadOrganizacional;
}

const EditarAmbientes = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        area_id: '',
        unidad_organizacional_id: '',
    });

    const [areas, setAreas] = useState<Area[]>([]);
    const [unidadSeleccionada, setUnidadSeleccionada] = useState<any>(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const cargarAreas = async () => {
        try {
            const res = await axios.get<Area[]>('/parametros/areas', {
                params: { estado: 'ACTIVO' },
            });
            setAreas(res.data);
        } catch (error) {
            console.error('❌ Error al cargar áreas:', error);
        }
    };

    const obtenerAmbiente = async () => {
        try {
            const res = await axios.get<Ambiente>(`/parametros/ambientes/${id}`);
            const ambiente = res.data;

            setFormData({
                codigo: ambiente.codigo || '',
                descripcion: ambiente.descripcion || '',
                area_id: ambiente.unidad_organizacional.area.id.toString(),
                unidad_organizacional_id: ambiente.unidad_organizacional.id.toString(),
            });

            setUnidadSeleccionada({
                value: ambiente,
                label: `${ambiente.unidad_organizacional.codigo} - ${ambiente.unidad_organizacional.descripcion}`,
            });
        } catch (error) {
            console.error('❌ Error al cargar el ambiente:', error);
            alert('Error al cargar el ambiente. Intente nuevamente.');
            navigate('/parametros/ambientes');
        } finally {
            setCargando(false);
        }
    };

    const areaIdActual = () => {
        return formData.area_id || '';
    };

    const buscarUnidadesAsync = async (inputValue: string) => {
        const area_id = areaIdActual();
        if (!area_id) return [];

        try {
            const res = await axios.get<UnidadOrganizacional[]>('/parametros/unidades-organizacionales/buscar', {
                params: {
                    estado: 'ACTIVO',
                    area_id,
                    q: inputValue
                }
            });

            return res.data.map((unidad) => ({
                value: unidad,
                label: `${unidad.codigo} - ${unidad.descripcion}`
            }));
        } catch (error) {
            console.error('❌ Error al buscar unidades organizacionales:', error);
            return [];
        }
    };

    const generarCodigo = async (unidad: UnidadOrganizacional) => {
        try {
            const res = await axios.get<{ total: number }>('/parametros/ambientes/contar', {
                params: { unidad_id: unidad.id },
            });

            const correlativo = (res.data.total + 1).toString().padStart(2, '0');
            const nuevoCodigo = `${unidad.codigo}.${correlativo}`;

            setFormData(prev => ({ ...prev, codigo: nuevoCodigo }));
        } catch (error) {
            console.error('❌ Error al generar código automático:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'area_id') {
            setFormData(prev => ({
                ...prev,
                area_id: value,
                unidad_organizacional_id: '',
                codigo: '',
            }));
            setUnidadSeleccionada(null);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleUnidadChange = (opcion: any) => {
        if (!opcion) return;
        const unidad = opcion.value;
        setUnidadSeleccionada(opcion);
        setFormData(prev => ({
            ...prev,
            unidad_organizacional_id: unidad.id,
            area_id: unidad.area.id,
        }));
        generarCodigo(unidad);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        try {
            const payload = {
                codigo: formData.codigo.trim(),
                descripcion: formData.descripcion.trim(),
                unidad_organizacional_id: formData.unidad_organizacional_id,
            };

            await axios.put(`/parametros/ambientes/${id}`, payload);
            alert('✅ Ambiente actualizado correctamente.');
            navigate('/parametros/ambientes');
        } catch (error: any) {
            console.error('❌ Error al actualizar el ambiente:', error);
            alert(error?.response?.data?.message || 'Error al actualizar.');
        } finally {
            setGuardando(false);
        }
    };

    useEffect(() => {
        cargarAreas();
        obtenerAmbiente();
    }, []);

    return (
        <div className="container mt-4">
            <div className="form-container">
                <h4 className="mb-4">Editar Ambiente</h4>
                {cargando ? (
                    <p>Cargando datos...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                        <div className="mb-3">
                            <label htmlFor="area_id" className="form-label">Área</label>
                            <select
                                id="area_id"
                                name="area_id"
                                className="form-select"
                                value={formData.area_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione un área</option>
                                {areas.map(area => (
                                    <option key={area.id} value={area.id}>
                                        {area.codigo} - {area.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Unidad Organizacional</label>
                            <AsyncSelect
                                cacheOptions
                                loadOptions={buscarUnidadesAsync}
                                defaultOptions
                                isDisabled={!formData.area_id}
                                placeholder="Buscar unidad organizacional..."
                                value={unidadSeleccionada}
                                onChange={handleUnidadChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="codigo" className="form-label">Código</label>
                            <input
                                type="text"
                                id="codigo"
                                name="codigo"
                                className="form-control"
                                value={formData.codigo}
                                readOnly
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="descripcion" className="form-label">Descripción</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                className="form-control"
                                value={formData.descripcion}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary" disabled={guardando}>
                                {guardando ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/parametros/ambientes')}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditarAmbientes;
