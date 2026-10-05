// ============================================
// MISHA LA GATA VIRAL - funciones.js
// ============================================

// Año automático en el footer
const spanAnio = document.getElementById("anio");
spanAnio.textContent = new Date().getFullYear();

// ============================================
// CARRUSEL DE FOTOS
// ============================================
// IMPORTANTE: revisa los nombres de archivo y las
// extensiones (.jpg/.jpeg/.png) para que coincidan
// exactamente con tus fotos dentro de la carpeta img/.
// Cambia también "fecha" y "titulo" por los datos reales
// de cada foto.

const fotosMisha = [
    { src: "img/misha.jpeg", titulo: "Curioseando por la puerta" },
    { src: "img/misha2.jpeg", titulo: "Explorando el pasillo" },
    { src: "img/misha3.jpeg", titulo: "Siesta en su camita" },
    { src: "img/Misha4.jpeg", titulo: "Vigilando la sala" },
    { src: "img/Misha5.jpeg", titulo: "De compras con mamá" },
    { src: "img/Misha6.jpeg", titulo: "Metida entre la ropa" },
    { src: "img/Misha7.jpeg", titulo: "Hora de comer" },
    { src: "img/Misha8.jpeg", titulo: "Jugando con la familia" },
    { src: "img/Misha9.jpeg", titulo: "Estirándose en la torre rascador" },
    { src: "img/Misha10.jpeg", titulo: "Posando en la cama" },
    { src: "img/Misha11.jpeg", titulo: "Momento de cariño" },
    { src: "img/Misha12.jpeg", titulo: "Abrazo con papá" },
    { src: "img/misha15.jpeg", titulo: "Disfrutando de un anime" },
];

const carruselTrack = document.getElementById("carruselTrack");
const carruselIndicadores = document.getElementById("carruselIndicadores");
const flechaIzq = document.getElementById("flechaIzq");
const flechaDer = document.getElementById("flechaDer");

let indiceActual = 0;

function crearSlides() {
    fotosMisha.forEach((foto) => {
        const figure = document.createElement("figure");
        figure.className = "tarjeta-foto";

        const img = document.createElement("img");
        img.src = foto.src;
        img.alt = foto.titulo;
        img.className = "tarjeta-foto-img";
        figure.appendChild(img);

        const figcaption = document.createElement("figcaption");
        figcaption.innerHTML = `
            <span class="tarjeta-foto-titulo">${foto.titulo}</span>
        `;

        figure.appendChild(figcaption);
        carruselTrack.appendChild(figure);
    });
}

function crearIndicadores() {
    fotosMisha.forEach((_, indice) => {
        const punto = document.createElement("button");
        punto.className = "carrusel-punto";
        punto.setAttribute("aria-label", `Ir a la foto ${indice + 1}`);
        punto.addEventListener("click", () => irAFoto(indice));
        carruselIndicadores.appendChild(punto);
    });
}

function actualizarCarrusel() {
    carruselTrack.style.transform = `translateX(-${indiceActual * 100}%)`;

    const puntos = carruselIndicadores.querySelectorAll(".carrusel-punto");
    puntos.forEach((punto, indice) => {
        punto.classList.toggle("activo", indice === indiceActual);
    });
}

function irAFoto(indice) {
    indiceActual = indice;
    actualizarCarrusel();
}

function fotoSiguiente() {
    indiceActual = (indiceActual + 1) % fotosMisha.length;
    actualizarCarrusel();
}

function fotoAnterior() {
    indiceActual = (indiceActual - 1 + fotosMisha.length) % fotosMisha.length;
    actualizarCarrusel();
}

crearSlides();
crearIndicadores();
actualizarCarrusel();

flechaDer.addEventListener("click", fotoSiguiente);
flechaIzq.addEventListener("click", fotoAnterior);

// Deslizar con el dedo en celulares (touch)
let posicionInicialX = 0;

carruselTrack.addEventListener("touchstart", (evento) => {
    posicionInicialX = evento.touches[0].clientX;
});

carruselTrack.addEventListener("touchend", (evento) => {
    const posicionFinalX = evento.changedTouches[0].clientX;
    const diferencia = posicionFinalX - posicionInicialX;

    if (diferencia > 50) {
        fotoAnterior();
    } else if (diferencia < -50) {
        fotoSiguiente();
    }
});

// ============================================
// SUSCRIPCIÓN POR CORREO (conectada al servidor Express)
// ============================================

// Dirección del servidor. Cuando lo publiques en la nube,
// cambiarás solo esta línea por la URL pública.
const URL_SERVIDOR = "http://localhost:3000";

// Elementos del formulario (ids que existen en tu index.html)
const formSuscripcion = document.getElementById("formSuscripcion");
const inputCorreo = document.getElementById("inputCorreo");
const botonSuscribirme = document.getElementById("btn");
const mensajeSuscripcion = document.getElementById("mensajeSuscripcion");

// Validación básica del formato del correo (antes de enviarlo al servidor)
const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Muestra un mensaje debajo del formulario.
// "tipo" puede ser "exito" o "error" (tus clases de color en el CSS)
function mostrarMensaje(texto, tipo) {
    mensajeSuscripcion.textContent = texto;
    mensajeSuscripcion.className = "mensaje-suscripcion " + tipo;
}

formSuscripcion.addEventListener("submit", async (evento) => {
    // Evita que el formulario recargue la página (comportamiento por defecto)
    evento.preventDefault();

    const correoIngresado = inputCorreo.value.trim();

    // 1) Validamos el formato antes de molestar al servidor
    if (!regexCorreo.test(correoIngresado)) {
        mostrarMensaje("Por favor ingresa un correo válido.", "error");
        return;
    }

    // 2) Desactivamos el botón para evitar envíos dobles
    botonSuscribirme.disabled = true;
    mostrarMensaje("Enviando...", "");

    try {
        // 3) Enviamos el correo al servidor Express
        const respuesta = await fetch(`${URL_SERVIDOR}/api/suscribirse`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo: correoIngresado }),
        });

        const datos = await respuesta.json();

        // 4) Mostramos el mensaje que responde el servidor
        if (respuesta.ok) {
            mostrarMensaje(datos.mensaje, "exito");
            formSuscripcion.reset();
        } else {
            // Ejemplo: correo repetido o inválido
            mostrarMensaje(datos.mensaje, "error");
        }
    } catch (error) {
        // Pasa si el servidor está apagado o no hay conexión
        mostrarMensaje("No se pudo conectar con el servidor 😿", "error");
    } finally {
        // Volvemos a activar el botón pase lo que pase
        botonSuscribirme.disabled = false;
    }
});

// ---- REFERENCIA DE EVENTOS (repaso del curso) ----
// keydown          : cuando escribimos en un formulario
// keyup            : cuando dejamos de presionar una tecla
// keypress         : cuando presionamos una tecla
// focus            : cuando hacemos click en un input
// blur             : cuando dejamos de hacer click en un input
// change           : cuando cambiamos el valor de un input
// submit           : cuando enviamos un formulario
// mouseover        : cuando pasamos el mouse por encima de un elemento
// DOMContentLoaded : cuando el DOM está cargado y listo para ser manipulado

