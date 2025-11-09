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
    const [guardando, setGuardando] = useState(false);

    // 🔹 Obtener datos del núcleo
    useEffect(() => {
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
                alert('❌ Error al cargar los datos.');
                navigate('/parametros/nucleos');
            } finally {
                setCargando(false);
            }
        };

        obtenerNucleo();
    }, [id, navigate]);

    // 🔹 Manejar cambios en inputs
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === 'codigo') newValue = value.toUpperCase(); // 🔠 fuerza mayúsculas
        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    // 🔹 Verificar si el código sigue siendo válido (por si se habilita edición futura)
    const verificarCodigoDisponible = async (codigo: string) => {
        const codigoNormalizado = codigo.trim().toUpperCase();
        if (codigoNormalizado === codigoOriginal.toUpperCase()) {
            setMensajeCodigo(null);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<{ disponible: boolean }>(
                `/parametros/nucleos/verificar-codigo/${codigoNormalizado}`,
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
            console.error('❌ Error al verificar código:', error);
            setMensajeCodigo('⚠️ No se pudo verificar el código.');
        }
    };

    // 🔹 Guardar cambios
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mensajeCodigo) return;

        setGuardando(true);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                codigo: formData.codigo.trim().toUpperCase(),
                descripcion: formData.descripcion.trim(),
                estado: formData.estado,
            };

            await axios.put(`/parametros/nucleos/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('✅ Núcleo actualizado correctamente.');
            navigate('/parametros/nucleos');
        } catch (error: any) {
            console.error('❌ Error al actualizar núcleo:', error);
            alert(error?.response?.data?.message || '❌ Error al actualizar núcleo.');
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) return <p className="container mt-4">Cargando datos...</p>;

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
                    onClick={() => navigate('/parametros/nucleos')}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver
                </button>

                <h4 className="mb-4">Editar Núcleo</h4>

                <form onSubmit={handleSubmit}>
                    {/* Código */}
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
                            readOnly
                            style={{ textTransform: 'uppercase' }}
                        />
                        {mensajeCodigo && (
                            <div className="invalid-feedback">{mensajeCodigo}</div>
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

                    {/* Estado (opcional si se habilita edición manual) */}
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
                    <div className="d-flex justify-content-end">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={guardando || !!mensajeCodigo}
                        >
                            {guardando ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => navigate('/parametros/nucleos')}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarNucleo;
