import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import { Form, Button, Spinner, Card, Row, Col, Alert } from 'react-bootstrap';

interface Usuario {
    id: number;
    nombre: string;
    correo: string;
}

interface Personal {
    id: number;
    ci: string;
    nombre: string;
    estado: string;
    expedido?: string;
    profesion?: string;
    direccion?: string;
    celular?: string;
    telefono?: string;
    email?: string;
    fecnac?: string;
    estciv?: number;
    sexo?: number;
    usuario?: Usuario | null;
}

const EditarPersonal = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<any>({
        usuario: null,
        usuario_id: '',
        documento: '',
        ci: '',
        nombre: '',
        estado: 'ACTIVO',
        expedido: '',
        profesion: '',
        direccion: '',
        celular: '',
        telefono: '',
        email: '',
        fecnac: '',
        estciv: '',
        sexo: '',
    });

    const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([]);
    const [cargando, setCargando] = useState(true);
    const [alerta, setAlerta] = useState<{ tipo: 'success' | 'danger'; mensaje: string } | null>(null);

    // 🔹 Cargar datos iniciales
    useEffect(() => {
        const cargarDatos = async () => {
            await Promise.all([obtenerPersonal(), obtenerUsuariosDisponibles()]);
            setCargando(false);
        };
        cargarDatos();
    }, []);

    // 🔹 Obtener datos del personal
    const obtenerPersonal = async () => {
        try {
            const res = await axiosInstance.get<Personal>(`/parametros/personal/${id}`);
            const p = res.data;

            setFormData({
                usuario: p.usuario || null,
                usuario_id: p.usuario?.id?.toString() || '',
                ci: p.ci || '',
                nombre: p.nombre || '',
                estado: p.estado || 'ACTIVO',
                expedido: p.expedido || '',
                profesion: p.profesion || '',
                direccion: p.direccion || '',
                celular: p.celular || '',
                telefono: p.telefono || '',
                email: p.email || '',
                fecnac: p.fecnac || '',
                estciv: p.estciv?.toString() || '',
                sexo: p.sexo?.toString() || '',
            });
        } catch (error) {
            console.error('❌ Error al obtener datos del personal:', error);
            setAlerta({ tipo: 'danger', mensaje: 'Error al cargar los datos del personal.' });
        }
    };

    // 🔹 Obtener usuarios disponibles (incluyendo el actual)
    const obtenerUsuariosDisponibles = async () => {
        try {
            const res = await axiosInstance.get<Usuario[]>(`/usuarios/disponibles/${id}`);
            setUsuariosDisponibles(res.data);
        } catch (error) {
            console.error('❌ Error al cargar usuarios disponibles:', error);
            setAlerta({ tipo: 'danger', mensaje: 'Error al cargar usuarios disponibles.' });
        }
    };

    // 🔹 Manejar cambios
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    // 🔹 Manejar cambio de usuario
    const handleUsuarioChange = (e: any) => {
        const userId = e.target.value;
        const selectedUser = usuariosDisponibles.find((u) => u.id === Number(userId)) || null;
        setFormData((prev: any) => ({
            ...prev,
            usuario_id: userId,
            usuario: selectedUser,
            nombre: selectedUser ? selectedUser.nombre : '',
            email: selectedUser ? selectedUser.correo : '',
        }));
    };

    // 🔹 Enviar actualización
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);
        setAlerta(null);

        try {
            const payload = {
                ...formData,
                documento: Number(formData.documento),
                estciv: Number(formData.estciv),
                sexo: Number(formData.sexo),
                usuario_id: formData.usuario ? formData.usuario.id : null,
            };

            await axiosInstance.put(`/parametros/personal/${id}`, payload);

            setAlerta({ tipo: 'success', mensaje: '✅ Personal actualizado correctamente.' });

            setTimeout(() => navigate('/parametros/personales'), 1500);
        } catch (error: any) {
            console.error('❌ Error al actualizar personal:', error);
            setAlerta({
                tipo: 'danger',
                mensaje: error?.response?.data?.message || 'Error al actualizar el personal.',
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="d-flex justify-content-center mt-4">
            <Card className="shadow-lg border-0 w-100" style={{ maxWidth: '900px' }}>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="text-primary fw-bold">Editar Personal</h4>
                        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                            ← Volver
                        </Button>
                    </div>

                    {alerta && <Alert variant={alerta.tipo}>{alerta.mensaje}</Alert>}

                    {cargando ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                            <p className="mt-2">Cargando datos...</p>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Usuario del Sistema</Form.Label>
                                        <Form.Select
                                            name="usuario_id"
                                            value={formData.usuario_id}
                                            onChange={handleUsuarioChange}
                                        >
                                            <option value="">Sin usuario asignado</option>
                                            {usuariosDisponibles.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.nombre} ({u.correo})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>CI</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="ci"
                                            value={formData.ci}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Expedido</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="expedido"
                                            value={formData.expedido}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre Completo</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            readOnly
                                            placeholder="Autocompletado al seleccionar usuario"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Profesión</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="profesion"
                                            value={formData.profesion}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Dirección</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Celular</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="celular"
                                            value={formData.celular}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Teléfono</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Correo electrónico</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha de Nacimiento</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="fecnac"
                                            value={formData.fecnac}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estado Civil</Form.Label>
                                        <Form.Select
                                            name="estciv"
                                            value={formData.estciv}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Seleccionar</option>
                                            <option value="1">Soltero</option>
                                            <option value="2">Casado</option>
                                            <option value="3">Viudo</option>
                                            <option value="4">Divorciado</option>
                                            <option value="5">Unión libre</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sexo</Form.Label>
                                        <Form.Select
                                            name="sexo"
                                            value={formData.sexo}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Seleccionar</option>
                                            <option value="1">Masculino</option>
                                            <option value="2">Femenino</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex justify-content-end mt-3">
                                <Button variant="primary" type="submit" disabled={cargando}>
                                    {cargando ? (
                                        <>
                                            <Spinner animation="border" size="sm" /> Guardando...
                                        </>
                                    ) : (
                                        'Actualizar Personal'
                                    )}
                                </Button>

                                <Button
                                    variant="secondary"
                                    className="ms-2"
                                    onClick={() => navigate('/parametros/personales')}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default EditarPersonal;
