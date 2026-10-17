// ============================================
// ver-usuarios.js - Muestra los usuarios registrados
// ============================================
// Uso (en la terminal, dentro de misha-servidor):  node ver-usuarios.js
// Solo mostramos el INICIO del hash para que veas que la contraseña
// real no se guarda: lo que hay en la tabla es un código sin sentido.

const { consultarVarios, usandoNube } = require("./db");

async function principal() {
    const usuarios = await consultarVarios(`
        SELECT id, nombre, apellidos, celular, correo,
               substr(clave_hash, 1, 20) || '...' AS inicio_del_hash,
               fecha_registro
        FROM usuarios
        ORDER BY id
    `);

    console.log(`Base de datos: ${usandoNube ? "Turso (nube)" : "archivo local"}`);
    console.log(`Total de usuarios: ${usuarios.length}`);
    console.table(usuarios);
}

principal().catch((error) => console.error("Error:", error.message));
