import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccesoDenegado = () => {
    const navigate = useNavigate();
    return (
        <div className="container text-center mt-5">
            <h2 className="text-danger fw-bold">🚫 Acceso Denegado</h2>
            <p className="text-muted">
                No tienes permisos suficientes para acceder a este módulo o realizar esta acción.
            </p>
            <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-2"></i> Volver atrás
            </button>
        </div>
    );
};

export default AccesoDenegado;
