import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

const RegistroUfv = () => {
    const [formData, setFormData] = useState({
        fecha: '',
        tc: '',
        estado: 'ACTIVO',
    });

    const [mensajeFecha, setMensajeFecha] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const verificarFechaDisponible = async (fecha: string) => {
        const fechaNormalizado = fecha.trim().toUpperCase();

        if (!fechaNormalizado) {
            setMensajeFecha(null);
            return;
        }

        try {
            const res = await axios.get<{ disponible: boolean }>(
                `/verificar-fecha/${fechaNormalizado}`
            );

            if (res.data.disponible) {
                setMensajeFecha('✅ Fecha disponible');
            } else {
                setMensajeFecha('❌ La fecha ya está registrado');
            }
        } catch (error) {
        //    console.error('❌ Error al verificar la fecha:', error);
        //    setMensajeFecha('❌ Error al verificar la fecha');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mensajeFecha?.includes('❌')) {
            alert('❌ La fecha ya está registrada, por favor elige otro.');
            return;
        }

        setCargando(true);

        const payload = {
            fecha: formData.fecha.trim().toUpperCase(),
            //tc: formData.tc.trim(),
            //tc: formData.tc,
            tc: parseFloat(formData.tc),
            estado: formData.estado,
        };

        try {
            await axios.post('parametros/ufvs', payload);
            alert('✅ Ufv registrada con éxito.');
            navigate('/ufvs');
        } catch (error: any) {
            console.error('❌ Error al registrar ufv:', error);
            alert(error?.response?.data?.message || 'Error al registrar la ufv.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="form-container">
                <h4 className="mb-4">Registrar Nueva Ufv</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="fecha" className="form-label">Fecha</label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            className="form-control"
                            value={formData.fecha}
                            onChange={(e) => {
                                handleChange(e);
                                verificarFechaDisponible(e.target.value);
                            }}
                            required
                        />
                        {mensajeFecha && (
                            <div className="form-text" style={{ color: mensajeFecha.includes('✅') ? 'green' : 'red' }}>
                                {mensajeFecha}
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="tc" className="form-label">Tc</label>
                        <input
                            type="number"
                            step="any"
                            id="tc"
                            name="tc"
                            className="form-control"
                            value={formData.tc}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    

                    <button type="submit" className="btn btn-primary" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Registrar'}
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
        </div>
    );
};

export default RegistroUfv;
