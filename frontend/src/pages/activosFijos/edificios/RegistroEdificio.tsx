import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import { Form, Button, Spinner, Card, Row, Col, Alert } from 'react-bootstrap';

interface DireccionAdministrativa {
    id: number;
    codigo: string;
    descripcion: string;
}

interface FormDataEdificio {
    codigo_gobierno?: string;
    codigo_institucional?: string;
    codigo_direccion_administrativa?: string;
    codigo_distrito?: string;
    codigo_sector_area?: string;
    codigo_unidad_organizacional?: string;
    unidad_organizacional_id?: number;
    codigo_cargo?: string;
    cargo_id?: number;
    codigo_ambiente?: string;
    codigo_grupo_contable?: string;
    codigo_correlativo?: string;
    responsable_id?: number;
    ubicacion?: string;
    ingreso?: string;
    descripcion_ingreso?: string;
    fecha_factura_donacion?: string;
    nro_factura?: string;
    proveedor_donante?: string;
    nombre_bien?: string;
    respaldo_legal?: string;
    descripcion_respaldo_legal?: string;
    clasificacion?: string;
    uso?: string;
    superficie?: number;
    servicios: string[];
    observaciones?: string;
    estado_conservacion?: string;
    valor_bs?: number;
    vida_util_anios?: number;
    fotos_edificio: string[];
    archivo_respaldo_pdf?: string;
    creado_por_id?: number;
}

interface Usuario { id: number; nombre: string; }
interface Personal { id: number; nombre: string; ci: string; }
interface Cargo { id: number; cargo?: string; nombre?: string; descripcion?: string; codigo?: string; }
interface UnidadOrganizacional { id: number; descripcion: string; codigo?: string; }

