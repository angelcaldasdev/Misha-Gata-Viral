// ============================================
// MISHA LA GATA VIRAL - funciones.js
// ============================================

// Año automático en el footer
const spanAnio = document.getElementById("anio");
spanAnio.textContent = new Date().getFullYear();

// Validación básica del formato del correo (se usa en cuenta y suscripción)
const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- Ayudas para guardar datos en el navegador (localStorage) ----
function leerAlmacen(clave, valorPorDefecto) {
    try {
        const texto = localStorage.getItem(clave);
        return texto ? JSON.parse(texto) : valorPorDefecto;
    } catch (error) {
        return valorPorDefecto;
    }
}

function guardarAlmacen(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch (error) {
        // Si el navegador no deja guardar, la página sigue funcionando
    }
}

// Aviso flotante corto (ej: "Agregado al carrito")
const avisoFlotante = document.getElementById("avisoFlotante");
let temporizadorAviso = null;

// duracionMs: cuánto tiempo se queda visible. Con 0 se queda hasta que llamemos a ocultarAviso()
function mostrarAviso(texto, duracionMs = 2200) {
    avisoFlotante.textContent = texto;
    avisoFlotante.classList.add("visible");
    clearTimeout(temporizadorAviso);

    if (duracionMs > 0) {
        temporizadorAviso = setTimeout(() => avisoFlotante.classList.remove("visible"), duracionMs);
    }
}

function ocultarAviso() {
    clearTimeout(temporizadorAviso);
    avisoFlotante.classList.remove("visible");
}

// ============================================
// CARRUSEL DE FOTOS (varias fotos a la vez)
// ============================================
// IMPORTANTE: revisa los nombres de archivo y las
// extensiones (.jpg/.jpeg/.png) para que coincidan
// exactamente con tus fotos dentro de la carpeta img/.

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

const carrusel = document.getElementById("carrusel");
const carruselTrack = document.getElementById("carruselTrack");
const carruselIndicadores = document.getElementById("carruselIndicadores");
const flechaIzq = document.getElementById("flechaIzq");
const flechaDer = document.getElementById("flechaDer");

// Posición actual = índice de la primera foto visible
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
        figcaption.innerHTML = `<span class="tarjeta-foto-titulo">${foto.titulo}</span>`;
        figure.appendChild(figcaption);

        carruselTrack.appendChild(figure);
    });
}

// Cuántas fotos se ven a la vez (lo define el CSS con --visibles: 4, 2 o 1)
function cantidadVisibles() {
    const valor = getComputedStyle(carrusel).getPropertyValue("--visibles");
    return parseInt(valor, 10) || 1;
}

// Último índice al que se puede llegar sin dejar espacios vacíos
function indiceMaximo() {
    return Math.max(0, fotosMisha.length - cantidadVisibles());
}

// Un punto por cada posición posible del carrusel
function crearIndicadores() {
    carruselIndicadores.innerHTML = "";
    for (let indice = 0; indice <= indiceMaximo(); indice++) {
        const punto = document.createElement("button");
        punto.type = "button";
        punto.className = "carrusel-punto";
        punto.setAttribute("aria-label", `Ir a la posición ${indice + 1}`);
        punto.addEventListener("click", () => irAFoto(indice));
        carruselIndicadores.appendChild(punto);
    }
}

function actualizarCarrusel() {
    if (indiceActual > indiceMaximo()) {
        indiceActual = indiceMaximo();
    }

    // El CSS usa --indice para calcular cuánto se desplaza el carrusel
    carruselTrack.style.setProperty("--indice", indiceActual);

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
    indiceActual = indiceActual >= indiceMaximo() ? 0 : indiceActual + 1;
    actualizarCarrusel();
}

function fotoAnterior() {
    indiceActual = indiceActual <= 0 ? indiceMaximo() : indiceActual - 1;
    actualizarCarrusel();
}

crearSlides();
crearIndicadores();
actualizarCarrusel();

flechaDer.addEventListener("click", fotoSiguiente);
flechaIzq.addEventListener("click", fotoAnterior);

// Si cambia el tamaño de la pantalla, cambia cuántas fotos se ven: recalculamos
window.addEventListener("resize", () => {
    crearIndicadores();
    actualizarCarrusel();
});

// Deslizar con el dedo en celulares (touch)
let posicionInicialX = 0;

carruselTrack.addEventListener("touchstart", (evento) => {
    posicionInicialX = evento.touches[0].clientX;
});

carruselTrack.addEventListener("touchend", (evento) => {
    const diferencia = evento.changedTouches[0].clientX - posicionInicialX;

    if (diferencia > 50) {
        fotoAnterior();
    } else if (diferencia < -50) {
        fotoSiguiente();
    }
});

// ============================================
// SUSCRIPCIÓN POR CORREO (conectada al servidor Express)
// ============================================

// ¿La página se está viendo desde tu computadora (Live Server) o desde internet (GitHub Pages)?
const ES_LOCAL = ["localhost", "127.0.0.1"].includes(window.location.hostname);

// ✏️ Dirección del servidor: en tu computadora usa el servidor local; en internet, el de la nube.
// Cuando crees el servicio en Render, pega aquí su dirección real (sin "/" al final).
const URL_SERVIDOR = ES_LOCAL ? "http://localhost:3000" : "https://misha-gata-viral.onrender.com";

// Los servidores gratuitos se duermen tras 15 minutos sin visitas y tardan hasta un minuto
// en despertar. Esperamos hasta este tiempo antes de rendirnos con "No se pudo conectar".
const TIEMPO_MAXIMO_ESPERA = ES_LOCAL ? 8000 : 70000;

const MENSAJE_SIN_CONEXION = "No se pudo conectar con el servidor 😿";

const esperar = (milisegundos) => new Promise((resolver) => setTimeout(resolver, milisegundos));

// Al abrir la página "tocamos la puerta" del servidor sin avisar a nadie:
// si estaba dormido, empieza a despertar mientras la persona mira la página.
if (!ES_LOCAL) {
    fetch(`${URL_SERVIDOR}/api/salud`).catch(() => {});
}

