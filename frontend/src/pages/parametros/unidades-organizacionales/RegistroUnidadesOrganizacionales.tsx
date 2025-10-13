import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface Area {
    id: number;
    codigo: string;
    descripcion: string;
}

const RegistroUnidadesOrganizacionales = () => {
    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        area_id: '',
    });

    const [areas, setAreas] = useState<Area[]>([]);
    const [error, setError] = useState('');
    const [codigoAreaSeleccionada, setCodigoAreaSeleccionada] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        obtenerAreas();
    }, []);

    const obtenerAreas = async () => {
        try {
            const res = await axios.get<Area[]>('/parametros/areas');
            setAreas(res.data);
        } catch (err) {
            console.error('❌ Error al obtener áreas:', err);
        }
    };

    const generarCodigoUnidad = async (codigoArea: string) => {
        try {
            if (!codigoArea || typeof codigoArea !== 'string' || codigoArea.trim() === '') {
                console.warn('❗ Código de área inválido:', codigoArea);
                alert('El código del área es inválido.');
                return;
            }

            console.log('📤 Generando código con códigoArea:', codigoArea);

            const res = await axios.get<{ total: number }>(
                `/parametros/unidades-organizacionales/contar?codigo_area=${codigoArea}`
            );

            const correlativo = res.data.total + 1;
            const correlativoFormateado = correlativo.toString().padStart(3, '0');
            const codigoGenerado = `${codigoArea}.${correlativoFormateado}`;

            console.log('✅ Código generado automáticamente:', codigoGenerado);

            setFormData((prev) => ({
                ...prev,
                codigo: codigoGenerado,
            }));
        } catch (error) {
            console.error('❌ Error al generar código automático:', error);
            alert('No se pudo generar el código.');
        }
    };


    const handleChange = async (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Si se selecciona un área, buscar su código y generar código automático
        if (name === 'area_id') {
            const areaSeleccionada = areas.find((area) => area.id.toString() === value);

            console.log('🧩 Área seleccionada:', areaSeleccionada);

            if (areaSeleccionada && areaSeleccionada.codigo) {
                setCodigoAreaSeleccionada(areaSeleccionada.codigo);
                await generarCodigoUnidad(areaSeleccionada.codigo);
            } else {
                console.warn('⚠️ No se encontró el código de área o está vacío');

                setCodigoAreaSeleccionada('');
                setFormData((prev) => ({
                    ...prev,
                    codigo: '',
                }));
            }
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { codigo, descripcion, area_id } = formData;

        if (!codigo || !descripcion || !area_id) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        try {
            await axios.post('/parametros/unidades-organizacionales', {
                codigo: codigo.trim(),
                descripcion: descripcion.trim(),
                area_id: parseInt(area_id),
            });

            navigate('/parametros/unidades-organizacionales');
        } catch (err: any) {
            console.error('❌ Error al registrar unidad organizacional:', err);
            setError('Error al registrar. Intenta nuevamente.');
        }
    };

    return (
        <div className="container mt-4">
            <h4 className="mb-3">Registrar Unidad Organizacional</h4>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                {/* Área */}
                <div className="mb-3">
                    <label htmlFor="area_id" className="form-label">
                        Área
                    </label>
                    <select
                        id="area_id"
                        name="area_id"
                        className="form-select"
                        value={formData.area_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un área</option>
                        {areas.map((area) => (
                            <option key={area.id} value={area.id}>
                                {area.descripcion}
                            </option>
                        ))}
                    </select>
                    {codigoAreaSeleccionada && (
                        <div className="mt-2 text-muted">
                            <strong>Código de Área:</strong> {codigoAreaSeleccionada}
                        </div>
                    )}
                </div>

                {/* Código */}
                <div className="mb-3">
                    <label htmlFor="codigo" className="form-label">
                        Código
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="codigo"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleChange}
                        required
                        readOnly
                    />
                </div>

                {/* Descripción */}
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

                {/* Botón guardar */}
                <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary">
                        <i className="bi bi-save me-2"></i>Guardar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistroUnidadesOrganizacionales;
