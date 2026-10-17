# 🐾 Misha la Gata Viral

Tienda y página web de mi gata Misha, creada como proyecto práctico del curso de **Desarrollo Front-End** (Ministerio de Trabajo y Promoción del Empleo). Empezó como un ejercicio de HTML, CSS y JavaScript y fue creciendo hasta convertirse en un proyecto **full stack publicado en internet**: una página con tienda y carrito, conectada a un servidor propio con **Node.js y Express** y a una base de datos SQLite en la nube con **Turso**.

🔗 **Demo en vivo:** https://angelcaldasdev.github.io/Misha-Gata-Viral/

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-orange)

> **Sobre la demo:** el servidor corre en un plan gratuito que se duerme tras 15 minutos sin visitas. Si entras después de un rato, el primer registro o inicio de sesión puede tardar **hasta un minuto** en responder; la página muestra el aviso *"Despertando el servidor…"* y continúa sola. Si el servidor no responde en ese tiempo, muestra *"No se pudo conectar con el servidor"*.

## 📖 Sobre el proyecto

Misha es mi gata, y esta página nació como ejercicio para practicar cada módulo del curso. Con el tiempo fui agregando por mi cuenta una tienda con productos, un carrito, cuentas de usuario, un servidor con base de datos y su publicación en la nube, para aprender el camino completo: desde lo que ve la persona en pantalla hasta cómo se guardan los datos y cómo se despliega una aplicación.

## ✨ Funcionalidades

### 🐱 Contenido
- **Portada** con tres fotos destacadas y título de Misha
- **"Conoce a Misha"** con su historia y etiquetas generadas desde JavaScript
- **"Un día en la vida de Misha"**: línea de tiempo con los momentos de su día
- **Galería con carrusel** de varias fotos a la vez, con flechas, indicadores y deslizado táctil (swipe)
- **Enlace a Instagram** y **sección de donaciones** con QR de Yape

### 🛍️ Tienda
- **Catálogo de 15 productos** (polos, poleras, suéteres, gorras, bolsas, tazas y medias), generado desde un arreglo de objetos en JavaScript
- **Ventana para elegir talla y cantidad** antes de agregar al carrito
- **Foto del producto en grande**: al hacer clic se abre completa y sin cortes
- **Carrito de compras** en un panel lateral, con contador, total, botones para sumar, restar y quitar productos, y guardado en `localStorage` para que no se pierda al recargar
- **Pedido guardado en el servidor** y envío del resumen por **WhatsApp**, con el pago por **Yape**

### 👤 Cuentas de usuario
- **Registro completo**: nombres, apellidos, celular peruano, correo y contraseña, validados en la página y en el servidor
- **Inicio de sesión con token (JWT)**, y la sesión se mantiene al recargar la página
- **Historial de pedidos desplegable**: cada pedido muestra número, fecha (en hora de Lima), total y estado, y al abrirlo se ven los productos con su cantidad y talla
- **Mis datos**: editar nombres, apellidos y celular
- **Cambiar contraseña**, pidiendo primero la actual

### 💌 Comunidad
- **Suscripción por correo** guardada en la base de datos, sin permitir correos repetidos

### 📱 Diseño y experiencia
- **Diseño responsivo**, adaptado a celular, tablet y escritorio
- **Manejo del servidor dormido**: aviso de espera visible (dentro de la ventana si hay una abierta) y mensaje claro si no hay conexión

## 🧱 Cómo está construido

```
GitHub Pages            Render                    Turso
(HTML + CSS + JS)  →   (Servidor Express)   →    (Base de datos SQLite)
lo que ve la persona    valida y protege          guarda los datos
```

| Parte | Dónde está publicada | Tecnologías |
|---|---|---|
| **Página** | GitHub Pages | HTML5 semántico (`<dialog>`, `<details>`), CSS3 (Flexbox, Grid, variables, media queries), JavaScript sin frameworks (DOM, eventos, `fetch`, `async/await`, `localStorage`) |
| **Servidor** | Render (plan gratuito) | Node.js, Express, CORS, `express-rate-limit` |
| **Base de datos** | Turso (plan gratuito) | SQLite en la nube con `@libsql/client` |
| **Seguridad** | — | `bcryptjs` (contraseñas), `jsonwebtoken` (sesión), `dotenv` (secretos fuera del código) |

