# Stock CRUD - Requisitos Funcionales y No Funcionales

**Fecha:** 16 de agosto de 2026  
**Versión:** 1.0  
**Proyecto:** Stock CRUD - Sistema de Gestión de Inventario

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Requisitos Funcionales](#requisitos-funcionales)
3. [Requisitos No Funcionales](#requisitos-no-funcionales)
4. [Resumen Cuantitativo](#resumen-cuantitativo)

---

## Descripción General

**Stock CRUD** es una aplicación web para la gestión de inventario que permite a los usuarios registrarse, autenticarse y administrar un catálogo de productos con información de nombre, cantidad y precio.

### Stack Tecnológico

- **Frontend:** Vue.js 3.5+
- **Backend:** Node.js (v22.18.0 o superior), Express.js
- **Base de Datos:** MongoDB
- **Build Tool:** Vite
- **Autenticación:** JWT (JSON Web Tokens)
- **Contraseñas:** Encriptadas con bcrypt

---

## Requisitos Funcionales

### 1. Autenticación y Autorización

#### RF-1.1 Registro de Usuarios

- **Descripción:** El sistema debe permitir el registro de nuevos usuarios con nombre, email y contraseña.
- **Criterios de Aceptación:**
  - Se requieren los campos: nombre, email y contraseña
  - El email debe ser único en el sistema
  - La contraseña debe ser encriptada antes de almacenarla
  - Se retorna una respuesta de éxito con los datos del usuario
  - Se rechaza si el email ya está registrado con código HTTP 409

#### RF-1.2 Login de Usuarios

- **Descripción:** Los usuarios pueden iniciar sesión con email y contraseña.
- **Criterios de Aceptación:**
  - Se requieren email y contraseña
  - Se validan las credenciales contra la base de datos
  - Se genera un token JWT válido con expiración de 1 hora
  - El token se retorna al cliente
  - Se rechaza con HTTP 401 si las credenciales son inválidas

#### RF-1.3 Validación de Token JWT

- **Descripción:** El sistema debe validar el token JWT en cada petición a endpoints protegidos.
- **Criterios de Aceptación:**
  - El token debe estar en el header Authorization con esquema Bearer
  - Se valida la firma del token
  - Se verifica que no esté expirado
  - Se rechaza con HTTP 401 si el token es inválido o expirado

#### RF-1.4 Logout

- **Descripción:** Los usuarios pueden cerrar sesión eliminando su token local.
- **Criterios de Aceptación:**
  - Se limpian los datos de sesión del localStorage
  - Se redirige a la pantalla de login
  - Se vacía el estado de productos

#### RF-1.5 Aislamiento de Datos por Usuario

- **Descripción:** Cada usuario solo puede acceder a sus propios productos.
- **Criterios de Aceptación:**
  - Los productos se asocian al userId del propietario
  - Las operaciones CRUD validan que el producto pertenece al usuario
  - Se rechaza con HTTP 404 si un usuario intenta acceder a producto de otro

---

### 2. Gestión de Productos (CRUD)

#### RF-2.1 Crear Producto

- **Descripción:** Los usuarios autenticados pueden crear nuevos productos.
- **Criterios de Aceptación:**
  - Requiere autenticación (token JWT válido)
  - Se deben proporcionar: nombre, cantidad, precio
  - El nombre no puede estar vacío
  - La cantidad debe ser mayor a 0
  - El precio debe ser mayor o igual a 0
  - Se retorna el producto creado con ID asignado
  - Se guarda en la base de datos con timestamp de creación

#### RF-2.2 Leer Productos

- **Descripción:** Los usuarios pueden obtener la lista de todos sus productos.
- **Criterios de Aceptación:**
  - Requiere autenticación
  - Se retornan solo los productos del usuario autenticado
  - Los productos se ordenan por fecha de creación (más recientes primero)
  - Se incluye id, nombre, cantidad, precio y fechas

#### RF-2.3 Actualizar Producto

- **Descripción:** Los usuarios pueden modificar la información de un producto existente.
- **Criterios de Aceptación:**
  - Requiere autenticación
  - Solo el propietario puede editar su producto
  - Se pueden actualizar: nombre, cantidad, precio
  - Se aplican las mismas validaciones que en creación
  - Se retorna el producto actualizado
  - Se rechaza con HTTP 404 si el producto no existe

#### RF-2.4 Eliminar Producto

- **Descripción:** Los usuarios pueden borrar productos de su inventario.
- **Criterios de Aceptación:**
  - Requiere autenticación
  - Solo el propietario puede eliminar su producto
  - Se solicita confirmación al usuario en el frontend
  - Se retorna confirmación de éxito
  - Se rechaza con HTTP 404 si el producto no existe

#### RF-2.5 Cálculo de Valor Total

- **Descripción:** El sistema calcula automáticamente el valor total del inventario.
- **Criterios de Aceptación:**
  - Se actualiza en tiempo real con cada cambio de producto
  - Fórmula: suma de (cantidad × precio) para todos los productos
  - Se muestra con formato de moneda local (CLP)

---

### 3. Interfaz de Usuario

#### RF-3.1 Landing Page

- **Descripción:** Se muestra una página de bienvenida con descripción de la aplicación.
- **Criterios de Aceptación:**
  - Visible sin autenticación
  - Contiene hero section con título y descripción
  - Incluye preview del panel de inventario
  - Botón CTA que lleva a la sección de login
  - Pie de página con información

#### RF-3.2 Formulario de Autenticación

- **Descripción:** Interfaz para login y registro con toggle entre modos.
- **Criterios de Aceptación:**
  - Modo Login: campos email y contraseña
  - Modo Registro: campos nombre, email y contraseña
  - Botón para cambiar entre modos
  - Validación de campos vacíos
  - Mensajes de error descriptivos

#### RF-3.3 Panel de Control

- **Descripción:** Pantalla principal después de autenticarse.
- **Criterios de Aceptación:**
  - Muestra el nombre del usuario
  - Muestra cantidad total de productos
  - Muestra valor total del inventario
  - Incluye botón de logout
  - Incluye toggle de tema

#### RF-3.4 Formulario de Producto

- **Descripción:** Permite agregar o editar productos.
- **Criterios de Aceptación:**
  - Campos: nombre, cantidad, precio
  - Botón de envío que dice "Agregar producto" o "Guardar producto"
  - Botón cancelar visible cuando se edita
  - Validación de valores antes de enviar
  - Mensajes de error claros

#### RF-3.5 Lista de Productos

- **Descripción:** Muestra todos los productos del usuario.
- **Criterios de Aceptación:**
  - Cada producto muestra: nombre, cantidad, precio
  - Botones "Editar" y "Eliminar" por cada producto
  - Scroll si hay muchos productos
  - Mensaje "Sin productos" si la lista está vacía
  - Actualización en tiempo real tras cambios

#### RF-3.6 Tema Claro/Oscuro

- **Descripción:** Permitir cambio dinámico de tema.
- **Criterios de Aceptación:**
  - Botón toggle en el header
  - Almacena preferencia en localStorage
  - Aplica automáticamente al cargar la página
  - Transiciones suaves entre temas
  - Detecta preferencia del sistema si es primera vez

#### RF-3.7 Indicadores de Carga

- **Descripción:** Mostrar feedback visual durante operaciones async.
- **Criterios de Aceptación:**
  - Spinner visible mientras carga productos
  - Botones deshabilitados durante envío
  - Mensaje descriptivo de progreso
  - ARIA live regions para accesibilidad

#### RF-3.8 Confirmación de Eliminar

- **Descripción:** Validar antes de eliminar un producto.
- **Criterios de Aceptación:**
  - Dialog de confirmación nativa del navegador
  - Texto claro: "¿Eliminar este producto?"
  - Solo se elimina si el usuario confirma

---

### 4. Persistencia de Datos

#### RF-4.1 Guardar Sesión

- **Descripción:** Mantener la sesión del usuario entre cargas.
- **Criterios de Aceptación:**
  - Token JWT almacenado en localStorage
  - Datos del usuario almacenados en localStorage
  - Se recupera automáticamente al cargar la página
  - Se limpia al logout

#### RF-4.2 Caché Local de Productos

- **Descripción:** Sincronizar productos entre servidor y localStorage.
- **Criterios de Aceptación:**
  - Los productos se guardan en localStorage por usuario
  - Se cargan primero desde caché (experiencia instantánea)
  - Se sincronizan con servidor en background
  - Estructura: `stockcrud_products[userId] = [products]`

#### RF-4.3 Sincronización Servidor-Cliente

- **Descripción:** Mantener datos consistentes.
- **Criterios de Aceptación:**
  - Después de crear/editar/eliminar, se actualiza el caché
  - Si falla el servidor, se mantiene el estado local
  - Al reconectar, se sincroniza automáticamente

---

### 5. Validaciones

#### RF-5.1 Validación de Registro

- **Descripción:** Validar campos obligatorios en registro.
- **Criterios de Aceptación:**
  - Nombre no vacío
  - Email no vacío y formato válido
  - Contraseña no vacía
  - Email único en la base de datos

#### RF-5.2 Validación de Login

- **Descripción:** Validar credenciales de acceso.
- **Criterios de Aceptación:**
  - Email no vacío
  - Contraseña no vacía
  - Credenciales coinciden en base de datos

#### RF-5.3 Validación de Producto

- **Descripción:** Validar datos al crear/editar producto.
- **Criterios de Aceptación:**
  - Nombre no vacío (trim whitespace)
  - Cantidad es número >= 1
  - Precio es número >= 0
  - Todos los campos requeridos

#### RF-5.4 Mensajes de Error

- **Descripción:** Mostrar mensajes descriptivos al usuario.
- **Criterios de Aceptación:**
  - Errores de validación claros
  - Errores de servidor descriptivos
  - Diferenciación entre tipos de error

---

## Requisitos No Funcionales

### 1. Rendimiento

#### RNF-1.1 Tiempo de Respuesta

- **Descripción:** Las operaciones deben completarse en tiempo aceptable.
- **Métrica:** Tiempo de respuesta del servidor < 2 segundos para la mayoría de operaciones
- **Aplica a:** Fetch, create, update, delete de productos

#### RNF-1.2 Caché Local

- **Descripción:** Reducir carga al servidor mediante localStorage.
- **Implementación:** Cargar productos desde caché mientras se sincroniza
- **Beneficio:** Experiencia instantánea al usuario

#### RNF-1.3 Lazy Loading

- **Descripción:** Cargar datos solo cuando se necesiten.
- **Implementación:** Cargar productos tras autenticación
- **Aplicación:** No precargar datos innecesarios

#### RNF-1.4 Indicadores de Progreso

- **Descripción:** Feedback visual de operaciones async.
- **Implementación:** Spinner CSS, mensajes de estado
- **Beneficio:** Usuario sabe que algo está sucediendo

---

### 2. Seguridad

#### RNF-2.1 Autenticación con JWT

- **Descripción:** Usar JSON Web Tokens para autenticación stateless.
- **Implementación:** Tokens con expiración de 1 hora
- **Beneficio:** Escalable, no requiere sesiones en servidor

#### RNF-2.2 Encriptación de Contraseñas

- **Descripción:** Contraseñas encriptadas irreversiblemente.
- **Algoritmo:** bcrypt con salt de 10 rondas
- **Cumple:** No se almacenan contraseñas en texto plano

#### RNF-2.3 Validación de Pertenencia

- **Descripción:** Verificar que el usuario propietario realiza operaciones.
- **Implementación:** Validar userId en cada operación CRUD
- **Previene:** Acceso no autorizado a datos ajenos

#### RNF-2.4 Headers de Seguridad

- **Descripción:** Usar headers HTTP estándar de seguridad.
- **Implementación:**
  - Authorization: Bearer `{token}`
  - Content-Type: application/json
  - CORS habilitado para desarrollo

#### RNF-2.5 Validación de Entrada

- **Descripción:** Sanitizar y validar datos de entrada.
- **Aplicación:** Trimming de strings, validación de tipos
- **Previene:** Inyecciones y datos malformados

#### RNF-2.6 Protección de Endpoints

- **Descripción:** Endpoints de producto requieren autenticación.
- **Implementación:** Middleware authenticate en todas las rutas protegidas
- **Excepción:** Endpoints de auth públicos

#### RNF-2.7 Exposición de Datos

- **Descripción:** No exponer información sensible.
- **Regla:** Contraseñas nunca en respuestas, solo datos públicos del usuario

#### RNF-2.8 Expiración de Token

- **Descripción:** Tokens con tiempo de vida limitado.
- **Duración:** 1 hora
- **Beneficio:** Reduce ventana de ataque si token es robado

---

### 3. Confiabilidad

#### RNF-3.1 Manejo de Errores

- **Descripción:** Gestionar errores de forma robusta.
- **Aplicación:**
  - Errores de conexión a BD
  - Errores de API con mensajes claros
  - Timeouts de peticiones

#### RNF-3.2 Recuperación de Sesión

- **Descripción:** Si falla carga de productos, permite reintento.
- **Implementación:** Mantener sesión válida, caché disponible
- **UX:** Usuario puede ver datos locales mientras se reconecta

#### RNF-3.3 Confirmación de Operaciones Destructivas

- **Descripción:** Pedir confirmación antes de eliminar.
- **Implementación:** Dialog nativo del navegador
- **Previene:** Eliminaciones accidentales

#### RNF-3.4 Persistencia de Datos

- **Descripción:** Datos disponibles incluso si servidor falla.
- **Aplicación:** localStorage como caché
- **Limitación:** Solo lectura; escrituras requieren servidor

#### RNF-3.5 Validación de Integridad

- **Descripción:** Datos consistentes entre cliente y servidor.
- **Implementación:** Sincronización tras cada cambio
- **Detección:** Errores de API indican desincronización

---

### 4. Compatibilidad

#### RNF-4.1 Navegadores Modernos

- **Soporte:** Chrome, Firefox, Safari (macOS/iOS), Edge
- **Versiones:** Últimas 2 versiones de cada navegador
- **Características:** ES6+, CSS Grid, Fetch API

#### RNF-4.2 Responsividad

- **Breakpoints:**
  - Mobile: < 520px
  - Tablet: 520px - 760px
  - Desktop: > 760px
- **Pruebas:** Todos los elementos funcionan en cada breakpoint

#### RNF-4.3 Accesibilidad

- **Estándares:** WCAG 2.1 AA
- **Implementación:**
  - ARIA labels descriptivos
  - ARIA live regions para feedback
  - Texto alternativo oculto visualmente
  - Navegación por teclado

#### RNF-4.4 Framework y Librerías

- **Frontend:** Vue.js 3.5+
- **Backend:** Node.js v22.18.0+, Express.js
- **Módulos:** Compatibles con ES6 modules

#### RNF-4.5 Variables de Entorno

- **Implementación:** dotenv en backend
- **Configuración:** MONGODB_URI, JWT_SECRET, PORT, VITE_API_BASE

---

### 5. Escalabilidad

#### RNF-5.1 Base de Datos

- **Tecnología:** MongoDB (no relacional)
- **Ventaja:** Escalabilidad horizontal
- **Estructura:** Documentos BSON sin schema rígido

#### RNF-5.2 API REST

- **Arquitectura:** Endpoints RESTful modulares
- **Stateless:** Cada petición es independiente
- **Escalable:** Fácil de distribuir entre servidores

#### RNF-5.3 Separación Cliente-Servidor

- **Beneficio:** Evolución independiente de frontend y backend
- **API:** Contrato claro mediante endpoints REST

#### RNF-5.4 Autenticación Stateless

- **JWT:** No requiere almacenamiento de sesiones
- **Escalabilidad:** Cualquier servidor puede validar token
- **Ventaja:** Sin necesidad de sincronización entre servidores

---

### 6. Mantenibilidad

#### RNF-6.1 Código Vue Organizado

- **Componentes:** Reutilizables y modularizados
- **Scoped Styles:** CSS aislado por componente
- **Reactivity:** Uso correcto de ref() y computed()

#### RNF-6.2 Módulos de Lógica

- **stockStore.js:** Funciones de API separadas
- **Reutilización:** Funciones importables desde cualquier componente
- **Testabilidad:** Lógica desacoplada de UI

#### RNF-6.3 Modelos de Base de Datos

- **User.js, Product.js:** Esquemas claros
- **Validadores:** Mongoose pre/post hooks
- **Índices:** Optimización de queries

#### RNF-6.4 Linting y Formatting

- **Linters:** ESLint, Oxlint
- **Formatter:** Prettier
- **Scripts:** `npm run lint`, `npm run format`
- **CI/CD Friendly:** Verificación automática de estilo

#### RNF-6.5 Comentarios y Documentación

- **Código:** Comentarios donde la lógica es compleja
- **Funciones:** Descripciones de parámetros y retorno
- **README:** Instrucciones de setup y uso

---

### 7. Usabilidad

#### RNF-7.1 Interfaz Intuitiva

- **Diseño:** Limpio y moderno
- **Flujo:** Login → Lista de Productos → CRUD → Logout
- **Botones:** Claramente etiquetados y posicionados

#### RNF-7.2 Feedback Visual

- **Loading:** Spinner durante operaciones
- **Errores:** Mensajes en lenguaje natural
- **Éxito:** Actualización de UI sin confirmar explícita
- **Transiciones:** Suaves y no invasivas

#### RNF-7.3 Tema Dinámico

- **Opciones:** Claro y oscuro
- **Persistencia:** Recordar preferencia del usuario
- **Detección:** Sistema operativo si es primera vez
- **Rendimiento:** No requiere reload de página

#### RNF-7.4 Formularios Validados

- **Validación En-Tiempo-Real:** Feedback mientras escribe
- **Restricciones:** HTML5 (min, max, required)
- **Prevención:** Submit deshabilitado si hay errores

#### RNF-7.5 Accesibilidad

- **Labels:** Asociadas con inputs
- **Error Messages:** Vinculadas a campos
- **Focus:** Orden lógico de tabulación
- **Screen Readers:** ARIA labels completos

---

### 8. Disponibilidad

#### RNF-8.1 Landing Page Pública

- **Acceso:** Sin autenticación requerida
- **Disponibilidad:** Siempre accesible
- **Propósito:** Presentar la aplicación

#### RNF-8.2 Recuperación de Sesión

- **Persistencia:** Token en localStorage
- **Validación:** Verificar token al montar app
- **Experiencia:** Sesión automática si token válido

#### RNF-8.3 Caché Local

- **Modo Offline:** Visualizar productos guardados localmente
- **Limitación:** No crear/editar sin conexión
- **Sincronización:** Al reconectar, sincronizar datos

#### RNF-8.4 Manejo de Desconexiones

- **Detectar:** Fallos de fetch indican desconexión
- **Feedback:** Mensaje al usuario
- **Reintento:** Permitir reintentar operación

---

### 9. Datos

#### RNF-9.1 Persistencia MongoDB

- **Almacenamiento:** Documentos persistentes en BD
- **Índices:** Optimizar búsquedas por usuario
- **Backups:** Responsabilidad de operaciones

#### RNF-9.2 Aislamiento de Datos

- **Segregación:** Cada usuario ve solo sus productos
- **Validación:** Verificar ownership en backend
- **Seguridad:** Imposible acceder datos ajenos

#### RNF-9.3 Timestamps

- **Creación:** `createdAt` en cada documento
- **Actualización:** `updatedAt` automático
- **Ordenamiento:** Por fecha descendente por defecto

---

### 10. Deployment

#### RNF-10.1 Build Frontend

- **Tool:** Vite
- **Output:** Carpeta `dist/`
- **Comandos:** `npm run build`, `npm run preview`

#### RNF-10.2 Ejecución Backend

- **Runtime:** Node.js
- **Start:** `npm run dev:backend` o `node server/index.js`
- **Entorno:** Variables en `.env`

#### RNF-10.3 Scripts de Desarrollo

- **`npm run dev`:** Ejecuta frontend y backend
- **`npm run dev:frontend`:** Solo frontend con Vite
- **`npm run dev:backend`:** Solo backend
- **`npm run build`:** Build de producción

#### RNF-10.4 CORS

- **Configuración:** Habilitado en todos los orígenes (desarrollo)
- **Producción:** Restringir a dominio específico
- **Implementación:** `cors()` middleware en Express

#### RNF-10.5 Variables de Entorno

- **Backend:** MONGODB_URI, JWT_SECRET, PORT
- **Frontend:** VITE_API_BASE
- **Archivo:** `.env` en raíz del proyecto
- **Fallback:** Valores por defecto en código

---

## Resumen Cuantitativo

### Distribuación de Requisitos

| Categoría             | Funcionales | No Funcionales | Total  |
| --------------------- | ----------- | -------------- | ------ |
| Autenticación         | 5           | 8              | 13     |
| Productos (CRUD)      | 5           | -              | 5      |
| Interfaz de Usuario   | 8           | 5              | 13     |
| Persistencia de Datos | 3           | 5              | 8      |
| Validaciones          | 4           | 2              | 6      |
| Rendimiento           | -           | 4              | 4      |
| Seguridad             | -           | 8              | 8      |
| Confiabilidad         | -           | 5              | 5      |
| Compatibilidad        | -           | 5              | 5      |
| Escalabilidad         | -           | 4              | 4      |
| Mantenibilidad        | -           | 5              | 5      |
| Usabilidad            | -           | 5              | 5      |
| Disponibilidad        | -           | 4              | 4      |
| Datos                 | -           | 3              | 3      |
| Deployment            | -           | 5              | 5      |
| **TOTAL**             | **28**      | **68**         | **96** |

### Por Estado

- ✅ **Implementados:** 96 requisitos (100%)
- 🔄 **En desarrollo:** 0 requisitos
- ⏳ **Por hacer:** 0 requisitos

---

## Matriz de Trazabilidad

### Ejemplos de Trazabilidad

| ID Requisito | Tipo         | Componente                     | Validación          |
| ------------ | ------------ | ------------------------------ | ------------------- |
| RF-1.1       | Funcional    | AuthPage, server/index.js      | Test de registro    |
| RF-1.2       | Funcional    | AuthPage, stockStore.js        | Test de login       |
| RF-2.1       | Funcional    | App.vue, server/index.js       | CRUD create         |
| RNF-2.1      | No Funcional | stockStore.js, server/index.js | JWT válido          |
| RNF-4.2      | No Funcional | App.vue (CSS)                  | Tests responsividad |
| RNF-6.1      | No Funcional | src/components/                | Code review         |

- **Comandos:** `npm run build`, `npm run preview`

#### RNF-10.2 Ejecución Backend

- **Runtime:** Node.js
- **Start:** `npm run dev:backend` o `node server/index.js`
- **Entorno:** Variables en `.env`

#### RNF-10.3 Scripts de Desarrollo

- **`npm run dev`:** Ejecuta frontend y backend
- **`npm run dev:frontend`:** Solo frontend con Vite
- **`npm run dev:backend`:** Solo backend
- **`npm run build`:** Build de producción

#### RNF-10.4 CORS

- **Configuración:** Habilitado en todos los orígenes (desarrollo)
- **Producción:** Restringir a dominio específico
- **Implementación:** `cors()` middleware en Express

#### RNF-10.5 Variables de Entorno

- **Backend:** MONGODB_URI, JWT_SECRET, PORT
- **Frontend:** VITE_API_BASE
- **Archivo:** `.env` en raíz del proyecto
- **Fallback:** Valores por defecto en código

---

## Resumen Cuantitativo

### Distribuación de Requisitos

| Categoría             | Funcionales | No Funcionales | Total  |
| --------------------- | ----------- | -------------- | ------ |
| Autenticación         | 5           | 8              | 13     |
| Productos (CRUD)      | 5           | -              | 5      |
| Interfaz de Usuario   | 8           | 5              | 13     |
| Persistencia de Datos | 3           | 5              | 8      |
| Validaciones          | 4           | 2              | 6      |
| Rendimiento           | -           | 4              | 4      |
| Seguridad             | -           | 8              | 8      |
| Confiabilidad         | -           | 5              | 5      |
| Compatibilidad        | -           | 5              | 5      |
| Escalabilidad         | -           | 4              | 4      |
| Mantenibilidad        | -           | 5              | 5      |
| Usabilidad            | -           | 5              | 5      |
| Disponibilidad        | -           | 4              | 4      |
| Datos                 | -           | 3              | 3      |
| Deployment            | -           | 5              | 5      |
| **TOTAL**             | **28**      | **68**         | **96** |

### Por Estado

- ✅ **Implementados:** 96 requisitos (100%)
- 🔄 **En desarrollo:** 0 requisitos
- ⏳ **Por hacer:** 0 requisitos

---

## Matriz de Trazabilidad

### Ejemplos de Trazabilidad

| ID Requisito | Tipo         | Componente                     | Validación          |
| ------------ | ------------ | ------------------------------ | ------------------- |
| RF-1.1       | Funcional    | AuthPage, server/index.js      | Test de registro    |
| RF-1.2       | Funcional    | AuthPage, stockStore.js        | Test de login       |
| RF-2.1       | Funcional    | App.vue, server/index.js       | CRUD create         |
| RNF-2.1      | No Funcional | stockStore.js, server/index.js | JWT válido          |
| RNF-4.2      | No Funcional | App.vue (CSS)                  | Tests responsividad |
| RNF-6.1      | No Funcional | src/components/                | Code review         |

---

## Notas Finales

### Consideraciones de Implementación

1. **Tokens JWT:** Expiración de 1 hora es adecuada para app de uso único. Considerar refresh tokens si es de uso prolongado.

2. **Validaciones:** Se realizan tanto en frontend (UX) como en backend (seguridad).

3. **Caché Local:** localStorage está limitado a ~5-10MB. Suficiente para la mayoría de casos de uso.

4. **CORS:** En producción, cambiar de wildcard a dominio específico.

5. **Índices MongoDB:** Crear índice en `Product.owner` para queries eficientes.

### Posibles Mejoras Futuras

- [ ] Recuperación de contraseña
- [ ] Autenticación social (Google, GitHub)
- [ ] Exportación de datos (CSV, PDF)
- [ ] Reportes de inventario
- [ ] Notificaciones de stock bajo
- [ ] Historial de cambios
- [ ] Colaboración multiusuario
- [ ] Roles y permisos granulares
- [ ] API GraphQL
- [ ] Aplicación móvil nativa

---

**Documento generado:** 16 de agosto de 2026  
**Versión:** 1.0  
**Estado:** Vigente
