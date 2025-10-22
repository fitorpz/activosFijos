import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

interface Usuario {
    id: number;
    nombre: string;
    correo: string;
}

interface Personal {
    id: number;
    documento: number;
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

    const [formData, setFormData] = useState({
        usuario: null as Usuario | null,
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

    // 🔹 Cargar datos iniciales
    useEffect(() => {
        obtenerPersonal();
        obtenerUsuariosDisponibles();
    }, []);

    // 🔹 Obtener datos del personal
    const obtenerPersonal = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/parametros/personal/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const p = res.data as Personal;

            setFormData({
                usuario: p.usuario || null,
                documento: p.documento?.toString() || '',
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
            alert('Error al cargar los datos del personal.');
        } finally {
            setCargando(false);
        }
    };

    const obtenerUsuariosDisponibles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get<Usuario[]>(`/parametros/personal/usuarios-disponibles`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { idPersonal: id },
            });
            setUsuariosDisponibles(res.data); // ✅ ya no da error
        } catch (error) {
            console.error('❌ Error al cargar usuarios disponibles:', error);
        }
    };


    // 🔹 Manejar cambios en los inputs
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
                documento: Number(formData.documento),
                estciv: Number(formData.estciv),
                sexo: Number(formData.sexo),
                usuario_id: formData.usuario ? formData.usuario.id : null, // 👈 clave
            };

            await axios.put(`/parametros/personal/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('✅ Personal actualizado correctamente.');
            navigate('/parametros/personales');
        } catch (error: any) {
            console.error('❌ Error al actualizar personal:', error);
            alert(error?.response?.data?.message || '❌ Error al actualizar el personal.');
        } finally {
            setCargando(false);
        }
    };


    return (
        <div className="container mt-4">
            <div className="form-container">
                <h4 className="mb-4">Editar Registro de Personal</h4>

                {cargando ? (
                    <p>Cargando datos...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="row">

                            {/* 🧩 Usuario asignado */}
                            <div className="col-md-6 mb-3">
                                <label htmlFor="usuario_id" className="form-label">Usuario asignado</label>
                                <select
                                    id="usuario_id"
                                    name="usuario_id"
                                    className="form-select"
                                    value={formData.usuario?.id || ''}
                                    onChange={(e) => {
                                        const userId = e.target.value;
                                        const selectedUser = usuariosDisponibles.find(u => u.id === Number(userId)) || null;
                                        setFormData((prev) => ({ ...prev, usuario: selectedUser }));
                                    }}
                                >
                                    <option value="">Sin usuario asignado</option>
                                    {usuariosDisponibles.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nombre} ({u.correo})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="documento" className="form-label">Nro. Documento</label>
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
                                    value={formData.usuario ? formData.usuario.nombre : formData.nombre}
                                    readOnly
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
                            {cargando ? 'Guardando...' : 'Actualizar'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => navigate('/parametros/personales')}
                        >
                            Cancelar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditarPersonal;
