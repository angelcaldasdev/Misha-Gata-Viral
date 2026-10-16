// ============================================
// server.js - Servidor de Misha (Express + SQLite)
// ============================================

require("dotenv").config();            // 🆕 carga las variables del archivo .env
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");    // para convertir contraseñas en hash
const jwt = require("jsonwebtoken");   // 🆕 para crear y revisar los tokens de sesión
const baseDeDatos = require("./db");   // nuestra conexión a SQLite (db.js)
const { catalogoPorId } = require("./productos");   // 🆕 precios oficiales (productos.js)

const aplicacion = express();
const PUERTO = 3000;

// Permite que la página (Live Server, puerto 5500) le hable a este servidor
aplicacion.use(cors());

// Permite leer el cuerpo de las peticiones en formato JSON
aplicacion.use(express.json());

// Misma validación de correo que usa la página
const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Consulta preparada": el SQL se escribe una vez y los valores entran por "?".
// Esto protege contra la inyección SQL (nunca pegues texto del usuario dentro del SQL).
const insertarSuscriptor = baseDeDatos.prepare(
    "INSERT INTO suscriptores (correo) VALUES (?)"
);

// ---- POST /api/suscribirse ----
// La página envía: { correo: "alguien@correo.com" }
aplicacion.post("/api/suscribirse", (peticion, respuesta) => {
    // El servidor SIEMPRE vuelve a validar, aunque la página ya lo hizo
    // (alguien podría llamar a la API sin pasar por tu página)
    const correo = String(peticion.body.correo || "").trim().toLowerCase();

    if (!regexCorreo.test(correo)) {
        return respuesta.status(400).json({ mensaje: "Por favor ingresa un correo válido." });
    }

    try {
        insertarSuscriptor.run(correo);
        return respuesta.status(201).json({ mensaje: "¡Gracias por suscribirte a Misha! 🐾" });
    } catch (error) {
        // El correo ya existe en la tabla (columna UNIQUE)
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return respuesta.status(409).json({ mensaje: "Ese correo ya está suscrito 🐱" });
        }

        console.error("Error al guardar el suscriptor:", error);
        return respuesta.status(500).json({ mensaje: "Ocurrió un error en el servidor 😿" });
    }
});

// ============================================
// 🆕 REGISTRO DE USUARIOS
// ============================================

const insertarUsuario = baseDeDatos.prepare(
    "INSERT INTO usuarios (nombre, correo, clave_hash) VALUES (?, ?, ?)"
);

// "Costo" de bcrypt: cuántas veces se repite el cálculo (2 elevado a 10 vueltas).
// Más alto = más seguro pero más lento. 10 es un valor estándar.
const COSTO_BCRYPT = 10;

// ---- POST /api/registro ----
// La página envía: { nombre, correo, clave }
aplicacion.post("/api/registro", async (peticion, respuesta) => {
    const nombre = String(peticion.body.nombre || "").trim();
    const correo = String(peticion.body.correo || "").trim().toLowerCase();
    const clave = String(peticion.body.clave || "");

    // 1) Validaciones (el servidor nunca confía en lo que llega)
    if (nombre.length < 2) {
        return respuesta.status(400).json({ mensaje: "Escribe tu nombre." });
    }
    if (!regexCorreo.test(correo)) {
        return respuesta.status(400).json({ mensaje: "Ingresa un correo válido." });
    }
    if (clave.length < 6) {
        return respuesta.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres." });
    }
    // bcrypt solo lee los primeros 72 bytes de la contraseña
    if (Buffer.byteLength(clave, "utf8") > 72) {
        return respuesta.status(400).json({ mensaje: "La contraseña es demasiado larga (máximo 72 caracteres)." });
    }

    try {
        // 2) Convertimos la contraseña en hash. bcrypt agrega una "sal" aleatoria,
        //    así dos personas con la misma contraseña tienen hashes distintos.
        const claveHash = await bcrypt.hash(clave, COSTO_BCRYPT);

        // 3) Guardamos en la tabla (solo el hash, nunca la contraseña real)
        insertarUsuario.run(nombre, correo, claveHash);

        // 4) Respondemos SIN devolver el hash
        return respuesta.status(201).json({ mensaje: "¡Cuenta creada! Ya puedes iniciar sesión 🐱" });
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return respuesta.status(409).json({ mensaje: "Ese correo ya tiene una cuenta. Inicia sesión." });
        }

        console.error("Error al registrar el usuario:", error);
        return respuesta.status(500).json({ mensaje: "Ocurrió un error en el servidor 😿" });
    }
});

