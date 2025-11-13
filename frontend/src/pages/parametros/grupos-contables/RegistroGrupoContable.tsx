import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

const RegistroGrupoContable = () => {
    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        tiempo: '',
        porcentaje: '',
        estado: 'ACTIVO',
    });

    const [cargando, setCargando] = useState(false);
    const [mensajeCodigo, setMensajeCodigo] = useState<string | null>(null);
    const [codigoDisponible, setCodigoDisponible] = useState<boolean | null>(null);

    const navigate = useNavigate();

    // 🔹 Detectar si es subgrupo (tiene punto en el código)
    const esSubgrupo = formData.codigo.includes('.');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        const newValue = name === 'codigo' ? value.toUpperCase() : value;

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    const verificarCodigoDisponible = async (codigo: string) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                console.error("⚠️ No hay token en localStorage");
                setMensajeCodigo("⚠️ No hay sesión activa.");
                setCodigoDisponible(false);
                return;
            }

            const response = await axios.get<{ sugerido: string }>(
                `/parametros/grupos-contables/sugerir-codigo`,
                {
                    params: { codigo },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const sugerido = response.data.sugerido;

            if (sugerido !== codigo) {
                setMensajeCodigo(`⚠️ El código ya existe. Se generará como subgrupo: ${sugerido}`);
                setCodigoDisponible(false);
            } else {
                setMensajeCodigo(`✅ Código disponible.`);
                setCodigoDisponible(true);
            }

        } catch (error: any) {
            console.error("❌ Error en sugerir código:", error);

            if (error.response?.status === 401) {
                setMensajeCodigo("⚠️ Sesión expirada. Por favor, vuelve a iniciar sesión.");
            } else if (error.code === "ERR_NETWORK") {
                setMensajeCodigo("❌ Error de conexión con el servidor.");
            } else {
                setMensajeCodigo("⚠️ No se pudo verificar el código.");
            }

            setCodigoDisponible(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);

        try {
            const token = localStorage.getItem('token');
            const esSubgrupo = formData.codigo.includes('.');

            // 🔹 Si es subgrupo, tiempo y porcentaje deben ser 0
            const payload = {
                ...formData,
                tiempo: esSubgrupo ? 0 : Number(formData.tiempo) || 0,
                porcentaje: esSubgrupo ? 0 : Number(formData.porcentaje) || 0,
                estado: formData.estado ?? 'ACTIVO',
            };

            await axios.post('/parametros/grupos-contables', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('✅ Grupo contable registrado correctamente.');
            navigate('/parametros/grupos-contables');
        } catch (error: any) {
            console.error('❌ Error al registrar grupo contable:', error);
            alert(error?.response?.data?.message || '❌ Error al registrar grupo contable.');
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
                    onClick={() => navigate('/parametros/grupos-contables')}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver
                </button>

                <h4 className="mb-4">Nuevo Grupo Contable</h4>

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
                            onChange={handleChange}
                            onBlur={(e) => verificarCodigoDisponible(e.target.value)}
                            required
                        />
                        {mensajeCodigo && (
                            <small className="text-muted d-block mt-1">{mensajeCodigo}</small>
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
                            disabled={codigoDisponible === false}
                            required
                        />
                    </div>

                    {/* Tiempo */}
                    <div className="mb-3">
                        <label htmlFor="tiempo" className="form-label">Tiempo</label>
                        <input
                            type="number"
                            id="tiempo"
                            name="tiempo"
                            className="form-control"
                            value={esSubgrupo ? 0 : formData.tiempo}
                            onChange={handleChange}
                            disabled={codigoDisponible === false || esSubgrupo}
                            required
                            min="0"
                        />
                        {esSubgrupo && (
                            <small className="text-muted">
                                Este es un subgrupo. El tiempo se asignará automáticamente como 0.
                            </small>
                        )}
                    </div>

                    {/* Porcentaje */}
                    <div className="mb-3">
                        <label htmlFor="porcentaje" className="form-label">Porcentaje</label>
                        <input
                            type="number"
                            id="porcentaje"
                            name="porcentaje"
                            className="form-control"
                            value={esSubgrupo ? 0 : formData.porcentaje}
                            onChange={handleChange}
                            disabled={codigoDisponible === false || esSubgrupo}
                            required
                            min="0"
                            max="100"
                            step="0.01"
                        />
                        {esSubgrupo && (
                            <small className="text-muted">
                                Este es un subgrupo. El porcentaje se asignará automáticamente como 0.
                            </small>
                        )}
                    </div>

                    {/* Botones */}
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
                        onClick={() => navigate('/parametros/grupos-contables')}
                    >
                        Cancelar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistroGrupoContable;
