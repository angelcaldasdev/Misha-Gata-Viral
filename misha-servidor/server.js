// ============================================
// server.js - Servidor de Misha (Express + SQLite/Turso)
// ============================================

require("dotenv").config({ quiet: true });   // carga las variables del archivo .env
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");    // para convertir contraseñas en hash
const jwt = require("jsonwebtoken");   // para crear y revisar los tokens de sesión

const {
    baseDeDatos,
    iniciarBaseDeDatos,
    consultarVarios,
    consultarUno,
    ejecutar,
    usandoNube,
} = require("./db");
const { catalogoPorId } = require("./productos");   // precios oficiales (productos.js)

const aplicacion = express();

// En la nube, el servicio nos dice en qué puerto escuchar con la variable PORT
const PUERTO = process.env.PORT || 3000;

// Render (y casi todos los servicios en la nube) pone un "proxy" delante del servidor.
// Con esto, Express ve la IP real de cada visitante (la necesita el límite de intentos).
aplicacion.set("trust proxy", 1);

// ---- CORS: ¿qué páginas pueden usar esta API? ----
// Solo las que estén en esta lista. Si publicas la página en otro lugar, agrégala en la
// variable ORIGENES_PERMITIDOS (separadas por comas). Sin "/" al final.
const ORIGENES_PERMITIDOS = (
    process.env.ORIGENES_PERMITIDOS ||
    "https://angelcaldasdev.github.io,http://127.0.0.1:5500,http://localhost:5500"
)
    .split(",")
    .map((origen) => origen.trim())
    .filter(Boolean);

aplicacion.use(
    cors({
        origin(origen, devolver) {
            // "!origen" son llamadas que no vienen de un navegador (Postman, curl, pruebas)
            devolver(null, !origen || ORIGENES_PERMITIDOS.includes(origen));
        },
    })
);

// Permite leer el cuerpo de las peticiones en formato JSON (con un tamaño máximo)
aplicacion.use(express.json({ limit: "20kb" }));

// Si alguien llama a la API sin enviar datos, dejamos el cuerpo vacío en vez de fallar
aplicacion.use((peticion, respuesta, siguiente) => {
    if (!peticion.body) peticion.body = {};
    siguiente();
});

