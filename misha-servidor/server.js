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
    "INSERT INTO usuarios (nombre, apellidos, celular, correo, clave_hash) VALUES (?, ?, ?, ?, ?)"
);

// ---- 🆕 Ayudas para limpiar y validar los datos personales ----

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
aplicacion.post("/api/registro", async (peticion, respuesta) => {
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
        insertarUsuario.run(nombre, apellidos, celular, correo, claveHash);

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
    "SELECT id, nombre, apellidos, celular, correo, clave_hash FROM usuarios WHERE correo = ?"
);

const buscarUsuarioPorId = baseDeDatos.prepare(
    "SELECT id, nombre, apellidos, celular, correo FROM usuarios WHERE id = ?"
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
            usuario: usuarioParaLaPagina(usuario),
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
        usuario: usuarioParaLaPagina(peticion.usuario),
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

// ============================================
// 🆕 MI CUENTA: datos, contraseña e historial de pedidos
// ============================================

const actualizarDatosUsuario = baseDeDatos.prepare(
    "UPDATE usuarios SET nombre = ?, apellidos = ?, celular = ? WHERE id = ?"
);
const buscarClaveHash = baseDeDatos.prepare("SELECT clave_hash FROM usuarios WHERE id = ?");
const actualizarClaveHash = baseDeDatos.prepare("UPDATE usuarios SET clave_hash = ? WHERE id = ?");

// Los últimos 50 pedidos de UNA persona (la más reciente primero)
const listarPedidosDeUsuario = baseDeDatos.prepare(`
    SELECT id, total_centimos, estado, fecha_pedido
    FROM pedidos
    WHERE usuario_id = ?
    ORDER BY id DESC
    LIMIT 50
`);
const listarDetalleDePedido = baseDeDatos.prepare(`
    SELECT nombre, talla, cantidad, precio_centimos
    FROM detalle_pedido
    WHERE pedido_id = ?
    ORDER BY id
`);

// ---- PUT /api/perfil ----  (cambiar nombres, apellidos y celular)
// El correo NO se puede cambiar porque es lo que identifica la cuenta.
aplicacion.put("/api/perfil", exigirSesion, (peticion, respuesta) => {
    const nombre = limpiarTexto(peticion.body.nombre);
    const apellidos = limpiarTexto(peticion.body.apellidos);
    const celular = normalizarCelular(peticion.body.celular);

    const errorDatos = validarDatosPersonales(nombre, apellidos, celular);
    if (errorDatos) {
        return respuesta.status(400).json({ mensaje: errorDatos });
    }

    try {
        actualizarDatosUsuario.run(nombre, apellidos, celular, peticion.usuario.id);

        return respuesta.json({
            mensaje: "Datos actualizados ✅",
            usuario: usuarioParaLaPagina({ ...peticion.usuario, nombre, apellidos, celular }),
        });
    } catch (error) {
        console.error("Error al actualizar los datos:", error);
        return respuesta.status(500).json({ mensaje: "Ocurrió un error en el servidor 😿" });
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
        const fila = buscarClaveHash.get(peticion.usuario.id);
        const claveActualCorrecta = await bcrypt.compare(claveActual, fila.clave_hash);

        if (!claveActualCorrecta) {
            return respuesta.status(400).json({ mensaje: "La contraseña actual no es correcta." });
        }

        const nuevoHash = await bcrypt.hash(claveNueva, COSTO_BCRYPT);
        actualizarClaveHash.run(nuevoHash, peticion.usuario.id);

        return respuesta.json({ mensaje: "Contraseña actualizada ✅" });
    } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        return respuesta.status(500).json({ mensaje: "Ocurrió un error en el servidor 😿" });
    }
});

// ---- GET /api/mis-pedidos ----  (historial de la persona con sesión iniciada)
// Solo devuelve los pedidos de ESA persona: el id sale del token, no de la página.
aplicacion.get("/api/mis-pedidos", exigirSesion, (peticion, respuesta) => {
    const pedidos = listarPedidosDeUsuario.all(peticion.usuario.id).map((pedido) => ({
        id: pedido.id,
        fecha: pedido.fecha_pedido,   // viene en hora UTC; la página la convierte a hora de Lima
        estado: pedido.estado,
        total: pedido.total_centimos / 100,
        items: listarDetalleDePedido.all(pedido.id).map((item) => ({
            nombre: item.nombre,
            talla: item.talla,
            cantidad: item.cantidad,
            precio: item.precio_centimos / 100,
            subtotal: (item.precio_centimos * item.cantidad) / 100,
        })),
    }));

    respuesta.json({ pedidos });
});

aplicacion.listen(PUERTO, () => {
    console.log(`Servidor de Misha listo en http://localhost:${PUERTO}`);
});
