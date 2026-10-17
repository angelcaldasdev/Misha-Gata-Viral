// ============================================
// ver-suscriptores.js - Muestra los correos guardados
// ============================================
// Uso (en la terminal, dentro de misha-servidor):  node ver-suscriptores.js
// Si en tu .env están los datos de Turso, muestra los de la NUBE; si no, los del archivo local.
// Lo hacemos por terminal y NO con una ruta del servidor, para que
// la lista de correos no quede expuesta públicamente en internet.

const { consultarVarios, usandoNube } = require("./db");

async function principal() {
    const suscriptores = await consultarVarios(
        "SELECT id, correo, fecha_suscripcion FROM suscriptores ORDER BY id"
    );

    console.log(`Base de datos: ${usandoNube ? "Turso (nube)" : "archivo local"}`);
    console.log(`Total de suscriptores: ${suscriptores.length}`);
    console.table(suscriptores);
}

principal().catch((error) => console.error("Error:", error.message));