// ============================================
// 🆕 LOGIN Y SESIÓN (JWT)
// ============================================
// Un JWT (JSON Web Token) es una credencial con 3 partes: encabezado, datos y firma.
// - Los datos (nombre, correo...) se pueden LEER, no van cifrados:
//   por eso NUNCA metas contraseñas dentro del token.
// - La firma se crea con nuestro secreto: si alguien cambia un solo dato
//   del token, la firma ya no coincide y el servidor lo rechaza.

// El secreto vive en el archivo .env (que NO se sube a GitHub)
const JWT_SECRETO = process.env.JWT_SECRETO;

if (!JWT_SECRETO) {
    console.error("Falta JWT_SECRETO en el archivo .env. Revisa el paso 3.");
    process.exit(1);
}

const buscarUsuarioPorCorreo = baseDeDatos.prepare(
    "SELECT id, nombre, correo, clave_hash FROM usuarios WHERE correo = ?"
);

const buscarUsuarioPorId = baseDeDatos.prepare(
    "SELECT id, nombre, correo FROM usuarios WHERE id = ?"
);

// Hash de mentira: si el correo no existe, igual hacemos una comparación con este.
// Así el servidor tarda parecido en los dos casos y no revela qué correos existen.
const HASH_FALSO = bcrypt.hashSync("clave-falsa-para-igualar-tiempos", COSTO_BCRYPT);

// ---- POST /api/login ----
// La página envía: { correo, clave }
aplicacion.post("/api/login", async (peticion, respuesta) => {
    const correo = String(peticion.body.correo || "").trim().toLowerCase();
    const clave = String(peticion.body.clave || "");

    try {
        // 1) Buscamos al usuario (devuelve undefined si no existe)
        const usuario = buscarUsuarioPorCorreo.get(correo);

        // 2) bcrypt compara la contraseña escrita con el hash guardado
        const claveCorrecta = await bcrypt.compare(
            clave,
            usuario ? usuario.clave_hash : HASH_FALSO
        );

        // 3) Mismo mensaje para "correo no existe" y "contraseña incorrecta"
        if (!usuario || !claveCorrecta) {
            return respuesta.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
        }

        // 4) Creamos el token: guarda el id y vence en 7 días
        const token = jwt.sign({ id: usuario.id }, JWT_SECRETO, { expiresIn: "7d" });

        return respuesta.json({
            mensaje: `¡Hola de nuevo, ${usuario.nombre.split(" ")[0]}! 🐾`,
            token: token,
            usuario: { nombre: usuario.nombre, correo: usuario.correo },
        });
    } catch (error) {
        console.error("Error en el login:", error);
        return respuesta.status(500).json({ mensaje: "Ocurrió un error en el servidor 😿" });
    }
});

// ---- Middleware: "portero" para las rutas que exigen sesión ----
// La página manda el token en el encabezado:  Authorization: Bearer <token>
function exigirSesion(peticion, respuesta, siguiente) {
    const encabezado = peticion.headers.authorization || "";
    const [tipo, token] = encabezado.split(" ");

    if (tipo !== "Bearer" || !token) {
        return respuesta.status(401).json({ mensaje: "Debes iniciar sesión." });
    }

    try {
        // verify() revisa la firma y la fecha de vencimiento
        const datos = jwt.verify(token, JWT_SECRETO, { algorithms: ["HS256"] });

        // Volvemos a buscar al usuario: si ya no existe, el token no sirve
        const usuario = buscarUsuarioPorId.get(datos.id);
        if (!usuario) {
            return respuesta.status(401).json({ mensaje: "Debes iniciar sesión." });
        }

        peticion.usuario = usuario;   // lo dejamos disponible para la ruta
        siguiente();                  // pasa al siguiente paso
    } catch (error) {
        return respuesta.status(401).json({ mensaje: "Tu sesión expiró. Inicia sesión de nuevo." });
    }
}

