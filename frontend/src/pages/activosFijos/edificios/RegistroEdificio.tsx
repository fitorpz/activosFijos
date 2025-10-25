import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import { Form, Button, Spinner } from 'react-bootstrap';

interface Usuario {
    id: number;
    nombre: string;
}
interface Personal {
    id: number;
    nombre: string;
}
interface Cargo {
    id: number;
    nombre: string;
}
interface UnidadOrganizacional {
    id: number;
    descripcion: string;
}

const RegistroEdificio = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>({});
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [personales, setPersonales] = useState<Personal[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [unidades, setUnidades] = useState<UnidadOrganizacional[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usuariosRes, personalesRes, cargosRes, unidadesRes] = await Promise.all([
                axiosInstance.get<Usuario[]>('/activos-fijos/usuarios'),
                axiosInstance.get<Personal[]>('/activos-fijos/personales'),
                axiosInstance.get<Cargo[]>('/activos-fijos/cargos'),
                axiosInstance.get<UnidadOrganizacional[]>('/activos-fijos/unidades-organizacionales'),
            ]);


            setUsuarios(usuariosRes.data);
            setPersonales(personalesRes.data);
            setCargos(cargosRes.data);
            setUnidades(unidadesRes.data);
        } catch (error) {
            console.error('Error al cargar datos del formulario:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post('/edificios', formData);
            navigate('/edificios');
        } catch (error) {
            console.error('Error al registrar edificio:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Registrar Edificio</h2>
            <Form onSubmit={handleSubmit}>
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
                        {personales.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Cargo</Form.Label>
                    <Form.Select name="cargo_id" onChange={handleChange} required>
                        <option value="">Seleccione</option>
                        {cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Unidad Organizacional</Form.Label>
                    <Form.Select name="unidad_organizacional_id" onChange={handleChange} required>
                        <option value="">Seleccione</option>
                        {unidades.map(u => <option key={u.id} value={u.id}>{u.descripcion}</option>)}
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
                    <Form.Label>Estado Conservación</Form.Label>
                    <Form.Control name="estado_conservacion" onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Valor (Bs)</Form.Label>
                    <Form.Control type="number" name="valor_bs" onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Vida útil (años)</Form.Label>
                    <Form.Control type="number" name="vida_util_anios" onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Usuario responsable</Form.Label>
                    <Form.Select name="creado_por_id" onChange={handleChange} required>
                        <option value="">Seleccione</option>
                        {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </Form.Select>
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Registrar'}
                </Button>
            </Form>
        </div>
    );
};

export default RegistroEdificio;
