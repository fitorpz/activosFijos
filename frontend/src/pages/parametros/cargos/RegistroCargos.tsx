import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

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

interface Ambiente {
    id: number;
    codigo: string;
    descripcion: string;
}

const RegistroCargos = () => {
    const [formData, setFormData] = useState({
        codigo: '',
        cargo: '',
        estado: 'ACTIVO',
        area_id: '',
        area: '',
        unidad_organizacional_id: '',
        unidad_organizacional: '',
        ambiente_id: '',
        ambiente: '',
    });

    const [areas, setAreas] = useState<Area[]>([]);
    const [sugerenciasUnidades, setSugerenciasUnidades] = useState<UnidadOrganizacional[]>([]);
    const [sugerenciasAmbientes, setSugerenciasAmbientes] = useState<Ambiente[]>([]);
    const [unidadInput, setUnidadInput] = useState('');
    const [ambienteInput, setAmbienteInput] = useState('');
    const [mensajeCodigo, setMensajeCodigo] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const navigate = useNavigate();
    let debounceTimeout: any;

    const authHeaders = () => {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
    };

    // 🔹 Cargar áreas activas
    useEffect(() => {
        const cargarAreas = async () => {
            try {
                const res = await axios.get<Area[]>('/parametros/areas', {
                    params: { estado: 'ACTIVO' },
                    headers: authHeaders(),
                });
                setAreas(res.data);
            } catch (error) {
                console.error('❌ Error al cargar áreas:', error);
            }
        };
        cargarAreas();
    }, []);

    //  Buscar unidades organizacionales por texto y área
    const buscarUnidades = async (texto: string) => {
        if (!formData.area_id) {
            setSugerenciasUnidades([]);
            return;
        }

        try {
            const res = await axios.get<UnidadOrganizacional[]>(
                '/parametros/unidades-organizacionales/buscar',
                {
                    params: {
                        estado: 'ACTIVO',
                        area_id: parseInt(formData.area_id, 10),
                        q: texto || '', // ✅ permite buscar aunque esté vacío
                    },
                    headers: authHeaders(),
                }
            );

            // Filtrar por área localmente también (por seguridad)
            const areaIdNum = parseInt(formData.area_id, 10);
            const filtradas = res.data.filter(u => u.area_id === areaIdNum);

            setSugerenciasUnidades(filtradas);
        } catch (error) {
            console.error('❌ Error al buscar unidades:', error);
            setSugerenciasUnidades([]);
        }
    };


    //  Buscar ambientes por texto y unidad organizacional
    const buscarAmbientes = async (texto: string) => {
        if (!formData.unidad_organizacional_id) {
            setSugerenciasAmbientes([]);
            return;
        }

        try {
            const res = await axios.get<Ambiente[]>(
                '/parametros/ambientes/buscar',
                {
                    params: {
                        search: texto || '', // ✅ permite buscar incluso vacío
                        unidad_organizacional_id: formData.unidad_organizacional_id,
                    },
                    headers: authHeaders(),
                }
            );
            setSugerenciasAmbientes(res.data);
        } catch (error) {
            console.error('❌ Error al buscar ambientes:', error);
            setSugerenciasAmbientes([]);
        }
    };


    //  Cambiar valores del formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'area_id') {
            const areaSeleccionada = areas.find((a) => a.id.toString() === value);
            setFormData((prev) => ({
                ...prev,
                area_id: value,
                area: areaSeleccionada?.codigo || '',
                unidad_organizacional_id: '',
                unidad_organizacional: '',
                ambiente_id: '',
                ambiente: '',
                codigo: '',
            }));
            setUnidadInput('');
            setAmbienteInput('');
            setSugerenciasUnidades([]);
            setSugerenciasAmbientes([]);
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    //  Generar código automático
    const generarCodigo = async (ambienteCodigo: string) => {
        try {
            const res = await axios.get<{ codigo: string }>(
                `/parametros/cargos/siguiente-codigo`,
                {
                    params: { ambiente_codigo: ambienteCodigo },
                    headers: authHeaders(),
                }
            );
            setFormData((prev) => ({ ...prev, codigo: res.data.codigo }));
        } catch (error) {
            console.error('❌ Error generando código:', error);
            setMensajeCodigo('⚠️ No se pudo generar el código automáticamente.');
        }
    };

    //  Enviar formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.area || !formData.unidad_organizacional || !formData.ambiente) {
            alert('Por favor selecciona Área, Unidad y Ambiente.');
            return;
        }

        setCargando(true);

        try {
            await axios.post(
                '/parametros/cargos',
                {
                    ...formData,
                    ambiente_id: Number(formData.ambiente_id),
                    cargo: formData.cargo.trim(),
                },
                { headers: authHeaders() }
            );

            alert('✅ Cargo registrado correctamente.');
            navigate('/parametros/cargos');
        } catch (error) {
            console.error('❌ Error al registrar cargo:', error);
            alert('❌ Ocurrió un error al registrar el cargo.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container mt-4">
            <div
                className="mx-auto p-4 border rounded shadow"
                style={{ maxWidth: '700px', backgroundColor: '#fff' }}
            >
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm mb-3 d-inline-flex align-items-center"
                    onClick={() => navigate('/parametros/cargos')}
                >
                    <i className="bi bi-arrow-left me-1"></i> Volver
                </button>

                <h4 className="mb-4">Registrar Cargo</h4>

                <form onSubmit={handleSubmit}>
                    {/* Área */}
                    <div className="mb-3">
                        <label className="form-label">Área</label>
                        <select
                            className="form-select"
                            name="area_id"
                            value={formData.area_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione un área</option>
                            {areas.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.codigo} - {a.descripcion}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Unidad Organizacional */}
                    <div className="mb-3 position-relative">
                        <label className="form-label">Unidad Organizacional</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar unidad organizacional..."
                            value={unidadInput}
                            disabled={!formData.area_id}
                            onFocus={() => buscarUnidades('')} // 👈 carga sugerencias al hacer click
                            onChange={(e) => {
                                const texto = e.target.value;
                                setUnidadInput(texto);
                                clearTimeout(debounceTimeout);
                                debounceTimeout = setTimeout(() => buscarUnidades(texto), 300);
                            }}
                            required
                        />

                        {sugerenciasUnidades.length > 0 && (
                            <ul className="list-group position-absolute w-100 z-3">
                                {sugerenciasUnidades.map((u) => (
                                    <li
                                        key={u.id}
                                        className="list-group-item list-group-item-action"
                                        onClick={() => {
                                            setUnidadInput(`${u.codigo} - ${u.descripcion}`);
                                            setFormData((prev) => ({
                                                ...prev,
                                                unidad_organizacional_id: u.id.toString(),
                                                unidad_organizacional: u.codigo,
                                                ambiente_id: '',
                                                ambiente: '',
                                                codigo: '',
                                            }));
                                            setSugerenciasUnidades([]);
                                            setAmbienteInput('');
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {u.codigo} - {u.descripcion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {/* Ambiente */}
                    <div className="mb-3 position-relative">
                        <label className="form-label">Ambiente</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar ambiente..."
                            value={ambienteInput}
                            disabled={!formData.unidad_organizacional_id}
                            onFocus={() => buscarAmbientes('')} // 👈 carga sugerencias al hacer click
                            onChange={(e) => {
                                const texto = e.target.value;
                                setAmbienteInput(texto);
                                clearTimeout(debounceTimeout);
                                debounceTimeout = setTimeout(() => buscarAmbientes(texto), 300);
                            }}
                            required
                        />
                        {sugerenciasAmbientes.length > 0 && (
                            <ul className="list-group position-absolute w-100 z-3">
                                {sugerenciasAmbientes.map((a) => (
                                    <li
                                        key={a.id}
                                        className="list-group-item list-group-item-action"
                                        onClick={() => {
                                            setAmbienteInput(`${a.codigo} - ${a.descripcion}`);
                                            setFormData((prev) => ({
                                                ...prev,
                                                ambiente_id: a.id.toString(),
                                                ambiente: a.codigo,
                                            }));
                                            setSugerenciasAmbientes([]);
                                            generarCodigo(a.codigo);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {a.codigo} - {a.descripcion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>


                    {/* Código */}
                    <div className="mb-3">
                        <label className="form-label">Código generado</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.codigo}
                            readOnly
                        />
                        {mensajeCodigo && <div className="text-danger mt-1">{mensajeCodigo}</div>}
                    </div>

                    {/* Cargo */}
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

                    {/* Botones */}
                    <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-primary" disabled={cargando}>
                            {cargando ? 'Guardando...' : <><i className="bi bi-save me-2"></i> Guardar</>}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => navigate('/parametros/cargos')}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistroCargos;
