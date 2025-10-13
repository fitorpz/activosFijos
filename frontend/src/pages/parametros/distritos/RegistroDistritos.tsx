import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

const RegistroDistrito = () => {
    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        estado: 'ACTIVO',
    });

    const [mensajeCodigo, setMensajeCodigo] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const verificarCodigoDisponible = async (codigo: string) => {
        const codigoNormalizado = codigo.trim().toUpperCase();

        if (!codigoNormalizado) {
            setMensajeCodigo(null);
            return;
        }

        try {
            const res = await axios.get<{ disponible: boolean }>(
                `/parametros/ciudades/verificar-codigo/${codigoNormalizado}`
            );

            if (res.data.disponible) {
                setMensajeCodigo('✅ Código disponible');
            } else {
                setMensajeCodigo('❌ El código ya está registrado');
            }
        } catch (error) {
            console.error('❌ Error al verificar código:', error);
            setMensajeCodigo('❌ Error al verificar el código');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mensajeCodigo?.includes('❌')) {
            alert('❌ El código ya está registrado, por favor elige otro.');
            return;
        }

        setCargando(true);

        const payload = {
            codigo: formData.codigo.trim().toUpperCase(),
            descripcion: formData.descripcion.trim(),
            estado: formData.estado,
        };

        try {
            await axios.post('/parametros/distritos', payload);
            alert('✅ distrito registrado con éxito.');
            navigate('/parametros/distritos');
        } catch (error: any) {
            console.error('❌ Error al registrar distrito:', error);
            alert(error?.response?.data?.message || 'Error al registrar el distrito.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="form-container">
                <h4 className="mb-4">Registrar Nuevo Distrito</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="codigo" className="form-label">Código</label>
                        <input
                            type="text"
                            id="codigo"
                            name="codigo"
                            className="form-control"
                            value={formData.codigo}
                            onChange={(e) => {
                                handleChange(e);
                                verificarCodigoDisponible(e.target.value);
                            }}
                            required
                        />
                        {mensajeCodigo && (
                            <div className="form-text" style={{ color: mensajeCodigo.includes('✅') ? 'green' : 'red' }}>
                                {mensajeCodigo}
                            </div>
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



                    <button type="submit" className="btn btn-primary" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Registrar'}
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

export default RegistroDistrito;
