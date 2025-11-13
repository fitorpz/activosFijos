import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';
import Select from 'react-select';

interface GrupoContable {
    id: number;
    codigo: string;
    descripcion: string;
}

const RegistroAuxiliar = () => {
    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        codigo_grupo: '',
        estado: 'ACTIVO',
    });

    const [cargando, setCargando] = useState(false);
    const [opcionesGrupo, setOpcionesGrupo] = useState<{ value: string; label: string }[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        cargarGruposContables();
    }, []);

    useEffect(() => {
        const generarCodigoAuxiliar = async () => {
            if (!formData.codigo_grupo) return;

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get<{ correlativo: string }>(
                    `/parametros/auxiliares/siguiente-codigo`,
                    {
                        params: { codigo_grupo: formData.codigo_grupo },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const codigoGenerado = `${response.data.correlativo}`;
                setFormData((prev) => ({ ...prev, codigo: codigoGenerado }));
            } catch (error) {
                console.error('❌ Error al generar código auxiliar:', error);
            }
        };

        generarCodigoAuxiliar();
    }, [formData.codigo_grupo]);

    const cargarGruposContables = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<GrupoContable[]>('/parametros/grupos-contables', {
                headers: { Authorization: `Bearer ${token}` },
                params: { estado: 'ACTIVO' },
            });

            // Filtrar solo grupos con un punto (segundo nivel)
            const gruposSegundoNivel = res.data.filter((grupo) => grupo.codigo.includes('.') && grupo.codigo.split('.').length === 2);

            const opciones = gruposSegundoNivel.map((grupo) => ({
                value: grupo.codigo,
                label: `${grupo.codigo} - ${grupo.descripcion}`,
            }));


            setOpcionesGrupo(opciones);
        } catch (error) {
            console.error('❌ Error al cargar grupos contables:', error);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);

        try {
            const payload = {
                codigo: formData.codigo.trim(),
                descripcion: formData.descripcion.trim(),
                codigo_grupo: formData.codigo_grupo.trim(),
                estado: formData.estado,
            };

            const token = localStorage.getItem('token');
            await axios.post('/parametros/auxiliares', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert('✅ Auxiliar registrado con éxito.');
            navigate('/parametros/auxiliares');
        } catch (error: any) {
            console.error('❌ Error al registrar auxiliar:', error);
            alert(error?.response?.data?.message || '❌ Error al registrar el auxiliar.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container mt-4">
            <div
                className="mx-auto p-4 border rounded shadow"
                style={{ maxWidth: '600px', backgroundColor: '#fff' }}
            >
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm mb-3 d-inline-flex align-items-center"
                    onClick={() => navigate('/parametros/auxiliares')}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver
                </button>

                <h4 className="mb-4">Nuevo Auxiliar</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="codigo_grupo" className="form-label">
                            Grupo Contable
                        </label>
                        <Select
                            id="codigo_grupo"
                            name="codigo_grupo"
                            options={opcionesGrupo}
                            value={opcionesGrupo.find((option) => option.value === formData.codigo_grupo)}
                            onChange={(selected) =>
                                setFormData((prev) => ({ ...prev, codigo_grupo: selected?.value || '' }))
                            }
                            placeholder="Buscar grupo contable..."
                            isClearable
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="codigo" className="form-label">
                            Código
                        </label>
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
                        <label htmlFor="descripcion" className="form-label">
                            Descripción
                        </label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            className="form-control"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                        />
                    </div>



                    <button type="submit" className="btn btn-primary" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Registrar'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => navigate('/parametros/auxiliares')}
                    >
                        Cancelar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistroAuxiliar;