import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface Ciudad {
    id: number;
    codigo: string;
    descripcion: string;
    estado: 'ACTIVO' | 'INACTIVO';
}

const EditarCiudad = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
    });

    const [codigoOriginal, setCodigoOriginal] = useState('');
    const [mensajeCodigo, setMensajeCodigo] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        obtenerCiudad();
    }, []);

    const obtenerCiudad = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<Ciudad>(`/parametros/ciudades/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setFormData({
                codigo: res.data.codigo,
                descripcion: res.data.descripcion,
                estado: res.data.estado,
            });
            setCodigoOriginal(res.data.codigo);
        } catch (error) {
            console.error('❌ Error al cargar ciudad:', error);
            alert('Error al cargar los datos');
        } finally {
            setCargando(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const verificarCodigoDisponible = async (codigo: string) => {
        const codigoNormalizado = codigo.trim().toUpperCase();
        if (codigoNormalizado === codigoOriginal.toUpperCase()) {
            setMensajeCodigo(null); // No hay cambios en el código
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<{ disponible: boolean }>(
                `/parametros/ciudades/verificar-codigo/${codigoNormalizado}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.data.disponible) {
                setMensajeCodigo('⚠️ Código ya está en uso');
            } else {
                setMensajeCodigo(null);
            }
        } catch (error) {
            console.error('Error al verificar código:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mensajeCodigo) return; // No enviar si hay código duplicado

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/ciudades/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            navigate('/parametros/ciudades');
        } catch (error) {
            console.error('❌ Error al actualizar ciudad:', error);
            alert('Error al actualizar ciudad');
        }
    };

    if (cargando) return <p>Cargando...</p>;

    return (
        <div className="container mt-4">
            <h3>Editar Ciudad</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="codigo" className="form-label">Código</label>
                    <input
                        type="text"
                        id="codigo"
                        name="codigo"
                        className={`form-control ${mensajeCodigo ? 'is-invalid' : ''}`}
                        value={formData.codigo}
                        onChange={handleChange}
                        onBlur={() => verificarCodigoDisponible(formData.codigo)}
                        readOnly
                    />
                    {mensajeCodigo && (
                        <div className="invalid-feedback">{mensajeCodigo}</div>
                    )}
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

                <button type="submit" className="btn btn-primary">
                    Guardar Cambios
                </button>
                <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => navigate('/parametros/ciudades')}
                >
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default EditarCiudad;
