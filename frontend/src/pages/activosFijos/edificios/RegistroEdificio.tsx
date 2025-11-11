import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

interface CodigoEdificio {
    codigo_gobierno: string;
    codigo_institucional: string;
    codigo_direccion_administrativa: string;
    codigo_distrito: string;
    codigo_sector_area: string;
    codigo_unidad_organizacional: string;
    codigo_cargo: string;
    codigo_ambiente: string;
    codigo_grupo_contable: string;
    codigo_correlativo: string;
}

const RegistroEdificio = () => {
    const navigate = useNavigate();

    const [codigos, setCodigos] = useState<CodigoEdificio>({
        codigo_gobierno: 'GAMS',
        codigo_institucional: '1101',
        codigo_direccion_administrativa: '',
        codigo_distrito: '',
        codigo_sector_area: '',
        codigo_unidad_organizacional: '',
        codigo_cargo: '',
        codigo_ambiente: '',
        codigo_grupo_contable: '',
        codigo_correlativo: '',
    });

    const [codigoCompleto, setCodigoCompleto] = useState<string>('');
    const [generando, setGenerando] = useState(false);
    const [direcciones, setDirecciones] = useState<any[]>([]);
    const [filtroDireccion, setFiltroDireccion] = useState('');
    const [direccionSeleccionada, setDireccionSeleccionada] = useState<any | null>(null);

    const seleccionarDireccion = (direccion: any) => {
        setDireccionSeleccionada(direccion);
        setCodigos((prev) => ({
            ...prev,
            codigo_direccion_administrativa: direccion.codigo,
        }));
        setFiltroDireccion(direccion.descripcion);

        // 🔹 Cierra el listado automáticamente después de seleccionar
        setTimeout(() => setFiltroDireccion(''), 200);
    };


    // 🔹 Generar código correlativo automáticamente desde backend
    const generarCorrelativo = async () => {
        try {
            setGenerando(true);
            const res = await axiosInstance.get('/activos-fijos/edificios'); // podemos crear endpoint /siguiente-correlativo si quieres
            const edificios = res.data.data;
            const ultimo = edificios.length > 0 ? edificios[edificios.length - 1] : null;
            const correlativo = ultimo
                ? String(parseInt(ultimo.codigo_correlativo) + 1).padStart(4, '0')
                : '0001';
            setCodigos((prev) => ({ ...prev, codigo_correlativo: correlativo }));
        } catch (err) {
            console.error('Error generando correlativo:', err);
        } finally {
            setGenerando(false);
        }
    };

    useEffect(() => {
        const cargarDirecciones = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axiosInstance.get('/parametros/direcciones-administrativas', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Filtramos solo las activas
                setDirecciones(res.data.filter((d: any) => d.estado === 'ACTIVO'));
            } catch (error) {
                console.error('❌ Error al cargar direcciones administrativas:', error);
            }
        };
        cargarDirecciones();
    }, []);


    // 🔹 Recalcular código completo cada vez que cambie algo
    useEffect(() => {
        const partes = Object.values(codigos).map((v) => v || '');
        setCodigoCompleto(partes.join('.'));
    }, [codigos]);

    // 🔹 Manejar cambios de input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCodigos((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    };

    // 🔹 Ir al siguiente paso
    const siguiente = () => {
        // En el siguiente paso guardaremos los demás datos del edificio
        console.log('Datos del código inicial:', codigos);
        navigate('/activos-fijos/edificios/detalles', { state: { codigos, codigoCompleto } });
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <h4 className="fw-bold text-primary mb-3">
                        <i className="bi bi-building me-2"></i> Registro de Edificio - Codificación GAMS
                    </h4>

                    <div className="row g-3">
                        <div className="col-md-2">
                            <label className="form-label">1. Gobierno</label>
                            <input
                                type="text"
                                className="form-control"
                                name="codigo_gobierno"
                                value={codigos.codigo_gobierno}
                                onChange={handleChange}
                                disabled
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">2. Institucional</label>
                            <input
                                type="text"
                                className="form-control"
                                name="codigo_institucional"
                                value={codigos.codigo_institucional}
                                onChange={handleChange}
                                disabled
                            />
                        </div>

                        <div className="col-md-2 position-relative">
                            <label className="form-label">3. Dirección Adm.</label>

                            {/* Campo principal muestra el código */}
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar dirección..."
                                value={codigos.codigo_direccion_administrativa}
                                onChange={(e) => setFiltroDireccion(e.target.value)}
                                autoComplete="off"
                                required
                            />

                            {/* Lista de resultados filtrados */}
                            {filtroDireccion && direcciones.length > 0 && (
                                <ul
                                    className="list-group position-absolute w-100 shadow-sm mt-1"
                                    style={{ zIndex: 1000, maxHeight: '180px', overflowY: 'auto' }}
                                >
                                    {direcciones
                                        .filter(
                                            (d) =>
                                                d.descripcion.toLowerCase().includes(filtroDireccion.toLowerCase()) ||
                                                d.codigo.toLowerCase().includes(filtroDireccion.toLowerCase())
                                        )
                                        .slice(0, 5)
                                        .map((d) => (
                                            <li
                                                key={d.id}
                                                className="list-group-item list-group-item-action"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => seleccionarDireccion(d)}
                                            >
                                                <strong>{d.codigo}</strong> - {d.descripcion}
                                            </li>
                                        ))}
                                </ul>
                            )}

                            {/* Texto debajo con selección */}
                            {direccionSeleccionada && (
                                <div className="mt-1 small text-muted">
                                    Seleccionado:{' '}
                                    <strong>{direccionSeleccionada.descripcion}</strong> ({direccionSeleccionada.codigo})
                                </div>
                            )}
                        </div>



                        <div className="col-md-2">
                            <label className="form-label">4. Distrito</label>
                            <input
                                type="text"
                                className="form-control"
                                name="codigo_distrito"
                                value={codigos.codigo_distrito}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">5. Sector / Área</label>
                            <input
                                type="text"
                                className="form-control"
                                name="codigo_sector_area"
                                value={codigos.codigo_sector_area}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">6. Unidad Org.</label>
                            <input
                                type="text"
                                className="form-control"
                                name="codigo_unidad_organizacional"
                                value={codigos.codigo_unidad_organizacional}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">7. Cargo</label>
                            <input
                                type="text"
                                className="form-control"
                                name="codigo_cargo"
                                value={codigos.codigo_cargo}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">8. Ambiente</label>
                            <input
                                type="text"
                                className="form-control"
                                name="codigo_ambiente"
                                value={codigos.codigo_ambiente}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">9. Grupo Contable</label>
                            <input
                                type="text"
                                className="form-control"
                                name="codigo_grupo_contable"
                                value={codigos.codigo_grupo_contable}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">10. Correlativo</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="codigo_correlativo"
                                    value={codigos.codigo_correlativo}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={generarCorrelativo}
                                    disabled={generando}
                                >
                                    {generando ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <i className="bi bi-arrow-repeat"></i>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Vista previa del código completo */}
                    <div className="alert alert-info mt-4">
                        <strong>Código completo generado:</strong>
                        <div className="fs-5 mt-2 text-primary">{codigoCompleto || '—'}</div>
                    </div>

                    <div className="mt-3 d-flex justify-content-end gap-2">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/activos-fijos/edificios')}
                        >
                            <i className="bi bi-arrow-left me-1"></i> Cancelar
                        </button>
                        <button className="btn btn-primary" onClick={siguiente}>
                            Siguiente <i className="bi bi-arrow-right ms-1"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistroEdificio;
