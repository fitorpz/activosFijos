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
    const [guardando, setGuardando] = useState(false);

    // 🔹 Cargar datos al montar
    useEffect(() => {
        obtenerDireccion();
    }, []);

    const obtenerDireccion = async () => {
        try {
            const res = await axios.get<DireccionAdministrativa>(
                `/parametros/direcciones-administrativas/${id}`
            );
            setFormData({
                codigo: res.data.codigo || '',
                descripcion: res.data.descripcion || '',
                estado: res.data.estado || 'ACTIVO',
            });
        } catch (error) {
            console.error('❌ Error al cargar la dirección:', error);
            alert('Error al cargar la dirección. Intente nuevamente.');
            navigate('/parametros/direcciones-administrativas');
        } finally {
            setCargando(false);
        }
    };

    // 🔹 Controlar cambios (con mayúsculas automáticas)
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

            await axios.put(`/parametros/direcciones-administrativas/${id}`, payload);
            alert('✅ Dirección actualizada correctamente.');
            navigate('/parametros/direcciones-administrativas');
        } catch (error: any) {
            console.error('❌ Error al actualizar la dirección:', error);
            alert(error?.response?.data?.message || 'Error al actualizar.');
        } finally {
            setGuardando(false);
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
                    onClick={() => navigate('/parametros/direcciones-administrativas')}
                >
                    <i className="bi bi-arrow-left me-1"></i> Volver
                </button>

                <h4 className="mb-4">Editar Dirección Administrativa</h4>

                {cargando ? (
                    <p>Cargando datos...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
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
                                style={{ textTransform: 'uppercase' }} // 🔠 visualmente en mayúsculas
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
                                onClick={() => navigate('/parametros/direcciones-administrativas')}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditarDireccionAdministrativa;
