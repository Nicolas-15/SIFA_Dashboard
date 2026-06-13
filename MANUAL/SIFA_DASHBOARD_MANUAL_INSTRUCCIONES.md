<style>
@media print {
  @page {
    size: letter;
    margin: 20mm 15mm 20mm 25mm;
    @bottom-center {
      content: "-" counter(page) "-";
      font-size: 8pt;
      font-family: "Segoe UI", sans-serif;
      color: #888;
    }
  }
  @page:first {
    margin-top: 0;
    @bottom-center {
      content: none;
    }
  }
  table tbody tr:hover {
    background-color: #f1f5f9;
  }
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.first-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100%;
  padding-top: 60px;
  padding-bottom: 40px;
  box-sizing: border-box;
}

.first-page .spacer {
  flex: 1;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 9.5pt;
  font-family: "Segoe UI", Arial, sans-serif;
}

table thead tr {
  background-color: #1e293b;
  color: #ffffff;
}

table th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 700;
  font-size: 9pt;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

table td {
  padding: 7px 12px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

table tbody tr:nth-child(even) {
  background-color: #f8fafc;
}

table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}

h2 {
  margin-top: 36px;
}

h3 {
  margin-top: 28px;
}

p, li {
  margin-top: 6px;
}
</style>

<div class="first-page">

<div align="center">

# Manual de Instrucciones

# SIFA Dashboard

<p style="margin-top: 32px; font-weight: 600;">Sistema Integrado de Fiscalización Automatizada</p>

</div>

<div class="spacer"></div>

<div align="center">

| | |
|---|---|
| **Versión** | 1.0.0 |
| **Plataforma** | Web (navegador moderno) |
| **Idioma** | Español |
| **Fecha de elaboración** | Junio 2026 |
| **Elaborado por** | Leonel Briones Palacios |
| **Revisado por** | Nicolás López Plaza |
| **Aprobado por** | Andrés Ortega Suazo |

</div>

---

<div style="page-break-before: always;"></div>

## Índice

