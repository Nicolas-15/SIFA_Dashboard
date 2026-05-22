# 🌐 SIFA - Dashboard Web (Panel de Administración y Monitoreo)

Este repositorio contiene la aplicación de **Dashboard Web** del proyecto **SIFA (Sistema Integrado de Fiscalización Automatizada)**, diseñada para la **I. Municipalidad de El Quisco**. Es un panel administrativo moderno y reactivo que centraliza la visualización de analíticas, la validación de infracciones vehiculares capturadas en terreno, la administración de catálogos y la gestión de usuarios bajo un estricto control de acceso basado en roles (RBAC).

---

## 📌 Módulos e Implementación del Sistema

Tras auditar el código fuente, a continuación se detallan las características y vistas **100% implementadas** en la aplicación:

### 1. 📊 Resumen Diario (Dashboard)
El módulo principal consolida el estado operativo del sistema mediante:
*   **Tarjetas de KPIs:** Indicadores en tiempo real que contabilizan:
    *   `Total Infracciones` (Registradas en el sistema).
    *   `Para Verificar` (Infracciones en estado *pendiente*).
    *   `Aceptadas` (Infracciones validadas legalmente).
    *   `Exportadas` (Citaciones oficiales con documento PDF generado).
*   **Visualización Geoespacial (Mapa de Calor):** Integración interactiva con **Leaflet** y **React Leaflet** que proyecta la ubicación exacta de las infracciones mediante coordenadas GPS y mapas de calor (*Heatmaps*).
*   **Tipos de Infracción (Gráfico de Barras):** Gráfico de barras horizontales desarrollado con **Recharts** que agrupa y ordena de mayor a menor frecuencia las infracciones cometidas en la comuna.
*   **Actividad Reciente:** Historial cronológico con las últimas infracciones recibidas y sus estados.

### 2. 👮 Registro de Infracciones
Panel de supervisión y control del flujo de infracciones vehiculares:
*   **Búsqueda y Filtrado:** Buscador dinámico por **patente**, **tipo de infracción** o **ID único**. Pestañas de filtrado rápido por estado (`Todas`, `Pendiente`, `Aceptada`, `Exportada`, `Rechazada`). *Nota: Se ha removido todo flujo relacionado con número de boleta y número de parte.*
*   **Flujo de Detalle y Evidencia Fotográfica:**
    *   **Carrusel de Evidencias:** Carga segura de imágenes encriptadas desde el servidor backend utilizando un hook personalizado (`useAuthImages`) con autenticación JWT y soporte de carrusel interactivo y zoom en pantalla completa.
    *   **Detalle de Vehículo e Identificación:** Muestra y permite editar (en modo edición) la patente, marca, modelo, color y tipo de vehículo interviniente.
    *   **Geolocalización del Suceso:** Muestra las coordenadas de latitud y longitud acompañadas de un mapa interactivo miniatura de **OpenStreetMap** (con opción de vista en pantalla completa).
    *   **Detalles del Infracción:** Código de la infracción, tipo, y sección de observaciones adicionales.
*   **Acciones y Firma del Juzgado (JPL):**
    *   Solo los usuarios con el rol de **Administrativo JPL** (Juzgado de Policía Local) pueden tomar acciones legales sobre las infracciones.
    *   **Rechazar:** Cambia el estado a `rejected` y anula la infracción.
    *   **Revisar / Aceptar:** Pide confirmación de validez legal y cambia el estado a `accepted`.
    *   **Generar Empadronado JPL (Exportar):** Genera dinámicamente un documento oficial en PDF (`empadronado-${id}.pdf`) listo para impresión mediante la combinación de **jsPDF** y **html2canvas**, y cambia de forma automática el estado de la infracción a `exported`.

### 3. ⚠️ Catálogo de Tipos de Infracciones
*   **Acceso Restringido:** Vista disponible únicamente para los roles **Administrador** y **Supervisor**.
*   **Funcionalidad:** Listado y mantenedor completo (CRUD) de los tipos de infracciones regulados en la comuna.
*   **Atributos de Datos:** Cada tipo de infracción se compone únicamente de su `ID` (código de ley), `Nombre` (título de la infracción), `Descripción` (detalle de la disposición infringida) y su estado de `Habilitado/Deshabilitado`. *No se gestionan montos, multas en dinero, tarifas ni cobros en esta sección.*

### 4. 👥 Gestión de Usuarios
*   **Acceso Restringido:** Vista exclusiva para el rol **Administrador**.
*   **Mantenedor de Usuarios:** Permite la creación, edición y administración de los usuarios del sistema.
*   **Validaciones y Atributos:**
    *   **Nombre y Apellido:** Datos personales del operador.
    *   **RUT:** Entrada formateada con validación nativa chilena (cuerpo y dígito verificador `XX.XXX.XXX-X`).
    *   **Contacto:** Correo electrónico y teléfono móvil (validado a 8 dígitos).
    *   **Rol:** Asignación de permisos mediante roles del sistema (`Administrador`, `Supervisor`, `Administrativo JPL`, `Fiscalizador`).
    *   **Estado:** Permite activar o revocar (`active` / `inactive`) los accesos de cualquier usuario (excepto del usuario administrador en sesión).

