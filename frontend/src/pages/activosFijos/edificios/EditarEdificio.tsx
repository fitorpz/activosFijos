import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosConfig";
import {
    Tabs,
    Tab,
    Form,
    Button,
    Spinner,
    Table,
    Modal,
    Alert,
    Row,
    Col,
    Card,
} from "react-bootstrap";

/* ===========================
   Tipos principales
=========================== */
interface Edificio {
    id: number;
    codigo_direccion_administrativa: string;
    nombre_bien: string;
    descripcion_ingreso: string;
    ubicacion: string;
    clasificacion: string;
    uso: string;
    estado_conservacion: string;
    vida_util_anios: number;
    valor_bs: number;
    unidad_organizacional_id: number;
    responsable_id: number;
    cargo_id: number;
    estado: string;
}

interface Usuario { id: number; nombre: string; }
interface Personal { id: number; nombre: string; }
interface Cargo { id: number; nombre: string; }
interface UnidadOrganizacional { id: number; descripcion: string; }

/* ===========================
   Componente principal
=========================== */
const EditarEdificio = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [edificio, setEdificio] = useState<Partial<Edificio>>({});
    const [loading, setLoading] = useState(false);
    const [key, setKey] = useState<string>("general");
    const [msg, setMsg] = useState<{ type: "success" | "danger"; text: string } | null>(null);

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [personales, setPersonales] = useState<Personal[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [unidades, setUnidades] = useState<UnidadOrganizacional[]>([]);

    /* ===========================
       Efectos iniciales
    ============================ */
    useEffect(() => {
        if (id) {
            fetchCatalogos();
            fetchEdificio();
        }
    }, [id]);

    const fetchCatalogos = async () => {
        try {
            const [usuariosRes, personalesRes, cargosRes, unidadesRes] = await Promise.all([
                axiosInstance.get("/usuarios"),
                axiosInstance.get("/parametros/personal"),
                axiosInstance.get("/parametros/cargos"),
                axiosInstance.get("/parametros/unidades-organizacionales"),
            ]);
            setUsuarios(usuariosRes.data);
            setPersonales(personalesRes.data);
            setCargos(cargosRes.data);
            setUnidades(unidadesRes.data);
        } catch (error) {
            console.error("❌ Error cargando catálogos:", error);
        }
    };

    const fetchEdificio = async () => {
        try {
            const res = await axiosInstance.get(`/activos-fijos/edificios/${id}`);
            setEdificio(res.data.data); // ✅ el backend retorna { data }
        } catch (error) {
            console.error("❌ Error al cargar edificio:", error);
        }
    };

    /* ===========================
       Manejo de formulario
    ============================ */
    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setEdificio((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Construir payload
            const payload: Partial<Edificio> = {
                codigo_direccion_administrativa: edificio?.codigo_direccion_administrativa ?? "",
                nombre_bien: edificio?.nombre_bien ?? "",
                descripcion_ingreso: edificio?.descripcion_ingreso ?? "",
                ubicacion: edificio?.ubicacion ?? "",
                clasificacion: edificio?.clasificacion ?? "",
                uso: edificio?.uso ?? "",
                estado_conservacion: edificio?.estado_conservacion ?? "",
                valor_bs: edificio?.valor_bs ?? 0,
                vida_util_anios: edificio?.vida_util_anios ?? 0,
                unidad_organizacional_id: edificio?.unidad_organizacional_id || undefined,
                responsable_id: edificio?.responsable_id || undefined,
                cargo_id: edificio?.cargo_id || undefined,
            };


            // 🧹 Limpiar valores vacíos o nulos
            Object.keys(payload).forEach((k) => {
                const val = payload[k as keyof typeof payload];
                if (val === "" || val === null || val === undefined) {
                    delete payload[k as keyof typeof payload];
                }
            });

            // Guardar cambios
            await axiosInstance.put(`/activos-fijos/edificios/${id}`, payload);

            setMsg({ type: "success", text: "Cambios guardados correctamente." });
            setTimeout(() => setMsg(null), 3000);

            await fetchEdificio(); // 🔄 refrescar datos
        } catch (error) {
            console.error("❌ Error al guardar:", error);
            setMsg({ type: "danger", text: "Error al guardar los cambios." });
            setTimeout(() => setMsg(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    /* ===========================
   Render principal
============================ */
    return (
        <div className="container mt-4">
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="fw-bold text-primary">Editar Edificio</h3>
                        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                            ← Volver
                        </Button>
                    </div>

                    {msg && <Alert variant={msg.type}>{msg.text}</Alert>}

                    <Tabs
                        id="tabs-edificio"
                        activeKey={key}
                        onSelect={(k) => setKey(k || "general")}
                        className="mb-3"
                    >
                        <Tab eventKey="general" title="Datos Generales">
                            <DatosGeneralesTab
                                edificio={edificio}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                usuarios={usuarios}
                                personales={personales}
                                cargos={cargos}
                                unidades={unidades}
                                loading={loading}
                            />
                        </Tab>

                        <Tab eventKey="ampliaciones" title="Ampliaciones">
                            <AmpliacionesTab edificioId={Number(id)} />
                        </Tab>

                        <Tab eventKey="remodelaciones" title="Remodelaciones">
                            <RemodelacionesTab edificioId={Number(id)} />
                        </Tab>

                        <Tab eventKey="bajas" title="Bajas">
                            <BajasTab edificioId={Number(id)} />
                        </Tab>

                        <Tab eventKey="historial" title="Historial">
                            <HistorialTab edificioId={Number(id)} />
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </div>
    );
};

/* ===========================
   TAB: Datos Generales
=========================== */
const DatosGeneralesTab = ({
    edificio,
    handleChange,
    handleSubmit,
    usuarios,
    personales,
    cargos,
    unidades,
    loading,
}: any) => (
    <Form onSubmit={handleSubmit}>
        <Row>
            <Col md={6}>
                <Form.Group className="mb-3">
                    <Form.Label>Dirección Administrativa</Form.Label>
                    <Form.Control
                        name="codigo_direccion_administrativa"
                        value={edificio.codigo_direccion_administrativa || ""}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>


                <Form.Group className="mb-3">
                    <Form.Label>Nombre del Bien</Form.Label>
                    <Form.Control
                        name="nombre_bien"
                        value={edificio.nombre_bien || ""}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Descripción de Ingreso</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="descripcion_ingreso"
                        value={edificio.descripcion_ingreso || ""}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Ubicación</Form.Label>
                    <Form.Control
                        name="ubicacion"
                        value={edificio.ubicacion || ""}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Clasificación</Form.Label>
                    <Form.Control
                        name="clasificacion"
                        value={edificio.clasificacion || ""}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Uso</Form.Label>
                    <Form.Control
                        name="uso"
                        value={edificio.uso || ""}
                        onChange={handleChange}
                    />
                </Form.Group>
            </Col>

            <Col md={6}>
                <Form.Group className="mb-3">
                    <Form.Label>Estado de Conservación</Form.Label>
                    <Form.Control
                        name="estado_conservacion"
                        value={edificio.estado_conservacion || ""}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Valor (Bs)</Form.Label>
                    <Form.Control
                        name="valor_bs"
                        type="number"
                        value={edificio.valor_bs || ""}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Vida Útil (años)</Form.Label>
                    <Form.Control
                        name="vida_util_anios"
                        type="number"
                        value={edificio.vida_util_anios || ""}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Unidad Organizacional</Form.Label>
                    <Form.Select
                        name="unidad_organizacional_id"
                        value={edificio.unidad_organizacional_id || ""}
                        onChange={handleChange}
                    >
                        <option value="">Seleccione...</option>
                        {unidades.map((u: any) => (
                            <option key={u.id} value={u.id}>
                                {u.descripcion}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Responsable</Form.Label>
                    <Form.Select
                        name="responsable_id"
                        value={edificio.responsable_id || ""}
                        onChange={handleChange}
                    >
                        <option value="">Seleccione...</option>
                        {personales.map((p: any) => (
                            <option key={p.id} value={p.id}>
                                {p.nombre}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Cargo</Form.Label>
                    <Form.Select
                        name="cargo_id"
                        value={edificio.cargo_id || ""}
                        onChange={handleChange}
                    >
                        <option value="">Seleccione...</option>
                        {cargos.map((c: any) => (
                            <option key={c.id} value={c.id}>
                                {c.cargo || c.nombre || c.descripcion || `Cargo #${c.id}`}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Col>
        </Row>

        <div className="d-flex justify-content-end">
            <Button type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" animation="border" /> : "Guardar Cambios"}
            </Button>
        </div>
    </Form>
);

/* ===========================
   TAB: Ampliaciones
=========================== */
const AmpliacionesTab = ({ edificioId }: { edificioId: number }) => {
    const [data, setData] = useState<any[]>([]);
    const [show, setShow] = useState(false);
    const [form, setForm] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        const res = await axiosInstance.get(`/activos-fijos/edificios/ampliaciones?edificioId=${edificioId}`);
        setData(res.data.data || res.data);
    };

    useEffect(() => {
        if (!edificioId || isNaN(edificioId)) return;
        fetchData();
    }, [edificioId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // construir body limpio
        const cleanForm: any = {
            ...form,
            edificio_id: edificioId
        };

        // eliminar campos vacíos
        Object.keys(cleanForm).forEach(key => {
            if (cleanForm[key] === "" || cleanForm[key] === null || cleanForm[key] === undefined) {
                delete cleanForm[key];
            }
        });

        await axiosInstance.post(`/activos-fijos/edificios/ampliaciones`, cleanForm);

        setShow(false);
        fetchData();
        setLoading(false);
    };


    return (
        <>
            <Button className="mb-3" onClick={() => setShow(true)}>+ Registrar Ampliación</Button>
            <Table bordered hover size="sm">
                <thead>
                    <tr>
                        <th>Fecha Ingreso</th>
                        <th>Valor (Bs)</th>
                        <th>Proveedor/Donante</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((a) => (
                        <tr key={a.id}>
                            <td>{a.fecha_ingreso}</td>
                            <td>{a.valor_ampliacion}</td>
                            <td>{a.proveedor_donante}</td>
                            <td>{a.descripcion_respaldo_legal}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Nueva Ampliación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha Ingreso</Form.Label>
                            <Form.Control
                                type="date"
                                name="fecha_ingreso"
                                onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Valor Ampliación (Bs)</Form.Label>
                            <Form.Control
                                type="number"
                                name="valor_ampliacion"
                                onChange={(e) => setForm({ ...form, valor_ampliacion: parseFloat(e.target.value) })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Proveedor / Donante</Form.Label>
                            <Form.Control
                                name="proveedor_donante"
                                onChange={(e) => setForm({ ...form, proveedor_donante: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="descripcion_respaldo_legal"
                                onChange={(e) => setForm({ ...form, descripcion_respaldo_legal: e.target.value })}
                            />
                        </Form.Group>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : "Guardar"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

/* ===========================
   TAB: Remodelaciones
=========================== */
const RemodelacionesTab = ({ edificioId }: { edificioId: number }) => {
    const [data, setData] = useState<any[]>([]);
    const [show, setShow] = useState(false);
    const [form, setForm] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        const res = await axiosInstance.get(`/activos-fijos/edificios/remodelaciones?edificioId=${edificioId}`);
        setData(res.data.data || res.data);
    };

    useEffect(() => {
        if (!edificioId || isNaN(edificioId)) return;
        fetchData();
    }, [edificioId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const cleanForm: any = { ...form, edificio_id: edificioId };

        Object.keys(cleanForm).forEach(key => {
            if (cleanForm[key] === "" || cleanForm[key] === null || cleanForm[key] === undefined) {
                delete cleanForm[key];
            }
        });

        await axiosInstance.post(`/activos-fijos/edificios/remodelaciones`, cleanForm);
        setShow(false);
        fetchData();
        setLoading(false);
    };


    return (
        <>
            <Button className="mb-3" onClick={() => setShow(true)}>+ Registrar Remodelación</Button>
            <Table bordered hover size="sm">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Nro Factura</th>
                        <th>Valor (Bs)</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((r) => (
                        <tr key={r.id}>
                            <td>{r.fecha_factura_donacion}</td>
                            <td>{r.nro_factura}</td>
                            <td>{r.valor_remodelacion}</td>
                            <td>{r.descripcion_respaldo_legal}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Nueva Remodelación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha Factura/Donación</Form.Label>
                            <Form.Control
                                type="date"
                                name="fecha_factura_donacion"
                                onChange={(e) => setForm({ ...form, fecha_factura_donacion: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Nro Factura</Form.Label>
                            <Form.Control
                                name="nro_factura"
                                onChange={(e) => setForm({ ...form, nro_factura: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Valor Remodelación (Bs)</Form.Label>
                            <Form.Control
                                type="number"
                                name="valor_remodelacion"
                                onChange={(e) => setForm({ ...form, valor_remodelacion: parseFloat(e.target.value) })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="descripcion_respaldo_legal"
                                onChange={(e) => setForm({ ...form, descripcion_respaldo_legal: e.target.value })}
                            />
                        </Form.Group>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : "Guardar"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

/* ===========================
   TAB: Bajas
=========================== */
const BajasTab = ({ edificioId }: { edificioId: number }) => {
    const [data, setData] = useState<any[]>([]);
    const [show, setShow] = useState(false);
    const [form, setForm] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        const res = await axiosInstance.get(`/activos-fijos/edificios/bajas?edificioId=${edificioId}`);
        setData(res.data.data || res.data);
    };

    useEffect(() => {
        if (!edificioId || isNaN(edificioId)) return;
        fetchData();
    }, [edificioId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const cleanForm: any = { ...form, edificio_id: edificioId };

        Object.keys(cleanForm).forEach(key => {
            if (cleanForm[key] === "" || cleanForm[key] === null || cleanForm[key] === undefined) {
                delete cleanForm[key];
            }
        });

        await axiosInstance.post(`/activos-fijos/edificios/bajas`, cleanForm);

        setShow(false);
        fetchData();
        setLoading(false);
    };


    return (
        <>
            <Button className="mb-3" onClick={() => setShow(true)}>+ Registrar Baja</Button>
            <Table bordered hover size="sm">
                <thead>
                    <tr>
                        <th>Valor UFV</th>
                        <th>Superficie Desmantelamiento (m²)</th>
                        <th>Respaldo Legal</th>
                        <th>Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((b) => (
                        <tr key={b.id}>
                            <td>{b.valor_ufv}</td>
                            <td>{b.superficie_desmantelamiento}</td>
                            <td>{b.respaldo_legal}</td>
                            <td>{b.observaciones}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Nueva Baja</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Valor UFV</Form.Label>
                            <Form.Control
                                type="number"
                                name="valor_ufv"
                                onChange={(e) => setForm({ ...form, valor_ufv: parseFloat(e.target.value) })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Superficie Desmantelamiento (m²)</Form.Label>
                            <Form.Control
                                type="number"
                                name="superficie_desmantelamiento"
                                onChange={(e) =>
                                    setForm({ ...form, superficie_desmantelamiento: parseFloat(e.target.value) })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Respaldo Legal</Form.Label>
                            <Form.Control
                                name="respaldo_legal"
                                onChange={(e) => setForm({ ...form, respaldo_legal: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Observaciones</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="observaciones"
                                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                            />
                        </Form.Group>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : "Guardar"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

/* ===========================
   TAB: Historial
=========================== */
const HistorialTab = ({ edificioId }: { edificioId: number }) => {
    const [data, setData] = useState<any[]>([]);

    const fetchData = async () => {
        if (!edificioId || isNaN(edificioId)) return;
        const res = await axiosInstance.get(`/activos-fijos/historial-edificios/${edificioId}`);
        setData(res.data.data || res.data);
    };

    useEffect(() => {
        if (!edificioId || isNaN(edificioId)) return;
        fetchData();
    }, [edificioId]);

    return (
        <Table bordered hover size="sm">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>
                {data.map((h) => (
                    <tr key={h.id}>
                        <td>{new Date(h.fecha_accion).toLocaleString()}</td>
                        <td>{h.usuario?.nombre || "—"}</td>
                        <td>{h.accion}</td>
                        <td>{h.descripcion}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};



export default EditarEdificio;