const formSuscripcion = document.getElementById("formSuscripcion");
const inputCorreo = document.getElementById("inputCorreo");
const aceptoPrivacidad = document.getElementById("aceptoPrivacidad");
const botonSuscribirme = document.getElementById("btn");
const mensajeSuscripcion = document.getElementById("mensajeSuscripcion");

// Muestra un mensaje debajo del formulario ("exito" o "error")
function mostrarMensaje(texto, tipo) {
    mensajeSuscripcion.textContent = texto;
    mensajeSuscripcion.className = "mensaje-suscripcion " + tipo;
}

formSuscripcion.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const correoIngresado = inputCorreo.value.trim();

    // 1) Validamos el formato antes de molestar al servidor
    if (!regexCorreo.test(correoIngresado)) {
        mostrarMensaje("Por favor ingresa un correo válido.", "error");
        return;
    }

    // 2) Debe aceptar la política de privacidad
    if (!aceptoPrivacidad.checked) {
        mostrarMensaje("Debes aceptar la política de privacidad para continuar.", "error");
        return;
    }

    // 3) Desactivamos el botón para evitar envíos dobles
    botonSuscribirme.disabled = true;
    mostrarMensaje("Enviando...", "");

    // pedirAlServidor espera si el servidor está dormido y SIEMPRE devuelve una respuesta
    const resultado = await pedirAlServidor("/api/suscribirse", "POST", { correo: correoIngresado });
    botonSuscribirme.disabled = false;

    if (resultado.ok) {
        mostrarMensaje(resultado.datos.mensaje, "exito");
        formSuscripcion.reset();
    } else {
        mostrarMensaje(resultado.datos.mensaje, "error");
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
// CONOCE A MISHA (etiquetas) Y UN DÍA EN LA VIDA DE MISHA
// ============================================

// ✏️ Etiquetas cortas de la sección "Conoce a Misha"
const etiquetasMisha = [
    { emoji: "🎂", texto: "1 añito" },
    { emoji: "🎨", texto: "Calicó" },
    { emoji: "😴", texto: "Dormilona" },
    { emoji: "🥰", texto: "Muy cariñosa" },
    { emoji: "🐟", texto: "Amante del churu" },
    { emoji: "🧸", texto: "Estrella con cascabel" },
    { emoji: "📸", texto: "@misha.gataviral" },
];

// ✏️ Pasos de "Un día en la vida de Misha" (cambia textos y momentos a tu gusto)
const diaDeMisha = [
    { emoji: "🌅", momento: "Mañana", titulo: "Croquetas", descripcion: "Desayuna sus croquetas y se estira." },
    { emoji: "😴", momento: "Día", titulo: "Siesta", descripcion: "Duerme en cualquier parte de la casa." },
    { emoji: "🥰", momento: "Tarde", titulo: "Cariños", descripcion: "Mimos con toda la familia." },
    { emoji: "🐟", momento: "Después", titulo: "Hora del churu", descripcion: "Su golosina favorita." },
    { emoji: "🌙", momento: "Noche", titulo: "A explorar", descripcion: "Juega, explora y se enreda con los cables." },
];

const etiquetasContenedor = document.getElementById("etiquetasMisha");
const lineaTiempo = document.getElementById("lineaTiempo");

// Crea una etiqueta (chip) por cada elemento de la lista
function crearEtiquetas() {
    if (!etiquetasContenedor) return;

    etiquetasMisha.forEach((etiqueta) => {
        const item = document.createElement("li");
        item.className = "etiqueta";
        item.textContent = `${etiqueta.emoji} ${etiqueta.texto}`;
        etiquetasContenedor.appendChild(item);
    });
}

// Crea un paso de la línea de tiempo por cada momento del día
function crearLineaTiempo() {
    if (!lineaTiempo) return;

    diaDeMisha.forEach((paso) => {
        const item = document.createElement("li");
        item.className = "paso";
        item.innerHTML = `
            <span class="paso-icono" aria-hidden="true">${paso.emoji}</span>
            <div class="paso-texto">
                <span class="paso-momento">${paso.momento}</span>
                <h3 class="paso-titulo">${paso.titulo}</h3>
                <p class="paso-descripcion">${paso.descripcion}</p>
            </div>
        `;
        lineaTiempo.appendChild(item);
    });
}

crearEtiquetas();
crearLineaTiempo();

// ============================================
// PRODUCTOS
// ============================================

// ✏️ CAMBIA por tu número: código de país 51 + tus 9 dígitos (sin espacios ni "+")
const NUMERO_WHATSAPP = "51943147131";

// ✏️ CAMBIA los precios (en soles) y las tallas si hace falta.
// Las fotos deben llamarse igual que aquí y estar en la carpeta img/
const productosMisha = [
    { id: "polo1",    nombre: "Polo Misha 1",    categoria: "Polo",    precio: 35, imagen: "img/polo1.jpg",    tallas: ["S", "M", "L", "XL"] },
    { id: "polo2",    nombre: "Polo Misha 2",    categoria: "Polo",    precio: 35, imagen: "img/polo2.jpg",    tallas: ["S", "M", "L", "XL"] },
    { id: "polo3",    nombre: "Polo Misha 3",    categoria: "Polo",    precio: 35, imagen: "img/polo3.jpg",    tallas: ["S", "M", "L", "XL"] },
    { id: "polera1",  nombre: "Polera Misha 1",  categoria: "Polera",  precio: 60, imagen: "img/polera1.jpg",  tallas: ["S", "M", "L", "XL"] },
    { id: "polera2",  nombre: "Polera Misha 2",  categoria: "Polera",  precio: 60, imagen: "img/polera2.jpg",  tallas: ["S", "M", "L", "XL"] },

    // 🆕 Suéteres nuevos
    { id: "sueter1",  nombre: "Suéter Misha 1",  categoria: "Sueter",  precio: 70, imagen: "img/sueter1.jpg",  tallas: ["S", "M", "L", "XL"] },
    { id: "sueter2",  nombre: "Suéter Misha 2",  categoria: "Sueter",  precio: 70, imagen: "img/sueter2.jpg",  tallas: ["S", "M", "L", "XL"] },

    { id: "gorra1",   nombre: "Gorra Misha 1",   categoria: "Gorra",   precio: 25, imagen: "img/gorra1.jpg",   tallas: ["Única"] },
    { id: "gorra2",   nombre: "Gorra Misha 2",   categoria: "Gorra",   precio: 25, imagen: "img/gorra2.jpg",   tallas: ["Única"] },

    // 🆕 Bolsas nuevas (talla única)
    { id: "bolsa1",   nombre: "Bolsa Misha 1",   categoria: "Bolsa",   precio: 20, imagen: "img/bolsa1.jpg",   tallas: ["Única"] },
    { id: "bolsa2",   nombre: "Bolsa Misha 2",   categoria: "Bolsa",   precio: 20, imagen: "img/bolsa2.jpg",   tallas: ["Única"] },

    { id: "medias1",  nombre: "Medias Misha 1",  categoria: "Medias",  precio: 10, imagen: "img/medias1.jpg",  tallas: ["35-39", "40-44"] },
    { id: "medias2",  nombre: "Medias Misha 2",  categoria: "Medias",  precio: 10, imagen: "img/medias2.jpg",  tallas: ["35-39", "40-44"] },

    // 🆕 Tazas nuevas (talla única)
    { id: "taza1",    nombre: "Taza Misha 1",    categoria: "Taza",    precio: 15, imagen: "img/taza1.jpg",    tallas: ["Única"] },
    { id: "taza2",    nombre: "Taza Misha 2",    categoria: "Taza",    precio: 15, imagen: "img/taza2.jpg",    tallas: ["Única"] },
];

// Emoji de relleno que se ve mientras no subas las fotos reales.
// Cada categoría nueva necesita su emoji aquí, si no saldría "undefined".
const emojiPorCategoria = {
    Polo: "👕",
    Polera: "🧥",
    Sueter: "🧶",   // 🆕
    Gorra: "🧢",
    Bolsa: "👜",    // 🆕
    Medias: "🧦",
    Taza: "☕",     // 🆕
};

const productosGrid = document.getElementById("productosGrid");
const modalPedido = document.getElementById("modalPedido");
const modalNombre = document.getElementById("modalNombre");
const modalPrecio = document.getElementById("modalPrecio");
const pedidoTalla = document.getElementById("pedidoTalla");
const pedidoCantidad = document.getElementById("pedidoCantidad");
const pedidoTotal = document.getElementById("pedidoTotal");
const botonAgregarCarrito = document.getElementById("botonAgregarCarrito");
const mensajePedido = document.getElementById("mensajePedido");

// 🆕 Ventana para ver la foto del producto completa (sin cortes)
const modalImagen = document.getElementById("modalImagen");
const imagenGrande = document.getElementById("imagenGrande");
const pieImagen = document.getElementById("pieImagen");

function abrirImagenGrande(producto) {
    imagenGrande.src = producto.imagen;
    imagenGrande.alt = producto.nombre;
    pieImagen.textContent = `${producto.nombre} · ${formatearSoles(producto.precio)}`;
    modalImagen.showModal();
}

// Un clic en cualquier parte de la ventana la cierra (la tecla Esc también)
modalImagen.addEventListener("click", () => modalImagen.close());

// Producto que la persona eligió en este momento
let productoSeleccionado = null;

// Da formato de soles: 45 -> "S/ 45.00"
function formatearSoles(monto) {
    return "S/ " + monto.toFixed(2);
}

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
        imagen.addEventListener("error", () => imagen.remove());
        cajaFoto.appendChild(imagen);

        // 🆕 Clic en la foto = verla completa (solo si la imagen sí cargó)
        cajaFoto.addEventListener("click", () => {
            if (imagen.isConnected) abrirImagenGrande(producto);
        });

        const info = document.createElement("div");
        info.className = "producto-info";
        info.innerHTML = `
            <h3 class="producto-nombre">${producto.nombre}</h3>
            <p class="producto-precio">${formatearSoles(producto.precio)}</p>
        `;

        const botonPedir = document.createElement("button");
        botonPedir.type = "button";
        botonPedir.textContent = "Agregar";
        botonPedir.addEventListener("click", () => abrirModalPedido(producto));
        info.appendChild(botonPedir);

        tarjeta.appendChild(cajaFoto);
        tarjeta.appendChild(info);
        productosGrid.appendChild(tarjeta);
    });
}