// ---- Límite de intentos: frena a quien pruebe contraseñas una y otra vez ----
// Como ahora el servidor es público, cualquiera en internet podría intentarlo.
const limitarAccesos = rateLimit({
    windowMs: 15 * 60 * 1000,          // ventana de 15 minutos
    limit: 20,                          // máximo 20 intentos por persona en esa ventana
    standardHeaders: true,
    legacyHeaders: false,
    message: { mensaje: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." },
});

// Misma validación de correo que usa la página
const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MENSAJE_ERROR_SERVIDOR = "Ocurrió un error en el servidor 😿";

// ---- GET /api/salud ----
// La página la llama para "despertar" al servidor (los servidores gratuitos se duermen
// tras 15 minutos sin visitas) y para comprobar que está listo.
aplicacion.get("/api/salud", (peticion, respuesta) => {
    respuesta.json({ ok: true });
});

// ============================================
// SUSCRIPCIÓN
// ============================================

// ---- POST /api/suscribirse ----
// La página envía: { correo: "alguien@correo.com" }
aplicacion.post("/api/suscribirse", limitarAccesos, async (peticion, respuesta) => {
    // El servidor SIEMPRE vuelve a validar, aunque la página ya lo hizo
    // (alguien podría llamar a la API sin pasar por tu página)
    const correo = String(peticion.body.correo || "").trim().toLowerCase();

    if (!regexCorreo.test(correo)) {
        return respuesta.status(400).json({ mensaje: "Por favor ingresa un correo válido." });
    }

    try {
        // El "?" protege contra la inyección SQL (nunca pegues texto del usuario dentro del SQL)
        await ejecutar("INSERT INTO suscriptores (correo) VALUES (?)", [correo]);
        return respuesta.status(201).json({ mensaje: "¡Gracias por suscribirte a Misha! 🐾" });
    } catch (error) {
        // El correo ya existe en la tabla (columna UNIQUE)
        if (String(error.message).includes("UNIQUE")) {
            return respuesta.status(409).json({ mensaje: "Ese correo ya está suscrito 🐱" });
        }

        console.error("Error al guardar el suscriptor:", error);
        return respuesta.status(500).json({ mensaje: MENSAJE_ERROR_SERVIDOR });
    }
});

// ============================================
// REGISTRO DE USUARIOS
// ============================================

// ---- Ayudas para limpiar y validar los datos personales ----

// Quita espacios de los costados y deja un solo espacio entre palabras
function limpiarTexto(valor) {
    return String(valor || "").trim().replace(/\s+/g, " ");
}

// Deja solo los dígitos del celular. Si viene con el prefijo +51, lo quita.
function normalizarCelular(valor) {
    let digitos = String(valor || "").replace(/\D/g, "");
    if (digitos.length === 11 && digitos.startsWith("51")) {
        digitos = digitos.slice(2);
    }
    return digitos;
}

// Letras (con tildes y ñ), espacios, apóstrofes, puntos y guiones: de 2 a 60 caracteres
const regexNombre = /^[\p{L}][\p{L}\s'’.-]{1,59}$/u;

// Celular peruano: 9 dígitos y empieza con 9
const regexCelular = /^9\d{8}$/;

// Devuelve el mensaje de error, o null si todo está bien
function validarDatosPersonales(nombre, apellidos, celular) {
    if (!regexNombre.test(nombre)) return "Escribe tus nombres (solo letras).";
    if (!regexNombre.test(apellidos)) return "Escribe tus apellidos (solo letras).";
    if (!regexCelular.test(celular)) return "Ingresa un celular válido de 9 dígitos que empiece con 9.";
    return null;
}

// Los datos del usuario que SÍ se le pueden enviar a la página (nunca el hash de la clave)
function usuarioParaLaPagina(usuario) {
    return {
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        celular: usuario.celular,
        correo: usuario.correo,
    };
}

// "Costo" de bcrypt: cuántas veces se repite el cálculo (2 elevado a 10 vueltas).
// Más alto = más seguro pero más lento. 10 es un valor estándar.
const COSTO_BCRYPT = 10;

// ---- POST /api/registro ----
// La página envía: { nombre, apellidos, celular, correo, clave }
aplicacion.post("/api/registro", limitarAccesos, async (peticion, respuesta) => {
    const nombre = limpiarTexto(peticion.body.nombre);
    const apellidos = limpiarTexto(peticion.body.apellidos);
    const celular = normalizarCelular(peticion.body.celular);
    const correo = String(peticion.body.correo || "").trim().toLowerCase();
    const clave = String(peticion.body.clave || "");

    // 1) Validaciones (el servidor nunca confía en lo que llega)
    const errorDatos = validarDatosPersonales(nombre, apellidos, celular);
    if (errorDatos) {
        return respuesta.status(400).json({ mensaje: errorDatos });
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
        await ejecutar(
            "INSERT INTO usuarios (nombre, apellidos, celular, correo, clave_hash) VALUES (?, ?, ?, ?, ?)",
            [nombre, apellidos, celular, correo, claveHash]
        );

        // 4) Respondemos SIN devolver el hash
        return respuesta.status(201).json({ mensaje: "¡Cuenta creada! Ya puedes iniciar sesión 🐱" });
    } catch (error) {
        if (String(error.message).includes("UNIQUE")) {
            return respuesta.status(409).json({ mensaje: "Ese correo ya tiene una cuenta. Inicia sesión." });
        }

        console.error("Error al registrar el usuario:", error);
        return respuesta.status(500).json({ mensaje: MENSAJE_ERROR_SERVIDOR });
    }
});

// ============================================
// LOGIN Y SESIÓN (JWT)
// ============================================
// Un JWT (JSON Web Token) es una credencial con 3 partes: encabezado, datos y firma.
// - Los datos se pueden LEER, no van cifrados: por eso NUNCA metas contraseñas dentro.
// - La firma se crea con nuestro secreto: si alguien cambia un solo dato del token,
//   la firma ya no coincide y el servidor lo rechaza.

// El secreto vive en el archivo .env (local) o en las variables de Render (nube)
const JWT_SECRETO = process.env.JWT_SECRETO;

if (!JWT_SECRETO) {
    console.error("Falta JWT_SECRETO. Revisa tu archivo .env (o las variables de entorno del servicio).");
    process.exit(1);
}

// Hash de mentira: si el correo no existe, igual hacemos una comparación con este.
// Así el servidor tarda parecido en los dos casos y no revela qué correos existen.
const HASH_FALSO = bcrypt.hashSync("clave-falsa-para-igualar-tiempos", COSTO_BCRYPT);

// ---- POST /api/login ----
// La página envía: { correo, clave }
aplicacion.post("/api/login", limitarAccesos, async (peticion, respuesta) => {
    const correo = String(peticion.body.correo || "").trim().toLowerCase();
    const clave = String(peticion.body.clave || "");

    try {
        // 1) Buscamos al usuario (devuelve undefined si no existe)
        const usuario = await consultarUno(
            "SELECT id, nombre, apellidos, celular, correo, clave_hash FROM usuarios WHERE correo = ?",
            [correo]
        );

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
            usuario: usuarioParaLaPagina(usuario),
        });
    } catch (error) {
        console.error("Error en el login:", error);
        return respuesta.status(500).json({ mensaje: MENSAJE_ERROR_SERVIDOR });
    }
});

