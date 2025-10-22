import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface Usuario {
    id: number;
    nombre: string;
    correo: string;
}

const RegistroPersonal = () => {
    const [formData, setFormData] = useState({
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

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    // 🧩 Cargar usuarios disponibles
    useEffect(() => {
        obtenerUsuariosDisponibles();
    }, []);

    const obtenerUsuariosDisponibles = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get<Usuario[]>('/parametros/personal/usuarios-disponibles', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsuarios(res.data);
        } catch (error) {
            console.error('❌ Error al obtener usuarios disponibles:', error);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);

        try {
            const token = localStorage.getItem('token');

            const payload = {
                ...formData,
                usuario_id: formData.usuario_id ? Number(formData.usuario_id) : null,
                documento: Number(formData.documento),
                estciv: Number(formData.estciv),
                sexo: Number(formData.sexo),
            };

            await axios.post('/parametros/personal', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert('✅ Personal registrado correctamente.');
            navigate('/parametros/personales');
        } catch (error: any) {
            console.error('❌ Error al registrar personal:', error);
            alert(error?.response?.data?.message || '❌ Error al registrar el personal.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="form-container">
                <h4 className="mb-4">Nuevo Registro de Personal</h4>
                <form onSubmit={handleSubmit}>
                    <div className="row">

                        {/* 🧩 Campo para seleccionar el usuario */}
                        <div className="col-md-6 mb-3">
                            <label htmlFor="usuario_id" className="form-label">
                                Usuario del Sistema (Nombre Completo)
                            </label>
                            <select
                                id="usuario_id"
                                name="usuario_id"
                                className="form-select"
                                value={formData.usuario_id}
                                onChange={handleChange}
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
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="documento" className="form-label">Nro Documento</label>
                            <input
                                type="number"
                                id="documento"
                                name="documento"
                                className="form-control"
                                value={formData.documento}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="ci" className="form-label">Documento</label>
                            <input
                                type="text"
                                id="ci"
                                name="ci"
                                className="form-control"
                                value={formData.ci}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="expedido" className="form-label">Expedido</label>
                            <input
                                type="text"
                                id="expedido"
                                name="expedido"
                                className="form-control"
                                value={formData.expedido}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="nombre" className="form-label">Nombre Completo (Personal)</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                className="form-control"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="profesion" className="form-label">Profesión</label>
                            <input
                                type="text"
                                id="profesion"
                                name="profesion"
                                className="form-control"
                                value={formData.profesion}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="direccion" className="form-label">Dirección</label>
                            <input
                                type="text"
                                id="direccion"
                                name="direccion"
                                className="form-control"
                                value={formData.direccion}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label htmlFor="celular" className="form-label">Celular</label>
                            <input
                                type="text"
                                id="celular"
                                name="celular"
                                className="form-control"
                                value={formData.celular}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label htmlFor="telefono" className="form-label">Teléfono</label>
                            <input
                                type="text"
                                id="telefono"
                                name="telefono"
                                className="form-control"
                                value={formData.telefono}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label htmlFor="email" className="form-label">Correo electrónico</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-control"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="fecnac" className="form-label">Fecha de nacimiento</label>
                            <input
                                type="date"
                                id="fecnac"
                                name="fecnac"
                                className="form-control"
                                value={formData.fecnac}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-3 mb-3">
                            <label htmlFor="estciv" className="form-label">Estado Civil</label>
                            <select
                                id="estciv"
                                name="estciv"
                                className="form-select"
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
                            </select>
                        </div>

                        <div className="col-md-3 mb-3">
                            <label htmlFor="sexo" className="form-label">Sexo</label>
                            <select
                                id="sexo"
                                name="sexo"
                                className="form-select"
                                value={formData.sexo}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccionar</option>
                                <option value="1">Masculino</option>
                                <option value="2">Femenino</option>
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="estado" className="form-label">Estado</label>
                            <select
                                id="estado"
                                name="estado"
                                className="form-select"
                                value={formData.estado}
                                onChange={handleChange}
                                required
                            >
                                <option value="ACTIVO">ACTIVO</option>
                                <option value="INACTIVO">INACTIVO</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Registrar'}
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => navigate('/parametros/personales')}
                    >
                        Cancelar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistroPersonal;