> En mi computadora, el mismo servidor usa un archivo SQLite local (`misha.db`) si no se configuran las variables de Turso.

### ¿Por qué Turso y no un archivo SQLite en el servidor?
Los servidores gratuitos como Render **borran los archivos del disco** cada vez que el servicio se reinicia o se duerme. Con un archivo local se perderían las cuentas y los pedidos. Turso guarda la base de datos aparte y el servidor solo se conecta a ella.

### Base de datos

| Tabla | Qué guarda |
|---|---|
| `suscriptores` | Correos de quienes se suscriben |
| `usuarios` | Nombres, apellidos, celular, correo y la contraseña convertida en hash |
| `pedidos` | Cada compra: quién la hizo, total, estado y fecha |
| `detalle_pedido` | Los productos de cada pedido, con el nombre y el precio del momento de la compra |

### API del servidor

| Método y ruta | Qué hace | ¿Pide sesión? |
|---|---|---|
| `GET /api/salud` | Indica que el servidor está despierto | No |
| `POST /api/suscribirse` | Guarda un correo suscrito | No |
| `POST /api/registro` | Crea una cuenta | No |
| `POST /api/login` | Inicia sesión y entrega un token | No |
| `GET /api/perfil` | Devuelve los datos de la persona con sesión | Sí |
| `PUT /api/perfil` | Actualiza nombres, apellidos y celular | Sí |
| `PUT /api/clave` | Cambia la contraseña | Sí |
| `POST /api/pedidos` | Registra un pedido | Sí |
| `GET /api/mis-pedidos` | Lista los pedidos de la persona | Sí |

## 🔐 Decisiones de seguridad

- **Las contraseñas no se guardan**: se almacena un hash con `bcrypt`, que no se puede convertir de vuelta en la contraseña.
- **El servidor no confía en la página**: al registrar un pedido, la página solo envía qué producto, talla y cantidad se eligieron; los precios y el total los calcula el servidor con su propio catálogo.
- **Todo se valida dos veces**: en la página para dar respuesta rápida y en el servidor, que es el que cuenta.
- **Consultas preparadas** con `?` en todas las sentencias SQL, para evitar la inyección SQL.
- **Cada persona ve solo lo suyo**: el servidor toma el id del token, no de la página, para listar los pedidos.
- **Pedidos en una transacción**: o se guarda el pedido completo o no se guarda nada.
- **CORS restringido**: solo mi página en GitHub Pages y mi entorno local pueden usar la API.
- **Límite de intentos**: máximo 20 intentos de login, registro o suscripción cada 15 minutos por persona, para frenar las contraseñas probadas a la fuerza.
- **Secretos fuera del repositorio**: el secreto del token y las credenciales de la base de datos viven en variables de entorno (`.env` en local, panel de Render en la nube) y nunca se suben a GitHub. Tampoco se sube la base de datos local (`*.db`).
- **Mensajes de error genéricos** en el login, para no revelar qué correos tienen cuenta.
- **Tamaño máximo de las peticiones** (20 KB) y respuestas claras ante datos mal formados.

## 🚀 Cómo ejecutarlo localmente

