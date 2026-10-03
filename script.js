const boton = document.getElementById("botonGirar");
const cinta = document.getElementById("cinta");

const imagenResultado = document.getElementById("imagenResultado");
const nombreResultado = document.getElementById("nombreResultado");

const cuchillos = [
    {
        nombre: "Cuchillo 1",
        imagen: "images/knife1.png"
    },
    {
        nombre: "Cuchillo 2",
        imagen: "images/knife2.png"
    },
    {
        nombre: "Cuchillo 3",
        imagen: "images/knife3.png"
    },
    {
        nombre: "Cuchillo 4",
        imagen: "images/knife4.png"
    },
    {
        nombre: "Cuchillo 5",
        imagen: "images/knife5.png"
    }
];

boton.addEventListener("click", function() {

    boton.disabled = true;

    const numeroAleatorio = Math.floor(Math.random() * cuchillos.length);

    const cuchilloGanador = cuchillos[numeroAleatorio];

    const movimiento = -(numeroAleatorio * 195);

    cinta.style.transform = "translateX(" + movimiento + "px)";

    setTimeout(function() {

        imagenResultado.src = cuchilloGanador.imagen;
        nombreResultado.textContent = cuchilloGanador.nombre;

        boton.disabled = false;

    }, 4000);

});
