async function buscarEventos() {
    const resposta = await fetch("http://127.0.0.1:8000/api/eventos/");
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