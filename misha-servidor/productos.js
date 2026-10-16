// ============================================
// productos.js - Catálogo oficial del servidor
// ============================================
// IMPORTANTE: el servidor NO confía en los precios que manda la página,
// porque cualquiera puede modificarlos desde el navegador. Los precios
// "de verdad" viven aquí. Si cambias un precio en funciones.js, cámbialo
// también en este archivo.
//
// El dinero se guarda en CÉNTIMOS (enteros): 3500 = S/ 35.00.
// Así evitamos errores de decimales como 0.1 + 0.2 = 0.30000000000000004.

const catalogo = [
    { id: "polo1",   nombre: "Polo Misha 1",   precioCentimos: 3500, tallas: ["S", "M", "L", "XL"] },
    { id: "polo2",   nombre: "Polo Misha 2",   precioCentimos: 3500, tallas: ["S", "M", "L", "XL"] },
    { id: "polo3",   nombre: "Polo Misha 3",   precioCentimos: 3500, tallas: ["S", "M", "L", "XL"] },
    { id: "polera1", nombre: "Polera Misha 1", precioCentimos: 6000, tallas: ["S", "M", "L", "XL"] },
    { id: "polera2", nombre: "Polera Misha 2", precioCentimos: 6000, tallas: ["S", "M", "L", "XL"] },
    { id: "sueter1", nombre: "Suéter Misha 1", precioCentimos: 7000, tallas: ["S", "M", "L", "XL"] },
    { id: "sueter2", nombre: "Suéter Misha 2", precioCentimos: 7000, tallas: ["S", "M", "L", "XL"] },
    { id: "gorra1",  nombre: "Gorra Misha 1",  precioCentimos: 2500, tallas: ["Única"] },
    { id: "gorra2",  nombre: "Gorra Misha 2",  precioCentimos: 2500, tallas: ["Única"] },
    { id: "bolsa1",  nombre: "Bolsa Misha 1",  precioCentimos: 2000, tallas: ["Única"] },
    { id: "bolsa2",  nombre: "Bolsa Misha 2",  precioCentimos: 2000, tallas: ["Única"] },
    { id: "taza1",   nombre: "Taza Misha 1",   precioCentimos: 1500, tallas: ["Única"] },
    { id: "taza2",   nombre: "Taza Misha 2",   precioCentimos: 1500, tallas: ["Única"] },
    { id: "medias1", nombre: "Medias Misha 1", precioCentimos: 1000, tallas: ["35-39", "40-44"] },
    { id: "medias2", nombre: "Medias Misha 2", precioCentimos: 1000, tallas: ["35-39", "40-44"] },
];

// Un "Map" permite buscar un producto por su id al instante: catalogoPorId.get("polo1")
const catalogoPorId = new Map(catalogo.map((producto) => [producto.id, producto]));

module.exports = { catalogoPorId };