Necesitas [Node.js](https://nodejs.org) (probado con las versiones 22 y 24).

1. Clona este repositorio e instala las dependencias del servidor:
   ```bash
   git clone https://github.com/angelcaldasdev/Misha-Gata-Viral.git
   cd Misha-Gata-Viral/misha-servidor
   npm install
   ```
2. Crea tu archivo `.env` a partir de la plantilla:
   ```bash
   cp .env.example .env        # en Windows (PowerShell): copy .env.example .env
   ```
3. Genera un secreto para los tokens y pégalo en `.env` después de `JWT_SECRETO=`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
4. Inicia el servidor:
   ```bash
   node server.js
   ```
   Debe decir `Base de datos: archivo local misha.db` (se crea la primera vez).
5. Abre `index.html` con la extensión **Live Server** de VS Code. Cuando la página se abre desde `localhost` o `127.0.0.1`, usa automáticamente el servidor local (`http://localhost:3000`).

> Sin el servidor, la parte visual, el catálogo y el carrito funcionan igual; las cuentas, los pedidos y la suscripción necesitan que esté encendido.

### Variables de entorno

| Variable | Para qué sirve | ¿Obligatoria? |
|---|---|---|
| `JWT_SECRETO` | Firma los tokens de sesión (usa uno distinto en local y en la nube) | Sí |
| `TURSO_DATABASE_URL` | Dirección de la base de datos en la nube (`libsql://...`) | No: sin ella usa `misha.db` |
| `TURSO_AUTH_TOKEN` | Token de acceso a esa base de datos | Solo si usas Turso |
| `ORIGENES_PERMITIDOS` | Páginas autorizadas a usar la API, separadas por comas | No: ya incluye GitHub Pages y Live Server |

### Ver los datos guardados

Desde la carpeta `misha-servidor` (muestran la base de datos que esté configurada, local o Turso):

```bash
node ver-suscriptores.js
node ver-usuarios.js     # muestra solo el inicio del hash, nunca la contraseña
node ver-pedidos.js
```

## ☁️ Despliegue

| Pieza | Servicio | Configuración |
|---|---|---|
| Página | GitHub Pages | Se publica sola con cada `push` a `main` |
| Servidor | Render, *Web Service* gratuito, región Virginia | *Root Directory:* `misha-servidor` · *Build:* `npm install` · *Start:* `node server.js` |
| Base de datos | Turso, plan gratuito, región AWS US East (Virginia) | Variables `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` en Render |

El servidor y la base de datos están en la misma región para que cada consulta sea rápida. La página elige sola con qué servidor hablar (`URL_SERVIDOR` en `funciones.js`): el local si se abre desde mi computadora, y el de Render si se abre desde internet.

## 📁 Estructura

```
Misha-Gata-Viral/
├── index.html
├── styles.css
├── funciones.js
├── img/
└── misha-servidor/
    ├── server.js              # rutas de la API
    ├── db.js                  # conexión (local o Turso) y creación de tablas
    ├── productos.js           # catálogo y precios oficiales del servidor
    ├── ver-suscriptores.js
    ├── ver-usuarios.js
    ├── ver-pedidos.js
    ├── .env.example           # plantilla de variables, sin secretos
    └── package.json
```

## ⚠️ Limitaciones actuales

- El plan gratuito de Render duerme el servidor tras 15 minutos sin visitas, así que el primer acceso puede tardar hasta un minuto.
- El pago se hace de forma manual con Yape y WhatsApp; todavía no hay una pasarela de pagos.
- No hay verificación del correo ni recuperación de contraseña por correo.
- Al cambiar la contraseña, las sesiones ya abiertas siguen válidas hasta que su token venza (7 días).
- El estado de los pedidos (`pendiente`, `pagado`, `entregado`) todavía no se puede cambiar desde la página.

## 🗺️ Próximos pasos

- Integrar una **pasarela de pagos** en modo de pruebas (sandbox)
- Un panel para cambiar el estado de los pedidos
- Recuperación de contraseña y verificación del correo
- Crear una tienda más completa con **Java, Spring Boot y Angular**, aplicando lo aprendido aquí

## 📚 Qué aprendí

- Cómo se conectan una página, una API y una base de datos, y cómo publicar cada pieza en un servicio distinto
- SQL: tablas, claves foráneas, `JOIN`, transacciones y migraciones con `ALTER TABLE`
- Autenticación con hash de contraseñas y tokens JWT
- Validar los datos en la página y en el servidor, y por qué el servidor nunca debe confiar en lo que llega
- Variables de entorno, CORS, límite de intentos y cómo manejar un servidor que se duerme
- Manejo de Git: `.gitignore`, secretos fuera del repositorio y commits ordenados

Este proyecto forma parte de mi camino como **Fullstack Java Developer** (Java, Spring Boot, Angular, TypeScript). Lo construí mientras cursaba el módulo de Front-End del curso del Ministerio de Trabajo, reforzando con práctica adicional por mi cuenta.

## 👤 Autor

**Angel Caldas** — Estudiante de Ingeniería de Sistemas (UPN) | Fullstack Developer
📷 [Instagram de Misha](https://www.instagram.com/misha.gataviral/)