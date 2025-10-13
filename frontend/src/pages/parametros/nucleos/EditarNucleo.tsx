import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface Nucleo {
    id: number;
    codigo: string;
    descripcion: string;
    estado: 'ACTIVO' | 'INACTIVO';
}

const EditarNucleo = () => {
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
        obtenerNucleo();
    }, []);

    const obtenerNucleo = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<Nucleo>(`/parametros/nucleos/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setFormData({
                codigo: res.data.codigo,
                descripcion: res.data.descripcion,
                estado: res.data.estado,
            });
            setCodigoOriginal(res.data.codigo);
        } catch (error) {
            console.error('❌ Error al cargar núcleo:', error);
            alert('Error al cargar los datos');
        } finally {
            setCargando(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const verificarCodigoDisponible = async (codigo: string) => {
        if (codigo.toUpperCase() === codigoOriginal.toUpperCase()) {
            setMensajeCodigo(null); // El código no cambió
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<{ disponible: boolean }>(
                `/parametros/nucleos/verificar-codigo/${codigo}`,
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

        // Evita enviar si el código está repetido
        if (mensajeCodigo) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/nucleos/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });


            navigate('/parametros/nucleos');
        } catch (error) {
            console.error('❌ Error al actualizar núcleo:', error);
            alert('Error al actualizar núcleo');
        }
    };

    if (cargando) return <p>Cargando...</p>;

    return (
        <div className="container mt-4">
            <h3>Editar Núcleo</h3>
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
                        required
                    />
                    {mensajeCodigo && (
                        <div className="invalid-feedback">{mensajeCodigo}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <input
                        type="text"
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
                    >
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary">
                    Guardar Cambios
                </button>
                <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => navigate('/parametros/nucleos')}
                >
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default EditarNucleo;
