// servidor.js — Servidor de suscripciones de Misha

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const aplicacion = express();
const PUERTO = process.env.PORT || 3000;

// Clave para que SOLO TÚ puedas ver la lista (cámbiala por una tuya)
const CLAVE_ADMIN = process.env.CLAVE_ADMIN || 'cambia-esta-clave';

// Archivo donde se guardarán los correos
const archivoSuscriptores = path.join(__dirname, 'suscriptores.json');

// Middlewares: permiten recibir JSON y peticiones desde tu página
aplicacion.use(cors());
aplicacion.use(express.json());

// Lee la lista de suscriptores desde el archivo (o devuelve lista vacía)
function leerSuscriptores() {
    if (!fs.existsSync(archivoSuscriptores)) return [];
    const contenido = fs.readFileSync(archivoSuscriptores, 'utf-8');
    return JSON.parse(contenido);
}

// Guarda la lista completa en el archivo
function guardarSuscriptores(listaSuscriptores) {
    fs.writeFileSync(archivoSuscriptores, JSON.stringify(listaSuscriptores, null, 2));
}

// Validación sencilla del formato del correo
function esCorreoValido(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// RUTA PÚBLICA: recibe un correo nuevo desde el formulario de la página
aplicacion.post('/api/suscribirse', (peticion, respuesta) => {
    const correo = (peticion.body.correo || '').trim().toLowerCase();

    if (!esCorreoValido(correo)) {
        return respuesta.status(400).json({ mensaje: 'Correo no válido' });
    }

    const listaSuscriptores = leerSuscriptores();

    // Evitamos correos repetidos
    if (listaSuscriptores.some((suscriptor) => suscriptor.correo === correo)) {
        return respuesta.status(409).json({ mensaje: 'Ya estás suscrito 🐾' });
    }

    listaSuscriptores.push({ correo: correo, fecha: new Date().toISOString() });
    guardarSuscriptores(listaSuscriptores);

    respuesta.status(201).json({ mensaje: '¡Gracias por suscribirte a Misha! 🐱' });
});

// RUTA PRIVADA: ver todos los correos (requiere tu clave)
aplicacion.get('/api/suscriptores', (peticion, respuesta) => {
    if (peticion.headers['x-clave-admin'] !== CLAVE_ADMIN) {
        return respuesta.status(401).json({ mensaje: 'No autorizado' });
    }
    respuesta.json(leerSuscriptores());
});

aplicacion.listen(PUERTO, () => {
    console.log(`Servidor de Misha corriendo en http://localhost:${PUERTO}`);
});