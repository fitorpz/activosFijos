import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

const RegistroDireccionAdministrativa = () => {
    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        estado: 'ACTIVO',
    });

    const [cargando, setCargando] = useState(false);
    const [mensajeCodigo, setMensajeCodigo] = useState<string | null>(null);
    const [codigoDisponible, setCodigoDisponible] = useState<boolean | null>(null);

    const navigate = useNavigate();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const verificarCodigoDisponible = async (codigo: string) => {
        if (!codigo.trim()) {
            setMensajeCodigo(null);
            setCodigoDisponible(null);
            return;
        }

        try {
            const codigoNormalizado = codigo.trim().toUpperCase();
            const res = await axios.get<{ disponible: boolean }>(
                `/parametros/direcciones-administrativas/verificar-codigo/${codigoNormalizado}`
            );

            if (res.data.disponible) {
                setMensajeCodigo('✅ Código disponible');
                setCodigoDisponible(true);
            } else {
                setMensajeCodigo('❌ El código ya está registrado');
                setCodigoDisponible(false);
            }
        } catch (error) {
            console.error('Error al verificar código:', error);
            setMensajeCodigo('❌ Error al verificar el código');
            setCodigoDisponible(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (codigoDisponible === false) {
            alert('❌ El código ya está registrado. Por favor elige otro.');
            return;
        }

        const payload = {
            codigo: formData.codigo.trim().toUpperCase(),
            descripcion: formData.descripcion.trim(),
            estado: formData.estado,
        };

        setCargando(true);
        try {
            await axios.post('/parametros/direcciones-administrativas', payload);
            alert('✅ Dirección administrativa registrada con éxito.');
            navigate('/parametros/direcciones-administrativas');
        } catch (error: any) {
            console.error('Error al registrar dirección:', error);
            alert(error?.response?.data?.message || '❌ Error al registrar la dirección.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="col-md-8 col-lg-6 mx-auto">
                <div className="form-container border rounded p-4 shadow-sm bg-white">
                    <h4 className="mb-4">Nueva Dirección Administrativa</h4>
                    <form onSubmit={handleSubmit}>
                        {/* Código */}
                        <div className="mb-3">
                            <label htmlFor="codigo" className="form-label">Código</label>
                            <input
                                type="text"
                                id="codigo"
                                name="codigo"
                                className={`form-control ${codigoDisponible === false ? 'is-invalid' : ''}`}
                                value={formData.codigo}
                                onChange={(e) => {
                                    handleChange(e);
                                    verificarCodigoDisponible(e.target.value);
                                }}
                                required
                            />
                            {mensajeCodigo && (
                                <div
                                    className={`form-text mt-1 ${codigoDisponible ? 'text-success' : 'text-danger'}`}
                                >
                                    {mensajeCodigo}
                                </div>
                            )}
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

                        {/* Botones */}
                        <div className="d-flex justify-content-between">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={cargando || codigoDisponible === false}
                            >
                                {cargando ? 'Guardando...' : 'Registrar'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/parametros/direcciones-administrativas')}
                            >
                                <i className="bi bi-arrow-left me-1"></i> Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistroDireccionAdministrativa;
