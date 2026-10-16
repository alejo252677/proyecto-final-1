const container = document.getElementById('Container');
const detailContainer = document.getElementById('detailContainer');
const armCounter = document.getElementById('armCounter');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const randomWeaponButton = document.getElementById('randomWeaponButton');
const themeSelect = document.getElementById('themeSelect');
const previousBtn = document.getElementById('previousBtn');
const nextBtn = document.getElementById('nextBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const categoryTitle = document.querySelector('.section-title h2');

const categorias = [
    { nombre: 'Pistolas', tipos: ['pistola', 'revolver'] },
    { nombre: 'Subfusiles', tipos: ['subfusil'] },
    { nombre: 'Francotiradores', tipos: ['francotirador'] },
    { nombre: 'Rifles', tipos: ['rifle'] },
    { nombre: 'Escopetas', tipos: ['escopeta'] }
];
let armas = [];
let armasFiltradas = [];
let paginaActual = 1;

function cambiarTema(modo) {
    const modoFiesta = modo === 'party';
    document.body.dataset.theme = modoFiesta ? 'dark' : modo;
    document.body.classList.toggle('party-mode', modoFiesta);
}

function obtenerCategoria(arma) {
    const tipo = arma.tipo.toLowerCase();
    return categorias.find(function (categoria) {
        return categoria.tipos.some(function (nombreTipo) {
            return tipo.includes(nombreTipo);
        });
    });
}

function obtenerPaginas() {
    return categorias.map(function (categoria) {
        return {
            categoria: categoria,
            armas: armasFiltradas.filter(function (arma) {
                return obtenerCategoria(arma) === categoria;
            })
        };
    }).filter(function (pagina) {
        return pagina.armas.length > 0;
    });
}

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
        randomWeaponButton.disabled = armas.length === 0;
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
    const paginas = obtenerPaginas();
    const pagina = paginas[paginaActual - 1];

    container.innerHTML = '';
    categoryTitle.textContent = pagina ? pagina.categoria.nombre : 'Armas';

    if (!pagina) {
        container.innerHTML = '<p style="color: #9fb5c9;">No se encontraron armas.</p>';
        armCounter.textContent = '0 Armas';
        actualizarBotonesPaginacion();
        return;
    }

    for (let i = 0; i < pagina.armas.length; i++) {
        const arma = pagina.armas[i];
        const card = document.createElement('article');
        card.className = 'arm-card';
        card.dataset.armaId = arma.id;
        card.innerHTML = `
            <img src="${arma.imagen}" alt="${arma.nombre}">
            <div class="arm-card-body">
                <h3>${arma.nombre}</h3>
                <p>${arma.tipo}</p>
            </div>
        `;

        card.addEventListener('click', function () {
            seleccionarArma(arma);
        });

        container.appendChild(card);
    }

    armCounter.textContent = pagina.armas.length + ' Armas';
    actualizarBotonesPaginacion();
}

function seleccionarArma(arma) {
    const cards = document.querySelectorAll('.arm-card');

    for (let i = 0; i < cards.length; i++) {
        cards[i].classList.toggle('active', cards[i].dataset.armaId === String(arma.id));
    }

    mostrarDetalle(arma, true);
}

function seleccionarArmaAleatoria() {
    const armasDisponibles = armas.filter(function (arma) {
        return obtenerCategoria(arma) !== undefined;
    });

    if (armasDisponibles.length === 0) {
        mostrarError('No hay armas disponibles para elegir.');
        return;
    }

    const arma = armasDisponibles[Math.floor(Math.random() * armasDisponibles.length)];
    armasFiltradas = armas;
    searchInput.value = '';

    const paginas = obtenerPaginas();
    const indicePagina = paginas.findIndex(function (pagina) {
        return pagina.armas.includes(arma);
    });

    if (indicePagina === -1) {
        mostrarError('No se pudo mostrar el arma seleccionada.');
        return;
    }

    paginaActual = indicePagina + 1;
    renderizarPagina();
    seleccionarArma(arma);
}

function actualizarBotonesPaginacion() {
    const totalPaginas = obtenerPaginas().length;

    previousBtn.disabled = paginaActual === 1;
    nextBtn.disabled = paginaActual === totalPaginas || totalPaginas === 0;
}

function mostrarDetalle(arma, resaltar) {
    if (!arma) {
        detailContainer.classList.remove('weapon-selected');
        detailContainer.innerHTML = `
            <img src="https://cdna.artstation.com/p/assets/images/images/025/645/082/large/vladyslav-liedienov-first-terrorist5.jpg?1586457106" alt="CSGO">
            <h2>valorant</h2>
            <p>Selecciona un arma para ver sus estadisticas</p>
        `;
        return;
    }

    detailContainer.classList.toggle('weapon-selected', Boolean(resaltar));
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

    const primeraPagina = obtenerPaginas()[0];
    if (primeraPagina) {
        seleccionarArma(primeraPagina.armas[0]);
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
randomWeaponButton.addEventListener('click', seleccionarArmaAleatoria);
themeSelect.addEventListener('change', function () {
    cambiarTema(themeSelect.value);
});

searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        buscarArmas();
    }
});

// Cambia de página sin modificar el arma mostrada en el panel de detalles.
function cambiarPagina(direccion) {
    const paginas = obtenerPaginas();
    const totalPaginas = paginas.length;
    const nuevaPagina = paginaActual + direccion;

    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) {
        return;
    }
    paginaActual = nuevaPagina;
    renderizarPagina();
    renderizarPagina();
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