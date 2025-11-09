import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

const RegistroBase = () => {
    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        estado: 'ACTIVO',
    });

    const [codigoDisponible, setCodigoDisponible] = useState<boolean | null>(null);
    const [mensajeCodigo, setMensajeCodigo] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const navigate = useNavigate();

    // 🧩 Manejo genérico de cambios
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        let newValue = value;

        // Forzar mayúsculas en campos de código o siglas
        if (['codigo', 'sigla', 'abreviatura'].includes(name)) {
            newValue = newValue.toUpperCase();
        }

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    // 🧩 Verificar disponibilidad del código (si aplica)
    const verificarCodigoDisponible = async (codigo: string) => {
        if (!codigo.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<{ disponible: boolean }>(
                '/parametros/unidades-organizacionales/verificar-codigo',
                {
                    params: { codigo },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.disponible) {
                setMensajeCodigo('✅ Código disponible.');
                setCodigoDisponible(true);
            } else {
                setMensajeCodigo('⚠️ El código ya está en uso.');
                setCodigoDisponible(false);
            }
        } catch (error) {
            console.error('❌ Error al verificar código:', error);
            setMensajeCodigo('⚠️ No se pudo verificar el código.');
            setCodigoDisponible(false);
        }
    };

    // 🧩 Enviar formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post('/parametros/unidades-organizacionales', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('✅ Registro exitoso');
            navigate('/parametros/unidades-organizacionales');
        } catch (error: any) {
            console.error('❌ Error al registrar:', error);
            alert(error?.response?.data?.message || 'Error al registrar');
        } finally {
            setCargando(false);
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
                    onClick={() => navigate(-1)}
                >
                    <i className="bi bi-arrow-left me-1"></i> Volver
                </button>

                <h4 className="mb-4">Registrar Unidad Organizacional</h4>

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
                            className={`form-control ${codigoDisponible === false ? 'is-invalid' : ''}`}
                            value={formData.codigo}
                            onChange={handleChange}
                            onBlur={(e) => verificarCodigoDisponible(e.target.value)}
                            required
                            style={{ textTransform: 'uppercase' }} // 🔠 Visualmente en mayúsculas
                        />
                        {mensajeCodigo && (
                            <small className="text-muted d-block mt-1">{mensajeCodigo}</small>
                        )}
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
                            disabled={codigoDisponible === false}
                            required
                        />
                    </div>

                    {/* Botones */}
                    <div className="d-flex justify-content-end">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={cargando || codigoDisponible === false}
                        >
                            {cargando ? 'Guardando...' : 'Registrar'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => navigate(-1)}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistroBase;
