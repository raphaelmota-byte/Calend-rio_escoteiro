from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from .models import Categoria, Evento, Secao, Participante, Inscricao
from .serializers import CategoriaSerializer, EventoSerializer, SecaoSerializer, ParticipanteSerializer, InscricaoSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    
class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        categoria_id = self.request.query_params.get("categoria")
        secao_id = self.request.query_params.get("secao")

        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)

        if secao_id:
            queryset = queryset.filter(secoes=secao_id)

        return queryset
    
class SecaoViewSet(viewsets.ModelViewSet):
    queryset = Secao.objects.all()
    serializer_class = SecaoSerializer
    
    
    
class ParticipanteViewSet(viewsets.ModelViewSet):
    queryset = Participante.objects.all()
    serializer_class = ParticipanteSerializer
    
class InscricaoViewSet(viewsets.ModelViewSet):
    queryset = Inscricao.objects.all()
    serializer_class = InscricaoSerializer
    
class InscricaoCreateView(APIView):
    
    def post(self, request, evento_id):
        
        serializer = ParticipanteSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors , status=400)
        
        participante, criado = Participante.objects.get_or_create(
            email=request.data["email"],
            defaults={
                "nome": request.data["nome"],
                "telefone": request.data.get("telefone", ""),
                "secao_id": request.data["secao"],
            }
        )

        if not criado:
            participante.nome = request.data["nome"]
            participante.telefone = request.data.get("telefone", "")
            participante.secao_id = request.data["secao"] # type: ignore
            participante.save()
        
        
        inscricao = Inscricao.objects.create(
            evento_id=evento_id,
            participante=participante,
        )

        return Response(
            {"detail": "Inscrição realizada com sucesso!", "inscricao_id": inscricao.id}, # pyright: ignore[reportAttributeAccessIssue]
            status=201,
        )