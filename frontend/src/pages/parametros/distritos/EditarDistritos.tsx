import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface Distrito {
    id: number;
    codigo: string;
    descripcion: string;
    estado: 'ACTIVO' | 'INACTIVO';
}

const EditarDistrito = () => {
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
        obtenerDistrito();
    }, []);

    const obtenerDistrito = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<Distrito>(`/parametros/distritos/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setFormData({
                codigo: res.data.codigo,
                descripcion: res.data.descripcion,
                estado: res.data.estado,
            });
        } catch (error) {
            console.error('❌ Error al cargar distrito:', error);
            alert('❌ Error al cargar los datos');
            navigate('/parametros/distritos');
        } finally {
            setCargando(false);
        }
    };

    // 🔹 Manejo de cambios (con mayúsculas automáticas)
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/distritos/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('✅ Distrito actualizado correctamente.');
            navigate('/parametros/distritos');
        } catch (error: any) {
            console.error('❌ Error al actualizar distrito:', error);
            alert(error?.response?.data?.message || '❌ Error al actualizar distrito.');
        } finally {
            setGuardando(false);
        }
    };

    // 🔹 Mostrar mensaje de carga
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
                    onClick={() => navigate('/parametros/distritos')}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver
                </button>

                <h4 className="mb-4">Editar Distrito</h4>

                <form onSubmit={handleSubmit}>
                    {/* Código */}
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
                            style={{ textTransform: 'uppercase' }} // 🔠 Visualmente en mayúsculas
                            readOnly
                        />
                    </div>

                    {/* Descripción */}
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
                            onClick={() => navigate('/parametros/distritos')}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarDistrito;
