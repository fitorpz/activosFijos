import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

const RegistroAreas = () => {
    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        estado: 'ACTIVO',
    });

    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();
    const [mensajeCodigo, setMensajeCodigo] = useState<string | null>(null);
    const [codigoDisponible, setCodigoDisponible] = useState(true);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'codigo') {
            verificarCodigo(value);
        }
    };


    const verificarCodigo = async (codigo: string) => {
        const limpio = codigo.trim();
        if (limpio.length < 3) return; // evitar validaciones inútiles

        try {
            const res = await axios.get<{ disponible: boolean }>(
                '/parametros/areas/verificar-codigo',
                { params: { codigo: limpio } }
            );
            setCodigoDisponible(res.data.disponible);
            setMensajeCodigo(
                res.data.disponible ? null : `❌ El código '${codigo}' ya está en uso.`
            );
        } catch (error) {
            console.error('Error al verificar código:', error);
            setMensajeCodigo('⚠️ Error al verificar código.');
            setCodigoDisponible(false);
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!codigoDisponible) {
            alert('❌ No puedes registrar el área porque el código ya está en uso.');
            return;
        }

        setCargando(true);

        try {
            const payload = {
                codigo: formData.codigo.trim(),
                descripcion: formData.descripcion.trim(),
                estado: formData.estado,
            };

            await axios.post('/parametros/areas', payload);
            alert('✅ Área registrada con éxito.');
            navigate('/parametros/areas');
        } catch (error: any) {
            console.error('❌ Error al registrar área:', error);
            alert(error?.response?.data?.message || '❌ Error al registrar el área.');
        }
        finally {
            setCargando(false);
        }
    };


    return (
        <div className="container mt-4">
            <div className="form-container">
                <h4 className="mb-4">Nueva Área</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="codigo" className="form-label">Código</label>
                        <input
                            type="text"
                            id="codigo"
                            name="codigo"
                            className={`form-control ${!codigoDisponible ? 'is-invalid' : ''}`}
                            value={formData.codigo}
                            onChange={handleChange}
                            required
                        />
                        {mensajeCodigo && <div className="invalid-feedback">{mensajeCodigo}</div>}
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

                    <button type="submit" className="btn btn-primary" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Registrar'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => navigate('/parametros/areas')}
                    >
                        Cancelar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistroAreas;
