import { useState } from 'react';

const PrimeraVez = () => {
    const [nombre, setNombre] = useState('');
    const [cargo, setCargo] = useState('');
    const [unidad, setUnidad] = useState('');
    const [correo, setCorreo] = useState('');

    const handleGenerarPDF = () => {
        alert('Aquí se generará un PDF con los datos ingresados (en siguiente paso).');
        // Aquí se conectará la funcionalidad de generación PDF
    };

    return (
        <div className="container mt-4">
            <h4>¿Primera vez?</h4>
            <ol>
                <li>
                    Debe llenar el <strong>Formulario de Asignación de Cuenta de Usuario</strong> con sus datos.
                </li>
                <li>Presione <strong>Generar PDF</strong> para descargarlo.</li>
                <li>Adjunte los documentos solicitados (CI, memo, etc.).</li>
                <li>
                    Entregue todo a la <strong>Jefatura de Activos Fijos</strong>.
                </li>
                <li>Reciba su usuario y contraseña asignados.</li>
                <li>Con esos datos podrá ingresar al sistema.</li>
            </ol>

            <div className="card p-4 mt-4">
                <h5 className="mb-3">Formulario de solicitud</h5>
                <div className="mb-3">
                    <label>Nombre completo</label>
                    <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label>Cargo</label>
                    <input type="text" className="form-control" value={cargo} onChange={(e) => setCargo(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label>Unidad Organizacional</label>
                    <input type="text" className="form-control" value={unidad} onChange={(e) => setUnidad(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label>Correo institucional</label>
                    <input type="email" className="form-control" value={correo} onChange={(e) => setCorreo(e.target.value)} />
                </div>

                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-secondary" onClick={() => window.history.back()}>Cerrar</button>
                    <button className="btn btn-primary" onClick={handleGenerarPDF}>Generar PDF</button>
                </div>
            </div>
        </div>
    );
};

export default PrimeraVez;
