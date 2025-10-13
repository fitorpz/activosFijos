import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface Ufv {
    id: number;
    fecha: string;
    tc: string;
    estado: 'ACTIVO' | 'INACTIVO';
}

const EditarUfv = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fecha: '',
        tc: '',
        estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
    });

    const [fechaOriginal, setFechaOriginal] = useState('');
    const [mensajeFecha, setMensajeFecha] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        obtenerUfv();
    }, []);

    const obtenerUfv = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<Ufv>(`/parametros/ufvs/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setFormData({
                //fecha: res.data.fecha,
                fecha: res.data.fecha.split('T')[0],
                //fecha: fechaISO,
                tc: res.data.tc,
                estado: res.data.estado,
            });
            //setFechaOriginal(res.data.fecha);
            setFechaOriginal(res.data.fecha.split('T')[0]);
        } catch (error) {
            console.error('❌ Error al cargar ufv:', error);
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

    const verificarFechaDisponible = async (fecha: string) => {
        //const fechaNormalizado = fecha.trim().toUpperCase();
        const fechaNormalizado = fecha;
        if (fechaNormalizado === fechaOriginal.toUpperCase()) {
            setMensajeFecha(null); // No hay cambios en el código
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<{ disponible: boolean }>(
                `/ufvs/verificar-fecha/${fechaNormalizado}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.data.disponible) {
                setMensajeFecha('⚠️ Fecha ya está en uso');
            } else {
                setMensajeFecha(null);
            }
        } catch (error) {
            console.error('Error al verificar fecha:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mensajeFecha) return; // No enviar si hay código duplicado

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/parametros/ufvs/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            navigate('/ufvs');
        } catch (error) {
            console.error('❌ Error al actualizar ufv:', error);
            alert('Error al actualizar ufv');
        }
    };

    if (cargando) return <p>Cargando...</p>;

    return (
        <div className="container mt-4">
            <h3>Editar Ufv</h3>
            <form onSubmit={handleSubmit}>
                
                <div className="mb-3">
                    <label htmlFor="fecha" className="form-label">Fecha</label>
                    <input
                        type="Date"
                        id="fecha"
                        name="fecha"
                        className={`form-control ${mensajeFecha ? 'is-invalid' : ''}`}
                        value={formData.fecha}
                        onChange={handleChange}
                        onBlur={() => verificarFechaDisponible(formData.fecha)}
                        required
                    />
                    {mensajeFecha && (
                        <div className="invalid-feedback">{mensajeFecha}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="tc" className="form-label">Tc</label>
                    <textarea
                        id="tc"
                        name="tc"
                        className="form-control"
                        value={formData.tc}
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
                    onClick={() => navigate('/ufvs')}
                >
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default EditarUfv;