// ---- GET /api/perfil ----
// Ruta protegida: solo responde si llega un token válido.
// La página la usará al cargar para saber si la persona sigue con sesión.
aplicacion.get("/api/perfil", exigirSesion, (peticion, respuesta) => {
    respuesta.json({
        usuario: { nombre: peticion.usuario.nombre, correo: peticion.usuario.correo },
    });
});

// ============================================
// 🆕 PEDIDOS
// ============================================

const insertarPedido = baseDeDatos.prepare(
    "INSERT INTO pedidos (usuario_id, total_centimos) VALUES (?, ?)"
);

const insertarDetalle = baseDeDatos.prepare(`
    INSERT INTO detalle_pedido (pedido_id, producto_id, nombre, talla, cantidad, precio_centimos)
    VALUES (?, ?, ?, ?, ?, ?)
`);

// Una "transacción" agrupa varias escrituras: o se guardan TODAS o no se guarda NINGUNA.
// Así nunca queda un pedido a medias (por ejemplo, el pedido sin sus productos).
const guardarPedido = baseDeDatos.transaction((usuarioId, lineas, totalCentimos) => {
    const resultado = insertarPedido.run(usuarioId, totalCentimos);
    const pedidoId = resultado.lastInsertRowid;   // el id que SQLite le asignó al pedido

    for (const linea of lineas) {
        insertarDetalle.run(
            pedidoId,
            linea.productoId,
            linea.nombre,
            linea.talla,
            linea.cantidad,
            linea.precioCentimos
        );
    }

    return pedidoId;
});

// ---- POST /api/pedidos ----
// Ruta protegida (exigirSesion). La página envía SOLO lo que la persona eligió:
//   { items: [ { id: "polo1", talla: "M", cantidad: 2 }, ... ] }
// Los precios y el total los pone el servidor.
aplicacion.post("/api/pedidos", exigirSesion, (peticion, respuesta) => {
    const itemsRecibidos = peticion.body.items;

    if (!Array.isArray(itemsRecibidos) || itemsRecibidos.length === 0) {
        return respuesta.status(400).json({ mensaje: "Tu carrito está vacío." });
    }
    if (itemsRecibidos.length > 50) {
        return respuesta.status(400).json({ mensaje: "Hay demasiados productos en el pedido." });
    }

    // Revisamos cada producto contra el catálogo y vamos sumando el total
    const lineas = [];
    let totalCentimos = 0;

    for (const item of itemsRecibidos) {
        const producto = catalogoPorId.get(String(item.id));
        const cantidad = Number(item.cantidad);

        if (!producto) {
            return respuesta.status(400).json({ mensaje: "Hay un producto que ya no está disponible." });
        }
        if (!producto.tallas.includes(item.talla)) {
            return respuesta.status(400).json({ mensaje: `La talla elegida no existe para ${producto.nombre}.` });
        }
        if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 10) {
            return respuesta.status(400).json({ mensaje: "La cantidad de cada producto debe estar entre 1 y 10." });
        }

        lineas.push({
            productoId: producto.id,
            nombre: producto.nombre,
            talla: item.talla,
            cantidad: cantidad,
            precioCentimos: producto.precioCentimos,
        });
        totalCentimos += producto.precioCentimos * cantidad;
    }

    try {
        const pedidoId = guardarPedido(peticion.usuario.id, lineas, totalCentimos);

        // Respondemos con los datos del servidor (en soles) para armar el mensaje de WhatsApp
        return respuesta.status(201).json({
            mensaje: "¡Pedido registrado! 🐾",
            pedido: {
                id: pedidoId,
                total: totalCentimos / 100,
                items: lineas.map((linea) => ({
                    nombre: linea.nombre,
                    talla: linea.talla,
                    cantidad: linea.cantidad,
                    subtotal: (linea.precioCentimos * linea.cantidad) / 100,
                })),
            },
        });
    } catch (error) {
        console.error("Error al guardar el pedido:", error);
        return respuesta.status(500).json({ mensaje: "Ocurrió un error en el servidor 😿" });
    }
});

aplicacion.listen(PUERTO, () => {
    console.log(`Servidor de Misha listo en http://localhost:${PUERTO}`);
});