// ============================================
// DATOS DE MISHA (cuadros 3 columnas x 4 filas = 12)
// ============================================
const datosMisha = [
    { emoji: "😴", titulo: "Dormilona", descripcion: "Le encanta dormir mucho, en especial durante el día." },
    { emoji: "🔌", titulo: "Travesura favorita", descripcion: "Jugar con cables es lo que más disfruta." },
    { emoji: "🥰", titulo: "Muy cariñosa", descripcion: "Linda y tierna con toda la familia." },
    { emoji: "🕵️‍♀️", titulo: "Sigilosa", descripcion: "Introvertida: se mueve por la casa sin hacer ruido." },
    { emoji: "🐟", titulo: "Amante del churu", descripcion: "Su golosina favorita, junto con sus croquetas." },
    { emoji: "🎂", titulo: "1 añito", descripcion: "Acaba de cumplir su primer año de vida." },
    { emoji: "🎨", titulo: "Pelaje calicó", descripcion: "Mezcla blanco, negro y naranja en un solo gatito." },
    { emoji: "⭐", titulo: "Estrella de la casa", descripcion: "Todos giran alrededor de ella." },
    { emoji: "📸", titulo: "Viral en Instagram", descripcion: "La encuentras como @misha.gataviral." },
    // ✏️ EDITA estos 3 con datos reales de Misha:
    { emoji: "📍", titulo: "Su lugar favorito", descripcion: "✏️ Cuéntanos dónde le gusta descansar." },
    { emoji: "🧸", titulo: "Su juguete favorito", descripcion: "✏️ Escribe con qué juega más." },
    { emoji: "🌙", titulo: "Sus noches", descripcion: "✏️ Escribe qué hace Misha de noche." },
];

const datosGrid = document.getElementById("datosGrid");

// Crea un cuadro por cada dato de la lista
function crearTarjetasDatos() {
    if (!datosGrid) return;

    datosMisha.forEach((dato) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "dato-tarjeta";
        tarjeta.innerHTML = `
            <span class="dato-emoji" aria-hidden="true">${dato.emoji}</span>
            <h3 class="dato-titulo">${dato.titulo}</h3>
            <p class="dato-descripcion">${dato.descripcion}</p>
        `;
        datosGrid.appendChild(tarjeta);
    });
}

crearTarjetasDatos();

// ============================================
// PRODUCTOS Y PEDIDOS (pago con Yape + pedido por WhatsApp)
// ============================================

// ✏️ CAMBIA por tu número: código de país 51 + tus 9 dígitos (sin espacios ni "+")
const NUMERO_WHATSAPP = "51943147131";

// ✏️ CAMBIA los precios (en soles) y las tallas si hace falta.
// Las fotos deben llamarse igual que aquí y estar en la carpeta img/
const productosMisha = [
    { id: "polo1",   nombre: "Polo Misha 1",   categoria: "Polo",   precio: 45, imagen: "img/polo1.jpeg",   tallas: ["S", "M", "L", "XL"] },
    { id: "polo2",   nombre: "Polo Misha 2",   categoria: "Polo",   precio: 45, imagen: "img/polo2.jpeg",   tallas: ["S", "M", "L", "XL"] },
    { id: "gorra1",  nombre: "Gorra Misha 1",  categoria: "Gorra",  precio: 30, imagen: "img/gorra1.jpeg",  tallas: ["Única"] },
    { id: "gorra2",  nombre: "Gorra Misha 2",  categoria: "Gorra",  precio: 30, imagen: "img/gorra2.jpeg",  tallas: ["Única"] },
    { id: "medias1", nombre: "Medias Misha 1", categoria: "Medias", precio: 15, imagen: "img/medias1.jpeg", tallas: ["35-39", "40-44"] },
    { id: "medias2", nombre: "Medias Misha 2", categoria: "Medias", precio: 15, imagen: "img/medias2.jpeg", tallas: ["35-39", "40-44"] },
];

// Emoji de relleno que se ve mientras no subas las fotos reales
const emojiPorCategoria = { Polo: "👕", Gorra: "🧢", Medias: "🧦" };

const productosGrid = document.getElementById("productosGrid");
const modalPedido = document.getElementById("modalPedido");
const modalNombre = document.getElementById("modalNombre");
const modalPrecio = document.getElementById("modalPrecio");
const pedidoNombre = document.getElementById("pedidoNombre");
const pedidoTalla = document.getElementById("pedidoTalla");
const pedidoCantidad = document.getElementById("pedidoCantidad");
const pedidoTotal = document.getElementById("pedidoTotal");
const botonEnviarPedido = document.getElementById("botonEnviarPedido");
const mensajePedido = document.getElementById("mensajePedido");

