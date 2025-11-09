import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

const RegistroAreas = () => {
    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        estado: 'ACTIVO',
    });

    const [mensajeCodigo, setMensajeCodigo] = useState<string | null>(null);
    const [codigoDisponible, setCodigoDisponible] = useState<boolean | null>(null);
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    // 🔹 Manejo genérico de cambios (con mayúsculas automáticas)
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        let newValue = value;

        if (['codigo', 'codigo_edificio', 'sigla', 'abreviatura'].includes(name)) {
            newValue = newValue.toUpperCase();
        }

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    // 🔹 Verificación del código disponible
    const verificarCodigo = async (codigo: string) => {
        const limpio = codigo.trim().toUpperCase();
        if (!limpio || limpio.length < 2) {
            setMensajeCodigo(null);
            setCodigoDisponible(null);
            return;
        }

        try {
            const res = await axios.get<{ disponible: boolean }>(
                '/parametros/areas/verificar-codigo',
                { params: { codigo: limpio } }
            );

            if (res.data.disponible) {
                setMensajeCodigo('✅ Código disponible');
                setCodigoDisponible(true);
            } else {
                setMensajeCodigo(`❌ El código '${codigo}' ya está en uso.`);
                setCodigoDisponible(false);
            }
        } catch (error) {
            console.error('❌ Error al verificar código:', error);
            setMensajeCodigo('⚠️ Error al verificar el código.');
            setCodigoDisponible(false);
        }
    };

    // 🔹 Enviar formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (codigoDisponible === false) {
            alert('❌ No puedes registrar el área porque el código ya está en uso.');
            return;
        }

        setCargando(true);

        try {
            const payload = {
                codigo: formData.codigo.trim().toUpperCase(),
                descripcion: formData.descripcion.trim(),
                estado: formData.estado,
            };

            await axios.post('/parametros/areas', payload);
            alert('✅ Área registrada con éxito.');
            navigate('/parametros/areas');
        } catch (error: any) {
            console.error('❌ Error al registrar área:', error);
            alert(error?.response?.data?.message || '❌ Error al registrar el área.');
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
                {/* Botón Volver */}
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm mb-3 d-inline-flex align-items-center"
                    onClick={() => navigate('/parametros/areas')}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver
                </button>

                <h4 className="mb-4">Nueva Área</h4>

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
                            onChange={(e) => {
                                handleChange(e);
                                verificarCodigo(e.target.value);
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
                            onClick={() => navigate('/parametros/areas')}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistroAreas;
