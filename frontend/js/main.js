
const config = {
    API_URL : "https://calend-rio-escoteiro.onrender.com/api"
    // API_URL : "http://127.0.0.1:8000/api"
};

const Estado = {
    calendar: null ,
    todosEventos : [],
    coresCategorias : {},
    nomesSecoes: {} ,

};

const Api = {
  async buscarCategorias() {
        const resposta = await fetch(`${config.API_URL}/categorias/`);
        return await resposta.json();

        
    },

    async buscarSecoes() {
        const resposta = await fetch(`${config.API_URL}/secoes/`);
        return await resposta.json();

    },

   async buscarEventos() {
        const resposta = await fetch(`${config.API_URL}/eventos/`);
        return await resposta.json();

       
    },
}



const Calendario = {
    renderizar : () => {
        const containerCalendario = document.getElementById('calendario');
        
        // cria uma nova instancia para o fullcalendar associando ao container e guarda no objeto global
        Estado.calendar = new FullCalendar.Calendar(containerCalendario, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            height: '70vh',


            // FONTE DE DADOS DO CALENDÁRIO:
            // É daqui que o FullCalendar puxa a lista exata do que será desenhado na tela.
            // Usamos a variável da memória (Estado) em vez de um link da API para:
            // 1. Evitar requisições lentas na internet ao mudar de mês , Permitir que os filtros de seções/categorias funcionem instantaneamente.
            // 2. Entregar os dados já com a data formatada e os nomes das seções traduzidos.
            events: Estado.todosEventos, 

            eventClick: function(info) {
                info.jsEvent.preventDefault();

                // 1. Preenche os dados no HTML do Modal
                document.getElementById('modal-titulo').textContent = info.event.title;

                // Formata a data para padrão brasileiro na exibição
                const dataFormatada = info.event.start.toLocaleDateString('pt-BR', { 
                    day: '2-digit', month: '2-digit', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                });
                document.getElementById('modal-data').textContent = dataFormatada.replace(' 00:00', '');
            
                // Dados do extendedProps
                document.getElementById('modal-local').textContent = info.event.extendedProps.local || 'Local a definir';
                document.getElementById('modal-descricao').textContent = info.event.extendedProps.descricao || '';

                const idsSecoes = info.event.extendedProps.secoes || [];

                // Traduz cada número para o nome correspondente guardado no Estado
                const nomesDasSecoes = idsSecoes.map(id => Estado.nomesSecoes[id]);
                            
                // Junta tudo com vírgula e injeta no HTML do Modal
                document.getElementById('modal-secoes').textContent = nomesDasSecoes.join(', ') || 'Geral';

                // 2. Chama o Modal do Bootstrap
                const modalElement = document.getElementById('eventoModal');
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            },
            
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

// ---------------------------------------------------
// EVENTOS
// ----------------------------------------------------

function prepararEventos(eventos){
    Estado.todosEventos = eventos.map(function(evento) {
        let stringInicio = evento.data_inicio;
        if (evento.hora_inicio) stringInicio += 'T' + evento.hora_inicio;

        // Formata Fim
        let stringFim = evento.data_fim;
        if (evento.hora_fim) stringFim += 'T' + evento.hora_fim;

           return {
               title: evento.titulo,
               start: stringInicio,
               end: stringFim ,
               color: Estado.coresCategorias[evento.categoria] || '#3788d8',
               display: 'block',

               extendedProps: {
                   categoria: evento.categoria,
                   secoes: evento.secoes  ,
                   descricao: evento.descricao,
                   local: evento.local
               }
           };
       });
}


function renderizarCategorias(categorias){
    const container = document.getElementById('filtro-categorias');

        categorias.forEach(function(categoria) {
            Estado.coresCategorias[categoria.id] = categoria.cor;

            const label = document.createElement('label');
            label.innerHTML = ` <input type="checkbox" value="${categoria.id}" checked>
                ${categoria.nome} `;
            container.appendChild(label);
        });

}

function renderizarSecoes(secoes){
    const container = document.getElementById("filtro-secoes");

        secoes.forEach(function(secao){
            Estado.nomesSecoes[secao.id] = secao.nome;

            const label = document.createElement('label');
            label.innerHTML = ` <input type="checkbox" value="${secao.id}" checked>
                ${secao.nome}`;
            container.appendChild(label);
        });
}

// ---------------------------------------------------
// FILTROS
// ----------------------------------------------------


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
    const categorias = await Api.buscarCategorias();
    renderizarCategorias(categorias);

    const secoes = await Api.buscarSecoes();
    renderizarSecoes(secoes);

    const eventos = await Api.buscarEventos(); // Busca os dados primeiro

    prepararEventos(eventos);
    
    Calendario.renderizar();   // Desenha o calendário depois
    
    configurarNavegacao();
}

inicializar();