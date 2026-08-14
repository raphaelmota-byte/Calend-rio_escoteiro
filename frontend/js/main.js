const API_URL = "http://127.0.0.1:8000/api";

async function buscarEventos() {
    const resposta = await fetch(`${API_URL}/eventos/`);
    const eventos = await resposta.json();

    const eventosFormatados = eventos.map(function(evento) {
        return {
          title: evento.titulo,
          start: evento.data_inicio
        };
    });

    const calendarEl = document.getElementById('calendario');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        events: eventosFormatados
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