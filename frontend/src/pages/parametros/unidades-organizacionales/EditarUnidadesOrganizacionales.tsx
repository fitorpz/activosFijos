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

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true);
                await Promise.all([
                    obtenerUnidad(),
                    obtenerAreas()
                ]);
            } catch (e) {
                console.error('❌ Error al cargar los datos:', e);
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []);

    const obtenerUnidad = async () => {
        try {
            const res = await axios.get<UnidadOrganizacional>(`/parametros/unidades-organizacionales/${id}`);
            setFormData({
                codigo: res.data.codigo || '',
                descripcion: res.data.descripcion || '',
                area_id: res.data.area?.id?.toString() || '',
            });
        } catch (error) {
            console.error('❌ Error al cargar la unidad organizacional:', error);
            alert('Error al cargar la unidad. Intente nuevamente.');
            navigate('/parametros/unidades-organizacionales');
            throw error; // muy importante: relanzar para que Promise.all detecte el error
        }
    };

    const obtenerAreas = async () => {
        try {
            const res = await axios.get<Area[]>('/parametros/areas');
            setAreas(res.data);
        } catch (error) {
            console.error('❌ Error al obtener áreas:', error);
            throw error;
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                codigo: formData.codigo.trim(),
                descripcion: formData.descripcion.trim(),
                area_id: parseInt(formData.area_id),
            };

            await axios.put(`/parametros/unidades-organizacionales/${id}`, payload);
            alert('✅ Unidad actualizada correctamente.');
            navigate('/parametros/unidades-organizacionales');
        } catch (error: any) {
            console.error('❌ Error al actualizar la unidad organizacional:', error);
            alert(error?.response?.data?.message || 'Error al actualizar.');
        }
    };

    return (
        <div className="container mt-4">
            <div className="form-container">
                <h4 className="mb-4">Editar Unidad Organizacional</h4>
                {cargando ? (
                    <p>Cargando datos...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="area_id" className="form-label">Área</label>
                            <select
                                id="area_id"
                                name="area_id"
                                className="form-select"
                                value={formData.area_id}
                                onChange={handleChange}
                                required
                                disabled // 👈 esto lo hace solo lectura
                            >
                                <option value="">Seleccione un área</option>
                                {areas.map((area) => (
                                    <option key={area.id} value={area.id}>
                                        {area.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="codigo" className="form-label">Código</label>
                            <input
                                type="text"
                                id="codigo"
                                name="codigo"
                                className="form-control"
                                value={formData.codigo}
                                onChange={handleChange}
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

                        <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => navigate('/parametros/unidades-organizacionales')}
                        >
                            Cancelar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditarUnidadesOrganizacionales;
