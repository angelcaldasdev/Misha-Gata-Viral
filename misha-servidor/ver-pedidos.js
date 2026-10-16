// ============================================
// ver-pedidos.js - Muestra los pedidos guardados
// ============================================
// Uso (en la terminal, dentro de misha-servidor):  node ver-pedidos.js

const baseDeDatos = require("./db");

// JOIN = unir dos tablas: aquí juntamos cada pedido con los datos de quien lo hizo.
// Dividimos entre 100.0 para mostrar soles en vez de céntimos.
const pedidos = baseDeDatos
    .prepare(`
        SELECT p.id,
               u.nombre,
               u.correo,
               p.total_centimos / 100.0 AS total_soles,
               p.estado,
               p.fecha_pedido
        FROM pedidos p
        JOIN usuarios u ON u.id = p.usuario_id
        ORDER BY p.id DESC
    `)
    .all();

console.log(`Total de pedidos: ${pedidos.length}`);
console.table(pedidos);

// Los productos de cada pedido
const detalle = baseDeDatos
    .prepare(`
        SELECT pedido_id,
               nombre AS producto,
               talla,
               cantidad,
               precio_centimos / 100.0 AS precio_soles
        FROM detalle_pedido
        ORDER BY pedido_id DESC, id
    `)
    .all();

console.log("Detalle de los pedidos:");
console.table(detalle);
