import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

const RegistroCiudad = () => {
    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        estado: 'ACTIVO',
    });

    const [mensajeCodigo, setMensajeCodigo] = useState<string | null>(null);
    const [codigoDisponible, setCodigoDisponible] = useState(true);
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    // 🔹 Manejar cambios (convertir código a mayúsculas automáticamente)
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

    // 🔹 Verificar disponibilidad de código
    const verificarCodigoDisponible = async (codigo: string) => {
        const codigoNormalizado = codigo.trim().toUpperCase();
        if (!codigoNormalizado) {
            setMensajeCodigo(null);
            setCodigoDisponible(true);
            return;
        }

        try {
            const res = await axios.get<{ disponible: boolean }>(
                `/parametros/ciudades/verificar-codigo/${codigoNormalizado}`
            );

            if (res.data.disponible) {
                setMensajeCodigo('✅ Código disponible');
                setCodigoDisponible(true);
            } else {
                setMensajeCodigo('❌ El código ya está registrado');
                setCodigoDisponible(false);
            }
        } catch (error) {
            console.error('❌ Error al verificar código:', error);
            setMensajeCodigo('⚠️ Error al verificar el código');
            setCodigoDisponible(false);
        }
    };

    // 🔹 Guardar nueva ciudad
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!codigoDisponible) {
            alert('❌ El código ya está en uso. Elige otro.');
            return;
        }

        setCargando(true);
        const payload = {
            codigo: formData.codigo.trim().toUpperCase(),
            descripcion: formData.descripcion.trim(),
            estado: formData.estado,
        };

        try {
            await axios.post('/parametros/ciudades', payload);
            alert('✅ Ciudad registrada con éxito.');
            navigate('/parametros/ciudades');
        } catch (error: any) {
            console.error('❌ Error al registrar ciudad:', error);
            alert(error?.response?.data?.message || '❌ Error al registrar la ciudad.');
        } finally {
            setCargando(false);
        }
    };

    // 🔹 Interfaz
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
                    onClick={() => navigate('/parametros/ciudades')}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver
                </button>

                <h4 className="mb-4">Registrar Nueva Ciudad</h4>

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
                            className={`form-control ${codigoDisponible ? '' : 'is-invalid'}`}
                            value={formData.codigo}
                            onChange={(e) => {
                                handleChange(e);
                                verificarCodigoDisponible(e.target.value);
                            }}
                            required
                            style={{ textTransform: 'uppercase' }}
                        />
                        {mensajeCodigo && (
                            <small
                                className={`d-block mt-1 ${codigoDisponible ? 'text-success' : 'text-danger'
                                    }`}
                            >
                                {mensajeCodigo}
                            </small>
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
                            required
                        />
                    </div>

                    {/* Botones */}
                    <div className="d-flex justify-content-end">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={cargando || !codigoDisponible}
                        >
                            {cargando ? 'Guardando...' : 'Registrar'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => navigate('/parametros/ciudades')}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistroCiudad;