// Abre la ventana para elegir talla y cantidad
function abrirModalPedido(producto) {
    productoSeleccionado = producto;

    modalNombre.textContent = producto.nombre;
    modalPrecio.textContent = formatearSoles(producto.precio);

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

function actualizarTotal() {
    const cantidad = parseInt(pedidoCantidad.value, 10) || 0;
    pedidoTotal.textContent = formatearSoles(productoSeleccionado.precio * cantidad);
}

// Botón "Agregar al carrito" de la ventana del producto
function confirmarAgregado() {
    const cantidad = parseInt(pedidoCantidad.value, 10);

    if (!cantidad || cantidad < 1 || cantidad > 10) {
        mensajePedido.textContent = "La cantidad debe estar entre 1 y 10.";
        return;
    }

    agregarAlCarrito(productoSeleccionado, pedidoTalla.value, cantidad);
    modalPedido.close();
    mostrarAviso("Agregado al carrito 🛒");
}

if (productosGrid && modalPedido) {
    crearTarjetasProductos();
    pedidoCantidad.addEventListener("input", actualizarTotal);
    botonAgregarCarrito.addEventListener("click", confirmarAgregado);
}

// ============================================
// CARRITO DE COMPRAS
// ============================================
// Cada elemento del carrito: { id, talla, cantidad }
// Se guarda en localStorage para que no se pierda al recargar.

const botonCarrito = document.getElementById("botonCarrito");
const contadorCarrito = document.getElementById("contadorCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const panelCarrito = document.getElementById("panelCarrito");
const fondoCarrito = document.getElementById("fondoCarrito");
const cerrarCarritoBoton = document.getElementById("cerrarCarrito");
const listaCarrito = document.getElementById("listaCarrito");
const carritoVacio = document.getElementById("carritoVacio");
const carritoPie = document.getElementById("carritoPie");
const carritoTotal = document.getElementById("carritoTotal");
const botonEnviarPedido = document.getElementById("botonEnviarPedido");
const botonVaciarCarrito = document.getElementById("botonVaciarCarrito");
const mensajeCarrito = document.getElementById("mensajeCarrito");

// Cargamos el carrito guardado (ignorando productos que ya no existan)
let carrito = leerAlmacen("misha_carrito", []).filter((item) =>
    productosMisha.some((producto) => producto.id === item.id)
);

function buscarProducto(id) {
    return productosMisha.find((producto) => producto.id === id);
}

function guardarCarrito() {
    guardarAlmacen("misha_carrito", carrito);
}

function agregarAlCarrito(producto, talla, cantidad) {
    const existente = carrito.find((item) => item.id === producto.id && item.talla === talla);

    if (existente) {
        existente.cantidad = Math.min(existente.cantidad + cantidad, 10);
    } else {
        carrito.push({ id: producto.id, talla: talla, cantidad: cantidad });
    }

    guardarCarrito();
    dibujarCarrito();
}

function calcularTotalCarrito() {
    return carrito.reduce((suma, item) => suma + buscarProducto(item.id).precio * item.cantidad, 0);
}

// Redibuja la lista, el contador y los totales
function dibujarCarrito() {
    const totalProductos = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    const total = calcularTotalCarrito();

    contadorCarrito.textContent = totalProductos;
    totalCarrito.textContent = formatearSoles(total);
    carritoTotal.textContent = formatearSoles(total);

    const hayProductos = carrito.length > 0;
    carritoVacio.hidden = hayProductos;
    carritoPie.hidden = !hayProductos;

    listaCarrito.innerHTML = "";

    carrito.forEach((item) => {
        const producto = buscarProducto(item.id);
        const li = document.createElement("li");
        li.className = "carrito-item";
        li.innerHTML = `
            <div class="carrito-item-foto">
                ${emojiPorCategoria[producto.categoria]}
                <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.remove()">
            </div>
            <div class="carrito-item-datos">
                <p class="carrito-item-nombre">${producto.nombre}</p>
                <p class="carrito-item-detalle">Talla: ${item.talla} · ${formatearSoles(producto.precio)}</p>
                <div class="carrito-item-controles">
                    <button type="button" data-accion="restar" data-id="${item.id}" data-talla="${item.talla}" aria-label="Quitar una unidad">−</button>
                    <span>${item.cantidad}</span>
                    <button type="button" data-accion="sumar" data-id="${item.id}" data-talla="${item.talla}" aria-label="Agregar una unidad">+</button>
                    <button type="button" class="boton-quitar" data-accion="quitar" data-id="${item.id}" data-talla="${item.talla}">Quitar</button>
                </div>
            </div>
            <span class="carrito-item-subtotal">${formatearSoles(producto.precio * item.cantidad)}</span>
        `;
        listaCarrito.appendChild(li);
    });
}

// Un solo "oyente" para todos los botones + − Quitar de la lista
listaCarrito.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const { accion, id, talla } = boton.dataset;
    const item = carrito.find((elemento) => elemento.id === id && elemento.talla === talla);
    if (!item) return;

    if (accion === "sumar") {
        item.cantidad = Math.min(item.cantidad + 1, 10);
    } else if (accion === "restar") {
        item.cantidad -= 1;
    } else if (accion === "quitar") {
        item.cantidad = 0;
    }

    // Si la cantidad llegó a 0 se elimina del carrito
    carrito = carrito.filter((elemento) => elemento.cantidad > 0);
    guardarCarrito();
    dibujarCarrito();
});

