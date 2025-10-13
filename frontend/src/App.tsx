import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// 🔹 Páginas de autenticación
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { RegistroUsuario } from './pages/usuarios/RegistroUsuario';
import RecuperarContrasena from './pages/usuarios/RecuperarContrasena';
import PrimeraVez from './pages/usuarios/PrimeraVez';
import CuentaDeshabilitada from './pages/usuarios/CuentaDeshabilitada';

// 🔹 Usuarios y roles
import { EditarUsuario } from './pages/usuarios/EditarUsuario';
import Usuarios from './pages/usuarios/Usuarios';
import ListaRoles from './pages/usuarios/roles/ListaRoles';
import CrearRol from './pages/usuarios/roles/CrearRol';
import EditarRol from './pages/usuarios/roles/EditarRol';

// 🔹 Layout y componentes base
import Layout from './components/Layout';
import PanelControl from './pages/PanelControl';

// 🔹 Parámetros y módulos del sistema
import Parametros from './pages/parametros/Parametros';
import DireccionesAdministrativas from './pages/parametros/direcciones-administrativas/DireccionesAdministrativas';
import RegistroDireccionAdministrativa from './pages/parametros/direcciones-administrativas/RegistroDireccionAdministrativa';
import EditarDireccionAdministrativa from './pages/parametros/direcciones-administrativas/EditarDireccionAdministrativa';
import UnidadesOrganizacionales from './pages/parametros/unidades-organizacionales/UnidadesOrganizacionales';
import RegistroUnidadesOrganizacionales from './pages/parametros/unidades-organizacionales/RegistroUnidadesOrganizacionales';
import EditarUnidadesOrganizacionales from './pages/parametros/unidades-organizacionales/EditarUnidadesOrganizacionales';
import Ambientes from './pages/parametros/ambientes/ambientes';
import RegistroAmbientes from './pages/parametros/ambientes/RegistroAmbientes';
import EditarAmbientes from './pages/parametros/ambientes/EditarAmbientes';
import Areas from './pages/parametros/areas/Areas';
import RegistroAreas from './pages/parametros/areas/RegistroAreas';
import EditarAreas from './pages/parametros/areas/EditarAreas';
import GruposContables from './pages/parametros/grupos-contables/GruposContables';
import RegistroGrupoContable from './pages/parametros/grupos-contables/RegistroGrupoContable';
import EditarGrupoContable from './pages/parametros/grupos-contables/EditarGrupoContable';
import Auxiliares from './pages/parametros/auxiliares/Auxiliares';
import RegistroAuxiliar from './pages/parametros/auxiliares/RegistroAuxiliar';
import EditarAuxiliar from './pages/parametros/auxiliares/EditarAuxiliar';
import Personales from './pages/parametros/personales/Personales';
import RegistroPersonal from './pages/parametros/personales/RegistroPersonal';
import EditarPersonal from './pages/parametros/personales/EditarPersonal';
import ListaCargos from './pages/parametros/cargos/Cargos';
import RegistroCargos from './pages/parametros/cargos/RegistroCargos';
import EditarCargos from './pages/parametros/cargos/EditarCargos';
import Nucleos from './pages/parametros/nucleos/Nucleos';
import RegistroNucleo from './pages/parametros/nucleos/RegistroNucleo';
import EditarNucleo from './pages/parametros/nucleos/EditarNucleo';
import Ciudades from './pages/parametros/ciudades/Ciudades';
import RegistroCiudad from './pages/parametros/ciudades/RegistroCiudad';
import EditarCiudad from './pages/parametros/ciudades/EditarCiudad';
import Distritos from './pages/parametros/distritos/Distritos';
import RegistroDistrito from './pages/parametros/distritos/RegistroDistritos';
import EditarDistrito from './pages/parametros/distritos/EditarDistritos';

// 🔹 Otros módulos
import ImprimirTickets from './pages/tickets/ImprimirTickets';
import Ufvs from './pages/activosFijos/ufvs/ufvs';
import RegistroUfv from './pages/activosFijos/ufvs/RegistroUfv';
import EditarUfv from './pages/activosFijos/ufvs/EditarUfv';
import ListaEdificios from './pages/activosFijos/edificios/ListaEdificios';
import RegistroEdificio from './pages/activosFijos/edificios/RegistroEdificio';
import EditarEdificio from './pages/activosFijos/edificios/EditarEdificio';
import AccesoDenegado from './pages/AccesoDenegado';

