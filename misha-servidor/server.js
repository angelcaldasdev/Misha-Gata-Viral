// ============================================
// server.js - Servidor de Misha (Express + SQLite)
// ============================================

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");    // 🆕 para convertir contraseñas en hash
const baseDeDatos = require("./db");   // nuestra conexión a SQLite (db.js)

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

aplicacion.listen(PUERTO, () => {
    console.log(`Servidor de Misha listo en http://localhost:${PUERTO}`);
});