---

## 🚀 Stack Tecnológico

La aplicación se construyó con un ecosistema robusto enfocado en interfaces de alto rendimiento y diseño premium:

*   **Core:** React 18 & Vite (compilación ultrarrápida y Hot Module Replacement).
*   **Estilos:** Tailwind CSS & PostCSS (diseño adaptable y responsive, adaptado para modo oscuro y vistas móviles).
*   **Enrutamiento y Estado:** React Router DOM v7 (rutas dinámicas y protegidas con Route Guards por rol).
*   **Gráficos:** Recharts (visualización de barras y tendencias).
*   **Mapas:** Leaflet, React Leaflet (renderizado de heatmaps y marcadores GPS).
*   **Generación de Documentos:** jsPDF & html2canvas (exportación de citaciones físicas).
*   **Iconografía:** Lucide React.

---

## 🏗️ Integración y Proxy en Desarrollo

El Dashboard Web se conecta al ecosistema de microservicios a través del **API Gateway** unificado en el puerto `9000`. 

Para evitar configuraciones complejas de CORS en desarrollo local, el servidor de Vite (`vite.config.js`) implementa un proxy inverso que redirige las peticiones relativas de forma transparente:
*   `/auth` ➡️ Redirige a `http://localhost:9000/auth` (Auth Service)
*   `/auth-api` ➡️ Redirige a `http://localhost:9000/auth` (Gateway)
*   `/core` ➡️ Redirige a `http://localhost:9000/core` (Core Service - Manejo de Infracciones y Catálogos)
*   `/api` ➡️ Redirige a `http://localhost:9000/api/mock` (APIs Fake para testing local)

---

## 🛠️ Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo:

### 1. Requisitos Previos
*   **Node.js** (v18.x o superior recomendado)
*   **npm** o **yarn** instalado

### 2. Clonar el Repositorio
```bash
git clone https://github.com/Nicolas-15/SIFA_Dashboard.git
cd SIFA_Dashboard
```

### 3. Instalar las Dependencias
```bash
npm install
```

### 4. Ejecutar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible por defecto en: **`http://localhost:5173`**

### 5. Compilar para Producción
```bash
npm run build
```

---

## 📚 Recursos del Proyecto SIFA

Enlaces compartidos para la alineación del desarrollo:

### 🎨 Diseño y Planeación
*   **Canva (Diagramas del Sistema):** [Ver diagramas en Canva](https://www.canva.com/design/DAHETfLsYtY/CRJ4o-yosxk7U3FmVpG3VA/edit)
*   **Figma (Diseño UI/UX):** [Ver prototipos en Figma](https://www.figma.com/design/lPnmPA1nVhkHiIynNSZC1I/SIFA?m=auto&t=ho6fOLhZR9MGQsZS-1)
*   **Miro (Planeación y Arquitectura):** [Ver tablero en Miro](https://miro.com/welcomeonboard/NGJXeTJZb2l6dC9zWm43NVFzWWpVZVRYM2lMMzBJeUxwSE9NNm9pMGZWRUlxWGF4VnViaEl5aFJNK2MwTDc5Z3VCK05DWDZ2TnNEZDduRHdxai9VSWlidTZRK2Z1L2hVMk1VUTZhL0ViR0NWL2lXaktHaE5BZU1iVFdqT0pxam5BS2NFM01kcUNFSnM0d3FEN050ekl3PT0hdjE=?share_link_id=461858653705)

### 📋 Gestión Ágil
*   **Jira (Tablero SCRUM):** [Ver tablero Jira](https://sifa-proyect.atlassian.net/jira/software/projects/SCRUM/boards/1)

### ⚙️ Repositorios del Ecosistema SIFA
*   **API Gateway:** [BEsifaAPIGateway](https://github.com/jarodsmdev/BEsifaAPIGateway)
*   **Auth Service (Spring Boot):** [BEsifaAuthService](https://github.com/jarodsmdev/BEsifaAuthService)
*   **Core Service (Spring Boot):** [BEsifaCoreService](https://github.com/Andythe20/BEsifaCoreService)
*   **YOLO Plate Detector (IA):** [sifaPlateDetectorBE](https://github.com/jarodsmdev/sifaPlateDetectorBE)
*   **Fake APIs:** [FAKE_APIs_SIFA](https://github.com/jarodsmdev/FAKE_APIs_SIFA)
*   **Aplicación Móvil (SIFA GO):** [sifa_go](https://github.com/Andythe20/sifa_go)
*   **Infraestructura Cloud (Terraform):** [TerraformProyectSIFA](https://github.com/jarodsmdev/TerraformProyectSIFA)