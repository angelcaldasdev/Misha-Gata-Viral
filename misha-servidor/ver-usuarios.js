// ============================================
// ver-usuarios.js - Muestra los usuarios registrados
// ============================================
// Uso (en la terminal, dentro de misha-servidor):  node ver-usuarios.js
// Solo mostramos el INICIO del hash para que veas que la contraseña
// real no se guarda: lo que hay en la tabla es un código sin sentido.

const baseDeDatos = require("./db");

const usuarios = baseDeDatos
    .prepare(`
        SELECT id, nombre, correo,
               substr(clave_hash, 1, 20) || '...' AS inicio_del_hash,
               fecha_registro
        FROM usuarios
        ORDER BY id
    `)
    .all();

console.log(`Total de usuarios: ${usuarios.length}`);
console.table(usuarios);
