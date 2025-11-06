import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface DireccionAdministrativa {
    id: number;
    codigo: string;
    descripcion: string;
    estado: 'ACTIVO' | 'INACTIVO';
}

const EditarDireccionAdministrativa = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        estado: 'ACTIVO',
    });

    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        obtenerDireccion();
    }, []);

    const obtenerDireccion = async () => {
        try {
            const res = await axios.get<DireccionAdministrativa>(`/parametros/direcciones-administrativas/${id}`);
            setFormData({
                codigo: res.data.codigo || '',
                descripcion: res.data.descripcion || '',
                estado: res.data.estado || 'ACTIVO', // <--- nuevo
            });
        } catch (error) {
            console.error('❌ Error al cargar la dirección:', error);
            alert('Error al cargar la dirección. Intente nuevamente.');
            navigate('/parametros/direcciones-administrativas');
        } finally {
            setCargando(false);
        }
    };



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

            await axios.put(`/parametros/direcciones-administrativas/${id}`, payload);
            alert('✅ Dirección actualizada correctamente.');
            navigate('/parametros/direcciones-administrativas');
        } catch (error: any) {
            console.error('❌ Error al actualizar la dirección:', error);
            alert(error?.response?.data?.message || 'Error al actualizar.');
        }
    };

    return (
        <div className="container mt-4">
            <div className="form-container">
                <h4 className="mb-4">Editar Dirección Administrativa</h4>
                {cargando ? (
                    <p>Cargando datos...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
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
                            onClick={() => navigate('/parametros/direcciones-administrativas')}
                        >
                            Cancelar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditarDireccionAdministrativa;