const RegistroEdificio = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormDataEdificio>({
        servicios: [],
        fotos_edificio: [],
    });


    // Catálogos
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [personales, setPersonales] = useState<Personal[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [unidades, setUnidades] = useState<UnidadOrganizacional[]>([]);
    const [direcciones, setDirecciones] = useState<DireccionAdministrativa[]>([]);

    // Archivos
    const [fotos, setFotos] = useState<File[]>([]);
    const [pdf, setPdf] = useState<File | null>(null);

    // Estado general
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchCatalogos();
    }, []);

    const fetchCatalogos = async () => {
        try {
            const [direccionesRes, usuariosRes, personalesRes, cargosRes, unidadesRes] =
                await Promise.all([
                    axiosInstance.get("/parametros/direcciones-administrativas"),
                    axiosInstance.get("/usuarios"),
                    axiosInstance.get("/parametros/personal"),
                    axiosInstance.get("/parametros/cargos"),
                    axiosInstance.get("/parametros/unidades-organizacionales"),
                ]);

            setDirecciones(direccionesRes.data);
            setUsuarios(usuariosRes.data);
            setPersonales(personalesRes.data);
            setCargos(cargosRes.data);
            setUnidades(unidadesRes.data);
        } catch (error: any) {
            console.error("❌ Error al cargar catálogos:", error);
            setErrorMsg("Error al cargar los catálogos. Verifique conexión o rutas del backend.");
        }
    };

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleServiciosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData((prev: any) => {
            const servicios = new Set(prev.servicios || []);
            if (checked) servicios.add(value);
            else servicios.delete(value);
            return { ...prev, servicios: Array.from(servicios) };
        });
    };

    const handleFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFotos(Array.from(e.target.files).slice(0, 5));
    };

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setPdf(e.target.files[0]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg('');
        setErrorMsg('');

        try {
            // 🧩 Adaptar datos al formato esperado por el backend DTO CreateEdificioDto
            const payload = {
                ...formData,
                // valores por defecto del backend
                codigo_gobierno: 'GAMS',
                codigo_institucional: '1101',
                // 🧩 estos deben ser generados o seleccionados según la estructura GAMS
                codigo_direccion_administrativa: formData.codigo_direccion_administrativa || '01',
                codigo_distrito: formData.codigo_distrito || '01',
                codigo_sector_area: formData.codigo_sector_area || '01',
                codigo_unidad_organizacional: formData.codigo_unidad_organizacional || '01',
                codigo_cargo: formData.codigo_cargo || '01',
                codigo_ambiente: formData.codigo_ambiente || '01',
                codigo_grupo_contable: formData.codigo_grupo_contable || '01',
                fotos_edificio: [],
            };

            // 1️⃣ Crear edificio
            const res = await axiosInstance.post('/activos-fijos/edificios', payload);
            const edificioId = res.data?.data?.id; // 🧩 backend devuelve data: edificio

            if (!edificioId) throw new Error('No se recibió el ID del edificio');

            // 2️⃣ Subir PDF
            if (pdf) {
                const pdfData = new FormData();
                pdfData.append('file', pdf);
                await axiosInstance.post(
                    `/activos-fijos/edificios/${edificioId}/upload/pdf`,
                    pdfData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            // 3️⃣ Subir fotos
            if (fotos.length > 0) {
                const fotosData = new FormData();
                fotos.forEach((f) => fotosData.append('fotos', f));
                await axiosInstance.post(
                    `/activos-fijos/edificios/${edificioId}/upload/fotos`,
                    fotosData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            setSuccessMsg('✅ Edificio registrado correctamente.');
            setTimeout(() => navigate('/edificios'), 1500);
        } catch (error: any) {
            console.error('❌ Error al registrar edificio:', error);
            if (error.response?.status === 400)
                setErrorMsg(error.response?.data?.message || 'Datos inválidos');
            else if (error.response?.status === 401)
                setErrorMsg('🚫 Sesión no autorizada. Inicie sesión nuevamente.');
            else
                setErrorMsg('❌ Ocurrió un error al registrar el edificio.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center mt-4">
            <Card className="shadow-lg border-0 w-100" style={{ maxWidth: '900px' }}>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="text-primary fw-bold">Registrar Edificio</h4>
                        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>← Volver</Button>
                    </div>

                    {successMsg && <Alert variant="success">{successMsg}</Alert>}
                    {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Row>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Dirección Administrativa</Form.Label>
                                        <Form.Select
                                            name="codigo_direccion_administrativa"
                                            value={formData.codigo_direccion_administrativa || ""}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione...</option>
                                            {direcciones.map((d) => (
                                                <option key={d.codigo} value={d.codigo}>
                                                    {d.descripcion} ({d.codigo})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Distrito</Form.Label>
                                        <Form.Select
                                            name="codigo_distrito"
                                            value={formData.codigo_distrito || ""}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione...</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                                <option key={n} value={n.toString().padStart(2, "0")}>{n}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Área / Sector</Form.Label>
                                        <Form.Select
                                            name="codigo_sector_area"
                                            value={formData.codigo_sector_area || ""}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="ADM">Administración Central</option>
                                            <option value="EDU">Educación</option>
                                            <option value="SAL">Salud</option>
                                            <option value="SEG">Seguridad Ciudadana</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Unidad Organizacional</Form.Label>
                                        <Form.Select
                                            name="unidad_organizacional_id"
                                            value={formData.unidad_organizacional_id || ""}
                                            onChange={(e) => {
                                                const unidad = unidades.find(u => u.id === Number(e.target.value));
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    unidad_organizacional_id: unidad?.id,
                                                    codigo_unidad_organizacional: unidad?.codigo || ""
                                                }));
                                            }}
                                        >
                                            <option value="">Seleccione...</option>
                                            {unidades.map((u) => (
                                                <option key={u.id} value={u.id}>{u.descripcion}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Col md={6}>
                                <Form.Group controlId="nombre_bien">
                                    <Form.Label>Nombre del Bien</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre_bien"
                                        value={formData.nombre_bien || ""}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="ubicacion">
                                    <Form.Label>Ubicación</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="ubicacion"
                                        value={formData.ubicacion || ""}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="responsable_id">
                                    <Form.Label>Responsable</Form.Label>
                                    <Form.Select
                                        name="responsable_id"
                                        value={formData.responsable_id || ""}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {personales.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre} - {p.ci}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="unidad_organizacional_id">
                                    <Form.Label>Unidad Organizacional</Form.Label>
                                    <Form.Select
                                        name="unidad_organizacional_id"
                                        value={formData.unidad_organizacional_id || ""}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione...</option>
                                        {unidades.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.descripcion}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="fecha_factura_donacion">
                                    <Form.Label>Fecha de Factura / Donación</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="fecha_factura_donacion"
                                        value={formData.fecha_factura_donacion || ""}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="valor_bs">
                                    <Form.Label>Valor (Bs)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="valor_bs"
                                        value={formData.valor_bs || ""}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group controlId="servicios">
                                    <Form.Label>Servicios</Form.Label>
                                    <div>
                                        {["Electricidad", "Agua", "Internet", "Gas"].map((serv) => (
                                            <Form.Check
                                                inline
                                                key={serv}
                                                type="checkbox"
                                                label={serv}
                                                value={serv}
                                                checked={formData.servicios.includes(serv)}
                                                onChange={handleServiciosChange}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="pdf">
                                    <Form.Label>Archivo PDF (opcional)</Form.Label>
                                    <Form.Control type="file" accept="application/pdf" onChange={handlePdfChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="fotos">
                                    <Form.Label>Fotos (máx 5)</Form.Label>
                                    <Form.Control type="file" multiple accept="image/*" onChange={handleFotosChange} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end">
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : "Registrar"}
                            </Button>
                        </div>
                    </Form>

                </Card.Body>
            </Card>
        </div>
    );
};

export default RegistroEdificio;
