// ============================================
// server.js - Servidor de Misha (Express + SQLite)
// ============================================

const express = require("express");
const cors = require("cors");
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

aplicacion.listen(PUERTO, () => {
    console.log(`Servidor de Misha listo en http://localhost:${PUERTO}`);
});
