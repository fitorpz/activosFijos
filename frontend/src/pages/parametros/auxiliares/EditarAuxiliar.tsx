import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface Auxiliar {
    id: number;
    codigo: string;
    descripcion: string;
    codigo_grupo: string;
    estado: string;
}

interface GrupoContable {
    id: number;
    codigo: string;
    descripcion: string;
}

const EditarAuxiliar = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        codigo_grupo: '',
        estado: 'ACTIVO',
    });

    const [gruposContables, setGruposContables] = useState<GrupoContable[]>([]);
    const [cargando, setCargando] = useState(true);

    // 🔹 Cargar auxiliar y grupos contables al iniciar
    useEffect(() => {
        obtenerAuxiliar();
        obtenerGruposContables();
    }, []);

    const obtenerAuxiliar = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<Auxiliar>(`/parametros/auxiliares/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData({
                codigo: res.data.codigo || '',
                descripcion: res.data.descripcion || '',
                codigo_grupo: res.data.codigo_grupo || '',
                estado: res.data.estado || 'ACTIVO',
            });
        } catch (error) {
            console.error('❌ Error al cargar auxiliar:', error);
            alert('Error al cargar el auxiliar. Intente nuevamente.');
            navigate('/parametros/auxiliares');
        } finally {
            setCargando(false);
        }
    };

    const obtenerGruposContables = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<GrupoContable[]>('/parametros/grupos-contables', {
                headers: { Authorization: `Bearer ${token}` },
                params: { estado: 'ACTIVO' },
            });
            setGruposContables(res.data);
        } catch (error) {
            console.error('❌ Error al cargar grupos contables:', error);
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
                codigo_grupo: formData.codigo_grupo.trim(),
                estado: formData.estado,
            };

            const token = localStorage.getItem('token');
            await axios.put(`/parametros/auxiliares/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('✅ Auxiliar actualizado correctamente.');
            navigate('/parametros/auxiliares');
        } catch (error: any) {
            console.error('❌ Error al actualizar auxiliar:', error);
            alert(error?.response?.data?.message || 'Error al actualizar.');
        }
    };

    return (
        <div className="container mt-4">
            <div className="form-container">
                <h4 className="mb-4">Editar Auxiliar</h4>
                {cargando ? (
                    <p>Cargando datos...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* 🔹 Grupo contable */}
                        <div className="mb-3">
                            <label htmlFor="codigo_grupo" className="form-label">
                                Grupo Contable
                            </label>
                            <select
                                id="codigo_grupo"
                                name="codigo_grupo"
                                className="form-select"
                                value={formData.codigo_grupo}
                                disabled // 👈 No se puede cambiar en edición
                            >
                                <option value="">-- Selecciona un grupo contable --</option>
                                {gruposContables.map((grupo) => (
                                    <option key={grupo.id} value={grupo.codigo}>
                                        {grupo.codigo} - {grupo.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 🔹 Código */}
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

                        {/* 🔹 Descripción */}
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

                        {/* 🔹 Estado */}
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

                        {/* 🔹 Botones */}
                        <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => navigate('/parametros/auxiliares')}
                        >
                            Cancelar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditarAuxiliar;
