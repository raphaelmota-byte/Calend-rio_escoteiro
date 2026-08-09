from django.db import models

# Create your models here.

class Categoria(models.Model):
    nome = models.CharField(max_length=50)
    cor = models.CharField(max_length=7)
   
    def __str__(self):
        return f"{self.nome} - ({self.cor})" 
    
class Secao(models.Model):
    nome = models.CharField(max_length=30)
    
    def __str__(self):
        return self.nome
    
class Evento(models.Model):
    titulo = models.CharField(max_length=200)
    descricao = models.TextField(blank=True) # não é necessário uma descrição sempre
    data_inicio = models.DateField()
    data_fim = models.DateField()
    hora_inicio = models.TimeField(null=True, blank=True)
    hora_fim = models.TimeField(null=True, blank=True)
    categoria = models.ForeignKey(Categoria , on_delete=models.SET_NULL , null= True)
    secoes = models.ManyToManyField(Secao)
    local = models.CharField(max_length=300)
    
    def __str__(self):
        return f"{self.titulo} - {self.data_inicio}"
    
class Participante(models.Model):
    nome = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=20 , blank=True)
    secao = models.ForeignKey(Secao , on_delete=models.PROTECT )
    
    def __str__(self):
        return f"{self.nome} - {self.secao}"
    
class Inscricao(models.Model):
    STATUS_CHOICES = [
    ("pendente", "Pendente"),
    ("confirmado", "Confirmado"),
    ("cancelado", "Cancelado"),
    ]
    
    evento = models.ForeignKey(Evento , on_delete=models.CASCADE)
    participante = models.ForeignKey(Participante , on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pendente")
    data_inscricao = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.participante} - {self.evento} - {self.status}"