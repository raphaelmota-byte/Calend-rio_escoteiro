from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, EventoViewSet, SecaoViewSet, ParticipanteViewSet, InscricaoViewSet , InscricaoCreateView

router = DefaultRouter()
router.register("categorias", CategoriaViewSet)
router.register("eventos", EventoViewSet)
router.register("secoes", SecaoViewSet)
router.register("participantes" , ParticipanteViewSet)
router.register("inscricoes", InscricaoViewSet)

urlpatterns = router.urls + [
    path("eventos/<int:evento_id>/inscrever/", InscricaoCreateView.as_view()),
]