import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface GrupoContable {
    id: number;
    codigo: string;
    descripcion: string;
    tiempo: number;
    porcentaje: number;
    estado: string;
}

const EditarGrupoContable = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        tiempo: '',
        porcentaje: '',
        estado: 'ACTIVO',
    });

    const [codigoError, setCodigoError] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        obtenerGrupo();
    }, []);

    const obtenerGrupo = async () => {
        try {
            const res = await axios.get<GrupoContable>(`/parametros/grupos-contables/${id}`);
            setFormData({
                codigo: res.data.codigo || '',
                descripcion: res.data.descripcion || '',
                tiempo: res.data.tiempo.toString() || '',
                porcentaje: res.data.porcentaje?.toString() || '',
                estado: res.data.estado || 'ACTIVO',
            });
        } catch (error) {
            console.error('❌ Error al cargar el grupo contable:', error);
            alert('Error al cargar el grupo contable. Intente nuevamente.');
            navigate('/parametros/grupos-contables');
        } finally {
            setCargando(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                codigo: formData.codigo.trim(),
                descripcion: formData.descripcion.trim(),
                tiempo: Number(formData.tiempo),
                porcentaje: Number(formData.porcentaje),
                estado: formData.estado,
            };

            await axios.put(`/parametros/grupos-contables/${id}`, payload);
            alert('✅ Grupo Contable actualizado correctamente.');
            navigate('/parametros/grupos-contables');
        } catch (error: any) {
            console.error('❌ Error al actualizar el grupo contable:', error);
            alert(error?.response?.data?.message || 'Error al actualizar.');
        }
    };

    return (
        <div className="container mt-4">
            <div className="mx-auto p-4 border rounded shadow" style={{ maxWidth: '600px', backgroundColor: '#fff' }}>
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm mb-3 d-inline-flex align-items-center"
                    onClick={() => navigate('/parametros/grupos-contables')}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver
                </button>

                <h4 className="mb-4">Editar Grupo Contable</h4>

                {cargando ? (
                    <p>Cargando datos...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
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

                        <div className="mb-3">
                            <label htmlFor="tiempo" className="form-label">Tiempo</label>
                            <input
                                type="number"
                                id="tiempo"
                                name="tiempo"
                                className="form-control"
                                value={formData.tiempo}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="porcentaje" className="form-label">Porcentaje</label>
                            <input
                                type="number"
                                id="porcentaje"
                                name="porcentaje"
                                className="form-control"
                                value={formData.porcentaje}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                step="0.01"
                                required
                            />
                        </div>

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

                        <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => navigate('/parametros/grupos-contables')}
                        >
                            Cancelar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditarGrupoContable;