function App() {
  // ✅ Estado del login basado en el token
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));

  // 🔄 Actualiza estado cuando el token cambia
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 Rutas públicas */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegistroUsuario />} />
        <Route path="/recuperar" element={<RecuperarContrasena />} />
        <Route path="/primera-vez" element={<PrimeraVez />} />
        <Route path="/deshabilitada" element={<CuentaDeshabilitada />} />

        {/* 🔐 Rutas privadas (solo si hay token) */}
        {isAuthenticated && (
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/panel-control" element={<PanelControl />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/usuarios/crear" element={<RegistroUsuario />} />
            <Route path="/usuarios/editar/:id" element={<EditarUsuario />} />
            <Route path="/usuarios/roles" element={<ListaRoles />} />
            <Route path="/usuarios/roles/crear" element={<CrearRol />} />
            <Route path="/usuarios/roles/editar/:id" element={<EditarRol />} />

            {/* Parámetros */}
            <Route path="/parametros" element={<Parametros />} />
            <Route path="/parametros/direcciones-administrativas" element={<DireccionesAdministrativas />} />
            <Route path="/parametros/direcciones-administrativas/nueva" element={<RegistroDireccionAdministrativa />} />
            <Route path="/parametros/direcciones-administrativas/editar/:id" element={<EditarDireccionAdministrativa />} />
            <Route path="/parametros/unidades-organizacionales" element={<UnidadesOrganizacionales />} />
            <Route path="/parametros/unidades-organizacionales/registrar" element={<RegistroUnidadesOrganizacionales />} />
            <Route path="/parametros/unidades-organizacionales/editar/:id" element={<EditarUnidadesOrganizacionales />} />
            <Route path="/parametros/ambientes" element={<Ambientes />} />
            <Route path="/parametros/ambientes/registrar" element={<RegistroAmbientes />} />
            <Route path="/parametros/ambientes/editar/:id" element={<EditarAmbientes />} />
            <Route path="/parametros/areas" element={<Areas />} />
            <Route path="/parametros/areas/registrar" element={<RegistroAreas />} />
            <Route path="/parametros/areas/editar/:id" element={<EditarAreas />} />
            <Route path="/parametros/grupos-contables" element={<GruposContables />} />
            <Route path="/parametros/grupos-contables/registrar" element={<RegistroGrupoContable />} />
            <Route path="/parametros/grupos-contables/editar/:id" element={<EditarGrupoContable />} />
            <Route path="/parametros/auxiliares" element={<Auxiliares />} />
            <Route path="/parametros/auxiliares/registrar" element={<RegistroAuxiliar />} />
            <Route path="/parametros/auxiliares/editar/:id" element={<EditarAuxiliar />} />
            <Route path="/parametros/personales" element={<Personales />} />
            <Route path="/parametros/personales/registrar" element={<RegistroPersonal />} />
            <Route path="/parametros/personales/editar/:id" element={<EditarPersonal />} />
            <Route path="/parametros/cargos" element={<ListaCargos />} />
            <Route path="/parametros/cargos/registrar" element={<RegistroCargos />} />
            <Route path="/parametros/cargos/editar/:id" element={<EditarCargos />} />
            <Route path="/parametros/nucleos" element={<Nucleos />} />
            <Route path="/parametros/nucleos/nuevo" element={<RegistroNucleo />} />
            <Route path="/parametros/nucleos/editar/:id" element={<EditarNucleo />} />
            <Route path="/parametros/ciudades" element={<Ciudades />} />
            <Route path="/parametros/ciudades/nuevo" element={<RegistroCiudad />} />
            <Route path="/parametros/ciudades/editar/:id" element={<EditarCiudad />} />
            <Route path="/parametros/distritos" element={<Distritos />} />
            <Route path="/parametros/distritos/nuevo" element={<RegistroDistrito />} />
            <Route path="/parametros/distritos/editar/:id" element={<EditarDistrito />} />

            {/* Otros */}
            <Route path="/tickets/imprimir" element={<ImprimirTickets />} />
            <Route path="/edificios" element={<ListaEdificios />} />
            <Route path="/edificios/nuevo" element={<RegistroEdificio />} />
            <Route path="/edificios/editar/:id" element={<EditarEdificio />} />
            <Route path="/ufvs" element={<Ufvs />} />
            <Route path="/ufvs/nuevo" element={<RegistroUfv />} />
            <Route path="/ufvs/editar/:id" element={<EditarUfv />} />
            <Route path="/acceso-denegado" element={<AccesoDenegado />} />
          </Route>
        )}

        {/* 🔸 Redirigir si no está autenticado */}
        {!isAuthenticated && <Route path="*" element={<Navigate to="/login" />} />}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