// ---- Middleware: "portero" para las rutas que exigen sesión ----
// La página manda el token en el encabezado:  Authorization: Bearer <token>
async function exigirSesion(peticion, respuesta, siguiente) {
    const encabezado = peticion.headers.authorization || "";
    const [tipo, token] = encabezado.split(" ");

    if (tipo !== "Bearer" || !token) {
        return respuesta.status(401).json({ mensaje: "Debes iniciar sesión." });
    }

    // 1) verify() revisa la firma y la fecha de vencimiento
    let datos;
    try {
        datos = jwt.verify(token, JWT_SECRETO, { algorithms: ["HS256"] });
    } catch (error) {
        return respuesta.status(401).json({ mensaje: "Tu sesión expiró. Inicia sesión de nuevo." });
    }

    // 2) Volvemos a buscar al usuario: si ya no existe, el token no sirve
    try {
        const usuario = await consultarUno(
            "SELECT id, nombre, apellidos, celular, correo FROM usuarios WHERE id = ?",
            [datos.id]
        );
        if (!usuario) {
            return respuesta.status(401).json({ mensaje: "Debes iniciar sesión." });
        }

        peticion.usuario = usuario;   // lo dejamos disponible para la ruta
        siguiente();                  // pasa al siguiente paso
    } catch (error) {
        console.error("Error al revisar la sesión:", error);
        return respuesta.status(500).json({ mensaje: MENSAJE_ERROR_SERVIDOR });
    }
}

// ---- GET /api/perfil ----
// Ruta protegida: solo responde si llega un token válido.
// La página la usa al cargar para saber si la persona sigue con sesión.
aplicacion.get("/api/perfil", exigirSesion, (peticion, respuesta) => {
    respuesta.json({ usuario: usuarioParaLaPagina(peticion.usuario) });
});

// ============================================
// PEDIDOS
// ============================================