function abrirCarrito() {
    mensajeCarrito.textContent = "";
    panelCarrito.classList.add("abierto");
    fondoCarrito.classList.add("abierto");
    panelCarrito.setAttribute("aria-hidden", "false");
}

function cerrarCarrito() {
    panelCarrito.classList.remove("abierto");
    fondoCarrito.classList.remove("abierto");
    panelCarrito.setAttribute("aria-hidden", "true");
}

botonCarrito.addEventListener("click", abrirCarrito);
cerrarCarritoBoton.addEventListener("click", cerrarCarrito);
fondoCarrito.addEventListener("click", cerrarCarrito);
document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrarCarrito();
});

botonVaciarCarrito.addEventListener("click", () => {
    carrito = [];
    guardarCarrito();
    dibujarCarrito();
});

// Guarda el pedido en el servidor y, si sale bien, abre WhatsApp con el resumen
async function enviarPedidoPorWhatsApp() {
    const usuario = usuarioActual();

    // Para finalizar la compra pedimos iniciar sesión
    if (!usuario) {
        cerrarCarrito();
        abrirCuenta("login", "Inicia sesión para finalizar tu pedido 🐾");
        return;
    }

    // Abrimos la pestaña de WhatsApp AHORA, mientras dura el clic de la persona.
    // Si esperáramos a que responda el servidor, muchos navegadores (sobre todo
    // en celulares) la bloquearían como ventana emergente. Más abajo le ponemos el enlace.
    const ventanaWhatsApp = window.open("", "_blank");

    // Mientras esperamos al servidor, la pestaña nueva muestra un mensaje en vez de verse en blanco
    if (ventanaWhatsApp) {
        ventanaWhatsApp.document.write(
            '<p style="font-family:sans-serif;text-align:center;margin-top:30vh">Preparando tu pedido… 🐾</p>'
        );
    }

    botonEnviarPedido.disabled = true;
    mensajeCarrito.textContent = "Guardando tu pedido...";

    // Enviamos SOLO id, talla y cantidad: el servidor pone los precios y calcula el total
    const itemsDelPedido = carrito.map((item) => ({
        id: item.id,
        talla: item.talla,
        cantidad: item.cantidad,
    }));

    const token = leerAlmacen(CLAVE_TOKEN, null);
    const resultado = await pedirAlServidor("/api/pedidos", "POST", { items: itemsDelPedido }, token);
    botonEnviarPedido.disabled = false;

    // ---- Si algo salió mal, cerramos la pestaña en blanco y avisamos ----
    if (!resultado.ok) {
        if (ventanaWhatsApp) ventanaWhatsApp.close();

        // 401 = el token venció o ya no es válido: hay que iniciar sesión otra vez
        if (resultado.estado === 401) {
            guardarAlmacen(CLAVE_TOKEN, null);
            usuarioSesion = null;
            actualizarBotonCuenta();
            cerrarCarrito();
            abrirCuenta("login", "Tu sesión expiró. Inicia sesión de nuevo 🐾");
            return;
        }

        mensajeCarrito.textContent = resultado.datos.mensaje;
        return;
    }

    // ---- El pedido ya está guardado: armamos el mensaje con los datos del SERVIDOR ----
    const pedido = resultado.datos.pedido;

    const lineas = pedido.items.map((item) => {
        return `• ${item.nombre} | Talla: ${item.talla} | Cant: ${item.cantidad} | ${formatearSoles(item.subtotal)}`;
    });

    const mensaje =
        `Hola, quiero confirmar mi pedido N.º ${pedido.id} de la tienda de Misha\n` +
        lineas.join("\n") + "\n" +
        `• Total: ${formatearSoles(pedido.total)}\n` +
        `• A nombre de: ${nombreCompleto(usuario)} (${usuario.correo})\n` +
        (usuario.celular ? `• Celular: ${usuario.celular}\n` : "") +
        "Te envío la captura de mi pago por Yape.";

    const enlace = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

    // El pedido quedó registrado: vaciamos el carrito para no enviarlo dos veces
    carrito = [];
    guardarCarrito();
    dibujarCarrito();
    mensajeCarrito.textContent = "";
    cerrarCarrito();
    mostrarAviso(`Pedido N.º ${pedido.id} registrado ✅`);

    // Lo último: llevamos la pestaña a WhatsApp (si el navegador la bloqueó, usamos esta misma)
    if (ventanaWhatsApp) {
        ventanaWhatsApp.opener = null;
        ventanaWhatsApp.location.href = enlace;
    } else {
        window.location.href = enlace;
    }
}

botonEnviarPedido.addEventListener("click", enviarPedidoPorWhatsApp);

dibujarCarrito();

// ============================================
// CUENTA: REGISTRO, SESIÓN, PEDIDOS, DATOS Y CONTRASEÑA (conectada al servidor Express)
// ============================================
// Las cuentas viven en la base de datos del servidor (SQLite) y las contraseñas
// se guardan con bcrypt. En el navegador solo guardamos el TOKEN de sesión (JWT).

const botonCuenta = document.getElementById("botonCuenta");
const textoCuenta = document.getElementById("textoCuenta");
const modalCuenta = document.getElementById("modalCuenta");
const avisoCuenta = document.getElementById("avisoCuenta");
const mensajeCuenta = document.getElementById("mensajeCuenta");

const vistaLogin = document.getElementById("vistaLogin");
const vistaRegistro = document.getElementById("vistaRegistro");
const vistaSesion = document.getElementById("vistaSesion");

const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");

// Panel de la persona con sesión iniciada
const listaPedidos = document.getElementById("listaPedidos");
const resumenPedidos = document.getElementById("resumenPedidos");
const formDatos = document.getElementById("formDatos");
const formClave = document.getElementById("formClave");
const mensajeDatos = document.getElementById("mensajeDatos");
const mensajeClave = document.getElementById("mensajeClave");
const botonSeguirComprando = document.getElementById("botonSeguirComprando");

// Nombre con el que guardamos el token en el navegador (localStorage)
const CLAVE_TOKEN = "misha_token";

// Datos de la persona con sesión iniciada: { nombre, apellidos, celular, correo }, o null
let usuarioSesion = null;