- [Manual de Instrucciones](#manual-de-instrucciones)
- [SIFA Dashboard](#sifa-dashboard)
  - [Índice](#índice)
  - [1. Introducción](#1-introducción)
  - [2. Requisitos del Sistema](#2-requisitos-del-sistema)
  - [3. Inicio de Sesión](#3-inicio-de-sesión)
    - [Descripción](#descripción)
    - [Elementos y opciones](#elementos-y-opciones)
  - [4. Recuperación de Contraseña](#4-recuperación-de-contraseña)
    - [Descripción](#descripción-1)
    - [Paso 1: Solicitud de código](#paso-1-solicitud-de-código)
    - [Paso 2: Ingreso de código y nueva contraseña](#paso-2-ingreso-de-código-y-nueva-contraseña)
    - [Paso 3: Confirmación de éxito](#paso-3-confirmación-de-éxito)
  - [5. Panel Principal (Dashboard)](#5-panel-principal-dashboard)
    - [Descripción](#descripción-2)
    - [5.1. Barra Lateral de Navegación](#51-barra-lateral-de-navegación)
    - [5.2. Encabezado Superior](#52-encabezado-superior)
    - [5.3. Filtro de Fechas](#53-filtro-de-fechas)
    - [5.4. Tarjetas de KPIs](#54-tarjetas-de-kpis)
    - [5.5. Mapa de Calor de Infracciones](#55-mapa-de-calor-de-infracciones)
    - [5.6. Actividad Reciente](#56-actividad-reciente)
    - [5.7. Mapa de Fiscalizadores en Terreno](#57-mapa-de-fiscalizadores-en-terreno)
  - [6. Registro de Infracciones](#6-registro-de-infracciones)
    - [Descripción](#descripción-3)
    - [6.1. Barra de Búsqueda y Filtros](#61-barra-de-búsqueda-y-filtros)
    - [6.2. Tabla de Infracciones](#62-tabla-de-infracciones)
    - [6.3. Modal de Detalle de Infracción](#63-modal-de-detalle-de-infracción)
      - [Encabezado](#encabezado)
      - [Motivo del Rechazo (solo si está rechazada)](#motivo-del-rechazo-solo-si-está-rechazada)
      - [Numeraciones](#numeraciones)
      - [Evidencia Fotográfica](#evidencia-fotográfica)
      - [Motivo e Infracción Cometida](#motivo-e-infracción-cometida)
      - [Denunciado / Infractor](#denunciado--infractor)
      - [Vehículo Interviniente](#vehículo-interviniente)
      - [Origen / Coordenadas](#origen--coordenadas)
    - [6.4. Acciones del Juzgado (JPL)](#64-acciones-del-juzgado-jpl)
      - [Infracción en estado "Pendiente"](#infracción-en-estado-pendiente)
      - [Infracción en estado "Aceptada"](#infracción-en-estado-aceptada)
      - [Infracción en estado "Exportada"](#infracción-en-estado-exportada)
      - [Infracción en estado "Rechazada"](#infracción-en-estado-rechazada)
  - [7. Citaciones JPL](#7-citaciones-jpl)
    - [Descripción](#descripción-4)
    - [7.1. Listado y Filtros](#71-listado-y-filtros)
    - [7.2. Detalle de Citación](#72-detalle-de-citación)
    - [7.3. Reprogramar Citación](#73-reprogramar-citación)
  - [8. Catálogo de Tipos de Infracciones](#8-catálogo-de-tipos-de-infracciones)
    - [Descripción](#descripción-5)
    - [8.1. Listado y Búsqueda](#81-listado-y-búsqueda)
    - [8.2. Crear Tipo de Infracción](#82-crear-tipo-de-infracción)
    - [8.3. Editar Tipo de Infracción](#83-editar-tipo-de-infracción)
    - [8.4. Eliminar Tipo de Infracción](#84-eliminar-tipo-de-infracción)
  - [9. Gestión de Usuarios](#9-gestión-de-usuarios)
    - [Descripción](#descripción-6)
    - [9.1. Listado y Búsqueda](#91-listado-y-búsqueda)
    - [9.2. Crear Usuario](#92-crear-usuario)
    - [9.3. Editar Usuario](#93-editar-usuario)
    - [9.4. Activar/Desactivar Usuario](#94-activardesactivar-usuario)
  - [10. Fiscalizadores en Terreno](#10-fiscalizadores-en-terreno)
    - [Descripción](#descripción-7)
    - [10.1. Listado de Fiscalizadores](#101-listado-de-fiscalizadores)
    - [10.2. Mapa de Ubicación](#102-mapa-de-ubicación)
    - [10.3. Notificaciones a Fiscalizadores](#103-notificaciones-a-fiscalizadores)
    - [10.4. Reportes](#104-reportes)
  - [11. Tokens de Acceso](#11-tokens-de-acceso)
    - [Descripción](#descripción-8)
    - [11.1. Listado y Filtros](#111-listado-y-filtros)
    - [11.2. Detalle y Acciones](#112-detalle-y-acciones)
  - [12. Registro de Auditorías](#12-registro-de-auditorías)
    - [Descripción](#descripción-9)
    - [12.1. Listado y Filtros](#121-listado-y-filtros)
    - [12.2. Tabla de Auditorías](#122-tabla-de-auditorías)
  - [13. Notificaciones Push](#13-notificaciones-push)
    - [Descripción](#descripción-10)
    - [13.1. Enviar Notificación](#131-enviar-notificación)
    - [13.2. Historial de Notificaciones](#132-historial-de-notificaciones)
  - [14. Roles y Permisos](#14-roles-y-permisos)
    - [Zonas restringidas por rol](#zonas-restringidas-por-rol)
  - [15. Cierre de Sesión](#15-cierre-de-sesión)
  - [16. Funcionalidades Transversales](#16-funcionalidades-transversales)
    - [16.1. Diseño Adaptable (Responsive)](#161-diseño-adaptable-responsive)
    - [16.2. Toast de Notificaciones](#162-toast-de-notificaciones)
    - [16.3. Atajo de Teclado](#163-atajo-de-teclado)
  - [Créditos](#créditos)

---

<div style="page-break-before: always;"></div>

## 1. Introducción

![Placeholder: Banner o logo de SIFA Dashboard](img/placeholder_intro_banner.png)

**SIFA Dashboard** es una aplicación web de escritorio y móvil diseñada como panel de administración del **Sistema Integrado de Fiscalización Automatizada (SIFA)** de la **I. Municipalidad de El Quisco**. Permite a los funcionarios municipales:

- Visualizar el resumen diario de infracciones de tránsito con indicadores en tiempo real.
- Revisar, aprobar, rechazar y exportar infracciones capturadas en terreno por fiscalizadores.
- Gestionar citaciones del Juzgado de Policía Local (JPL) y reprogramarlas.
- Administrar los catálogos de tipos de infracciones y los usuarios del sistema.
- Monitorear la ubicación de los fiscalizadores en terreno mediante mapas interactivos.
- Enviar notificaciones push a los dispositivos móviles de los fiscalizadores.
- Auditar todas las operaciones realizadas en el sistema.

---

<div style="page-break-before: always;"></div>

## 2. Requisitos del Sistema

| Requisito | Detalle |
|---|---|
| **Navegador** | Google Chrome 90+, Mozilla Firefox 88+, Microsoft Edge 90+, Safari 14+ |
| **Resolución mínima** | 320 px (móvil) — Diseño adaptable |
| **Conexión a internet** | Requerida para conectarse con los servicios backend |
| **Roles de usuario** | Administrador, Supervisor, Administrativo JPL |

---

<div style="page-break-before: always;"></div>

## 3. Inicio de Sesión

<img src="img/placeholder_login.png" alt="Placeholder: Captura de pantalla de inicio de sesión" />

![Placeholder: Captura de pantalla de inicio de sesión](img/placeholder_login_mobile.png)

### Descripción
Pantalla inicial que permite a los funcionarios autenticarse en el sistema con su correo institucional y contraseña.

### Elementos y opciones

| Elemento | Descripción |
|---|---|
| **Logotipo SIFA** | Escudo estilizado en la parte superior. |
| **Título "SIFA"** | Nombre del sistema con subtítulo "I. Municipalidad de El Quisco". |
| **Campo "Correo Institucional"** | Ingrese su correo electrónico registrado. Incluye validación de formato de email. |
| **Campo "Contraseña"** | Ingrese su contraseña. El campo oculta los caracteres por seguridad. |
| **Botón "Ingresar al Sistema"** | Presione para iniciar sesión. Mientras se procesa aparece un spinner con el texto "Autenticando...". |
| **Enlace "¿Olvidaste tu contraseña?"** | Texto debajo del botón. Redirige a la pantalla de recuperación de contraseña. |

> **Nota:**
> - Si la sesión es válida (token no expirado), la aplicación redirige automáticamente al dashboard.
> - Si la sesión expiró, se muestra un mensaje indicando el motivo (expirada, revocada, etc.).
> - Los mensajes de error se muestran en una tarjeta roja sobre el formulario.
> - Cada campo tiene validación individual con mensajes de error específicos.

---

<div style="page-break-before: always;"></div>

## 4. Recuperación de Contraseña

![Placeholder: Captura de pantalla de recuperación de contraseña](img/placeholder_recovery.png)

### Descripción
Permite al usuario restablecer su contraseña en caso de haberla olvidado. El flujo consta de 3 pasos.

### Paso 1: Solicitud de código

![Placeholder: Captura de pantalla paso 1 - solicitar código](img/placeholder_recovery_step1.png)

| Elemento | Descripción |
|---|---|
| **Ícono de alerta** | Ícono decorativo en la parte superior. |
| **Título "Recuperar Acceso"** | Encabezado de la pantalla. |
| **Subtítulo** | "Ingresa tu correo institucional para recibir el código de verificación." |
| **Campo "Correo Institucional"** | Ingrese su correo electrónico registrado. |
| **Botón "Enviar Código de Recuperación"** | Envía la solicitud al servidor. Muestra "Enviando código..." mientras procesa. |
| **Botón "Volver atrás"** | Regresa a la pantalla de inicio de sesión. |

### Paso 2: Ingreso de código y nueva contraseña

![](img/placeholder_restore_password.png)



| Elemento | Descripción |
|---|---|
| **Título "Restablecer Contraseña"** | Encabezado de la pantalla. |
| **Subtítulo** | Indica el correo al que se envió el código. |
| **Campo "Código de Verificación (6 dígitos)"** | Ingrese el código numérico de 6 dígitos recibido por correo. |
| **Campo "Contraseña Nueva (mín. 8 caracteres)"** | Ingrese la nueva contraseña. |
| **Campo "Confirmar Contraseña"** | Repita la nueva contraseña. Muestra error si no coinciden. |
| **Botón "Restablecer Contraseña"** | Envía los datos al servidor. Valida código de 6 dígitos y contraseñas coincidentes. |
| **Botón "Volver a ingresar correo"** | Regresa al paso 1. |

### Paso 3: Confirmación de éxito

![Placeholder: Captura de pantalla paso 3 - contraseña restablecida](img/placeholder_recovery_password_success.png)

| Elemento | Descripción |
|---|---|
| **Ícono de check verde** | Círculo con icono de verificación. |
| **Título "Contraseña Restablecida"** | Mensaje de éxito. |
| **Subtítulo** | "Tu contraseña ha sido actualizada con éxito y todas las sesiones previas fueron cerradas." |
| **Texto informativo** | "Ya puedes iniciar sesión en el sistema usando tus nuevas credenciales de acceso." |
| **Botón "Ir al Inicio de Sesión"** | Regresa a la pantalla de login. |

---

<div style="page-break-before: always;"></div>

## 5. Panel Principal (Dashboard)

![Placeholder: Captura de pantalla del dashboard](img/placeholder_dashboard.png)

### Descripción
Pantalla principal que consolida el estado operativo del sistema con indicadores en tiempo real, mapas de calor, gráficos y actividad reciente.

> **Acceso:** `Administrador`, `Supervisor`,  `Administrativo JPL` `

### 5.1. Barra Lateral de Navegación

![Placeholder: Captura de pantalla de la barra lateral](img/placeholder_sidebar.png)

Barra lateral izquierda con el menú de navegación principal. Las secciones visibles dependen del rol del usuario:

| Sección | Ícono | Visibilidad |
|---|---|---|
| **Dashboard** | LayoutDashboard | Todos los roles |
| **Infracciones** | Receipt | Todos los roles |
| **Citaciones JPL** | CalendarClock | Admin, Supervisor, Administrativo JPL |
| **Tipos de Infracciones** | FileWarning | Admin, Supervisor |
| **Gestión de Usuarios** | Users | Solo Admin |
| **Fiscalizadores** | ShieldMinus | Admin, Supervisor |
| **Tokens** | Key | Solo Admin |
| **Auditorías** | FileSearch | Solo Admin |
| **Notificaciones** | Bell | Admin, Supervisor |

Al final de la barra se muestra el nombre del usuario autenticado, su rol y el botón de **Cerrar Sesión**.

### 5.2. Encabezado Superior

Muestra la fecha actual formateada en español (ej. "Viernes, 12 de junio de 2026").

### 5.3. Filtro de Fechas

![Placeholder: Captura de pantalla del filtro de fechas](img/placeholder_date_filter.png)

| Elemento | Descripción |
|---|---|
| **Título "Resumen Diario"** | Encabezado de la sección. |
| **Subtítulo** | "Vista general del Sistema de Inteligencia para Fiscalización Automática" |
| **Selector "Desde"** | Campo de fecha (date input) para definir el inicio del rango. |
| **Selector "Hasta"** | Campo de fecha (date input) para definir el fin del rango. Validación: no puede ser menor que la fecha "Desde". |

Los filtros se guardan automáticamente en el almacenamiento de la sesión del navegador.

### 5.4. Tarjetas de KPIs

![Placeholder: Captura de pantalla de las tarjetas KPI](img/placeholder_kpi_cards.png)

Cuatro tarjetas que muestran los indicadores principales:

| Tarjeta | Color | Descripción |
|---|---|---|
| **Total Infracciones** | Azul (primary) | Número total de infracciones registradas en el rango de fechas. |
| **Para Verificar** | Amarillo (warning) | Infracciones en estado pendiente de revisión. |
| **Aceptadas** | Verde (secondary) | Infracciones validadas legalmente. |
| **Exportadas** | Gris (slate) | Citaciones oficiales con documento PDF generado. |

### 5.5. Mapa de Calor de Infracciones

![Placeholder: Captura de pantalla del mapa de calor](img/placeholder_heatmap.png)

| Elemento | Descripción |
|---|---|
| **Título "Zonas de Mayor Incidencia"** | Encabezado de la sección. |
| **Subtítulo** | "Mapa de calor basado en infracciones con GPS" |
| **Mapa interactivo** | Mapa OpenStreetMap con capa de calor (heatmap) que muestra la concentración geográfica de infracciones. |
| **Zoom** | Haga clic en el mapa para activar el zoom con rueda del mouse. |
| **Botón "Exportar Reporte"** | Descarga un reporte PDF con el mapa de calor y las estadísticas. Visible solo para Admin y Supervisor. |
| **Botón de pantalla completa** | Expande el mapa a pantalla completa para una mejor visualización. |

> Al hacer clic en una infracción desde la sección de **Actividad Reciente**, el mapa se centra en la ubicación de esa infracción y muestra un marcador.



### 5.6. Actividad Reciente

![Placeholder: Captura de pantalla de actividad reciente](img/placeholder_recent_activity.png)

Lista las últimas 5 infracciones registradas en el rango de fechas seleccionado.

| Elemento | Descripción |
|---|---|
| **Patente** | Número de patente del vehículo en formato código. |
| **Estado** | Badge de color que indica el estado (Pendiente, Aceptada, Exportada, Rechazada). |
| **Tipo de infracción** | Nombre del tipo de infracción cometida. |
| **Hora** | Hora de emisión de la infracción. |
| **Fiscalizador** | Identificador del fiscalizador que emitió la infracción. |
| **Click en tarjeta** | Si la infracción tiene coordenadas GPS, al hacer clic se centra el mapa de calor en esa ubicación. |

### 5.7. Mapa de Fiscalizadores en Terreno

![Placeholder: Captura de pantalla del mapa de fiscalizadores](img/placeholder_fiscalizadores_map.png)

> **Acceso:** `Administrador` ,`Supervisor`

| Elemento | Descripción |
|---|---|
| **Título "Fiscalizadores en Terreno"** | Encabezado con el conteo de fiscalizadores activos. |
| **Mapa de marcadores** | Mapa OpenStreetMap con marcadores azules en forma de gota que indican la ubicación de cada fiscalizador activo. |
| **Popup de información** | Al hacer clic en un marcador, se muestra: email, fecha de última conexión, dispositivo y un botón **"Enviar notificación"**. |
| **Botón de pantalla completa** | Expande el mapa a pantalla completa. |

---

<div style="page-break-before: always;"></div>

## 6. Registro de Infracciones

![Placeholder: Captura de pantalla del registro de infracciones](img/placeholder_infracciones.png)

### Descripción
Panel de supervisión y control del flujo de infracciones vehiculares. Permite buscar, filtrar, revisar y tomar acciones legales sobre cada infracción.

> **Acceso:** `Administrador`, `Supervisor`,  `Administrativo JPL`
>
> **Zona restringida:** Las acciones de Aceptar/Rechazar y exportación de PDF están disponibles solo para el rol `Administrativo JPL`.

### 6.1. Barra de Búsqueda y Filtros

![Placeholder: Captura de pantalla de filtros de infracciones](img/placeholder_infracciones_filters.png)

| Elemento | Descripción |
|---|---|
| **Campo de búsqueda** | Busque por patente, tipo de infracción o ID de infracción. |
| **Pestañas de estado** | Filtrado rápido: **Todas**, **Pendiente**, **Aceptada**, **Exportada**, **Rechazada**. Cada pestaña muestra el conteo correspondiente. |
| **Botón "Actualizar"** | Recarga los datos desde el servidor. |
| **Filtro "Desde"** | Fecha de inicio del rango (formato dd/mm/aaaa). |
| **Filtro "Hasta"** | Fecha de fin del rango. |
| **Filtro "Fiscalizador"** | Filtro por nombre o correo del fiscalizador, con sugerencias automáticas. |
| **Botón "Limpiar filtros"** | Restablece todos los filtros a sus valores por defecto. |

### 6.2. Tabla de Infracciones

![Placeholder: Captura de pantalla de la tabla de infracciones](img/placeholder_infracciones_table.png)

| Columna | Descripción |
|---|---|
| **ID** | Identificador único de la infracción. |
| **Patente** | Número de patente del vehículo en formato código (fondo oscuro). |
| **Infracción** | Código y nombre del tipo de infracción, más la disposición infringida. |
| **F. Emisión / Fiscalizador** | Fecha de emisión y nombre del fiscalizador que registró la infracción. |
| **Estado** | Badge de color que indica el estado actual. |
| **Fotos** | Cantidad de fotografías de evidencia asociadas. |
| **Acción** | Botón **"Ver Detalle"** para abrir el modal de detalle. |

En dispositivos móviles, la tabla se reemplaza por tarjetas verticales (vista mobile).

### 6.3. Modal de Detalle de Infracción

![Placeholder: Captura de pantalla del modal de detalle](img/placeholder_infraccion_modal.png)

Al hacer clic en **"Ver Detalle"** se abre un modal con las siguientes secciones:

#### Encabezado
- Badge de estado (color según estado).
- Título "Infracción ID: [número]".
- Botón de cerrar (X).

#### Motivo del Rechazo (solo si está rechazada)
- Tarjeta roja con el motivo detallado del rechazo.

#### Numeraciones
| Campo | Descripción |
|---|---|
| **N° ID** | Identificador único de la infracción. |
| **Fecha de Emisión** | Fecha y hora de emisión en formato local. |
| **Agente / Fiscalizador** | Nombre del fiscalizador que emitió. |

#### Evidencia Fotográfica
- Carrusel interactivo con flechas de navegación.
- Contador de imágenes (ej. "1 / 3").
- Dots indicadores de posición.
- Overlay con fecha, ubicación y patente editable.
- Click en la imagen para ver en pantalla completa.
- Soporte para navegación por teclado, rueda del mouse y gestos táctiles (swipe).
- Las imágenes se cargan de forma segura con autenticación JWT.

#### Motivo e Infracción Cometida
| Campo | Descripción |
|---|---|
| **Código Infracción** | Código del tipo de infracción. |
| **Tipo de Infracción** | Nombre descriptivo. |
| **Observaciones** | Notas adicionales del fiscalizador. |

#### Denunciado / Infractor
| Campo | Descripción |
|---|---|
| **Nombre Completo** | Nombre del infractor. |
| **RUT** | RUT con formato chileno. |
| **Edad** | Edad del infractor. |
| **Dirección (Calle y N°)** | Domicilio del infractor. |
| **Comuna / Ciudad** | Comuna de residencia. |
| **Estado Civil** | Estado civil del infractor. |
| **Profesión u Oficio** | Profesión registrada. |

#### Vehículo Interviniente
| Campo | Descripción |
|---|---|
| **Marca** | Marca del vehículo. |
| **Modelo** | Modelo del vehículo. |
| **Color** | Color del vehículo. |
| **Tipo** | Tipo de vehículo (Automóvil, Camioneta, etc.). |

#### Origen / Coordenadas
| Campo | Descripción |
|---|---|
| **Latitud** | Coordenada de latitud. |
| **Longitud** | Coordenada de longitud. |
| **Mapa OpenStreetMap** | Mapa interactivo en miniatura con la ubicación de la infracción. Botón para ver en pantalla completa. |

### 6.4. Acciones del Juzgado (JPL)

![Placeholder: Captura de pantalla de acciones JPL](img/placeholder_jpl_actions.png)

> **Zona restringida:** Solo los usuarios con rol **Administrativo JPL** pueden realizar estas acciones.

#### Infracción en estado "Pendiente"

| Acción | Descripción |
|---|---|
| **Rechazar** | Muestra un campo para ingresar el motivo de rechazo (obligatorio). Al confirmar, cambia el estado a `rejected` y anula la infracción. |
| **Revisar / Aceptar** | Solicita confirmación de validez legal. Al confirmar, cambia el estado a `accepted`. |

#### Infracción en estado "Aceptada"

| Acción | Descripción |
|---|---|
| **Reabrir a Pendiente** | Revierte el estado a `pending`. |
| **Generar Empadronado JPL** | Genera dinámicamente un documento PDF oficial (`empadronado-[id].pdf`) listo para impresión. Cambia automáticamente el estado a `exported`. |

#### Infracción en estado "Exportada"

| Acción | Descripción |
|---|---|
| **Reabrir a Pendiente** | Revierte el estado a `pending`. |
| **Descargar PDF Nuevamente** | Regenera y descarga el documento PDF. |

#### Infracción en estado "Rechazada"

| Acción | Descripción |
|---|---|
| **Reabrir a Pendiente** | Revierte el estado a `pending` para reconsideración. |

---

<div style="page-break-before: always;"></div>

## 7. Citaciones JPL

![Placeholder: Captura de pantalla de citaciones](img/placeholder_citaciones.png)

### Descripción
Módulo de gestión de citaciones del Juzgado de Policía Local. Permite consultar, revisar y reprogramar las citaciones asociadas a las infracciones.

**Acceso:** `Administrador` `Supervisor` `Administrativo JPL`

> **Zona restringida:** La opción "Reprogramar" está disponible solo para el rol `Administrativo JPL`.

### 7.1. Listado y Filtros

| Elemento | Descripción |
|---|---|
| **Título "Citaciones JPL"** | Encabezado de la pantalla. |
| **Campo de búsqueda** | Busque por patente, ID de citación o ID de infracción. |
| **Pestañas de filtro** | Filtrado por estado. |
| **Filtros de fecha** | Rango de fechas "Desde" y "Hasta". |
| **Botón "Actualizar"** | Recarga los datos. |
| **Paginación** | Navegación entre páginas de resultados. |

### 7.2. Detalle de Citación

![Placeholder: Captura de pantalla del detalle de citación](img/placeholder_citacion_modal.png)

| Sección | Campos |
|---|---|
| **Citación** | N° de citación, N° de infracción asociada, estado. |
| **Fecha de Citación** | Fecha programada para la comparecencia al JPL. Indicador visual si es futura (próxima) o pasada. |
| **Infractor** | Nombre completo, RUT, dirección, comuna, correo, teléfono, profesión, estado civil. |
| **Vehículo** | Patente, marca, modelo, año, color, tipo, N° motor, N° serie. |
| **Infracción** | Código, tipo, disposición infringida. |
| **Detalles** | Fecha de emisión, fiscalizador, ubicación (dirección), observaciones. |

### 7.3. Reprogramar Citación

![Placeholder: Captura de pantalla de reprogramación](img/placeholder_reprogramar.png)

Solo disponible para usuarios **Administrativo JPL** y solo para citaciones con fecha futura.

| Elemento | Descripción |
|---|---|
| **Botón "Reprogramar"** | Abre el formulario de reprogramación. |
| **Campo "Nueva fecha y hora"** | Selector de fecha y hora (datetime-local). La fecha debe ser futura. |
| **Botón "Confirmar nueva fecha"** | Guarda la reprogramación. |
| **Botón "Cancelar"** | Cierra el formulario sin guardar. |

---

<div style="page-break-before: always;"></div>

## 8. Catálogo de Tipos de Infracciones

![Placeholder: Captura de pantalla de tipos de infracciones](img/placeholder_tipo_infracciones.png)

### Descripción
Mantenedor completo (CRUD) de los tipos de infracciones regulados en la comuna.

> **Acceso:** `Administrador` , `Supervisor`

### 8.1. Listado y Búsqueda

| Elemento | Descripción |
|---|---|
| **Título "Tipos de Infracciones"** | Encabezado de la pantalla. |
| **Campo de búsqueda** | Busque por nombre o descripción del tipo de infracción. |
| **Botón "Nuevo Tipo"** | Abre el modal de creación. Visible solo para Administradores. |
| **Botón "Actualizar"** | Recarga los datos. |
| **Tabla** | Columnas: ID, Nombre, Descripción, Habilitado (Sí/No), Acciones (Editar, Eliminar). |

### 8.2. Crear Tipo de Infracción

| Elemento | Descripción |
|---|---|
| **Modal "Nuevo Tipo de Infracción"** | Formulario de creación. |
| **Campo "Nombre"** | Nombre del tipo de infracción (obligatorio). |
| **Campo "Descripción"** | Detalle de la disposición infringida (opcional). |
| **Botón "Crear"** | Guarda el nuevo registro. |
| **Botón "Cancelar"** | Cierra el modal sin guardar. |

### 8.3. Editar Tipo de Infracción

| Elemento | Descripción |
|---|---|
| **Modal "Editar Tipo de Infracción"** | Formulario de edición precargado. |
| **Campo "Nombre"** | Edite el nombre. |
| **Campo "Descripción"** | Edite la descripción. |
| **Switch "Habilitado"** | Active o desactive el tipo de infracción. |
| **Botón "Guardar Cambios"** | Actualiza el registro. |

### 8.4. Eliminar Tipo de Infracción

| Elemento | Descripción |
|---|---|
| **Modal de confirmación** | Mensaje: "¿Estás seguro de eliminar el tipo de infracción [nombre]?". |
| **Botón "Eliminar"** | Confirma la eliminación. |
| **Botón "Cancelar"** | Cancela la operación. |

---

<div style="page-break-before: always;"></div>

## 9. Gestión de Usuarios

![Placeholder: Captura de pantalla de gestión de usuarios](img/placeholder_usuarios.png)

### Descripción
Mantenedor de usuarios del sistema.

> **Acceso:** `Administrador` (exclusivo)

### 9.1. Listado y Búsqueda

| Elemento | Descripción |
|---|---|
| **Título "Gestión de Usuarios"** | Encabezado de la pantalla. |
| **Campo de búsqueda** | Busque por nombre, apellido, RUT o correo electrónico. |
| **Botón "Nuevo Usuario"** | Abre el modal de creación. |
| **Botón "Actualizar"** | Recarga los datos. |
| **Tabla** | Columnas: Nombre, RUT, Email, Teléfono, Rol, Estado, Acciones (Editar, Activar/Desactivar). |

### 9.2. Crear Usuario

![Placeholder: Captura de pantalla de creación de usuario](img/placeholder_usuario_create.png)

| Elemento | Descripción |
|---|---|
| **Modal "Nuevo Usuario"** | Formulario de creación. |
| **Campo "Nombre"** | Nombre del usuario (obligatorio). |
| **Campo "Apellido"** | Apellido del usuario (obligatorio). |
| **Campo "RUT"** | RUT con formato automático XX.XXX.XXX-X y validación chilena (obligatorio). |
| **Campo "Correo Electrónico"** | Correo institucional (obligatorio). |
| **Campo "Teléfono"** | Teléfono móvil de 8 dígitos (opcional). |
| **Campo "Contraseña"** | Contraseña de acceso (obligatorio en creación). |
| **Campo "Confirmar Contraseña"** | Debe coincidir con la contraseña. |
| **Selector "Rol"** | Seleccione el rol del usuario: Administrador, Supervisor, Administrativo JPL, Fiscalizador. |
| **Botón "Crear Usuario"** | Guarda el nuevo usuario. |

### 9.3. Editar Usuario

![Placeholder: Captura de pantalla de edición de usuario](img/placeholder_usuario_edit.png)

Mismos campos que la creación, con la diferencia de que la contraseña es opcional (si se deja vacía, no se modifica).

### 9.4. Activar/Desactivar Usuario

![Placeholder: Captura de pantalla de gestión de usuarios](img/placeholder_usuarios.png)

| Acción | Descripción |
|---|---|
| **Botón de activar/desactivar** | Cambia el estado del usuario entre `active` e `inactive`. |
| **Restricción** | No se puede desactivar el propio usuario administrador en sesión. |

---

<div style="page-break-before: always;"></div>

## 10. Fiscalizadores en Terreno

![Placeholder: Captura de pantalla de fiscalizadores](img/placeholder_fiscalizadores.png)

### Descripción
Panel de monitoreo del personal que ha reportado actividad en los últimos 10 minutos.

> **Acceso:** `Administrador` `Supervisor`

### 10.1. Listado de Fiscalizadores

| Elemento | Descripción |
|---|---|
| **Título "Fiscalizadores en Terreno"** | Encabezado con subtítulo "Personal que ha reportado actividad en los últimos 10 minutos." |
| **Campo de búsqueda** | Busque por correo electrónico del fiscalizador. |
| **Botón "Actualizar"** | Recarga la lista de fiscalizadores activos. |
| **Botón "Reportes"** | Abre el modal de generación de reportes. |
| **Tabla** | Columnas: Email, Última Conexión, Dispositivo, Versión App, Acciones (Ver Mapa, Notificar). |

### 10.2. Mapa de Ubicación

![Placeholder: Captura de pantalla del mapa de ubicación](img/placeholder_fiscalizador_map.png)

Al hacer clic en **"Ver Mapa"**, se abre un modal con un mapa OpenStreetMap centrado en la ubicación del fiscalizador seleccionado.

| Elemento | Descripción |
|---|---|
| **Título** | "Ubicación de [email]" |
| **Mapa** | Mapa con marcador en la posición exacta del fiscalizador. |
| **Botón de cerrar** | Cierra el modal. |

### 10.3. Notificaciones a Fiscalizadores

![Placeholder: Captura de pantalla de notificación push](img/placeholder_fiscalizador_notify_a.png)

| Elemento | Descripción |
|---|---|
| **Modal "Enviar Notificación Push"** | Formulario para enviar notificación. |
| **Destinatario** | Correo del fiscalizador (precargado). |
| **Campo "Título"** | Título de la notificación (obligatorio). |
| **Campo "Mensaje"** | Cuerpo del mensaje (obligatorio). |
| **Botón "Enviar"** | Envía la notificación push al dispositivo del fiscalizador. |
| **Error** | Si el dispositivo no está registrado, muestra el mensaje: "El dispositivo de este fiscalizador no está registrado para notificaciones." |

### 10.4. Reportes

![Placeholder: Captura de pantalla de reportes](img/placeholder_reportes_modal.png)

| Opción de reporte | Descripción |
|---|---|
| **Mapa de Calor (Ubicaciones)** | Genera un reporte PDF con un mapa de calor de las ubicaciones de los fiscalizadores en un rango de fechas. |
| **Reporte de Actividad (Productividad)** | Genera un reporte PDF con la productividad de los fiscalizadores. |
| **Selector de fechas** | Rango de fechas para filtrar los datos del reporte. |

---

<div style="page-break-before: always;"></div>

## 11. Tokens de Acceso

![Placeholder: Captura de pantalla de tokens](img/placeholder_tokens.png)

### Descripción
Gestión de tokens de autenticación JWT del sistema.

> **Acceso:** `Administrador` (exclusivo)

### 11.1. Listado y Filtros

| Elemento | Descripción |
|---|---|
| **Título "Tokens de Acceso"** | Encabezado de la pantalla. |
| **Campo de búsqueda** | Busque por usuario, RUT o correo electrónico. |
| **Pestañas de filtro** | **Todos**, **Activos**, **Revocados**, **Expirados**. |
| **Botón "Actualizar"** | Recarga los datos. |
| **Paginación** | Navegación entre páginas de resultados. |

### 11.2. Detalle y Acciones

![Placeholder: Captura de pantalla de detalle de token](img/placeholder_token_detail.png)

| Elemento | Descripción |
|---|---|
| **Modal de detalle** | Muestra: ID del token, usuario asociado, RUT, correo, fecha de creación, fecha de expiración, estado, IP de origen, última actividad. |
| **Botón "Revocar"** | Revoca el token de acceso inmediatamente. |
| **Botón "Expiar"** | Marca el token como expirado. |

---

<div style="page-break-before: always;"></div>

## 12. Registro de Auditorías

![Placeholder: Captura de pantalla de auditorías](img/placeholder_auditorias.png)

### Descripción
Registro cronológico de todas las operaciones realizadas en el sistema.

> **Acceso:** `Administrador` (exclusivo)

### 12.1. Listado y Filtros

| Elemento | Descripción |
|---|---|
| **Título "Registro de Auditorías"** | Encabezado de la pantalla. |
| **Campo de búsqueda** | Busque por acción, usuario o detalle. |
| **Filtros de fecha** | Rango de fechas "Desde" y "Hasta". |
| **Filtro por usuario** | Filtre las auditorías por usuario que realizó la acción. |
| **Botón "Actualizar"** | Recarga los datos. |
| **Botón "Limpiar filtros"** | Restablece todos los filtros. |

### 12.2. Tabla de Auditorías

| Columna | Descripción |
|---|---|
| **Fecha/Hora** | Marca de tiempo de la acción. |
| **Usuario** | Nombre del usuario que ejecutó la acción. |
| **Acción** | Tipo de operación (CREAR, ACTUALIZAR, ELIMINAR, etc.). |
| **Entidad** | Recurso afectado (Infracción, Usuario, TipoInfraccion, etc.). |
| **ID Entidad** | Identificador del recurso afectado. |
| **Detalle** | Descripción textual de la operación. |
| **Dirección IP** | Dirección IP desde donde se realizó la operación. |

---

<div style="page-break-before: always;"></div>

## 13. Notificaciones Push

![Placeholder: Captura de pantalla de notificaciones push](img/placeholder_notificaciones.png)

### Descripción
Módulo de envío de notificaciones push a los dispositivos móviles de los fiscalizadores.

> **Acceso:** `Administrador` y `Supervisor`

### 13.1. Enviar Notificación

![Placeholder: Captura de pantalla de enviar notificación](img/placeholder_notificaciones_send.png)

| Elemento | Descripción |
|---|---|
| **Pestaña "Enviar"** | Vista de creación de notificaciones. |
| **Sección "Destino"** | Tres opciones de destinatario: |
| | - **Todos los dispositivos**: Envía a todos los dispositivos registrados. |
| | - **Solo desactualizados**: Envía a dispositivos con versión distinta a la actual. |
| | - **Seleccionar dispositivos**: Permite elegir manualmente los dispositivos. |
| **Campo "Título"** | Título de la notificación (obligatorio). |
| **Campo "Mensaje"** | Cuerpo del mensaje en área de texto (obligatorio). |
| **Campo "Versión actual (app)"** | Versión de la app para filtrar dispositivos desactualizados (solo si aplica). |
| **Vista previa** | Tarjeta que simula la notificación en un dispositivo Android. |
| **Lista de dispositivos** | Panel expandible que muestra los dispositivos registrados con: email, modelo, versión de app, estado (Activo/Inactivo/Desconocido). |
| **Botón "Enviar notificación"** | Abre un modal de confirmación con el resumen del envío. |
| **Botón "Limpiar"** | Restablece el formulario. |

### 13.2. Historial de Notificaciones

![Placeholder: Captura de pantalla del historial de notificaciones](img/placeholder_notificaciones_history.png)

| Elemento | Descripción |
|---|---|
| **Pestaña "Historial"** | Vista del historial de notificaciones enviadas. |
| **Filtros** | **Todas**, **A todos**, **Desactualizados**, **Seleccionados**. |
| **Tabla** | Columnas: Tipo (destino), Título, Mensaje, Enviados (cantidad), Versión, Enviado por, Fecha. |
| **Paginación** | Navegación entre páginas del historial. |

---

<div style="page-break-before: always;"></div>

## 14. Roles y Permisos

| Módulo | Administrador | Supervisor | Administrativo JPL |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Infracciones (ver) | ✅ | ✅ | ✅ |
| Infracciones (aceptar/rechazar) | ❌ | ❌ | ✅ |
| Infracciones (exportar PDF) | ❌ | ❌ | ✅ |
| Citaciones JPL (ver) | ✅ | ✅ | ✅ |
| Citaciones JPL (reprogramar) | ❌ | ❌ | ✅ |
| Tipos de Infracciones (CRUD) | ✅ | ✅ | ❌ |
| Gestión de Usuarios (CRUD) | ✅ | ❌ | ❌ |
| Fiscalizadores en Terreno | ✅ | ✅ | ❌ |
| Tokens de Acceso | ✅ | ❌ | ❌ |
| Auditorías | ✅ | ❌ | ❌ |
| Notificaciones Push | ✅ | ✅ | ❌ |

> **Nota:** El rol **Fiscalizador** (USER_APP) no tiene acceso al Dashboard web; corresponde a los usuarios de la aplicación móvil SIFA GO.

### Zonas restringidas por rol

Ciertas acciones y sub-secciones (zonas) dentro de un módulo están limitadas a roles específicos:

| Zona restringida | Módulo | Roles con acceso |
|---|---|---|
| **Aceptar / Rechazar infracción** | Infracciones | `Administrativo JPL` |
| **Exportar PDF** | Infracciones | `Administrativo JPL` |
| **Reprogramar citación** | Citaciones JPL | `Administrativo JPL` |
| **Crear / Editar / Eliminar tipos** | Tipos de Infracciones | `Administrador` `Supervisor` |
| **Crear / Editar / Eliminar usuarios** | Gestión de Usuarios | `Administrador` |
| **Enviar notificaciones push** | Notificaciones | `Administrador` |
| **Revocar tokens** | Tokens de Acceso | `Administrador` |
| **Mapa de fiscalizadores en terreno** | Dashboard | `Administrador` `Supervisor` |
| **Reportes de fiscalizadores** | Fiscalizadores | `Administrador` `Supervisor` |
| **Enviar notificación a fiscalizador** | Fiscalizadores | `Administrador` `Supervisor` |

> **Nota:** Un rol con acceso a un módulo puede ver la sección, pero sin acceso a la zona restringida los botones/acciones correspondientes no se renderizan en la interfaz.

---

<div style="page-break-before: always;"></div>

## 15. Cierre de Sesión

![Placeholder: Captura de pantalla de confirmación de cierre de sesión](img/placeholder_logout.png)

| Elemento | Descripción |
|---|---|
| **Botón de cerrar sesión** | Icono de salida en la barra lateral, junto al nombre del usuario. |
| **Diálogo de confirmación** | Al presionar el botón, se muestra un diálogo en la misma barra lateral con: |
| | - Ícono de advertencia y texto "¿Cerrar sesión?" |
| | - Mensaje: "Perderás el acceso hasta que vuelvas a iniciar sesión." |
| | - **Botón "Cancelar"**: Cierra la confirmación. |
| | - **Botón "Sí, salir"**: Cierra la sesión y redirige a la pantalla de inicio de sesión. |

---

<div style="page-break-before: always;"></div>

## 16. Funcionalidades Transversales

### 16.1. Diseño Adaptable (Responsive)

![Placeholder: Captura de pantalla en vista móvil](img/placeholder_responsive.png)

La aplicación está diseñada para funcionar correctamente en distintos tamaños de pantalla:

| Dispositivo | Comportamiento |
|---|---|
| **Escritorio (≥ 768px)** | Barra lateral siempre visible, tablas completas con todas las columnas. |
| **Tablet (≥ 640px)** | Barra lateral visible, tablas con columnas ajustadas. |
| **Móvil (< 640px)** | Barra lateral oculta con botón de menú (hamburguesa) en el encabezado. Las tablas se reemplazan por tarjetas verticales (vista móvil). |

### 16.2. Toast de Notificaciones

![Placeholder: Captura de pantalla de toast](img/placeholder_toast.png)

La aplicación muestra notificaciones temporales (toast) en la esquina inferior para informar al usuario sobre:

| Tipo | Color | Ejemplo |
|---|---|---|
| **success** | Verde | "Infracción aceptada exitosamente" |
| **error** | Rojo | "Error al cargar los datos" |
| **info** | Azul | "Reintentando conexión con el servidor..." |

### 16.3. Atajo de Teclado

| Tecla | Acción |
|---|---|
| **Escape (Esc)** | Cierra el modal de detalle de infracción o citación actualmente abierto. |





















---

*Documento generado para la aplicación **SIFA Dashboard** -  Sistema Integrado de Fiscalización Automatizada*

---

<div style="page-break-before: always;"></div>

## Créditos

**SIFA Dashboard** fue desarrollado por:

| Nombre | Perfil |
|---|---|
| **Leonel Briones Palacios** | [linkedin.com/in/leonel-briones-palacios](https://www.linkedin.com/in/leonel-briones-palacios/) |
| **Andrés Ortega Suazo** | [linkedin.com/in/andres-ortega-suazo](https://www.linkedin.com/in/andres-ortega-suazo/) |
| **Nicolás López Plaza** | [linkedin.com/in/nicolas-alejandro-lopez-plaza-13973a399](https://www.linkedin.com/in/nicolas-alejandro-lopez-plaza-13973a399/) |

---

*© 2026 - Equipo SIFA - DUOC UC Sede Viña del Mar. Todos los derechos reservados.*
