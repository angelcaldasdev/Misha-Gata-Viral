# 🐾 Misha la Gata Viral

Tienda y página web de mi gata Misha, creada como proyecto práctico del curso de **Desarrollo Front-End** (Ministerio de Trabajo y Promoción del Empleo). Empezó como un ejercicio de HTML, CSS y JavaScript y fue creciendo hasta convertirse en un proyecto **full stack**: una página con tienda y carrito, conectada a un servidor propio con **Node.js, Express y una base de datos SQLite**.

🔗 **Demo en vivo (solo la parte visual):** https://angelcaldasdev.github.io/Misha-Gata-Viral/

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-orange)

> **Nota sobre la demo:** GitHub Pages solo publica la página. Las cuentas, los pedidos y la suscripción necesitan el servidor, que por ahora corre de forma local. Para probar todo, sigue la sección [Cómo ejecutarlo localmente](#-cómo-ejecutarlo-localmente).

## 📖 Sobre el proyecto

Misha es mi gata, y esta página nació como ejercicio para practicar cada módulo del curso. Con el tiempo fui agregando por mi cuenta una tienda con productos, un carrito, cuentas de usuario y un servidor con base de datos, para seguir aprendiendo el camino completo: desde lo que ve la persona en pantalla hasta cómo se guardan los datos.

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
- **Registro completo**: nombres, apellidos, celular, correo y contraseña, con validación en la página y en el servidor
- **Inicio de sesión con token (JWT)** y sesión que se mantiene al recargar la página
- **Historial de pedidos desplegable**: cada pedido muestra número, fecha, total y estado, y al abrirlo se ven los productos con su cantidad y talla
- **Mis datos**: editar nombres, apellidos y celular
- **Cambiar contraseña**, pidiendo primero la actual

### 💌 Comunidad
- **Suscripción por correo** guardada en la base de datos, sin permitir correos repetidos

### 📱 Diseño
- **Diseño responsivo**, adaptado a celular, tablet y escritorio

## 🧱 Cómo está construido

```
Página (HTML + CSS + JavaScript)  →  Servidor Express (API)  →  Base de datos SQLite
        lo que ve la persona          valida, protege y calcula        guarda los datos
```

### Tecnologías

| Parte | Tecnologías |
|---|---|
| **Página** | HTML5 semántico (incluye `<dialog>` y `<details>`), CSS3 (Flexbox, Grid, variables, media queries), JavaScript sin frameworks (DOM, eventos, `fetch`, `async/await`, `localStorage`) |
| **Servidor** | Node.js, Express, CORS |
| **Base de datos** | SQLite con `better-sqlite3` |
| **Seguridad** | `bcryptjs` (contraseñas), `jsonwebtoken` (sesión), `dotenv` (secretos fuera del código) |
| **Publicación** | GitHub Pages (solo la página) |

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
- **Secretos fuera del repositorio**: el secreto del token vive en `.env` y la base de datos (`*.db`) tampoco se sube a GitHub, porque contiene datos personales.
- **Mensajes de error genéricos** en el login, para no revelar qué correos tienen cuenta.

## 🚀 Cómo ejecutarlo localmente

Necesitas [Node.js](https://nodejs.org) (probado con las versiones 22 y 24).

1. Clona este repositorio:
   ```bash
   git clone https://github.com/angelcaldasdev/Misha-Gata-Viral.git
   cd Misha-Gata-Viral/misha-servidor
   ```
2. Instala las dependencias del servidor:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` dentro de `misha-servidor` con un secreto para los tokens. Puedes generar uno así:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   y guardarlo en el archivo como:
   ```
   JWT_SECRETO=la_cadena_larga_que_salio
   ```
4. Inicia el servidor (crea la base de datos `misha.db` la primera vez):
   ```bash
   node server.js
   ```
   Debe decir `Servidor de Misha listo en http://localhost:3000`.
5. Abre `index.html` con la extensión **Live Server** de VS Code. La página se conecta al servidor en `http://localhost:3000`; si lo publicas en otro lugar, cambia la constante `URL_SERVIDOR` en `funciones.js`.

> Sin el servidor, la parte visual, el catálogo y el carrito funcionan igual; las cuentas, los pedidos y la suscripción necesitan que esté encendido.

### Ver los datos guardados

Desde la carpeta `misha-servidor`:

```bash
node ver-suscriptores.js
node ver-usuarios.js     # muestra solo el inicio del hash, nunca la contraseña
node ver-pedidos.js
```

## 📁 Estructura

```
Misha-Gata-Viral/
├── index.html
├── styles.css
├── funciones.js
├── img/
└── misha-servidor/
    ├── server.js              # rutas de la API
    ├── db.js                  # conexión y tablas de SQLite
    ├── productos.js           # catálogo y precios oficiales del servidor
    ├── ver-suscriptores.js
    ├── ver-usuarios.js
    ├── ver-pedidos.js
    └── package.json
```

## 🗺️ Próximos pasos

- Publicar el servidor en la nube para que toda la demo funcione en línea
- Integrar una **pasarela de pagos** en modo de pruebas (sandbox), en lugar del pago manual con Yape
- Un panel para cambiar el estado de los pedidos (pendiente, pagado, entregado)
- Crear una tienda más completa con **Java, Spring Boot y Angular**, aplicando lo aprendido aquí

## 📚 Qué aprendí

- Cómo se conectan una página, una API y una base de datos
- SQL: tablas, claves foráneas, `JOIN`, transacciones y migraciones con `ALTER TABLE`
- Autenticación con hash de contraseñas y tokens JWT
- Validar los datos en la página y en el servidor, y por qué el servidor nunca debe confiar en lo que llega
- Manejo de Git: `.gitignore`, secretos fuera del repositorio y commits ordenados

Este proyecto forma parte de mi camino como **Fullstack Java Developer** (Java, Spring Boot, Angular, TypeScript). Lo construí mientras cursaba el módulo de Front-End del curso del Ministerio de Trabajo, reforzando con práctica adicional por mi cuenta.

## 👤 Autor

**Angel Caldas** — Estudiante de Ingeniería de Sistemas (UPN) | Fullstack Developer en formación
📷 [Instagram de Misha](https://www.instagram.com/misha.gataviral/)