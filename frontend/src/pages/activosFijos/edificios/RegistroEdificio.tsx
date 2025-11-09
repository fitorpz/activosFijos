import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosConfig';
import { Form, Button, Spinner, Card, Row, Col, Alert } from 'react-bootstrap';

interface DireccionAdministrativa {
    id: number;
    codigo: string;
    descripcion: string;
}

interface Usuario { id: number; nombre: string; }
interface Personal { id: number; nombre: string; ci: string; }
interface Cargo { id: number; cargo?: string; nombre?: string; descripcion?: string; codigo?: string; }
interface UnidadOrganizacional { id: number; descripcion: string; codigo?: string; }

const RegistroEdificio = () => {
    const navigate = useNavigate();

    // Estado del formulario
    const [formData, setFormData] = useState<any>({
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
                        {/* 👇🏼 aquí tus campos originales, sin cambios estructurales */}
                        {/* Solo asegúrate que los names coincidan con los del DTO del backend */}
                        {/* Ejemplo: codigo_direccion_administrativa, responsable_id, etc. */}
                        {/* ...todo tu JSX anterior permanece igual */}
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default RegistroEdificio;
