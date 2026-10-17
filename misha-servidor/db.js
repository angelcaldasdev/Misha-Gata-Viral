// ============================================
// db.js - Conexión a la base de datos (SQLite local o Turso en la nube)
// ============================================
// - En tu computadora: si NO defines TURSO_DATABASE_URL, usa el archivo local misha.db.
// - En la nube: defines TURSO_DATABASE_URL y TURSO_AUTH_TOKEN (en el .env o en Render)
//   y la MISMA aplicación se conecta a tu base de datos de Turso.
//
// ¿Por qué Turso? Los servidores gratuitos como Render borran los archivos que se
// guardan en su disco cada vez que se reinician o se duermen. Si dejáramos misha.db
// ahí, perderíamos las cuentas y los pedidos. Turso guarda la base de datos aparte.

const path = require("path");

// Cargamos el .env desde ESTA carpeta, sin importar desde dónde ejecutes node
require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });

const { createClient } = require("@libsql/client");

// "file:misha.db" es relativo a la carpeta desde la que arrancas el servidor (misha-servidor)
const baseDeDatos = createClient({
    url: process.env.TURSO_DATABASE_URL || "file:misha.db",
    authToken: process.env.TURSO_AUTH_TOKEN,   // en local no hace falta
});

// ---- Ayudas para escribir menos código en server.js ----

// Devuelve TODAS las filas de una consulta (un arreglo)
async function consultarVarios(sql, args = []) {
    const resultado = await baseDeDatos.execute({ sql, args });
    return resultado.rows;
}

// Devuelve solo la PRIMERA fila (o undefined si no hay ninguna)
async function consultarUno(sql, args = []) {
    const filas = await consultarVarios(sql, args);
    return filas[0];
}

// Para INSERT / UPDATE / DELETE
async function ejecutar(sql, args = []) {
    return baseDeDatos.execute({ sql, args });
}

// ---- Creación de tablas ----
// Se ejecuta UNA vez al arrancar el servidor. "IF NOT EXISTS" evita errores si ya existen.
async function iniciarBaseDeDatos() {
    // En SQLite local activa las claves foráneas. En la nube, cada petición puede usar una
    // conexión distinta, así que no podemos depender de esto: el servidor ya valida los datos.
    try {
        await baseDeDatos.execute("PRAGMA foreign_keys = ON");
    } catch (error) {
        // Si la base de datos no lo permite, seguimos sin problema
    }

    await baseDeDatos.executeMultiple(`
        CREATE TABLE IF NOT EXISTS suscriptores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            correo TEXT NOT NULL UNIQUE,
            fecha_suscripcion TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellidos TEXT NOT NULL DEFAULT '',
            celular TEXT NOT NULL DEFAULT '',
            correo TEXT NOT NULL UNIQUE,
            clave_hash TEXT NOT NULL,
            fecha_registro TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);

    // MIGRACIÓN: si tu base de datos ya existía sin apellidos y celular, los agregamos
    // SOLO si todavía no están, así se conservan las cuentas que ya creaste.
    const columnas = (await consultarVarios("PRAGMA table_info(usuarios)")).map((columna) => columna.name);

    if (!columnas.includes("apellidos")) {
        await ejecutar("ALTER TABLE usuarios ADD COLUMN apellidos TEXT NOT NULL DEFAULT ''");
    }
    if (!columnas.includes("celular")) {
        await ejecutar("ALTER TABLE usuarios ADD COLUMN celular TEXT NOT NULL DEFAULT ''");
    }

    await baseDeDatos.executeMultiple(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
            total_centimos INTEGER NOT NULL,
            estado TEXT NOT NULL DEFAULT 'pendiente',
            fecha_pedido TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS detalle_pedido (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
            producto_id TEXT NOT NULL,
            nombre TEXT NOT NULL,
            talla TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_centimos INTEGER NOT NULL
        );
    `);
}

// ¿Estamos usando la base de datos de la nube? (para mostrarlo al arrancar)
const usandoNube = Boolean(process.env.TURSO_DATABASE_URL);

module.exports = { baseDeDatos, iniciarBaseDeDatos, consultarVarios, consultarUno, ejecutar, usandoNube };
