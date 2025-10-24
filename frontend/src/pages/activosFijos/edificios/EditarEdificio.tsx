import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import { Form, Button, Spinner } from 'react-bootstrap';

interface Edificio {
    id: number;
    nro_da: string;
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
}

interface Usuario { id: number; nombre: string; }
interface Personal { id: number; nombre: string; }
interface Cargo { id: number; nombre: string; }
interface UnidadOrganizacional { id: number; descripcion: string; }

const EditarEdificio = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<Edificio>>({});
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [personales, setPersonales] = useState<Personal[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [unidades, setUnidades] = useState<UnidadOrganizacional[]>([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        fetchDatos();
        fetchEdificio();
    }, []);

    const fetchDatos = async () => {
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
            console.error('Error cargando datos', error);
        }
    };

    const fetchEdificio = async () => {
        try {
            const res = await axiosInstance.get<Edificio>(`/edificios/${id}`);
            setFormData(res.data);
        } catch (error) {
            console.error('Error al cargar edificio', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);
        try {
            await axiosInstance.put(`/edificios/${id}`, formData);
            navigate('/activosFijos/edificios');
        } catch (error) {
            console.error('Error al editar edificio', error);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Editar Edificio</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Código DA</Form.Label>
                    <Form.Control name="nro_da" value={formData.nro_da || ''} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Nombre Bien</Form.Label>
                    <Form.Control name="nombre_bien" value={formData.nombre_bien || ''} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Descripción de Ingreso</Form.Label>
                    <Form.Control as="textarea" name="descripcion_ingreso" value={formData.descripcion_ingreso || ''} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Ubicación</Form.Label>
                    <Form.Control name="ubicacion" value={formData.ubicacion || ''} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Clasificación</Form.Label>
                    <Form.Control name="clasificacion" value={formData.clasificacion || ''} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Uso</Form.Label>
                    <Form.Control name="uso" value={formData.uso || ''} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Estado de Conservación</Form.Label>
                    <Form.Control name="estado_conservacion" value={formData.estado_conservacion || ''} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Valor en Bs</Form.Label>
                    <Form.Control name="valor_bs" type="number" value={formData.valor_bs || ''} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Vida Útil (años)</Form.Label>
                    <Form.Control name="vida_util_anios" type="number" value={formData.vida_util_anios || ''} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Unidad Organizacional</Form.Label>
                    <Form.Select name="unidad_organizacional_id" value={formData.unidad_organizacional_id || ''} onChange={handleChange}>
                        <option value="">Seleccione...</option>
                        {unidades.map(u => <option key={u.id} value={u.id}>{u.descripcion}</option>)}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Responsable</Form.Label>
                    <Form.Select name="responsable_id" value={formData.responsable_id || ''} onChange={handleChange}>
                        <option value="">Seleccione...</option>
                        {personales.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Cargo</Form.Label>
                    <Form.Select name="cargo_id" value={formData.cargo_id || ''} onChange={handleChange}>
                        <option value="">Seleccione...</option>
                        {cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </Form.Select>
                </Form.Group>

                <Button type="submit" disabled={cargando}>
                    {cargando ? <Spinner animation="border" size="sm" /> : 'Guardar Cambios'}
                </Button>
            </Form>
        </div>
    );
};

export default EditarEdificio;