// Letras (con tildes y ñ), espacios, apóstrofes, puntos y guiones: de 2 a 60 caracteres
const regexNombre = /^[\p{L}][\p{L}\s'’.-]{1,59}$/u;

// Celular peruano: 9 dígitos y empieza con 9
const regexCelular = /^9\d{8}$/;

// ---- Ayudas para limpiar lo que escribe la persona ----

// Quita espacios de los costados y deja un solo espacio entre palabras
function limpiarTexto(texto) {
    return texto.trim().replace(/\s+/g, " ");
}

// Deja solo los dígitos del celular (y quita el prefijo +51 si lo escribió)
function limpiarCelular(texto) {
    let digitos = texto.replace(/\D/g, "");
    if (digitos.length === 11 && digitos.startsWith("51")) {
        digitos = digitos.slice(2);
    }
    return digitos;
}

// Devuelve el mensaje de error, o null si los datos personales están bien
function validarDatosPersonales(nombres, apellidos, celular) {
    if (!regexNombre.test(nombres)) return "Escribe tus nombres (solo letras).";
    if (!regexNombre.test(apellidos)) return "Escribe tus apellidos (solo letras).";
    if (!regexCelular.test(celular)) return "Ingresa un celular válido de 9 dígitos que empiece con 9.";
    return null;
}

// ---- Despertar al servidor ----
// Hora hasta la cual damos por despierto al servidor (no preguntamos de nuevo antes)
let servidorDespiertoHasta = 0;

// Pregunta a /api/salud hasta que el servidor responda. Si está dormido, avisa a la persona.
// Devuelve true si el servidor está listo, o false si no respondió a tiempo.
async function asegurarServidorDespierto() {
    // Si hace poco comprobamos que estaba despierto, no volvemos a preguntar
    if (Date.now() < servidorDespiertoHasta) return true;

    const inicio = Date.now();
    let ocultarAvisoLento = null;

    // Si tarda más de 3 segundos, avisamos para que la persona sepa que la página no se trabó
    const temporizadorLento = setTimeout(() => {
        ocultarAvisoLento = mostrarAvisoDespertando();
    }, 3000);

    let despierto = false;

    while (!despierto && Date.now() - inicio < TIEMPO_MAXIMO_ESPERA) {
        try {
            // Cada intento se corta a los 10 segundos para poder volver a intentar
            const controlador = new AbortController();
            const corte = setTimeout(() => controlador.abort(), 10000);
            const respuesta = await fetch(`${URL_SERVIDOR}/api/salud`, { signal: controlador.signal });
            clearTimeout(corte);
            despierto = respuesta.ok;
        } catch (error) {
            despierto = false;   // el servidor aún no responde: probamos otra vez en un momento
        }

        if (!despierto) await esperar(2000);
    }

    clearTimeout(temporizadorLento);
    if (ocultarAvisoLento) ocultarAvisoLento();

    // Los servidores gratuitos se duermen a los 15 minutos: damos por despierto 10 minutos
    if (despierto) {
        servidorDespiertoHasta = Date.now() + 10 * 60 * 1000;
    } else {
        // Pista para ti: abre la consola del navegador (F12) y mira a qué dirección intentó llegar
        console.warn(`No se pudo conectar con el servidor: ${URL_SERVIDOR}`);
    }

    return despierto;
}

// Muestra "Despertando el servidor..." donde la persona SÍ lo vea.
// Una ventana abierta (<dialog>) tapa todo lo demás, incluido el aviso flotante de abajo,
// así que en ese caso ponemos el mensaje DENTRO de la ventana.
// Devuelve una función que quita el aviso.
function mostrarAvisoDespertando() {
    const texto = "⏳ Despertando el servidor... puede tardar hasta un minuto.";
    const ventana = document.querySelector("dialog[open]");

    if (!ventana) {
        mostrarAviso(texto, 0);
        return ocultarAviso;
    }

    const aviso = crearElemento("p", "aviso-servidor", texto);
    aviso.setAttribute("role", "status");
    ventana.prepend(aviso);

    return () => aviso.remove();
}

// Habla con el servidor y SIEMPRE devuelve { ok, estado, datos, sinConexion }
//  - ok: true si el servidor respondió con éxito
//  - estado: el código HTTP (200, 400, 401...), o 0 si no hubo conexión
//  - datos: el JSON que respondió el servidor (ej: { mensaje: "..." })
//  - sinConexion: true si no se pudo llegar al servidor (apagado o sin internet)
async function pedirAlServidor(ruta, metodo, cuerpo, token) {
    const sinConexion = {
        ok: false,
        estado: 0,
        datos: { mensaje: MENSAJE_SIN_CONEXION },
        sinConexion: true,
    };

    // 1) Primero nos aseguramos de que el servidor esté despierto (así la petición real
    //    se envía UNA sola vez: nunca se duplica un pedido por reintentar)
    if (!(await asegurarServidorDespierto())) {
        return sinConexion;
    }

    const encabezados = { "Content-Type": "application/json" };

    // Si hay token, lo enviamos para que el servidor sepa quiénes somos
    if (token) {
        encabezados["Authorization"] = `Bearer ${token}`;
    }

    // 2) Hacemos la petición real, con un límite de 20 segundos
    const controlador = new AbortController();
    const corte = setTimeout(() => controlador.abort(), 20000);

    try {
        const respuesta = await fetch(`${URL_SERVIDOR}${ruta}`, {
            method: metodo,
            headers: encabezados,
            body: cuerpo ? JSON.stringify(cuerpo) : undefined,
            signal: controlador.signal,
        });

        const datos = await respuesta.json();
        return { ok: respuesta.ok, estado: respuesta.status, datos: datos, sinConexion: false };
    } catch (error) {
        servidorDespiertoHasta = 0;   // algo falló: la próxima vez volvemos a comprobar
        return sinConexion;
    } finally {
        clearTimeout(corte);
    }
}

// Devuelve { nombre, apellidos, celular, correo } si hay sesión iniciada, o null si no
// (el carrito usa esta función para pedir iniciar sesión antes de enviar el pedido)
function usuarioActual() {
    return usuarioSesion;
}

// "Angel Rafael" + "Caldas Ocmín" -> "Angel Rafael Caldas Ocmín"
// (las cuentas antiguas no tienen apellidos: en ese caso solo sale el nombre)
function nombreCompleto(usuario) {
    return [usuario.nombre, usuario.apellidos].filter(Boolean).join(" ");
}

// Guarda el token y los datos de la persona después de iniciar sesión
function guardarSesion(datosLogin) {
    guardarAlmacen(CLAVE_TOKEN, datosLogin.token);
    usuarioSesion = datosLogin.usuario;
    actualizarBotonCuenta();
}

// Cambia el texto del botón de la barra: "Ingresar" o el primer nombre de la persona
function actualizarBotonCuenta() {
    textoCuenta.textContent = usuarioSesion ? usuarioSesion.nombre.split(" ")[0] : "Ingresar";
}

// Crea un elemento con clase y texto. Usamos textContent (no innerHTML) para que
// nada de lo que venga del servidor pueda meter código raro en la página.
function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

// Escribe un mensaje en un <p> de mensajes ("exito" lo pinta de verde)
function mostrarMensajeEn(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = "mensaje-pedido " + (tipo || "");
}

// Muestra solo una de las 3 vistas de la ventana
function mostrarVistaCuenta(nombreVista) {
    vistaLogin.hidden = nombreVista !== "login";
    vistaRegistro.hidden = nombreVista !== "registro";
    vistaSesion.hidden = nombreVista !== "sesion";
    mensajeCuenta.textContent = "";
    mensajeCuenta.className = "mensaje-pedido";
}

function mensajeEnCuenta(texto, tipo) {
    mostrarMensajeEn(mensajeCuenta, texto, tipo);
}

// ---- Pestañas del panel (Mis pedidos / Mis datos / Contraseña) ----
const pestanasCuenta = document.querySelectorAll(".cuenta-pestana");

function mostrarPanel(idPanel) {
    pestanasCuenta.forEach((pestana) => {
        pestana.classList.toggle("activa", pestana.dataset.panel === idPanel);
    });
    document.querySelectorAll(".cuenta-panel").forEach((panel) => {
        panel.hidden = panel.id !== idPanel;
    });
}

pestanasCuenta.forEach((pestana) => {
    pestana.addEventListener("click", () => mostrarPanel(pestana.dataset.panel));
});

// ---- Historial de pedidos ----

// El servidor guarda la fecha en hora UTC ("2026-10-16 05:48:20"): la pasamos a hora de Lima
function formatearFechaLima(textoFecha) {
    const fecha = new Date(textoFecha.replace(" ", "T") + "Z");
    return fecha.toLocaleString("es-PE", {
        timeZone: "America/Lima",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Dibuja un <details> por cada pedido: se ve el resumen y al hacer clic se despliegan los productos
function dibujarPedidos(pedidos) {
    listaPedidos.innerHTML = "";

    if (pedidos.length === 0) {
        resumenPedidos.textContent = "";
        listaPedidos.appendChild(
            crearElemento("li", "pedidos-vacio", "Aún no tienes pedidos. ¡Misha te espera en la tienda! 🐾")
        );
        return;
    }

    resumenPedidos.textContent =
        pedidos.length === 1 ? "Tienes 1 pedido registrado." : `Tienes ${pedidos.length} pedidos registrados.`;

    pedidos.forEach((pedido) => {
        const detalles = crearElemento("details", "pedido");

        // Lo que se ve siempre: número, total, fecha y estado
        const resumen = document.createElement("summary");
        resumen.appendChild(crearElemento("span", "pedido-numero", `Pedido N.º ${pedido.id}`));
        resumen.appendChild(crearElemento("span", "pedido-total", formatearSoles(pedido.total)));
        resumen.appendChild(crearElemento("span", "pedido-fecha", formatearFechaLima(pedido.fecha)));
        resumen.appendChild(crearElemento("span", "pedido-estado estado-" + pedido.estado, pedido.estado));
        detalles.appendChild(resumen);

        // Lo que se despliega: cada producto con su cantidad y subtotal
        const productos = crearElemento("ul", "pedido-productos");
        pedido.items.forEach((item) => {
            const fila = document.createElement("li");

            const descripcion = crearElemento("span", "", `${item.cantidad} × ${item.nombre}`);
            descripcion.appendChild(crearElemento("small", "pedido-producto-talla", `Talla: ${item.talla}`));

            fila.appendChild(descripcion);
            fila.appendChild(crearElemento("span", "pedido-producto-subtotal", formatearSoles(item.subtotal)));
            productos.appendChild(fila);
        });
        detalles.appendChild(productos);

        const elementoLista = document.createElement("li");
        elementoLista.appendChild(detalles);
        listaPedidos.appendChild(elementoLista);
    });
}

// Pide al servidor los pedidos de la persona y los dibuja
async function cargarPedidos() {
    resumenPedidos.textContent = "";
    listaPedidos.innerHTML = "";
    listaPedidos.appendChild(crearElemento("li", "pedidos-vacio", "Cargando tus pedidos..."));

    const token = leerAlmacen(CLAVE_TOKEN, null);
    const resultado = await pedirAlServidor("/api/mis-pedidos", "GET", null, token);

    if (!resultado.ok) {
        listaPedidos.innerHTML = "";
        listaPedidos.appendChild(crearElemento("li", "pedidos-vacio", resultado.datos.mensaje));
        return;
    }

    dibujarPedidos(resultado.datos.pedidos);
}

// ---- Abrir la ventana de la cuenta ----

// Llena el saludo y el formulario "Mis datos" con la información de la persona
function prepararVistaSesion(usuario) {
    document.getElementById("nombreUsuario").textContent = nombreCompleto(usuario);
    document.getElementById("correoUsuario").textContent = usuario.correo;

    document.getElementById("datosNombres").value = usuario.nombre;
    document.getElementById("datosApellidos").value = usuario.apellidos || "";
    document.getElementById("datosCelular").value = usuario.celular || "";
    document.getElementById("datosCorreo").value = usuario.correo;

    formClave.reset();
    mostrarMensajeEn(mensajeDatos, "");
    mostrarMensajeEn(mensajeClave, "");
    mostrarPanel("panelPedidos");
}

function abrirCuenta(vista, aviso) {
    const usuario = usuarioActual();

    if (usuario) {
        prepararVistaSesion(usuario);
        mostrarVistaCuenta("sesion");
    } else {
        mostrarVistaCuenta(vista || "login");
    }

    avisoCuenta.textContent = aviso || "";
    if (!modalCuenta.open) modalCuenta.showModal();

    // Con sesión iniciada, traemos el historial actualizado
    if (usuario) cargarPedidos();
}

botonCuenta.addEventListener("click", () => abrirCuenta("login"));

document.getElementById("irARegistro").addEventListener("click", (evento) => {
    evento.preventDefault();
    mostrarVistaCuenta("registro");
});

document.getElementById("irALogin").addEventListener("click", (evento) => {
    evento.preventDefault();
    mostrarVistaCuenta("login");
});

// ---- Crear cuenta ----
formRegistro.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombre = limpiarTexto(document.getElementById("registroNombres").value);
    const apellidos = limpiarTexto(document.getElementById("registroApellidos").value);
    const celular = limpiarCelular(document.getElementById("registroCelular").value);
    const correo = document.getElementById("registroCorreo").value.trim().toLowerCase();
    const clave = document.getElementById("registroClave").value;
    const clave2 = document.getElementById("registroClave2").value;

    // 1) Validaciones rápidas en la página (el servidor las vuelve a hacer)
    const errorDatos = validarDatosPersonales(nombre, apellidos, celular);
    if (errorDatos) {
        mensajeEnCuenta(errorDatos);
        return;
    }
    if (!regexCorreo.test(correo)) {
        mensajeEnCuenta("Ingresa un correo válido.");
        return;
    }
    if (clave.length < 6) {
        mensajeEnCuenta("La contraseña debe tener al menos 6 caracteres.");
        return;
    }
    if (clave !== clave2) {
        mensajeEnCuenta("Las contraseñas no coinciden.");
        return;
    }

    // 2) Desactivamos el botón para evitar envíos dobles
    const botonEnviar = formRegistro.querySelector('button[type="submit"]');
    botonEnviar.disabled = true;
    mensajeEnCuenta("Creando tu cuenta...");

    // 3) Le pedimos al servidor que cree la cuenta
    const registro = await pedirAlServidor("/api/registro", "POST", { nombre, apellidos, celular, correo, clave });

    if (!registro.ok) {
        mensajeEnCuenta(registro.datos.mensaje);
        botonEnviar.disabled = false;
        return;
    }

    // 4) La cuenta ya existe: iniciamos sesión automáticamente para recibir el token
    const login = await pedirAlServidor("/api/login", "POST", { correo, clave });
    botonEnviar.disabled = false;

    if (!login.ok) {
        mostrarVistaCuenta("login");
        mensajeEnCuenta("Tu cuenta fue creada. Inicia sesión para continuar.", "exito");
        return;
    }

    guardarSesion(login.datos);
    formRegistro.reset();
    modalCuenta.close();
    mostrarAviso(`¡Bienvenido/a, ${login.datos.usuario.nombre.split(" ")[0]}! 🐱`);
});

// ---- Iniciar sesión ----
formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const correo = document.getElementById("loginCorreo").value.trim().toLowerCase();
    const clave = document.getElementById("loginClave").value;

    if (!regexCorreo.test(correo) || clave.length === 0) {
        mensajeEnCuenta("Escribe tu correo y tu contraseña.");
        return;
    }

    const botonEnviar = formLogin.querySelector('button[type="submit"]');
    botonEnviar.disabled = true;
    mensajeEnCuenta("Iniciando sesión...");

    // El servidor compara la contraseña con el hash guardado y nos da un token
    const login = await pedirAlServidor("/api/login", "POST", { correo, clave });
    botonEnviar.disabled = false;

    if (!login.ok) {
        mensajeEnCuenta(login.datos.mensaje);
        return;
    }

    guardarSesion(login.datos);
    formLogin.reset();
    modalCuenta.close();
    mostrarAviso(login.datos.mensaje);
});

// ---- Mis datos: guardar cambios ----
formDatos.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombre = limpiarTexto(document.getElementById("datosNombres").value);
    const apellidos = limpiarTexto(document.getElementById("datosApellidos").value);
    const celular = limpiarCelular(document.getElementById("datosCelular").value);

    const errorDatos = validarDatosPersonales(nombre, apellidos, celular);
    if (errorDatos) {
        mostrarMensajeEn(mensajeDatos, errorDatos);
        return;
    }

    const botonEnviar = formDatos.querySelector('button[type="submit"]');
    botonEnviar.disabled = true;
    mostrarMensajeEn(mensajeDatos, "Guardando...");

    const token = leerAlmacen(CLAVE_TOKEN, null);
    const resultado = await pedirAlServidor("/api/perfil", "PUT", { nombre, apellidos, celular }, token);
    botonEnviar.disabled = false;

    if (!resultado.ok) {
        mostrarMensajeEn(mensajeDatos, resultado.datos.mensaje);
        return;
    }

    // Actualizamos lo que se ve en pantalla con los datos que confirmó el servidor
    usuarioSesion = resultado.datos.usuario;
    actualizarBotonCuenta();
    prepararVistaSesion(usuarioSesion);
    mostrarPanel("panelDatos");
    mostrarMensajeEn(mensajeDatos, resultado.datos.mensaje, "exito");
});

