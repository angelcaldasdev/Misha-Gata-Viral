// ============================================
// ver-suscriptores.js - Muestra los correos guardados
// ============================================
// Uso (en la terminal, dentro de misha-servidor):  node ver-suscriptores.js
// Lo hacemos por terminal y NO con una ruta del servidor, para que
// la lista de correos no quede expuesta públicamente en internet.

const baseDeDatos = require("./db");

// .all() devuelve TODAS las filas como un arreglo de objetos
const suscriptores = baseDeDatos
    .prepare("SELECT id, correo, fecha_suscripcion FROM suscriptores ORDER BY id")
    .all();

console.log(`Total de suscriptores: ${suscriptores.length}`);
console.table(suscriptores);