// Una "transacción" agrupa varias escrituras: o se guardan TODAS o no se guarda NINGUNA.
// Así nunca queda un pedido a medias (por ejemplo, el pedido sin sus productos).
async function guardarPedido(usuarioId, lineas, totalCentimos) {
    const transaccion = await baseDeDatos.transaction("write");

    try {
        const resultado = await transaccion.execute({
            sql: "INSERT INTO pedidos (usuario_id, total_centimos) VALUES (?, ?)",
            args: [usuarioId, totalCentimos],
        });
        const pedidoId = Number(resultado.lastInsertRowid);   // el id que le asignó la base de datos

        for (const linea of lineas) {
            await transaccion.execute({
                sql: `INSERT INTO detalle_pedido (pedido_id, producto_id, nombre, talla, cantidad, precio_centimos)
                      VALUES (?, ?, ?, ?, ?, ?)`,
                args: [pedidoId, linea.productoId, linea.nombre, linea.talla, linea.cantidad, linea.precioCentimos],
            });
        }

        await transaccion.commit();   // confirma todo
        return pedidoId;
    } catch (error) {
        await transaccion.rollback(); // algo falló: deshace todo
        throw error;
    } finally {
        transaccion.close();
    }
}

// ---- POST /api/pedidos ----
// Ruta protegida (exigirSesion). La página envía SOLO lo que la persona eligió:
//   { items: [ { id: "polo1", talla: "M", cantidad: 2 }, ... ] }
// Los precios y el total los pone el servidor.
aplicacion.post("/api/pedidos", exigirSesion, async (peticion, respuesta) => {
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
        const pedidoId = await guardarPedido(peticion.usuario.id, lineas, totalCentimos);

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
        return respuesta.status(500).json({ mensaje: MENSAJE_ERROR_SERVIDOR });
    }
});

// ============================================
// MI CUENTA: datos, contraseña e historial de pedidos
// ============================================

// ---- PUT /api/perfil ----  (cambiar nombres, apellidos y celular)
// El correo NO se puede cambiar porque es lo que identifica la cuenta.
aplicacion.put("/api/perfil", exigirSesion, async (peticion, respuesta) => {
    const nombre = limpiarTexto(peticion.body.nombre);
    const apellidos = limpiarTexto(peticion.body.apellidos);
    const celular = normalizarCelular(peticion.body.celular);

    const errorDatos = validarDatosPersonales(nombre, apellidos, celular);
    if (errorDatos) {
        return respuesta.status(400).json({ mensaje: errorDatos });
    }

    try {
        await ejecutar(
            "UPDATE usuarios SET nombre = ?, apellidos = ?, celular = ? WHERE id = ?",
            [nombre, apellidos, celular, peticion.usuario.id]
        );

        return respuesta.json({
            mensaje: "Datos actualizados ✅",
            usuario: usuarioParaLaPagina({ ...peticion.usuario, nombre, apellidos, celular }),
        });
    } catch (error) {
        console.error("Error al actualizar los datos:", error);
        return respuesta.status(500).json({ mensaje: MENSAJE_ERROR_SERVIDOR });
    }
});

// ---- PUT /api/clave ----  (cambiar contraseña)
aplicacion.put("/api/clave", exigirSesion, async (peticion, respuesta) => {
    const claveActual = String(peticion.body.claveActual || "");
    const claveNueva = String(peticion.body.claveNueva || "");

    if (claveNueva.length < 6) {
        return respuesta.status(400).json({ mensaje: "La contraseña nueva debe tener al menos 6 caracteres." });
    }
    if (Buffer.byteLength(claveNueva, "utf8") > 72) {
        return respuesta.status(400).json({ mensaje: "La contraseña nueva es demasiado larga (máximo 72 caracteres)." });
    }

    try {
        // Primero comprobamos que sabe su contraseña actual
        const fila = await consultarUno("SELECT clave_hash FROM usuarios WHERE id = ?", [peticion.usuario.id]);
        const claveActualCorrecta = await bcrypt.compare(claveActual, fila.clave_hash);

        if (!claveActualCorrecta) {
            return respuesta.status(400).json({ mensaje: "La contraseña actual no es correcta." });
        }

        const nuevoHash = await bcrypt.hash(claveNueva, COSTO_BCRYPT);
        await ejecutar("UPDATE usuarios SET clave_hash = ? WHERE id = ?", [nuevoHash, peticion.usuario.id]);

        return respuesta.json({ mensaje: "Contraseña actualizada ✅" });
    } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        return respuesta.status(500).json({ mensaje: MENSAJE_ERROR_SERVIDOR });
    }
});

