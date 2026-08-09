from django.contrib import admin
from .models import Categoria , Evento , Secao , Participante , Inscricao

# Register your models here.
admin.site.register(Evento)
admin.site.register(Categoria)
admin.site.register(Secao)
admin.site.register(Participante)
admin.site.register(Inscricao)
