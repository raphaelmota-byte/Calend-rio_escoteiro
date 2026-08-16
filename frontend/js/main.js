const API_URL = "http://127.0.0.1:8000/api";
let calendar ;
let todosEventos = [];

async function buscarEventos() {
    const resposta = await fetch(`${API_URL}/eventos/`);
    const eventos = await resposta.json();

    const eventosFormatados = eventos.map(function(evento) {
        return {
          title: evento.titulo,
          start: evento.data_inicio,
          extendedProps: {
          categoria: evento.categoria,
          secoes: evento.secoes
        }
        };
    });
    todosEventos = eventosFormatados;

    const calendarEl = document.getElementById('calendario');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        events: eventosFormatados ,
        headerToolbar: {
        left: '',
        center: '',
        right: ''
    },
        datesSet: function(info) {
        document.getElementById('titulo-calendario').textContent = info.view.title;
    }

    });

    calendar.render();
}


buscarEventos();

async function buscarCategorias() {
    const resposta = await fetch(`${API_URL}/categorias/`);
    const categorias = await resposta.json();

    const container = document.getElementById('filtro-categorias');

    categorias.forEach(function(categoria) {
        const label = document.createElement('label')
        label.innerHTML = ` <input type="checkbox" value="${categoria.id}" checked>
            ${categoria.nome} ` ;
        container.appendChild(label) ;
    });

}
buscarCategorias();

async function buscarSecoes(){
    const resposta = await fetch(`${API_URL}/secoes/`)
    const secoes = await resposta.json()

    const container = document.getElementById("filtro-secoes")

    secoes.forEach(function(secao){
        const label = document.createElement('label')
        label.innerHTML = ` <input type="checkbox" value="${secao.id}" checked>
            ${secao.nome}` ;
        container.appendChild(label)

    });
}
buscarSecoes();

function aplicarFiltros() {
    const categoriasMarcadas = Array.from(
        document.querySelectorAll('#filtro-categorias input:checked')
    ).map(function(input) {
        return Number(input.value);
    });

    const secoesMarcadas = Array.from(
        document.querySelectorAll('#filtro-secoes input:checked')
    ).map(function(input) {
        return Number(input.value);
    });

    const eventosFiltrados = todosEventos.filter(function(evento) {
        const categoriaOk = categoriasMarcadas.includes(evento.extendedProps.categoria);
        const secaoOk = evento.extendedProps.secoes.some(function(idSecao) {
            return secoesMarcadas.includes(idSecao);
        });
        return categoriaOk && secaoOk;
    });

    calendar.setOption('events', eventosFiltrados);
}

function configurarFiltros() {
    const filtroCategorias = document.getElementById('filtro-categorias');
    const filtroSecoes = document.getElementById('filtro-secoes');

    filtroCategorias.addEventListener('change', aplicarFiltros);
    filtroSecoes.addEventListener('change', aplicarFiltros);
}

configurarFiltros();


function configurarMenu() {
    const btnMenu = document.getElementById('btn-menu');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    btnMenu.addEventListener('click', function() {
        sidebar.classList.toggle('ativo');
        overlay.classList.toggle('ativo');
    });

    overlay.addEventListener('click', function() {
        sidebar.classList.remove('ativo');
        overlay.classList.remove('ativo');
    });
}

configurarMenu();

function configurarBotaoHoje() {
    const btnHoje = document.getElementById('btn-hoje');

    btnHoje.addEventListener('click', function() {
        if (calendar) {
            calendar.today();
        }
    });
}

configurarBotaoHoje();

function configurarNavegacao() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    btnPrev.addEventListener('click', function() {
        if (calendar) {
            calendar.prev();
        }
    });

    btnNext.addEventListener('click', function() {
        if (calendar) {
            calendar.next();
        }
    });
}

configurarNavegacao();