import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    area_id: number;
}

type OptionUnidad = {
    value: string;          // id como string
    label: string;          // "codigo - descripcion"
    area_id: number;        // 👈 extra para validar
};

const RegistroAmbientes = () => {
    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        area_id: '',
        unidad_organizacional_id: '',
    });

    const [areas, setAreas] = useState<Area[]>([]);
    const [unidades, setUnidades] = useState<UnidadOrganizacional[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => { cargarAreas(); }, []);

    useEffect(() => {
        if (formData.area_id) {
            cargarUnidadesPorArea(parseInt(formData.area_id, 10));
        } else {
            setUnidades([]);
            setFormData(prev => ({ ...prev, unidad_organizacional_id: '', codigo: '' }));
        }
    }, [formData.area_id]);

    useEffect(() => {
        if (formData.unidad_organizacional_id) {
            generarCodigo(parseInt(formData.unidad_organizacional_id, 10));
        } else {
            setFormData(prev => ({ ...prev, codigo: '' }));
        }
    }, [formData.unidad_organizacional_id]);

    const cargarAreas = async () => {
        try {
            const res = await axios.get<Area[]>('/parametros/areas', { params: { estado: 'ACTIVO' } });
            setAreas(res.data);
        } catch (e) {
            console.error('❌ Error al cargar áreas:', e);
        }
    };

    const cargarUnidadesPorArea = async (areaId: number) => {
        try {
            const res = await axios.get<UnidadOrganizacional[]>('/parametros/unidades-organizacionales', {
                params: { estado: 'ACTIVO', area_id: areaId },   // 👈 filtra por área
            });
            setUnidades(res.data);
        } catch (e) {
            console.error('❌ Error al cargar unidades organizacionales:', e);
        }
    };

    // 👉 convierte una unidad en opción de AsyncSelect
    const toOption = (u: UnidadOrganizacional): OptionUnidad => ({
        value: String(u.id),
        label: `${u.codigo} - ${u.descripcion}`,
        area_id: u.area_id,
    });

    // 🔎 búsqueda remota + filtro por área (server-side)
    const buscarUnidadesAsync = async (inputValue: string): Promise<OptionUnidad[]> => {
        if (!formData.area_id) return [];

        try {
            const res = await axios.get<UnidadOrganizacional[]>('/parametros/unidades-organizacionales/buscar', {
                params: {
                    estado: 'ACTIVO',
                    area_id: parseInt(formData.area_id, 10),   // 👈 siempre enviar area_id
                    q: inputValue || '',
                },
            });

            // ⚠️ defensa extra: si el backend no filtrara, filtramos aquí:
            const areaIdNum = parseInt(formData.area_id, 10);
            const filtradas = res.data.filter(u => u.area_id === areaIdNum);

            return filtradas.map(toOption);
        } catch (e) {
            console.error('❌ Error al buscar unidades organizacionales:', e);
            return [];
        }
    };

    const generarCodigo = async (unidadId: number) => {
        try {
            const res = await axios.get<{ total: number }>('/parametros/ambientes/contar', {
                params: { unidad_id: unidadId },
            });

            const unidad = unidades.find(u => u.id === unidadId);
            if (!unidad) return;

            const total = res.data.total || 0;
            const correlativo = String(total + 1).padStart(2, '0');
            const codigoGenerado = `${unidad.codigo}.${correlativo}`;

            setFormData(prev => ({ ...prev, codigo: codigoGenerado }));
        } catch (e) {
            console.error('❌ Error al generar código automático:', e);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'area_id' ? { unidad_organizacional_id: '', codigo: '' } : {}),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { codigo, descripcion, area_id, unidad_organizacional_id } = formData;

        if (!codigo || !descripcion || !area_id || !unidad_organizacional_id) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        setCargando(true);
        try {
            const payload = {
                codigo: codigo.trim(),
                descripcion: descripcion.trim(),
                unidad_organizacional_id: parseInt(unidad_organizacional_id, 10),
            };

            await axios.post('/parametros/ambientes', payload);
            alert('✅ Ambiente registrado con éxito.');
            navigate('/parametros/ambientes');
        } catch (e: any) {
            console.error('❌ Error al registrar ambiente:', e);
            setError(e?.response?.data?.message || 'Error inesperado al registrar.');
        } finally {
            setCargando(false);
        }
    };

    const selectedOption: OptionUnidad | null = (() => {
        if (!formData.unidad_organizacional_id) return null;
        const u = unidades.find(x => String(x.id) === formData.unidad_organizacional_id);
        return u ? toOption(u) : null;
    })();

    return (
        <div className="container mt-4">
            <h4 className="mb-3">Registrar Ambiente</h4>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                {/* Área */}
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

                {/* Unidad Organizacional */}
                <div className="mb-3">
                    <label className="form-label">Unidad Organizacional</label>
                    <AsyncSelect<OptionUnidad, false>
                        key={formData.area_id || 'no-area'}         // 👈 resetea caché al cambiar área
                        cacheOptions={false}                         // 👈 evita resultados viejos
                        loadOptions={buscarUnidadesAsync}
                        defaultOptions={unidades.map(toOption)}     // 👈 lista inicial solo de esa área
                        isDisabled={!formData.area_id}
                        placeholder={formData.area_id ? 'Escriba para buscar...' : 'Seleccione un área primero'}
                        value={selectedOption}
                        onChange={(opcion) => {
                            if (!opcion) {
                                setFormData(prev => ({ ...prev, unidad_organizacional_id: '', codigo: '' }));
                                return;
                            }
                            // 🚧 defensa extra: evita seleccionar una unidad de otra área
                            const areaIdNum = parseInt(formData.area_id, 10);
                            if (opcion.area_id !== areaIdNum) {
                                alert('La unidad seleccionada no pertenece al área elegida.');
                                setFormData(prev => ({ ...prev, unidad_organizacional_id: '', codigo: '' }));
                                return;
                            }
                            setFormData(prev => ({ ...prev, unidad_organizacional_id: opcion.value }));
                        }}
                        isClearable
                        noOptionsMessage={() =>
                            formData.area_id ? 'Sin resultados' : 'Seleccione un área primero'
                        }
                    />
                </div>

                {/* Código generado */}
                <div className="mb-3">
                    <label htmlFor="codigo" className="form-label">Código (generado automáticamente)</label>
                    <input
                        type="text"
                        id="codigo"
                        name="codigo"
                        className="form-control"
                        value={formData.codigo}
                        readOnly
                    />
                </div>

                {/* Descripción */}
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
                    <button type="submit" className="btn btn-primary" disabled={cargando}>
                        {cargando ? 'Guardando...' : (<><i className="bi bi-save me-2"></i>Guardar</>)}
                    </button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/parametros/ambientes')}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistroAmbientes;
