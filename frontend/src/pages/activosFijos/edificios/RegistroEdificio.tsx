import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';


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

    // 🏗️ Campos restantes del edificio
    const [form, setForm] = useState({
        nombre_bien: '',
        ubicacion: '',
        ingreso: '',
        descripcion_ingreso: '',
        fecha_factura_donacion: '',
        nro_factura: '',
        proveedor_donante: '',
        respaldo_legal: '',
        descripcion_respaldo_legal: '',
        clasificacion: '',
        uso: '',
        superficie: '',
        servicios: [] as string[],
        observaciones: '',
        estado_conservacion: '',
        valor_bs: '',
        vida_util_anios: '',
        fotos_edificio: [] as File[],
        archivo_respaldo_pdf: null as File | null,
        responsable_id: '',
    });

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

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const [codigoCompleto, setCodigoCompleto] = useState<string>('');
    const [generando, setGenerando] = useState(false);
    const [direcciones, setDirecciones] = useState<any[]>([]);
    const [filtroDireccion, setFiltroDireccion] = useState('');
    const [direccionSeleccionada, setDireccionSeleccionada] = useState<any | null>(null);
    const [distritosFiltrados, setDistritosFiltrados] = useState<any[]>([]);
    const [filtroDistrito, setFiltroDistrito] = useState('');
    const [distritoSeleccionado, setDistritoSeleccionado] = useState<any | null>(null);
    const [areas, setAreas] = useState<any[]>([]);
    const [filtroArea, setFiltroArea] = useState('');
    const [areaSeleccionada, setAreaSeleccionada] = useState<any | null>(null);
    const [unidades, setUnidades] = useState<any[]>([]);
    const [filtroUnidad, setFiltroUnidad] = useState('');
    const [unidadSeleccionada, setUnidadSeleccionada] = useState<any | null>(null);
    const [ambientes, setAmbientes] = useState<any[]>([]);
    const [filtroAmbiente, setFiltroAmbiente] = useState('');
    const [ambienteSeleccionado, setAmbienteSeleccionado] = useState<any | null>(null);
    const [cargos, setCargos] = useState<any[]>([]);
    const [filtroCargo, setFiltroCargo] = useState('');
    const [cargoSeleccionado, setCargoSeleccionado] = useState<any | null>(null);
    const [gruposContables, setGruposContables] = useState<any[]>([]);
    const [filtroGrupo, setFiltroGrupo] = useState('');
    const [grupoSeleccionado, setGrupoSeleccionado] = useState<any | null>(null);
    const [correlativo, setCorrelativo] = useState('');
    const [cargandoCorrelativo, setCargandoCorrelativo] = useState(false);
    const [responsables, setResponsables] = useState<any[]>([]);

    const [archivoPdf, setArchivoPdf] = useState<File | null>(null);
    const [fotos, setFotos] = useState<File[]>([]);



    const generarCorrelativo = async () => {
        try {
            setCargandoCorrelativo(true);
            const token = localStorage.getItem('token');
            const res = await axiosInstance.get('/activos-fijos/edificios/siguiente-correlativo', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const nuevo = res.data?.data?.correlativo || '';
            setCorrelativo(nuevo);
            setCodigos((prev) => ({ ...prev, codigo_correlativo: nuevo }));
        } catch (error: any) {
            console.error('❌ Error al generar correlativo:', error);
            toast.error(
                error.response?.data?.message ||
                'Error al generar correlativo. Intenta de nuevo.'
            );
        } finally {
            setCargandoCorrelativo(false);
        }
    };

    const seleccionarGrupo = (grupo: any) => {
        setGrupoSeleccionado(grupo);
        setCodigos((prev) => ({
            ...prev,
            codigo_grupo_contable: grupo.codigo,
        }));
        setFiltroGrupo(''); // 🔹 Limpia el filtro para mostrar el código
    };


    const seleccionarCargo = (cargo: any) => {
        setCargoSeleccionado(cargo);
        setCodigos((prev) => ({
            ...prev,
            codigo_cargo: cargo.codigo,
        }));
        setFiltroCargo(''); //  Limpia el filtro para que quede el código visible
    };


    const seleccionarAmbiente = (ambiente: any) => {
        setAmbienteSeleccionado(ambiente);
        setCodigos((prev) => ({
            ...prev,
            codigo_ambiente: ambiente.codigo,
        }));
        setFiltroAmbiente(''); //  Limpia para mostrar el código
    };


    const seleccionarUnidad = (unidad: any) => {
        setUnidadSeleccionada(unidad);
        setCodigos((prev) => ({
            ...prev,
            codigo_unidad_organizacional: unidad.codigo,
        }));
        setFiltroUnidad(''); //  Limpia el texto para mostrar el código
    };


    const seleccionarArea = (area: any) => {
        setAreaSeleccionada(area);
        setCodigos((prev) => ({
            ...prev,
            codigo_sector_area: area.codigo,
        }));
        setFiltroArea(''); // Limpia el texto del input para que quede el código
    };

    const seleccionarDistrito = (distrito: any) => {
        setDistritoSeleccionado(distrito);
        setCodigos((prev) => ({
            ...prev,
            codigo_distrito: distrito.codigo,
        }));
        setFiltroDistrito('');
    };

    const seleccionarDireccion = (direccion: any) => {
        setDireccionSeleccionada(direccion);
        setCodigos((prev) => ({
            ...prev,
            codigo_direccion_administrativa: direccion.codigo,
        }));
        setFiltroDireccion(direccion.descripcion);

        //  Cierra el listado automáticamente después de seleccionar
        setTimeout(() => setFiltroDireccion(''), 200);
    };

    const handleGuardarEdificio = async () => {
        try {
            const token = localStorage.getItem('token');
            const creado_por_id = localStorage.getItem('userId') || 1;

            const payload = {
                ...codigos,
                ...form,
                creado_por_id: Number(creado_por_id),
                responsable_id: Number(form.responsable_id),
                unidad_organizacional_id: unidadSeleccionada?.id,
                cargo_id: cargoSeleccionado?.id,
                codigo_completo: codigoCompleto,
            };

            const res = await axiosInstance.post('/activos-fijos/edificios', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const edificioId = res.data?.data?.id;
            toast.success('✅ Edificio creado correctamente');

            // Subir PDF
            if (archivoPdf && edificioId) {
                const formData = new FormData();
                formData.append('file', archivoPdf);
                await axiosInstance.post(`/activos-fijos/edificios/${edificioId}/upload/pdf`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            // Subir fotos
            if (fotos.length > 0 && edificioId) {
                const formData = new FormData();
                fotos.forEach((f) => formData.append('fotos', f));
                await axiosInstance.post(`/activos-fijos/edificios/${edificioId}/upload/fotos`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            navigate('/edificios');
        } catch (error: any) {
            console.error('❌ Error al guardar edificio:', error);
            toast.error(error.response?.data?.message || 'Error al guardar el edificio');
        }
    };

    useEffect(() => {
        const cargarResponsables = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axiosInstance.get('/parametros/personal', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // El backend devuelve todos (activos e inactivos), filtramos aquí:
                const activos = (res.data.data || res.data).filter(
                    (p: any) => p.estado === 'ACTIVO'
                );

                // El nombre completo puede estar dividido, así que construimos uno
                const normalizados = activos.map((p: any) => ({
                    id: p.id,
                    nombre: p.nombre ?? p.usuario?.nombre ?? 'Sin nombre',
                    ci: p.ci ?? '',
                }));

                setResponsables(normalizados);
            } catch (error) {
                console.error('❌ Error al cargar responsables:', error);
                setResponsables([]);
            }
        };

        cargarResponsables();
    }, []);



    useEffect(() => {
        const cargarGruposContables = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axiosInstance.get('/parametros/grupos-contables?estado=ACTIVO', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = res.data.data || res.data;
                setGruposContables(data);
            } catch (error) {
                console.error('❌ Error al cargar grupos contables:', error);
            }
        };

        cargarGruposContables();
    }, []);


    useEffect(() => {
        const buscarCargos = async () => {
            try {
                const token = localStorage.getItem('token');
                const q = filtroCargo.trim();
                const ambienteSel = ambienteSeleccionado;

                if (!ambienteSel) {
                    setCargos([]);
                    return;
                }

                // ✅ Corrección: parámetros exactos del backend
                const params = new URLSearchParams({
                    ambiente_id: ambienteSel.id.toString(),
                    q: q || '',
                });

                const endpoint = `/parametros/cargos/buscar-por-ambiente?${params.toString()}`;
                const res = await axiosInstance.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = res.data.data || res.data;
                setCargos(data);
            } catch (error) {
                console.error('❌ Error al buscar cargos:', error);
                setCargos([]);
            }
        };

        buscarCargos();
    }, [filtroCargo, ambienteSeleccionado]);

    useEffect(() => {
        const buscarAmbientes = async () => {
            try {
                const token = localStorage.getItem('token');
                const q = filtroAmbiente.trim();
                const unidadSel = unidadSeleccionada;

                if (!unidadSel) {
                    setAmbientes([]);
                    return;
                }

                // ✅ Corrección: usar nombres exactos del backend
                const params = new URLSearchParams({
                    unidad_organizacional_id: unidadSel.id.toString(),
                    search: q || '', // si está vacío, backend igual responderá sin error
                });

                const endpoint = `/parametros/ambientes/buscar?${params.toString()}`;
                const res = await axiosInstance.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = res.data.data || res.data;
                setAmbientes(data);
            } catch (error) {
                console.error('❌ Error al buscar ambientes:', error);
                setAmbientes([]);
            }
        };

        buscarAmbientes();
    }, [filtroAmbiente, unidadSeleccionada]);



    useEffect(() => {
        const buscarUnidades = async () => {
            try {
                const token = localStorage.getItem('token');
                const q = filtroUnidad.trim();
                const areaSel = areaSeleccionada;

                if (!areaSel) {
                    setUnidades([]); // Si no hay área, no se muestran unidades
                    return;
                }

                const params = new URLSearchParams({
                    estado: 'ACTIVO',
                    area_id: areaSel.id,
                });
                if (q) params.append('q', q);

                const endpoint = `/parametros/unidades-organizacionales/buscar?${params.toString()}`;
                const res = await axiosInstance.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = res.data.data || res.data;
                setUnidades(data);
            } catch (error) {
                console.error('❌ Error al buscar unidades organizacionales:', error);
            }
        };

        buscarUnidades();
    }, [filtroUnidad, areaSeleccionada]);


    useEffect(() => {
        const cargarAreas = async () => {
            try {
                const token = localStorage.getItem('token');
                const q = filtroArea.trim();
                const endpoint = '/parametros/areas?estado=ACTIVO';
                const res = await axiosInstance.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = res.data.data || res.data;
                // Si el usuario está escribiendo, filtramos localmente
                const filtradas = q
                    ? data.filter((a: any) =>
                        a.descripcion.toLowerCase().includes(q.toLowerCase()) ||
                        a.codigo.toLowerCase().includes(q.toLowerCase())
                    )
                    : data;
                setAreas(filtradas);
            } catch (error) {
                console.error('❌ Error al cargar áreas:', error);
            }
        };

        cargarAreas();
    }, [filtroArea]);


    useEffect(() => {
        const buscarDistritos = async () => {
            try {
                const token = localStorage.getItem('token');
                const q = filtroDistrito.trim();
                // si no hay texto, traer los primeros 10 activos
                const endpoint = q
                    ? `/parametros/distritos/buscar?q=${encodeURIComponent(q)}`
                    : '/parametros/distritos?estado=ACTIVO';
                const res = await axiosInstance.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = res.data.data || res.data; // compatibilidad con ambos formatos
                setDistritosFiltrados(data.filter((d: any) => d.estado === 'ACTIVO'));
            } catch (error) {
                console.error('❌ Error al cargar distritos:', error);
            }
        };

        buscarDistritos();
    }, [filtroDistrito]);


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

    useEffect(() => {
        const cargarResponsables = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axiosInstance.get('/parametros/personal?estado=ACTIVO', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setResponsables(res.data.data || res.data);
            } catch (error) {
                console.error('❌ Error al cargar responsables:', error);
            }
        };
        cargarResponsables();
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

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar dirección..."
                                // ✅ Muestra el código si hay uno seleccionado
                                value={
                                    filtroDireccion ||
                                    (direccionSeleccionada ? direccionSeleccionada.codigo : '')
                                }
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
                                                d.descripcion
                                                    .toLowerCase()
                                                    .includes(filtroDireccion.toLowerCase()) ||
                                                d.codigo
                                                    .toLowerCase()
                                                    .includes(filtroDireccion.toLowerCase())
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

                            {/* ✅ Mostrar descripción debajo del input */}
                            {direccionSeleccionada && (
                                <div className="mt-1 small text-muted">
                                    Seleccionado: <strong>{direccionSeleccionada.descripcion}</strong> ({direccionSeleccionada.codigo})
                                </div>
                            )}
                        </div>


                        <div className="col-md-2 position-relative">
                            <label className="form-label">4. Distrito</label>

                            {/* Campo principal del distrito */}
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar distrito..."
                                value={filtroDistrito || codigos.codigo_distrito}
                                onChange={(e) => setFiltroDistrito(e.target.value)}
                                autoComplete="off"
                                required
                            />

                            {/* Lista desplegable con resultados */}
                            {filtroDistrito && distritosFiltrados.length > 0 && (
                                <ul
                                    className="list-group position-absolute w-100 shadow-sm mt-1"
                                    style={{ zIndex: 1000, maxHeight: '180px', overflowY: 'auto' }}
                                >
                                    {distritosFiltrados.slice(0, 5).map((d) => (
                                        <li
                                            key={d.id}
                                            className="list-group-item list-group-item-action"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => seleccionarDistrito(d)}
                                        >
                                            <strong>{d.codigo}</strong> - {d.descripcion}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Texto de selección debajo */}
                            {distritoSeleccionado && (
                                <div className="mt-1 small text-muted">
                                    Seleccionado:{' '}
                                    <strong>{distritoSeleccionado.descripcion}</strong> ({distritoSeleccionado.codigo})
                                </div>
                            )}
                        </div>
                        <div className="col-md-2 position-relative">
                            <label className="form-label">5. Sector / Área</label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar área..."
                                // ✅ Mostrar el código si hay selección, sino el texto buscado
                                value={
                                    filtroArea === '' && areaSeleccionada
                                        ? areaSeleccionada.codigo
                                        : filtroArea
                                }
                                onChange={(e) => setFiltroArea(e.target.value)}
                                autoComplete="off"
                                required
                            />

                            {/* Lista de sugerencias */}
                            {filtroArea && areas.length > 0 && (
                                <ul
                                    className="list-group position-absolute w-100 shadow-sm mt-1"
                                    style={{ zIndex: 1000, maxHeight: '180px', overflowY: 'auto' }}
                                >
                                    {areas
                                        .filter(
                                            (a) =>
                                                a.descripcion
                                                    .toLowerCase()
                                                    .includes(filtroArea.toLowerCase()) ||
                                                a.codigo
                                                    .toLowerCase()
                                                    .includes(filtroArea.toLowerCase())
                                        )
                                        .slice(0, 5)
                                        .map((a) => (
                                            <li
                                                key={a.id}
                                                className="list-group-item list-group-item-action"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => seleccionarArea(a)}
                                            >
                                                <strong>{a.codigo}</strong> - {a.descripcion}
                                            </li>
                                        ))}
                                </ul>
                            )}

                            {areaSeleccionada && (
                                <div className="mt-1 small text-muted">
                                    Seleccionado: <strong>{areaSeleccionada.descripcion}</strong> ({areaSeleccionada.codigo})
                                </div>
                            )}
                        </div>

                        <div className="col-md-2 position-relative">
                            <label className="form-label">6. Unidad Org.</label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder={
                                    areaSeleccionada
                                        ? "Buscar unidad..."
                                        : "Selecciona un área primero"
                                }
                                //  Mostrar el código si ya hay una unidad seleccionada
                                value={
                                    filtroUnidad === '' && unidadSeleccionada
                                        ? unidadSeleccionada.codigo
                                        : filtroUnidad
                                }
                                onChange={(e) => setFiltroUnidad(e.target.value)}
                                autoComplete="off"
                                disabled={!areaSeleccionada}
                                required
                            />

                            {filtroUnidad && unidades.length > 0 && (
                                <ul
                                    className="list-group position-absolute w-100 shadow-sm mt-1"
                                    style={{ zIndex: 1000, maxHeight: '180px', overflowY: 'auto' }}
                                >
                                    {unidades
                                        .filter(
                                            (u) =>
                                                u.descripcion
                                                    .toLowerCase()
                                                    .includes(filtroUnidad.toLowerCase()) ||
                                                u.codigo
                                                    .toLowerCase()
                                                    .includes(filtroUnidad.toLowerCase())
                                        )
                                        .slice(0, 5)
                                        .map((u) => (
                                            <li
                                                key={u.id}
                                                className="list-group-item list-group-item-action"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => seleccionarUnidad(u)}
                                            >
                                                <strong>{u.codigo}</strong> - {u.descripcion}
                                            </li>
                                        ))}
                                </ul>
                            )}

                            {/*  Descripción debajo */}
                            {unidadSeleccionada && (
                                <div className="mt-1 small text-muted">
                                    Seleccionado:{' '}
                                    <strong>{unidadSeleccionada.descripcion}</strong> ({unidadSeleccionada.codigo})
                                </div>
                            )}
                        </div>

                        <div className="col-md-2 position-relative">
                            <label className="form-label">7. Ambiente</label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder={
                                    unidadSeleccionada
                                        ? "Buscar ambiente..."
                                        : "Selecciona una unidad primero"
                                }
                                // ✅ Muestra el código si ya hay un ambiente seleccionado
                                value={
                                    filtroAmbiente === '' && ambienteSeleccionado
                                        ? ambienteSeleccionado.codigo
                                        : filtroAmbiente
                                }
                                onChange={(e) => setFiltroAmbiente(e.target.value)}
                                autoComplete="off"
                                disabled={!unidadSeleccionada}
                                required
                            />

                            {/* Lista de sugerencias */}
                            {filtroAmbiente && ambientes.length > 0 && (
                                <ul
                                    className="list-group position-absolute w-100 shadow-sm mt-1"
                                    style={{ zIndex: 1000, maxHeight: '180px', overflowY: 'auto' }}
                                >
                                    {ambientes
                                        .filter(
                                            (a) =>
                                                a.descripcion
                                                    .toLowerCase()
                                                    .includes(filtroAmbiente.toLowerCase()) ||
                                                a.codigo
                                                    .toLowerCase()
                                                    .includes(filtroAmbiente.toLowerCase())
                                        )
                                        .slice(0, 5)
                                        .map((a) => (
                                            <li
                                                key={a.id}
                                                className="list-group-item list-group-item-action"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => seleccionarAmbiente(a)}
                                            >
                                                <strong>{a.codigo}</strong> - {a.descripcion}
                                            </li>
                                        ))}
                                </ul>
                            )}

                            {/* ✅ Descripción debajo */}
                            {ambienteSeleccionado && (
                                <div className="mt-1 small text-muted">
                                    Seleccionado:{' '}
                                    <strong>{ambienteSeleccionado.descripcion}</strong> ({ambienteSeleccionado.codigo})
                                </div>
                            )}
                        </div>



                        <div className="col-md-2 position-relative">
                            <label className="form-label">8. Cargo</label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder={
                                    ambienteSeleccionado
                                        ? "Buscar cargo..."
                                        : "Selecciona un ambiente primero"
                                }
                                // ✅ Mostrar el código si ya hay un cargo seleccionado
                                value={
                                    filtroCargo === '' && cargoSeleccionado
                                        ? cargoSeleccionado.codigo
                                        : filtroCargo
                                }
                                onChange={(e) => setFiltroCargo(e.target.value)}
                                autoComplete="off"
                                disabled={!ambienteSeleccionado}
                                required
                            />

                            {/* Lista de sugerencias */}
                            {filtroCargo && cargos.length > 0 && (
                                <ul
                                    className="list-group position-absolute w-100 shadow-sm mt-1"
                                    style={{ zIndex: 1000, maxHeight: '180px', overflowY: 'auto' }}
                                >
                                    {cargos
                                        .filter(
                                            (c) =>
                                                c.cargo
                                                    .toLowerCase()
                                                    .includes(filtroCargo.toLowerCase()) ||
                                                c.codigo
                                                    .toLowerCase()
                                                    .includes(filtroCargo.toLowerCase())
                                        )
                                        .slice(0, 5)
                                        .map((c) => (
                                            <li
                                                key={c.id}
                                                className="list-group-item list-group-item-action"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => seleccionarCargo(c)}
                                            >
                                                <strong>{c.codigo}</strong> - {c.cargo}
                                            </li>
                                        ))}
                                </ul>
                            )}

                            {/* ✅ Descripción debajo */}
                            {cargoSeleccionado && (
                                <div className="mt-1 small text-muted">
                                    Seleccionado:{' '}
                                    <strong>{cargoSeleccionado.cargo}</strong> ({cargoSeleccionado.codigo})
                                </div>
                            )}
                        </div>



                        <div className="col-md-2 position-relative">
                            <label className="form-label">9. Grupo Contable</label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar grupo..."
                                // ✅ Muestra el código si hay un grupo seleccionado
                                value={
                                    filtroGrupo === '' && grupoSeleccionado
                                        ? grupoSeleccionado.codigo
                                        : filtroGrupo
                                }
                                onChange={(e) => setFiltroGrupo(e.target.value)}
                                autoComplete="off"
                                required
                            />

                            {/* Lista de sugerencias */}
                            {filtroGrupo && gruposContables.length > 0 && (
                                <ul
                                    className="list-group position-absolute w-100 shadow-sm mt-1"
                                    style={{ zIndex: 1000, maxHeight: '180px', overflowY: 'auto' }}
                                >
                                    {gruposContables
                                        .filter(
                                            (g) =>
                                                g.descripcion
                                                    .toLowerCase()
                                                    .includes(filtroGrupo.toLowerCase()) ||
                                                g.codigo
                                                    .toLowerCase()
                                                    .includes(filtroGrupo.toLowerCase())
                                        )
                                        .slice(0, 6)
                                        .map((g) => (
                                            <li
                                                key={g.id}
                                                className="list-group-item list-group-item-action"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => seleccionarGrupo(g)}
                                            >
                                                <strong>{g.codigo}</strong> - {g.descripcion}
                                            </li>
                                        ))}
                                </ul>
                            )}

                            {/* ✅ Descripción debajo */}
                            {grupoSeleccionado && (
                                <div className="mt-1 small text-muted">
                                    Seleccionado:{' '}
                                    <strong>{grupoSeleccionado.descripcion}</strong> ({grupoSeleccionado.codigo})
                                </div>
                            )}
                        </div>



                        <div className="col-md-2 position-relative">
                            <label className="form-label">10. Correlativo</label>

                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Generar correlativo"
                                    value={correlativo}
                                    readOnly
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={generarCorrelativo}
                                    disabled={cargandoCorrelativo}
                                    title="Generar correlativo"
                                >
                                    {cargandoCorrelativo ? (
                                        <i className="fa fa-spinner fa-spin"></i>
                                    ) : (
                                        <i className="fa fa-sync"></i>
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

                    {/* 🔹 Sección de datos del edificio */}
                    <hr className="my-4" />
                    <h5 className="text-primary fw-bold mb-3">Datos del Edificio</h5>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Nombre del Bien</label>
                            <input name="nombre_bien" className="form-control" value={form.nombre_bien} onChange={handleFormChange} required />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Ubicación</label>
                            <input name="ubicacion" className="form-control" value={form.ubicacion} onChange={handleFormChange} required />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Ingreso</label>
                            <input name="ingreso" className="form-control" value={form.ingreso} onChange={handleFormChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Descripción Ingreso</label>
                            <input name="descripcion_ingreso" className="form-control" value={form.descripcion_ingreso} onChange={handleFormChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Fecha Factura / Donación</label>
                            <input type="date" name="fecha_factura_donacion" className="form-control" value={form.fecha_factura_donacion} onChange={handleFormChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Nro. Factura</label>
                            <input name="nro_factura" className="form-control" value={form.nro_factura} onChange={handleFormChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Proveedor / Donante</label>
                            <input name="proveedor_donante" className="form-control" value={form.proveedor_donante} onChange={handleFormChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Respaldo Legal</label>
                            <input name="respaldo_legal" className="form-control" value={form.respaldo_legal} onChange={handleFormChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Descripción Respaldo Legal</label>
                            <textarea name="descripcion_respaldo_legal" className="form-control" value={form.descripcion_respaldo_legal} onChange={handleFormChange}></textarea>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Clasificación</label>
                            <input name="clasificacion" className="form-control" value={form.clasificacion} onChange={handleFormChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Uso</label>
                            <input name="uso" className="form-control" value={form.uso} onChange={handleFormChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Estado de Conservación</label>
                            <input name="estado_conservacion" className="form-control" value={form.estado_conservacion} onChange={handleFormChange} />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Superficie (m²)</label>
                            <input type="number" name="superficie" className="form-control" value={form.superficie} onChange={handleFormChange} />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Valor (Bs)</label>
                            <input type="number" name="valor_bs" className="form-control" value={form.valor_bs} onChange={handleFormChange} />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Vida útil (años)</label>
                            <input type="number" name="vida_util_anios" className="form-control" value={form.vida_util_anios} onChange={handleFormChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Servicios</label>
                            <div className="d-flex flex-wrap gap-3">
                                {['Agua', 'Electricidad', 'Alcantarillado', 'Internet', 'Gas'].map((serv) => (
                                    <div key={serv} className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={serv}
                                            checked={form.servicios.includes(serv)}
                                            onChange={(e) => {
                                                if (e.target.checked)
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        servicios: [...prev.servicios, serv],
                                                    }));
                                                else
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        servicios: prev.servicios.filter((s) => s !== serv),
                                                    }));
                                            }}
                                        />
                                        <label className="form-check-label" htmlFor={serv}>
                                            {serv}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className="col-md-3">
                            <label className="form-label">Responsable</label>
                            <select
                                name="responsable_id"
                                className="form-select"
                                value={form.responsable_id}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="">Seleccione...</option>
                                {responsables.map((r: any) => (
                                    <option key={r.id} value={r.id}>
                                        {r.nombre} {r.ci ? ` - CI: ${r.ci}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">Observaciones</label>
                            <textarea
                                name="observaciones"
                                className="form-control"
                                rows={3}
                                value={form.observaciones}
                                onChange={handleFormChange}
                            ></textarea>
                        </div>



                        {/* 📎 Archivos */}
                        <div className="col-md-6">
                            <label className="form-label">Archivo PDF de respaldo</label>
                            <input type="file" accept="application/pdf" className="form-control" onChange={(e) => setArchivoPdf(e.target.files?.[0] || null)} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Fotos del Edificio</label>
                            <input type="file" accept="image/*" multiple className="form-control" onChange={(e) => setFotos(Array.from(e.target.files || []))} />
                        </div>
                    </div>

                    {/* 🔘 Botón Guardar */}
                    <div className="mt-4 d-flex justify-content-end">
                        <button className="btn btn-primary" onClick={handleGuardarEdificio}>
                            <i className="bi bi-save me-2"></i> Guardar Edificio
                        </button>
                    </div>


                    <div className="mt-3 d-flex justify-content-end gap-2">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/edificios')}
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
