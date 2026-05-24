from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('UTILIZADOR', 'Utilizador'),
        ('MODERADOR', 'Moderador'),
        ('ADMINISTRADOR', 'Administrador'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='UTILIZADOR')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Trail(models.Model):
    name = models.CharField(max_length=250)
    location = models.CharField(max_length=250)
    weather_status = models.CharField(max_length=250, blank=True, null=True)

    def __str__(self):
        return self.name

class Post(models.Model):
    CATEGORY_CHOICES = [
        ('TRILHO', 'Trilho'),
        ('EQUIPAMENTO', 'Equipamento'),
        ('ENCONTRO', 'Encontro'),
    ]
    title = models.CharField(max_length=250)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)

    def __str__(self):
        return self.title

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentário de {self.author.username} em {self.post.title}"

class NewsItem(models.Model):
    title = models.CharField(max_length=250)
    description = models.TextField()
    relevance_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='news_items')

    def __str__(self):
        return self.title
