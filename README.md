# 🐾 Misha la Gata Viral

Página web hecha como proyecto práctico del curso de **Desarrollo Front-End** (Ministerio de Trabajo y Promoción del Empleo), aplicando HTML, CSS y JavaScript desde cero.

🔗 **Demo en vivo:** https://angelcaldasdev.github.io/Misha-Gata-Viral/

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-orange)

## 📖 Sobre el proyecto

Misha es mi gata, y esta página nació como ejercicio para poner en práctica cada módulo del curso: estructura HTML, estilos con CSS (selectores, colores, diseño responsivo), y lógica con JavaScript (variables, funciones, eventos y manejo del DOM). Con el tiempo se fue convirtiendo en un pequeño proyecto real, con funcionalidades que fui agregando por mi cuenta para seguir aprendiendo, como una tienda con carrito de compras y cuentas de usuario.

## ✨ Funcionalidades

### 🐱 Contenido
- **Portada** con tres fotos destacadas y título de Misha
- **Sección "Conoce a Misha"** con su historia y etiquetas (chips) generadas desde JavaScript
- **"Un día en la vida de Misha"**: línea de tiempo con los momentos de su día
- **Galería con carrusel** que muestra varias fotos a la vez, con flechas, indicadores y deslizado táctil (swipe)
- **Enlace a Instagram** de Misha

### 🛍️ Tienda
- **Catálogo de productos** con polos, poleras, suéteres, gorras, bolsas, tazas y medias, generado desde un arreglo de objetos en JavaScript
- **Ventana para elegir talla y cantidad** antes de agregar un producto
- **Ver la foto del producto completa**: al hacer clic en la imagen se abre en grande y sin cortes
- **Carrito de compras** en un panel lateral, con contador, total, botones para sumar, restar y quitar productos, y guardado en `localStorage` para que no se pierda al recargar
- **Cuentas de usuario**: crear cuenta, iniciar sesión y cerrar sesión (los datos se guardan en el navegador, con la contraseña convertida en hash SHA-256; es una implementación de práctica)
- **Pedido por WhatsApp**: al finalizar, se arma el mensaje con todos los productos y el total, y el pago se hace con **Yape**

### 💌 Comunidad
- **Formulario de suscripción** por correo, con validación en JavaScript y conexión a un servidor propio hecho con Node.js y Express (`misha-servidor`)
- **Sección de donaciones** con QR de Yape, para quienes quieran colaborar con su comida

### 📱 Diseño
- **Diseño responsivo**, adaptado a celular, tablet y escritorio

## 🛠️ Tecnologías usadas

- HTML5 semántico (incluye la etiqueta `<dialog>` para las ventanas emergentes)
- CSS3 (Flexbox, Grid, diseño responsivo con media queries, variables CSS)
- JavaScript (vanilla, sin frameworks): manipulación del DOM, eventos, `fetch`, `async/await`, `localStorage` y la API `crypto.subtle`
- Node.js y Express (servidor de suscripciones)
- Google Fonts (Baloo 2 y Nunito)
- Publicado con GitHub Pages

## 🚀 Cómo verlo localmente

1. Clona este repositorio:
   ```bash
   git clone https://github.com/angelcaldasdev/Misha-Gata-Viral.git
   ```
2. Abre `index.html` en tu navegador (o usa la extensión "Live Server" de VS Code).
3. *(Opcional)* Para probar la suscripción por correo, inicia el servidor:
   ```bash
   cd misha-servidor
   npm install
   node server.js
   ```
   El servidor corre en `http://localhost:3000`.

> **Nota:** en la demo de GitHub Pages el formulario de suscripción no guarda correos, porque el servidor todavía solo funciona de forma local.

## 🗺️ Próximos pasos

- Guardar cuentas, suscriptores y pedidos en una **base de datos** a través de Express
- Reemplazar el guardado de cuentas en `localStorage` por registro e inicio de sesión en el servidor
- Crear una tienda más completa con **Java, Spring Boot y Angular**, integrando una **pasarela de pagos** en modo de pruebas (sandbox)
- Publicar el servidor en la nube

## 📚 Contexto de aprendizaje

Este proyecto forma parte de mi camino como **Fullstack Java Developer** (Java, Spring Boot, Angular, TypeScript). Lo construí mientras cursaba el módulo de Front-End del curso del Ministerio de Trabajo, reforzando también con práctica adicional por mi cuenta.

## 👤 Autor

**Angel Caldas** — Estudiante de Ingeniería de Sistemas (UPN) | Fullstack Developer en formación
📷 [Instagram de Misha](https://www.instagram.com/misha.gataviral/)