// ---- GET /api/mis-pedidos ----  (historial de la persona con sesión iniciada)
// Solo devuelve los pedidos de ESA persona: el id sale del token, no de la página.
aplicacion.get("/api/mis-pedidos", exigirSesion, async (peticion, respuesta) => {
    try {
        // Consulta 1: los últimos 50 pedidos de la persona (el más reciente primero)
        const pedidos = await consultarVarios(
            `SELECT id, total_centimos, estado, fecha_pedido
             FROM pedidos
             WHERE usuario_id = ?
             ORDER BY id DESC
             LIMIT 50`,
            [peticion.usuario.id]
        );

        // Consulta 2: los productos de TODOS esos pedidos de una sola vez
        // (así hablamos solo 2 veces con la base de datos, no una vez por pedido)
        const detalle = await consultarVarios(
            `SELECT pedido_id, nombre, talla, cantidad, precio_centimos
             FROM detalle_pedido
             WHERE pedido_id IN (
                 SELECT id FROM pedidos WHERE usuario_id = ? ORDER BY id DESC LIMIT 50
             )
             ORDER BY pedido_id DESC, id`,
            [peticion.usuario.id]
        );

        // Agrupamos los productos por pedido
        const productosPorPedido = new Map();
        for (const fila of detalle) {
            if (!productosPorPedido.has(fila.pedido_id)) productosPorPedido.set(fila.pedido_id, []);
            productosPorPedido.get(fila.pedido_id).push({
                nombre: fila.nombre,
                talla: fila.talla,
                cantidad: fila.cantidad,
                precio: fila.precio_centimos / 100,
                subtotal: (fila.precio_centimos * fila.cantidad) / 100,
            });
        }

        return respuesta.json({
            pedidos: pedidos.map((pedido) => ({
                id: pedido.id,
                fecha: pedido.fecha_pedido,   // viene en hora UTC; la página la convierte a hora de Lima
                estado: pedido.estado,
                total: pedido.total_centimos / 100,
                items: productosPorPedido.get(pedido.id) || [],
            })),
        });
    } catch (error) {
        console.error("Error al listar los pedidos:", error);
        return respuesta.status(500).json({ mensaje: MENSAJE_ERROR_SERVIDOR });
    }
});

// ---- Manejo de errores generales ----
// Si llega un JSON roto o demasiado grande, respondemos con un mensaje claro
aplicacion.use((error, peticion, respuesta, siguiente) => {
    if (error.type === "entity.parse.failed") {
        return respuesta.status(400).json({ mensaje: "Los datos enviados no son válidos." });
    }
    if (error.type === "entity.too.large") {
        return respuesta.status(413).json({ mensaje: "Los datos enviados son demasiado grandes." });
    }

    console.error("Error inesperado:", error);
    return respuesta.status(500).json({ mensaje: MENSAJE_ERROR_SERVIDOR });
});

// ---- Arranque: primero preparamos la base de datos, luego abrimos el servidor ----
iniciarBaseDeDatos()
    .then(() => {
        aplicacion.listen(PUERTO, () => {
            console.log(`Servidor de Misha listo en el puerto ${PUERTO}`);
            console.log(`Base de datos: ${usandoNube ? "Turso (nube)" : "archivo local misha.db"}`);
        });
    })
    .catch((error) => {
        console.error("No se pudo iniciar la base de datos:", error);
        process.exit(1);
    });
