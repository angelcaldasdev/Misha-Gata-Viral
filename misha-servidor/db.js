// ============================================
// db.js - Conexión a la base de datos (SQLite)
// ============================================
// SQLite guarda TODO en un solo archivo (misha.db) dentro de esta carpeta.
// Si el archivo no existe, se crea solo la primera vez que arrancas el servidor.

const Database = require("better-sqlite3");
const path = require("path");

// Abrimos (o creamos) el archivo de la base de datos
const baseDeDatos = new Database(path.join(__dirname, "misha.db"));

// 🆕 SQLite trae las "claves foráneas" apagadas. Las activamos para que la base
// de datos NO deje guardar, por ejemplo, un pedido de un usuario que no existe.
baseDeDatos.pragma("foreign_keys = ON");

// Creamos la tabla "suscriptores" si todavía no existe.
// - id: número único que se asigna solo (1, 2, 3...)
// - correo: no puede estar vacío (NOT NULL) ni repetirse (UNIQUE)
// - fecha_suscripcion: se llena sola con la fecha y hora actual
baseDeDatos.exec(`
    CREATE TABLE IF NOT EXISTS suscriptores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        correo TEXT NOT NULL UNIQUE,
        fecha_suscripcion TEXT NOT NULL DEFAULT (datetime('now'))
    )
`);

// 🆕 Tabla "usuarios": las personas que crean una cuenta para comprar.
// - clave_hash: NUNCA guardamos la contraseña real, solo un código (hash)
//   que se genera con bcrypt y no se puede convertir de vuelta en la contraseña.
baseDeDatos.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT NOT NULL UNIQUE,
        clave_hash TEXT NOT NULL,
        fecha_registro TEXT NOT NULL DEFAULT (datetime('now'))
    )
`);

// 🆕 Tabla "pedidos": una fila por cada compra.
// - usuario_id: quién hizo el pedido (apunta a la tabla usuarios)
// - total_centimos: total calculado por el servidor, en céntimos
// - estado: empieza en "pendiente" (luego podrá ser "pagado", "entregado"...)
baseDeDatos.exec(`
    CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        total_centimos INTEGER NOT NULL,
        estado TEXT NOT NULL DEFAULT 'pendiente',
        fecha_pedido TEXT NOT NULL DEFAULT (datetime('now'))
    )
`);

// 🆕 Tabla "detalle_pedido": una fila por cada producto dentro de un pedido.
// Guardamos el nombre y el precio del momento de la compra: si mañana cambias
// un precio, los pedidos antiguos deben seguir mostrando lo que se pagó entonces.
baseDeDatos.exec(`
    CREATE TABLE IF NOT EXISTS detalle_pedido (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
        producto_id TEXT NOT NULL,
        nombre TEXT NOT NULL,
        talla TEXT NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_centimos INTEGER NOT NULL
    )
`);

// Exportamos la conexión para usarla en server.js
module.exports = baseDeDatos;
