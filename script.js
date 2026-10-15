const container = document.getElementById('Container');
const detailContainer = document.getElementById('detailContainer');
const armCounter = document.getElementById('armCounter');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const previousBtn = document.getElementById('previousBtn');
const nextBtn = document.getElementById('nextBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');

const weaponsPerPage = 4;
let armas = [];
let armasFiltradas = [];
let paginaActual = 1;

// Carga las armas desde el archivo JSON.
async function cargarArmas() {
    loading.classList.remove('hidden');

    try {
        if (window.location.protocol === 'file:') {
            throw new Error('Abrí la página desde un servidor local (Live Server o python -m http.server).');
        }

        const response = await fetch('./armas.json');

        if (!response.ok) {
            throw new Error('No se pudo cargar armas.json');
        }

        armas = await response.json();
        armasFiltradas = armas;
        renderizarPagina();
        mostrarDetalle(null);
    } catch (error) {
        console.error(error);
        mostrarError('No se pudieron cargar las armas.');
    } finally {
        loading.classList.add('hidden');
    }
}

// Muestra en pantalla las armas de la página actual.
function renderizarPagina() {
    const inicio = (paginaActual - 1) * weaponsPerPage;
    const fin = inicio + weaponsPerPage;
    const armasPagina = armasFiltradas.slice(inicio, fin);

    container.innerHTML = '';

    if (armasPagina.length === 0) {
        container.innerHTML = '<p style="color: #9fb5c9;">No se encontraron armas.</p>';
        armCounter.textContent = '0 Armas';
        actualizarBotonesPaginacion();
        return;
    }

    for (let i = 0; i < armasPagina.length; i++) {
        const arma = armasPagina[i];
        const card = document.createElement('article');
        card.className = 'arm-card';
        card.innerHTML = `
            <img src="${arma.imagen}" alt="${arma.nombre}">
            <div class="arm-card-body">
                <h3>${arma.nombre}</h3>
                <p>${arma.tipo}</p>
            </div>
        `;

        card.addEventListener('click', function () {
            const cards = document.querySelectorAll('.arm-card');

            for (let j = 0; j < cards.length; j++) {
                cards[j].classList.remove('active');
            }

            card.classList.add('active');
            mostrarDetalle(arma);
        });

        container.appendChild(card);
    }

    armCounter.textContent = armasFiltradas.length + ' Armas';
    actualizarBotonesPaginacion();
}

function actualizarBotonesPaginacion() {
    const totalPaginas = Math.max(1, Math.ceil(armasFiltradas.length / weaponsPerPage));

    previousBtn.disabled = paginaActual === 1;
    nextBtn.disabled = paginaActual === totalPaginas || armasFiltradas.length === 0;
}

function mostrarDetalle(arma) {
    if (!arma) {
        detailContainer.innerHTML = `
            <img src="https://cdna.artstation.com/p/assets/images/images/025/645/082/large/vladyslav-liedienov-first-terrorist5.jpg?1586457106" alt="CSGO">
            <h2>valorant</h2>
            <p>Selecciona un arma para ver sus estadisticas</p>
        `;
        return;
    }

    detailContainer.innerHTML = `
        <img src="${arma.imagen}" alt="${arma.nombre}">
        <h2>${arma.nombre}</h2>
        <p><strong>Tipo:</strong> ${arma.tipo}</p>
        <p><strong>Precio:</strong> $${arma.precio}</p>
        <p><strong>Daño:</strong> ${arma.daño}</p>
    `;
}

// Busca por nombre o tipo.
function buscarArmas() {
    const texto = searchInput.value.trim().toLowerCase();
    armasFiltradas = [];

    for (let i = 0; i < armas.length; i++) {
        const arma = armas[i];
        const nombre = arma.nombre.toLowerCase();
        const tipo = arma.tipo.toLowerCase();
        if (
            nombre.indexOf(texto) !== -1 ||
            tipo.indexOf(texto) !== -1
        ) {
            armasFiltradas.push(arma);
        }
    }

    paginaActual = 1;
    renderizarPagina();

    if (armasFiltradas.length > 0) {
        mostrarDetalle(armasFiltradas[0]);
    } else {
        mostrarDetalle(null);
    }
}

function mostrarError(mensaje) {
    errorMessage.textContent = mensaje;
    errorMessage.classList.remove('hidden');

    setTimeout(function () {
        errorMessage.classList.add('hidden');
    }, 2500);
}

searchButton.addEventListener('click', buscarArmas);

searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        buscarArmas();
    }
});

// Cambia de página y muestra el detalle de la primera arma de esa página.
function cambiarPagina(direccion) {
    const totalPaginas = Math.ceil(armasFiltradas.length / weaponsPerPage);
    const nuevaPagina = paginaActual + direccion;

    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) {
        return;
    }

    paginaActual = nuevaPagina;
    renderizarPagina();
    mostrarDetalle(armasFiltradas[(paginaActual - 1) * weaponsPerPage]);
}

function paginaAnterior() {
    cambiarPagina(-1);
}

function paginaSiguiente() {
    cambiarPagina(1);
}

previousBtn.addEventListener('click', paginaAnterior);
nextBtn.addEventListener('click', paginaSiguiente);

cargarArmas();