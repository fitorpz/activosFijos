import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import axios, { AxiosResponse } from 'axios';
import { Form, Button, Spinner, Card, Row, Col, Alert } from 'react-bootstrap';

interface Usuario { id: number; nombre: string; }
interface Personal { id: number; nombre: string; }
interface Cargo { id: number; nombre: string; }
interface UnidadOrganizacional { id: number; descripcion: string; }

const RegistroEdificio = () => {
    const navigate = useNavigate();

    // 🔹 Estado del formulario
    const [formData, setFormData] = useState<any>({
        servicios: [],
        fotos_edificio: [],
    });

    // 🔹 Catálogos
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [personales, setPersonales] = useState<Personal[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [unidades, setUnidades] = useState<UnidadOrganizacional[]>([]);

    // 🔹 Archivos
    const [fotos, setFotos] = useState<File[]>([]);
    const [pdf, setPdf] = useState<File | null>(null);

    // 🔹 Estado general
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchDatos();
    }, []);

    const fetchDatos = async () => {
        try {
            const [usuariosRes, personalesRes, cargosRes, unidadesRes]: [
                AxiosResponse<Usuario[]>,
                AxiosResponse<Personal[]>,
                AxiosResponse<Cargo[]>,
                AxiosResponse<UnidadOrganizacional[]>
            ] = await Promise.all([
                axiosInstance.get('/activos-fijos/usuarios'),
                axiosInstance.get('/activos-fijos/personales'),
                axiosInstance.get('/activos-fijos/cargos'),
                axiosInstance.get('/activos-fijos/unidades-organizacionales'),
            ]);

            setUsuarios(usuariosRes.data);
            setPersonales(personalesRes.data);
            setCargos(cargosRes.data);
            setUnidades(unidadesRes.data);
        } catch (error) {
            console.error('Error al cargar catálogos:', error);
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
        if (e.target.files) {
            setFotos(Array.from(e.target.files).slice(0, 5)); // máx. 5 fotos
        }
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
            // 1️⃣ Crear edificio
            const res = await axiosInstance.post('/activos-fijos/edificios', formData);
            const edificioId = res.data.id;

            // 2️⃣ Subir PDF
            if (pdf) {
                const pdfData = new FormData();
                pdfData.append('file', pdf);
                await axios.post(
                    `${axiosInstance.defaults.baseURL}/activos-fijos/edificios/${edificioId}/upload/pdf`,
                    pdfData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            // 3️⃣ Subir fotos
            if (fotos.length > 0) {
                const fotosData = new FormData();
                fotos.forEach((f) => fotosData.append('fotos', f));
                await axios.post(
                    `${axiosInstance.defaults.baseURL}/activos-fijos/edificios/${edificioId}/upload/fotos`,
                    fotosData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            setSuccessMsg('✅ Edificio registrado correctamente.');
            setTimeout(() => navigate('/edificios'), 1500);
        } catch (error) {
            console.error('Error al registrar edificio:', error);
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
                        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                            ← Volver
                        </Button>
                    </div>

                    {successMsg && <Alert variant="success">{successMsg}</Alert>}
                    {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Código DA</Form.Label>
                                    <Form.Control name="nro_da" onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre del Bien</Form.Label>
                                    <Form.Control name="nombre_bien" onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Responsable</Form.Label>
                                    <Form.Select name="responsable_id" onChange={handleChange} required>
                                        <option value="">Seleccione</option>
                                        {personales.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Cargo</Form.Label>
                                    <Form.Select name="cargo_id" onChange={handleChange} required>
                                        <option value="">Seleccione</option>
                                        {cargos.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.nombre}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Unidad Organizacional</Form.Label>
                                    <Form.Select name="unidad_organizacional_id" onChange={handleChange} required>
                                        <option value="">Seleccione</option>
                                        {unidades.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.descripcion}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Ubicación</Form.Label>
                                    <Form.Control name="ubicacion" onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Clasificación</Form.Label>
                                    <Form.Control name="clasificacion" onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Uso</Form.Label>
                                    <Form.Control name="uso" onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Ingreso</Form.Label>
                                    <Form.Control name="ingreso" onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Descripción Ingreso</Form.Label>
                                    <Form.Control as="textarea" name="descripcion_ingreso" onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha Factura/Donación</Form.Label>
                                    <Form.Control type="date" name="fecha_factura_donacion" onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Nro Factura</Form.Label>
                                    <Form.Control name="nro_factura" onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Proveedor/Donante</Form.Label>
                                    <Form.Control name="proveedor_donante" onChange={handleChange} />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Respaldo Legal</Form.Label>
                                    <Form.Control name="respaldo_legal" onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Descripción Respaldo Legal</Form.Label>
                                    <Form.Control as="textarea" name="descripcion_respaldo_legal" onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Superficie (m²)</Form.Label>
                                    <Form.Control type="number" name="superficie" onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Servicios Disponibles</Form.Label>
                                    <div>
                                        {['agua', 'luz', 'internet', 'gas', 'telefono'].map((srv) => (
                                            <Form.Check
                                                key={srv}
                                                type="checkbox"
                                                label={srv.toUpperCase()}
                                                value={srv}
                                                onChange={handleServiciosChange}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Observaciones</Form.Label>
                                    <Form.Control as="textarea" name="observaciones" onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Estado de Conservación</Form.Label>
                                    <Form.Control name="estado_conservacion" onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Valor (Bs)</Form.Label>
                                    <Form.Control type="number" name="valor_bs" onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Vida Útil (años)</Form.Label>
                                    <Form.Control type="number" name="vida_util_anios" onChange={handleChange} required />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Usuario Responsable</Form.Label>
                                    <Form.Select name="creado_por_id" onChange={handleChange} required>
                                        <option value="">Seleccione</option>
                                        {usuarios.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.nombre}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Fotos del Edificio (máx. 5)</Form.Label>
                                    <Form.Control type="file" multiple accept="image/*" onChange={handleFotosChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Archivo Respaldo (PDF)</Form.Label>
                                    <Form.Control type="file" accept="application/pdf" onChange={handlePdfChange} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end mt-3">
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : 'Registrar Edificio'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default RegistroEdificio;
