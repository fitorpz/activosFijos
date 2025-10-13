// src/pages/tickets/ImprimirTickets.tsx
import { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { Button, Form } from 'react-bootstrap';

interface Area {
    id: number;
    codigo: string;
    descripcion: string;
}

interface UnidadOrganizacional {
    id: number;
    codigo: string;
    descripcion: string;
}

interface Ambiente {
    id: number;
    codigo: string;
    descripcion: string;
}

interface Cargo {
    id: number;
    codigo: string;
    cargo: string;
}

interface Edificio {
    id_311: number;
    codigo_311: string;
    descripcion_edificio: string;
}

const ImprimirTickets = () => {
    const [areas, setAreas] = useState<Area[]>([]);
    const [unidades, setUnidades] = useState<UnidadOrganizacional[]>([]);
    const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [edificios, setEdificios] = useState<Edificio[]>([]);
    const [seleccionados, setSeleccionados] = useState<number[]>([]);

    const [filtros, setFiltros] = useState({
        area_id: '',
        unidad_id: '',
        ambiente_id: '',
        cargo_id: '',
    });

    const [busquedaUnidad, setBusquedaUnidad] = useState('');
    const [busquedaAmbiente, setBusquedaAmbiente] = useState('');
    const [busquedaCargo, setBusquedaCargo] = useState('');
    

    // ▶️ Cargar todos los edificios al iniciar
    useEffect(() => {
        axios.get<Edificio[]>('/tickets/todos').then((res) => {
            setEdificios(res.data);
        });
    }, []);

    // ▶️ Cargar áreas
    useEffect(() => {
        axios
            .get<Area[]>('/parametros/areas?estado=ACTIVO')
            .then((res) => setAreas(res.data));
    }, []);

    // ▶️ Buscar unidades
    useEffect(() => {
        if (busquedaUnidad && filtros.area_id) {
            const delay = setTimeout(() => {
                axios
                    .get<UnidadOrganizacional[]>(
                        `/parametros/unidades-organizacionales/buscar`,
                        {
                            params: { q: busquedaUnidad, estado: 'ACTIVO', area_id: filtros.area_id },
                        }
                    )
                    .then((res) => setUnidades(res.data));
            }, 400);
            return () => clearTimeout(delay);
        } else {
            setUnidades([]);
        }
    }, [busquedaUnidad, filtros.area_id]);

    // ▶️ Buscar ambientes
    useEffect(() => {
        if (busquedaAmbiente && filtros.unidad_id) {
            const delay = setTimeout(() => {
                axios
                    .get<Ambiente[]>(`/parametros/ambientes/buscar`, {
                        params: { unidad_organizacional_id: filtros.unidad_id, search: busquedaAmbiente },
                    })
                    .then((res) => setAmbientes(res.data));
            }, 400);
            return () => clearTimeout(delay);
        } else {
            setAmbientes([]);
        }
    }, [busquedaAmbiente, filtros.unidad_id]);

    // ▶️ Buscar cargos
    useEffect(() => {
        if (busquedaCargo && filtros.ambiente_id) {
            const delay = setTimeout(() => {
                axios
                    .get<Cargo[]>(`/parametros/cargos/buscar`, {
                        params: { ambiente_id: filtros.ambiente_id, search: busquedaCargo },
                    })
                    .then((res) => setCargos(res.data));
            }, 400);
            return () => clearTimeout(delay);
        } else {
            setCargos([]);
        }
    }, [busquedaCargo, filtros.ambiente_id]);

    // ▶️ Cargar edificios cada vez que cambien filtros
    useEffect(() => {
        const { area_id, unidad_id, ambiente_id, cargo_id } = filtros;
        if (area_id && unidad_id && ambiente_id && cargo_id) {
            axios
                .get<Edificio[]>(`/tickets/filtrar`, {
                    params: { area_id, unidad_id, ambiente_id, cargo_id },
                })
                .then((res) => {
                    setEdificios(res.data);
                    setSeleccionados([]);
                });
        } else {
            // Si no hay filtros → cargar todos
            axios.get<Edificio[]>('/tickets/todos').then((res) => {
                setEdificios(res.data);
            });
        }
    }, [filtros]);

    const imprimirSeleccionados = () => {
        const idsSeleccionados = seleccionados.join(',');
        if (!idsSeleccionados) {
            alert('Selecciona al menos un edificio');
            return;
        }

        const url = `http://localhost:3000/tickets/imprimir-multiple?ids=${idsSeleccionados}`;
        window.open(url, '_blank');
    };


    return (
        <div className="container mt-4">
            <h3>Impresión de Tickets</h3>

            <Form>
                {/* Área */}
                <Form.Group className="mb-2">
                    <Form.Label>Área</Form.Label>
                    <Form.Select
                        name="area_id"
                        value={filtros.area_id}
                        onChange={(e) =>
                            setFiltros({
                                area_id: e.target.value,
                                unidad_id: '',
                                ambiente_id: '',
                                cargo_id: '',
                            })
                        }
                    >
                        <option value="">Seleccione un área</option>
                        {areas.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.codigo} - {a.descripcion}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {/* Unidad Organizacional */}
                <Form.Group className="mb-2">
                    <Form.Label>Unidad Organizacional</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Buscar unidad..."
                        value={busquedaUnidad}
                        onChange={(e) => setBusquedaUnidad(e.target.value)}
                    />
                    {unidades.length > 0 && (
                        <ul className="list-group">
                            {unidades.map((u) => (
                                <li
                                    key={u.id}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => {
                                        setFiltros({
                                            ...filtros,
                                            unidad_id: String(u.id),
                                            ambiente_id: '',
                                            cargo_id: '',
                                        });
                                        setBusquedaUnidad(`${u.codigo} - ${u.descripcion}`);
                                        setUnidades([]);
                                    }}
                                >
                                    {u.codigo} - {u.descripcion}
                                </li>
                            ))}
                        </ul>
                    )}
                </Form.Group>

                {/* Ambiente */}
                <Form.Group className="mb-2">
                    <Form.Label>Ambiente</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Buscar ambiente..."
                        value={busquedaAmbiente}
                        onChange={(e) => setBusquedaAmbiente(e.target.value)}
                    />
                    {ambientes.length > 0 && (
                        <ul className="list-group">
                            {ambientes.map((am) => (
                                <li
                                    key={am.id}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => {
                                        setFiltros({
                                            ...filtros,
                                            ambiente_id: String(am.id),
                                            cargo_id: '',
                                        });
                                        setBusquedaAmbiente(`${am.codigo} - ${am.descripcion}`);
                                        setAmbientes([]);
                                    }}
                                >
                                    {am.codigo} - {am.descripcion}
                                </li>
                            ))}
                        </ul>
                    )}
                </Form.Group>

                {/* Cargo */}
                <Form.Group className="mb-3">
                    <Form.Label>Cargo</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Buscar cargo..."
                        value={busquedaCargo}
                        onChange={(e) => setBusquedaCargo(e.target.value)}
                    />
                    {cargos.length > 0 && (
                        <ul className="list-group">
                            {cargos.map((c) => (
                                <li
                                    key={c.id}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => {
                                        setFiltros({ ...filtros, cargo_id: String(c.id) });
                                        setBusquedaCargo(`${c.codigo} - ${c.cargo}`);
                                        setCargos([]);
                                    }}
                                >
                                    {c.codigo} - {c.cargo}
                                </li>
                            ))}
                        </ul>
                    )}
                </Form.Group>
            </Form>

            {/* Tabla automática */}
            {edificios.length > 0 && (
                <div className="mt-4">
                    <h5>Edificios encontrados</h5>
                    <table className="table table-bordered table-sm">
                        <thead className="table-light">
                            <tr>
                                <th>Seleccionar</th>
                                <th>#</th>
                                <th>Código</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {edificios.map((e, i) => (
                                <tr key={e.id_311}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={seleccionados.includes(e.id_311)}
                                            onChange={(ev) => {
                                                if (ev.target.checked) {
                                                    setSeleccionados([...seleccionados, e.id_311]);
                                                } else {
                                                    setSeleccionados(seleccionados.filter(id => id !== e.id_311));
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>{i + 1}</td>
                                    <td>{e.codigo_311}</td>
                                    <td>{e.descripcion_edificio}</td>
                                </tr>

                            ))}
                        </tbody>
                    </table>

                    <Button
                        variant="success"
                        disabled={seleccionados.length === 0}
                        onClick={imprimirSeleccionados}
                    >
                        Imprimir Seleccionados
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ImprimirTickets;
