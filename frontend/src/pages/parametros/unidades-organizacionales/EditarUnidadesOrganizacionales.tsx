import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface Area {
    id: number;
    descripcion: string;
}

interface UnidadOrganizacional {
    id: number;
    codigo: string;
    descripcion: string;
    area: {
        id: number;
        descripcion: string;
    };
}

const EditarUnidadesOrganizacionales = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        area_id: '',
    });

    const [areas, setAreas] = useState<Area[]>([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // 🔹 Cargar datos iniciales
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true);
                await Promise.all([obtenerUnidad(), obtenerAreas()]);
            } catch (e) {
                console.error('❌ Error al cargar los datos:', e);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    // 🔹 Obtener unidad organizacional
    const obtenerUnidad = async () => {
        try {
            const res = await axios.get<UnidadOrganizacional>(
                `/parametros/unidades-organizacionales/${id}`
            );
            setFormData({
                codigo: res.data.codigo || '',
                descripcion: res.data.descripcion || '',
                area_id: res.data.area?.id?.toString() || '',
            });
        } catch (error) {
            console.error('❌ Error al cargar la unidad organizacional:', error);
            alert('❌ Error al cargar la unidad. Intente nuevamente.');
            navigate('/parametros/unidades-organizacionales');
            throw error;
        }
    };

    // 🔹 Obtener lista de áreas
    const obtenerAreas = async () => {
        try {
            const res = await axios.get<Area[]>('/parametros/areas');
            setAreas(res.data);
        } catch (error) {
            console.error('❌ Error al obtener áreas:', error);
            throw error;
        }
    };

    // 🔹 Manejo de cambios con mayúsculas automáticas
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        let newValue = value;

        if (['codigo', 'sigla', 'abreviatura'].includes(name)) {
            newValue = newValue.toUpperCase();
        }

        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    // 🔹 Guardar cambios
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);

        try {
            const payload = {
                codigo: formData.codigo.trim(),
                descripcion: formData.descripcion.trim(),
                area_id: parseInt(formData.area_id),
            };

            await axios.put(`/parametros/unidades-organizacionales/${id}`, payload);
            alert('✅ Unidad Organizacional actualizada correctamente.');
            navigate('/parametros/unidades-organizacionales');
        } catch (error: any) {
            console.error('❌ Error al actualizar la unidad organizacional:', error);
            alert(error?.response?.data?.message || '❌ Error al actualizar la unidad.');
        } finally {
            setGuardando(false);
        }
    };

    // 🔹 Pantalla de carga
    if (cargando) return <p className="container mt-4">Cargando datos...</p>;

    return (
        <div className="container mt-4">
            <div
                className="mx-auto p-4 border rounded shadow"
                style={{ maxWidth: '600px', backgroundColor: '#fff' }}
            >
                {/* Botón Volver */}
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm mb-3 d-inline-flex align-items-center"
                    onClick={() => navigate('/parametros/unidades-organizacionales')}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver
                </button>

                <h4 className="mb-4">Editar Unidad Organizacional</h4>

                <form onSubmit={handleSubmit}>
                    {/* Campo Área */}
                    <div className="mb-3">
                        <label htmlFor="area_id" className="form-label">
                            Área
                        </label>
                        <select
                            id="area_id"
                            name="area_id"
                            className="form-select"
                            value={formData.area_id}
                            onChange={handleChange}
                            required
                            disabled // lectura, no editable
                        >
                            <option value="">Seleccione un área</option>
                            {areas.map((area) => (
                                <option key={area.id} value={area.id}>
                                    {area.descripcion}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Campo Código */}
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
                            onChange={handleChange}
                            style={{ textTransform: 'uppercase' }}
                            readOnly
                        />
                    </div>

                    {/* Campo Descripción */}
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

                    {/* Botones */}
                    <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-primary" disabled={guardando}>
                            {guardando ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => navigate('/parametros/unidades-organizacionales')}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarUnidadesOrganizacionales;
