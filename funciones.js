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

function mostrarAviso(texto) {
    avisoFlotante.textContent = texto;
    avisoFlotante.classList.add("visible");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => avisoFlotante.classList.remove("visible"), 2200);
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

// Dirección del servidor. Cuando lo publiques en la nube,
// cambiarás solo esta línea por la URL pública.
const URL_SERVIDOR = "http://localhost:3000";

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

    try {
        const respuesta = await fetch(`${URL_SERVIDOR}/api/suscribirse`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo: correoIngresado }),
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            mostrarMensaje(datos.mensaje, "exito");
            formSuscripcion.reset();
        } else {
            mostrarMensaje(datos.mensaje, "error");
        }
    } catch (error) {
        mostrarMensaje("No se pudo conectar con el servidor 😿", "error");
    } finally {
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

// Arma el mensaje con TODOS los productos y abre WhatsApp
function enviarPedidoPorWhatsApp() {
    const usuario = usuarioActual();

    // Para finalizar la compra pedimos iniciar sesión
    if (!usuario) {
        cerrarCarrito();
        abrirCuenta("login", "Inicia sesión para finalizar tu pedido 🐾");
        return;
    }

    const lineas = carrito.map((item) => {
        const producto = buscarProducto(item.id);
        return `• ${producto.nombre} | Talla: ${item.talla} | Cant: ${item.cantidad} | ${formatearSoles(producto.precio * item.cantidad)}`;
    });

    const mensaje =
        "Hola, quiero hacer un pedido de la tienda de Misha 🐱\n" +
        lineas.join("\n") + "\n" +
        `• Total: ${formatearSoles(calcularTotalCarrito())}\n` +
        `• A nombre de: ${usuario.nombre} (${usuario.correo})\n` +
        "Te envío la captura de mi pago por Yape.";

    const enlace = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    window.open(enlace, "_blank", "noopener");
}

botonEnviarPedido.addEventListener("click", enviarPedidoPorWhatsApp);

dibujarCarrito();

// ============================================
// CUENTA: CREAR CUENTA E INICIAR SESIÓN (conectada al servidor Express)
// ============================================
// Ahora las cuentas viven en la base de datos del servidor (SQLite) y las
// contraseñas se guardan con bcrypt. En el navegador solo guardamos el TOKEN
// de sesión (JWT) que nos entrega el servidor cuando iniciamos sesión.

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

// Nombre con el que guardamos el token en el navegador (localStorage)
const CLAVE_TOKEN = "misha_token";

// Datos de la persona con sesión iniciada: { nombre, correo }, o null si no hay sesión
let usuarioSesion = null;

// Habla con el servidor y SIEMPRE devuelve { ok, datos, sinConexion }
//  - ok: true si el servidor respondió con éxito
//  - datos: el JSON que respondió el servidor (ej: { mensaje: "..." })
//  - sinConexion: true si no se pudo llegar al servidor (apagado o sin internet)
async function pedirAlServidor(ruta, metodo, cuerpo, token) {
    const encabezados = { "Content-Type": "application/json" };

    // Si hay token, lo enviamos para que el servidor sepa quiénes somos
    if (token) {
        encabezados["Authorization"] = `Bearer ${token}`;
    }

    try {
        const respuesta = await fetch(`${URL_SERVIDOR}${ruta}`, {
            method: metodo,
            headers: encabezados,
            body: cuerpo ? JSON.stringify(cuerpo) : undefined,
        });

        const datos = await respuesta.json();
        return { ok: respuesta.ok, datos: datos, sinConexion: false };
    } catch (error) {
        return {
            ok: false,
            datos: { mensaje: "No se pudo conectar con el servidor 😿" },
            sinConexion: true,
        };
    }
}

// Devuelve { nombre, correo } si hay sesión iniciada, o null si no
// (el carrito usa esta función para pedir iniciar sesión antes de enviar el pedido)
function usuarioActual() {
    return usuarioSesion;
}

// Guarda el token y los datos de la persona después de iniciar sesión
function guardarSesion(datosLogin) {
    guardarAlmacen(CLAVE_TOKEN, datosLogin.token);
    usuarioSesion = datosLogin.usuario;
    actualizarBotonCuenta();
}

// Cambia el texto del botón de la barra: "Ingresar" o el nombre de la persona
function actualizarBotonCuenta() {
    textoCuenta.textContent = usuarioSesion ? usuarioSesion.nombre.split(" ")[0] : "Ingresar";
}

// Muestra solo una de las 3 vistas de la ventana
function mostrarVistaCuenta(nombreVista) {
    vistaLogin.hidden = nombreVista !== "login";
    vistaRegistro.hidden = nombreVista !== "registro";
    vistaSesion.hidden = nombreVista !== "sesion";
    mensajeCuenta.textContent = "";
    mensajeCuenta.className = "mensaje-pedido";
}

function abrirCuenta(vista, aviso) {
    const usuario = usuarioActual();

    if (usuario) {
        document.getElementById("nombreUsuario").textContent = usuario.nombre;
        document.getElementById("correoUsuario").textContent = usuario.correo;
        mostrarVistaCuenta("sesion");
    } else {
        mostrarVistaCuenta(vista || "login");
    }

    avisoCuenta.textContent = aviso || "";
    if (!modalCuenta.open) modalCuenta.showModal();
}

function mensajeEnCuenta(texto, tipo) {
    mensajeCuenta.textContent = texto;
    mensajeCuenta.className = "mensaje-pedido " + (tipo || "");
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

    const nombre = document.getElementById("registroNombre").value.trim();
    const correo = document.getElementById("registroCorreo").value.trim().toLowerCase();
    const clave = document.getElementById("registroClave").value;
    const clave2 = document.getElementById("registroClave2").value;

    // 1) Validaciones rápidas en la página (el servidor las vuelve a hacer)
    if (nombre.length < 2) {
        mensajeEnCuenta("Escribe tu nombre.");
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
    const registro = await pedirAlServidor("/api/registro", "POST", { nombre, correo, clave });

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
// para confirmar que sigue siendo válido y recuperar el nombre.
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