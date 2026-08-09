from rest_framework import serializers
from .models import Categoria , Evento , Secao , Participante , Inscricao

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = "__all__"
        
class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = "__all__"
        
class SecaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Secao
        fields = "__all__"
        
class ParticipanteSerializer(serializers.ModelSerializer):
    email = serializers.EmailField() 
    class Meta:
        model = Participante
        fields = "__all__"
        
class InscricaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inscricao
        fields = "__all__"
    