// Producto que la persona eligió en este momento
let productoSeleccionado = null;

// Da formato de soles: 45 -> "S/ 45.00"
function formatearSoles(monto) {
    return "S/ " + monto.toFixed(2);
}

// Crea una tarjeta por cada producto de la lista
function crearTarjetasProductos() {
    productosMisha.forEach((producto) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "producto-tarjeta";

        // Caja de la foto: el emoji queda de fondo y la imagen se pone encima
        const cajaFoto = document.createElement("div");
        cajaFoto.className = "producto-foto";
        cajaFoto.textContent = emojiPorCategoria[producto.categoria];

        const imagen = document.createElement("img");
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;
        imagen.loading = "lazy";
        // Si la foto todavía no existe, se quita y se queda el emoji
        imagen.addEventListener("error", () => imagen.remove());
        cajaFoto.appendChild(imagen);

        const info = document.createElement("div");
        info.className = "producto-info";
        info.innerHTML = `
            <h3 class="producto-nombre">${producto.nombre}</h3>
            <p class="producto-precio">${formatearSoles(producto.precio)}</p>
        `;

        const botonPedir = document.createElement("button");
        botonPedir.textContent = "Pedir";
        botonPedir.addEventListener("click", () => abrirModalPedido(producto));
        info.appendChild(botonPedir);

        tarjeta.appendChild(cajaFoto);
        tarjeta.appendChild(info);
        productosGrid.appendChild(tarjeta);
    });
}

// Abre la ventana con los datos del producto elegido
function abrirModalPedido(producto) {
    productoSeleccionado = producto;

    modalNombre.textContent = producto.nombre;
    modalPrecio.textContent = formatearSoles(producto.precio);

    // Llenamos las tallas disponibles de ese producto
    pedidoTalla.innerHTML = "";
    producto.tallas.forEach((talla) => {
        const opcion = document.createElement("option");
        opcion.value = talla;
        opcion.textContent = talla;
        pedidoTalla.appendChild(opcion);
    });

    pedidoCantidad.value = 1;
    mensajePedido.textContent = "";
    actualizarTotal();
    modalPedido.showModal();
}

// Recalcula el total cuando cambia la cantidad
function actualizarTotal() {
    const cantidad = parseInt(pedidoCantidad.value, 10) || 0;
    pedidoTotal.textContent = formatearSoles(productoSeleccionado.precio * cantidad);
}

// Arma el mensaje y abre WhatsApp con el pedido listo para enviar
function enviarPedidoPorWhatsApp() {
    const nombreCliente = pedidoNombre.value.trim();
    const cantidad = parseInt(pedidoCantidad.value, 10);

    if (nombreCliente === "") {
        mensajePedido.textContent = "Escribe tu nombre para continuar 🐾";
        return;
    }
    if (!cantidad || cantidad < 1 || cantidad > 10) {
        mensajePedido.textContent = "La cantidad debe estar entre 1 y 10.";
        return;
    }

    const total = productoSeleccionado.precio * cantidad;
    const mensaje =
        "Hola, quiero hacer un pedido de la tienda de Misha 🐱\n" +
        `• Producto: ${productoSeleccionado.nombre}\n` +
        `• Talla: ${pedidoTalla.value}\n` +
        `• Cantidad: ${cantidad}\n` +
        `• Total: ${formatearSoles(total)}\n` +
        `• A nombre de: ${nombreCliente}\n` +
        "Te envío la captura de mi pago por Yape.";

    const enlace = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    window.open(enlace, "_blank", "noopener");
}

// Solo activamos todo si la sección de productos existe en la página
if (productosGrid && modalPedido) {
    crearTarjetasProductos();
    pedidoCantidad.addEventListener("input", actualizarTotal);
    botonEnviarPedido.addEventListener("click", enviarPedidoPorWhatsApp);
}