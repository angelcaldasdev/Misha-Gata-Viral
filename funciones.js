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
    { src: "img/misha.jpeg", titulo: "Curioseando por la puerta", fecha: "Actualiza esta fecha" },
    { src: "img/misha2.jpeg", titulo: "Explorando el pasillo", fecha: "Actualiza esta fecha" },
    { src: "img/misha3.jpeg", titulo: "Siesta en su camita", fecha: "Actualiza esta fecha" },
    { src: "img/Misha4.jpeg", titulo: "Vigilando la sala", fecha: "Actualiza esta fecha" },
    { src: "img/Misha5.jpeg", titulo: "De compras con mamá", fecha: "Actualiza esta fecha" },
    { src: "img/Misha6.jpeg", titulo: "Metida entre la ropa", fecha: "Actualiza esta fecha" },
    { src: "img/Misha7.jpeg", titulo: "Hora de comer", fecha: "Actualiza esta fecha" },
    { src: "img/Misha8.jpeg", titulo: "Jugando con la familia", fecha: "Actualiza esta fecha" },
    { src: "img/Misha9.jpeg", titulo: "Estirándose en la torre rascador", fecha: "Actualiza esta fecha" },
    { src: "img/Misha10.jpeg", titulo: "Posando en la cama", fecha: "Actualiza esta fecha" },
    { src: "img/Misha11.jpeg", titulo: "Momento de cariño", fecha: "Actualiza esta fecha" },
    { src: "img/Misha12.jpeg", titulo: "Abrazo con papá", fecha: "Actualiza esta fecha" },
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
            <span class="tarjeta-foto-fecha">${foto.fecha}</span>
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

// ---- SUSCRIPCIÓN POR CORREO ----
// IMPORTANTE: esto es una simulación en el navegador (localStorage).
// Para enviar notificaciones reales por correo cuando subas una foto
// nueva, necesitas un backend o un servicio externo, por ejemplo:
//   - Formspree / Mailchimp / Brevo (antes Sendinblue) para capturar
//     el correo y disparar campañas.
//   - Un pequeño backend propio (Node + Express) que guarde el correo
//     en una base de datos y use un servicio de envío (Resend, SendGrid).
// Por ahora, el formulario valida el correo y lo guarda localmente
// para que puedas probar la experiencia de usuario.

const formSuscripcion = document.getElementById("formSuscripcion");
const inputCorreo = document.getElementById("inputCorreo");
const mensajeSuscripcion = document.getElementById("mensajeSuscripcion");

const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

formSuscripcion.addEventListener("submit", (evento) => {
    // Evita que el formulario recargue la página (comportamiento por defecto)
    evento.preventDefault();

    const correoIngresado = inputCorreo.value.trim();

    if (!regexCorreo.test(correoIngresado)) {
        mostrarMensaje("Por favor ingresa un correo válido.", "error");
        return;
    }

    const suscriptores = obtenerSuscriptores();

    if (suscriptores.includes(correoIngresado)) {
        mostrarMensaje("¡Ese correo ya está suscrito! 🐾", "error");
        return;
    }

    suscriptores.push(correoIngresado);
    localStorage.setItem("suscriptoresMisha", JSON.stringify(suscriptores));

    mostrarMensaje("¡Listo! Te avisaremos con las novedades de Misha 🐱", "exito");
    formSuscripcion.reset();
});

function obtenerSuscriptores() {
    const guardado = localStorage.getItem("suscriptoresMisha");
    return guardado ? JSON.parse(guardado) : [];
}

function mostrarMensaje(texto, tipo) {
    mensajeSuscripcion.textContent = texto;
    mensajeSuscripcion.className = "mensaje-suscripcion " + tipo;
}

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