// ---- Cambiar contraseña ----
formClave.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const claveActual = document.getElementById("claveActual").value;
    const claveNueva = document.getElementById("claveNueva").value;
    const claveNueva2 = document.getElementById("claveNueva2").value;

    if (claveActual.length === 0) {
        mostrarMensajeEn(mensajeClave, "Escribe tu contraseña actual.");
        return;
    }
    if (claveNueva.length < 6) {
        mostrarMensajeEn(mensajeClave, "La contraseña nueva debe tener al menos 6 caracteres.");
        return;
    }
    if (claveNueva !== claveNueva2) {
        mostrarMensajeEn(mensajeClave, "Las contraseñas nuevas no coinciden.");
        return;
    }
    if (claveNueva === claveActual) {
        mostrarMensajeEn(mensajeClave, "La contraseña nueva debe ser distinta a la actual.");
        return;
    }

    const botonEnviar = formClave.querySelector('button[type="submit"]');
    botonEnviar.disabled = true;
    mostrarMensajeEn(mensajeClave, "Guardando...");

    const token = leerAlmacen(CLAVE_TOKEN, null);
    const resultado = await pedirAlServidor("/api/clave", "PUT", { claveActual, claveNueva }, token);
    botonEnviar.disabled = false;

    if (!resultado.ok) {
        mostrarMensajeEn(mensajeClave, resultado.datos.mensaje);
        return;
    }

    formClave.reset();
    mostrarMensajeEn(mensajeClave, resultado.datos.mensaje, "exito");
});

// ---- Seguir comprando: cierra la ventana y baja a los productos ----
botonSeguirComprando.addEventListener("click", () => {
    modalCuenta.close();
    document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
});

// ---- Cerrar sesión ----
// Borramos el token del navegador y listo
document.getElementById("botonCerrarSesion").addEventListener("click", () => {
    guardarAlmacen(CLAVE_TOKEN, null);
    usuarioSesion = null;
    actualizarBotonCuenta();
    modalCuenta.close();
    mostrarAviso("Sesión cerrada 👋");
});

// ---- Recordar la sesión al recargar la página ----
// Si hay un token guardado, se lo mostramos al servidor (/api/perfil)
// para confirmar que sigue siendo válido y recuperar los datos de la persona.
async function restaurarSesion() {
    const token = leerAlmacen(CLAVE_TOKEN, null);
    if (!token) return;

    const resultado = await pedirAlServidor("/api/perfil", "GET", null, token);

    if (resultado.ok) {
        usuarioSesion = resultado.datos.usuario;
    } else if (!resultado.sinConexion) {
        // El servidor sí respondió pero el token ya no sirve (venció o es falso): lo borramos
        guardarAlmacen(CLAVE_TOKEN, null);
    }
    // Si el servidor estaba apagado, conservamos el token para el próximo intento

    actualizarBotonCuenta();
}

actualizarBotonCuenta();
restaurarSesion();