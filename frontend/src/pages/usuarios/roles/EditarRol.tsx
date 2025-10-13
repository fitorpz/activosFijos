import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listarPermisos, editarRol, obtenerRol } from '../../../api/roles';
import { Permiso, Rol } from '../../../interfaces/interfaces';
import { agruparPermisosPorModulo } from '../../../utils/permisos';

export const EditarRol: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [slug, setSlug] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [permisos, setPermisos] = useState<number[]>([]);
    const [listaPermisos, setListaPermisos] = useState<Permiso[]>([]);
    const [cargando, setCargando] = useState(true);

    // ✅ Cargar permisos y datos del rol
    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true);
            try {
                const permisosRes = await listarPermisos();
                const permisosAll: Permiso[] = permisosRes.data?.data || permisosRes.data || [];
                setListaPermisos(permisosAll);

                const rolRes = await obtenerRol(Number(id));
                const rol: Rol = rolRes.data?.data || rolRes.data;
                if (!rol) throw new Error('Rol no encontrado');

                setNombre(rol.nombre || '');
                setSlug(rol.slug || '');
                setDescripcion(rol.descripcion || '');

                if (Array.isArray(rol.permisos)) {
                    const permisosIds = rol.permisos.map(p => typeof p === 'object' ? p.id : Number(p));
                    setPermisos(permisosIds);
                } else {
                    setPermisos([]);
                }
            } catch (error) {
                console.error('❌ Error al cargar datos del rol:', error);
                alert('No se pudieron cargar los datos del rol.');
                setListaPermisos([]);
                setPermisos([]);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, [id]);

    const permisosAgrupados = agruparPermisosPorModulo(listaPermisos);

    const togglePermiso = (id: number) => {
        setPermisos(prev =>
            prev.includes(id)
                ? prev.filter(pid => pid !== id)
                : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await editarRol(Number(id), { nombre, slug, descripcion, permisos });
            alert('✅ Rol actualizado correctamente');
            navigate('/usuarios/roles');
        } catch (err: any) {
            console.error('❌ Error al actualizar rol:', err);
            alert('Error al actualizar rol: ' + (err?.message || 'Error desconocido'));
        }
    };

    return (
        <div className="container mt-5">
            <h4 className="mb-4">Editar Rol</h4>
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-4">
                        <div className="mb-3">
                            <label className="form-label">Nombre</label>
                            <input className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Slug</label>
                            <input className="form-control" value={slug} onChange={e => setSlug(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Descripción</label>
                            <textarea className="form-control" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary" disabled={cargando}>
                                Guardar Cambios
                            </button>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <label className="form-label">Permisos del sistema</label>

                        {/* 🔹 Checkbox global */}
                        <div className="form-check mb-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="selectAll"
                                checked={permisos.length === listaPermisos.length && listaPermisos.length > 0}
                                onChange={() => {
                                    if (permisos.length === listaPermisos.length) {
                                        setPermisos([]);
                                    } else {
                                        setPermisos(listaPermisos.map(p => p.id));
                                    }
                                }}
                            />
                            <label className="form-check-label fw-bold" htmlFor="selectAll">
                                Seleccionar todos los permisos
                            </label>
                        </div>

                        {cargando ? (
                            <p>Cargando permisos...</p>
                        ) : Object.keys(permisosAgrupados).length === 0 ? (
                            <p className="text-muted">No hay permisos disponibles.</p>
                        ) : (
                            <div className="accordion" id="accordionPermisos">
                                {Object.entries(permisosAgrupados).map(([modulo, permisosModulo], index) => {
                                    const todosMarcados = permisosModulo.every(p => permisos.includes(p.id));

                                    return (
                                        <div className="accordion-item" key={modulo}>
                                            <h2 className="accordion-header" id={`heading-${index}`}>
                                                <button
                                                    className="accordion-button collapsed"
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#collapse-${index}`}
                                                    aria-expanded="false"
                                                    aria-controls={`collapse-${index}`}
                                                >
                                                    {modulo}
                                                </button>
                                            </h2>
                                            <div
                                                id={`collapse-${index}`}
                                                className="accordion-collapse collapse"
                                                aria-labelledby={`heading-${index}`}
                                                data-bs-parent="#accordionPermisos"
                                            >
                                                <div className="accordion-body">
                                                    {/* 🔹 Checkbox de módulo */}
                                                    <div className="form-check mb-2">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`modulo-${index}`}
                                                            checked={todosMarcados}
                                                            onChange={() => {
                                                                if (todosMarcados) {
                                                                    setPermisos(prev =>
                                                                        prev.filter(pid => !permisosModulo.some(p => p.id === pid))
                                                                    );
                                                                } else {
                                                                    setPermisos(prev => {
                                                                        const nuevos = permisosModulo.map(p => p.id);
                                                                        const combinados = [...prev, ...nuevos];
                                                                        return combinados.filter((id, i) => combinados.indexOf(id) === i);
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <label className="form-check-label fw-bold" htmlFor={`modulo-${index}`}>
                                                            Seleccionar todo el módulo
                                                        </label>
                                                    </div>

                                                    {/* 🔹 Permisos individuales */}
                                                    {permisosModulo.map(permiso => (
                                                        <div className="form-check" key={permiso.id}>
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`permiso-${permiso.id}`}
                                                                checked={permisos.includes(permiso.id)}
                                                                onChange={() => togglePermiso(permiso.id)}
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor={`permiso-${permiso.id}`}
                                                            >
                                                                <strong>{permiso.nombre}</strong>{' '}
                                                                {permiso.descripcion && (
                                                                    <span className="text-muted">
                                                                        ({permiso.descripcion})
                                                                    </span>
                                                                )}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditarRol;
