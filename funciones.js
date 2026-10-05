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