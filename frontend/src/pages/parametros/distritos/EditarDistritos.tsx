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

    const [codigoOriginal, setCodigoOriginal] = useState('');
    const [mensajeCodigo, setMensajeCodigo] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);

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
            setCodigoOriginal(res.data.codigo);
        } catch (error) {
            console.error('❌ Error al cargar distrito:', error);
            alert('❌ Error al cargar los datos');
            navigate('/parametros/distritos');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mensajeCodigo) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/distritos/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('✅ Distrito actualizado correctamente.');
            navigate('/parametros/distritos');
        } catch (error) {
            console.error('❌ Error al actualizar distrito:', error);
            alert('❌ Error al actualizar distrito.');
        }
    };

    if (cargando) return <p className="container mt-4">Cargando datos...</p>;

    return (
        <div className="container mt-4">
            <div className="form-container">
                <h4 className="mb-4">Editar Distrito</h4>
                <form onSubmit={handleSubmit}>
                    {/* Código */}
                    <div className="mb-3">
                        <label htmlFor="codigo" className="form-label">Código</label>
                        <input
                            type="text"
                            id="codigo"
                            name="codigo"
                            className="form-control"
                            value={formData.codigo}
                            readOnly
                        />
                    </div>

                    {/* Descripción */}
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

                    {/* Estado (opcional si decides mantener editable) */}
                    {/* 
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
                    */}

                    {/* Botones */}
                    <button type="submit" className="btn btn-primary">
                        Guardar Cambios
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => navigate('/parametros/distritos')}
                    >
                        Cancelar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditarDistrito;
