import { useState } from 'react';

const CuentaDeshabilitada = () => {
    const [nombre, setNombre] = useState('');
    const [cargo, setCargo] = useState('');
    const [unidad, setUnidad] = useState('');
    const [correo, setCorreo] = useState('');

    const handleGenerarPDF = () => {
        alert('Aquí se generará el PDF de habilitación de cuenta (siguiente paso).');
        // Aquí se puede usar jsPDF o pdf-lib
    };

    return (
        <div className="container mt-4">
            <h4>¿Su cuenta se encuentra deshabilitada?</h4>
            <ol>
                <li>
                    Debe descargar el <strong>Formulario de Habilitación de Cuenta</strong> y llenarlo. <br />
                    <strong>Presione click en Generar PDF para tenerlo.</strong>
                </li>
                <li>Enviar el formulario a la Jefatura de Activos Fijos.</li>
                <li>Recoger nueva contraseña de la Jefatura de Activos Fijos.</li>
                <li>Con su nueva contraseña acceda al sistema.</li>
            </ol>

            <div className="card p-4 mt-4">
                <h5 className="mb-3">Formulario de habilitación</h5>
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
                    <button className="btn btn-secondary" onClick={() => window.history.back()}>
                        Cerrar
                    </button>
                    <button className="btn btn-primary" onClick={handleGenerarPDF}>
                        Generar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CuentaDeshabilitada;
