import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface Area {
    id: number;
    codigo: string;
    descripcion: string;
    estado: string;
}

const EditarAreas = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        estado: 'ACTIVO',
    });

    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        obtenerArea();
    }, []);

    const obtenerArea = async () => {
        try {
            const res = await axios.get<Area>(`/parametros/areas/${id}`);
            setFormData({
                codigo: res.data.codigo || '',
                descripcion: res.data.descripcion || '',
                estado: res.data.estado || 'ACTIVO',
            });
        } catch (error) {
            console.error('❌ Error al cargar el área:', error);
            alert('Error al cargar el área. Intente nuevamente.');
            navigate('/parametros/areas');
        } finally {
            setCargando(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                codigo: formData.codigo.trim(),
                descripcion: formData.descripcion.trim(),
                estado: formData.estado,
            };

            await axios.put(`/parametros/areas/${id}`, payload);
            alert('✅ Área actualizada correctamente.');
            navigate('/parametros/areas');
        } catch (error: any) {
            console.error('❌ Error al actualizar el área:', error);
            alert(error?.response?.data?.message || 'Error al actualizar.');
        }
    };

    return (
        <div className="container mt-4">
            <div className="form-container">
                <h4 className="mb-4">Editar Área</h4>
                {cargando ? (
                    <p>Cargando datos...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="codigo" className="form-label">Código</label>
                            <input
                                id="codigo"
                                name="codigo"
                                type="text"
                                className="form-control"
                                value={formData.codigo}
                                onChange={handleChange}
                                required
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

                        <div className="mb-3">
                            <label htmlFor="estado" className="form-label">Estado</label>
                            <select
                                id="estado"
                                name="estado"
                                className="form-select"
                                value={formData.estado}
                                onChange={handleChange}
                                required
                            >
                                <option value="ACTIVO">ACTIVO</option>
                                <option value="INACTIVO">INACTIVO</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => navigate('/parametros/areas')}
                        >
                            Cancelar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditarAreas;
