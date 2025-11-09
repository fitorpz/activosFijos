import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface Area {
    id: number;
    codigo: string;
    descripcion: string;
    estado: 'ACTIVO' | 'INACTIVO';
}

const EditarAreas = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
    });

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // 🔹 Cargar datos al montar
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
            alert('❌ Error al cargar el área. Intente nuevamente.');
            navigate('/parametros/areas');
        } finally {
            setCargando(false);
        }
    };

    // 🔹 Manejo de cambios (con mayúsculas automáticas)
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        let newValue = value;

        if (['codigo', 'sigla', 'abreviatura'].includes(name)) {
            newValue = newValue.toUpperCase();
        }

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    // 🔹 Guardar cambios
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);

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
            alert(error?.response?.data?.message || '❌ Error al actualizar el área.');
        } finally {
            setGuardando(false);
        }
    };

    // 🔹 Pantalla de carga
    if (cargando) {
        return <p className="container mt-4">Cargando datos...</p>;
    }

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
                    onClick={() => navigate('/parametros/areas')}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver
                </button>

                <h4 className="mb-4">Editar Área</h4>

                <form onSubmit={handleSubmit}>
                    {/* Campo Código */}
                    <div className="mb-3">
                        <label htmlFor="codigo" className="form-label">
                            Código
                        </label>
                        <input
                            id="codigo"
                            name="codigo"
                            type="text"
                            className="form-control"
                            value={formData.codigo}
                            style={{ textTransform: 'uppercase' }} // visualmente mayúsculas
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
                            onClick={() => navigate('/parametros/areas')}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarAreas;
