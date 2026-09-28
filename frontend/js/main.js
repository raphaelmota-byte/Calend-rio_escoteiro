
const config = {
    API_URL : "https://calend-rio-escoteiro.onrender.com/api"
};

const Estado = {
    calendar: null ,
    todosEventos : [],
    coresCategorias : {},

};

const Api = {
  async buscarCategorias() {
        const resposta = await fetch(`${config.API_URL}/categorias/`);
        const categorias = await resposta.json();

        const container = document.getElementById('filtro-categorias');

        categorias.forEach(function(categoria) {
            Estado.coresCategorias[categoria.id] = categoria.cor;

            const label = document.createElement('label');
            label.innerHTML = ` <input type="checkbox" value="${categoria.id}" checked>
                ${categoria.nome} `;
            container.appendChild(label);
        });
    },

    async buscarSecoes() {
        const resposta = await fetch(`${config.API_URL}/secoes/`);
        const secoes = await resposta.json();

        const container = document.getElementById("filtro-secoes");

        secoes.forEach(function(secao){
            const label = document.createElement('label');
            label.innerHTML = ` <input type="checkbox" value="${secao.id}" checked>
                ${secao.nome}`;
            container.appendChild(label);
        });
    },

   async buscarEventos() {
        const resposta = await fetch(`${config.API_URL}/eventos/`);
        const eventos = await resposta.json();

        // Apenas formata e guarda no Estado.todosEventos
        Estado.todosEventos = eventos.map(function(evento) {
            return {
                title: evento.titulo,
                start: evento.data_inicio,
                color: Estado.coresCategorias[evento.categoria] || '#3788d8',
                extendedProps: {
                    categoria: evento.categoria,
                    secoes: evento.secoes
                }
            };
        });
    },
}



const Calendario = {
    renderizar : () => {
        const calendarEl = document.getElementById('calendario');
        
        Estado.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            height: '80vh',
            events: Estado.todosEventos, // Puxa direto do Estado global
            headerToolbar: {
                left: '',
                center: '',
                right: ''
            },
            datesSet: function(info) {
                const data = info.view.currentStart;
                const mes = data.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
                const ano = data.getFullYear();
                document.getElementById('titulo-calendario').textContent = `${mes}/${ano}`;
            }
        });

        Estado.calendar.render();
    },

    navegarHoje() {
        if (Estado.calendar) {
            Estado.calendar.today();
        }
    },

    proximo() {
        if (Estado.calendar) {
            Estado.calendar.next();
        }
    },

    anterior() {
        if (Estado.calendar) {
            Estado.calendar.prev();
        }
    }
        
}


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

    const eventosFiltrados = Estado.todosEventos.filter(function(evento) {
        const categoriaOk = categoriasMarcadas.includes(evento.extendedProps.categoria);
        const secaoOk = evento.extendedProps.secoes.some(function(idSecao) {
            return secoesMarcadas.includes(idSecao);
        });
        return categoriaOk && secaoOk;
    });

    Estado.calendar.setOption('events', eventosFiltrados);
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


function configurarNavegacao() {
   document.getElementById('btn-prev').addEventListener('click', () => Calendario.anterior());
    document.getElementById('btn-next').addEventListener('click', () => Calendario.proximo());
    document.getElementById('btn-hoje').addEventListener('click', () => Calendario.navegarHoje());
}


function mudarTituloHeader(){
    const h1 = document.getElementById("titulo-grupo");
    const tamanhoMinimo = 768;

    if (window.innerWidth <= tamanhoMinimo){
        h1.textContent = '111° GEAR';
    }
    else {
        h1.textContent = '111° GEAR Santos Dumont';
    }
}
 mudarTituloHeader()
 window.addEventListener('resize', mudarTituloHeader);

 async function inicializar() {
   await Api.buscarCategorias();
    await Api.buscarSecoes();
    await Api.buscarEventos(); // Busca os dados primeiro
    
    Calendario.renderizar();   // Desenha o calendário depois
    
    configurarNavegacao();
}

inicializar();