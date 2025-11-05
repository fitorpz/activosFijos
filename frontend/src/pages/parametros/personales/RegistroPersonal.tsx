import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import { Form, Button, Spinner, Card, Row, Col, Alert } from 'react-bootstrap';

interface Usuario {
    id: number;
    nombre: string;
    correo: string;
}

interface FormData {
    usuario: Usuario | null;
    usuario_id: string;
    documento: string;
    ci: string;
    nombre: string;
    estado: string;
    expedido: string;
    profesion: string;
    direccion: string;
    celular: string;
    telefono: string;
    email: string;
    fecnac: string;
    estciv: string;
    sexo: string;
}

const RegistroPersonal = () => {
    const navigate = useNavigate();

    // 🔹 Estado del formulario
    const [formData, setFormData] = useState<FormData>({
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

    // 🔹 Listado de usuarios disponibles
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [cargando, setCargando] = useState(false);
    const [alerta, setAlerta] = useState<{ tipo: 'success' | 'danger'; mensaje: string } | null>(null);

    // 🧩 Cargar usuarios disponibles al montar el componente
    useEffect(() => {
        obtenerUsuariosDisponibles();
    }, []);

    const obtenerUsuariosDisponibles = async () => {
        try {
            const res = await axiosInstance.get<Usuario[]>('/parametros/personal/usuarios-disponibles');
            setUsuarios(res.data);
        } catch (error) {
            console.error('❌ Error al obtener usuarios disponibles:', error);
            setAlerta({
                tipo: 'danger',
                mensaje: 'No se pudieron cargar los usuarios disponibles.',
            });
        }
    };


    // 🧩 Manejar cambios de campos generales
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    // 🧠 Cuando se selecciona un usuario del sistema
    const handleUsuarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        const selectedUser = usuarios.find((u) => u.id === Number(userId)) || null;

        setFormData((prev) => ({
            ...prev,
            usuario_id: userId,
            usuario: selectedUser,
            nombre: selectedUser ? selectedUser.nombre : '',
            email: selectedUser ? selectedUser.correo : '',
        }));
    };

    // 🧩 Envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);
        setAlerta(null);

        try {
            const payload = {
                ...formData,
                usuario_id: formData.usuario ? formData.usuario.id : null,
                documento: formData.documento ? Number(formData.documento) : null,
                estciv: formData.estciv ? Number(formData.estciv) : null,
                sexo: formData.sexo ? Number(formData.sexo) : null,
                fecnac: formData.fecnac || null,
                nombre: formData.nombre?.trim() || '',
                email: formData.email?.trim() || '',
            };

            await axiosInstance.post('/parametros/personal', payload);

            setAlerta({ tipo: 'success', mensaje: '✅ Personal registrado correctamente.' });

            // Redirigir después de unos segundos
            setTimeout(() => navigate('/parametros/personales'), 1500);
        } catch (error: any) {
            console.error('❌ Error al registrar personal:', error);
            setAlerta({
                tipo: 'danger',
                mensaje: error?.response?.data?.message || 'Error al registrar el personal.',
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
                        <h4 className="text-primary fw-bold">Registrar Personal</h4>
                        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                            ← Volver
                        </Button>
                    </div>

                    {alerta && <Alert variant={alerta.tipo}>{alerta.mensaje}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            {/* Usuario del sistema */}
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Usuario del Sistema</Form.Label>
                                    <Form.Select
                                        name="usuario_id"
                                        value={formData.usuario_id}
                                        onChange={handleUsuarioChange}
                                        required
                                    >
                                        <option value="">Seleccionar usuario</option>
                                        {usuarios.length > 0 ? (
                                            usuarios.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.nombre} ({u.correo})
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">No hay usuarios disponibles</option>
                                        )}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
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
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre Completo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        readOnly
                                        placeholder="Selecciona un usuario para autocompletar"
                                    />
                                </Form.Group>
                            </Col>

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
                        </Row>

                        <Row>
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
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Correo electrónico</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        readOnly
                                        placeholder="Autocompletado al seleccionar usuario"
                                    />
                                </Form.Group>
                            </Col>

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
                        </Row>

                        <Row>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estado Civil</Form.Label>
                                    <Form.Select name="estciv" value={formData.estciv} onChange={handleChange} required>
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
                                    <Form.Select name="sexo" value={formData.sexo} onChange={handleChange} required>
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
                                    'Registrar Personal'
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
                </Card.Body>
            </Card>
        </div>
    );
};

export default RegistroPersonal;
