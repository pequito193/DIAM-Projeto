from rest_framework import serializers
from .models import User, Trail, Post, Comment, NewsItem

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class TrailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trail
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    # Inclui os detalhes básicos do autor em vez de apenas o ID
    author_details = UserSerializer(source='author', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_details', 'content', 'created_at']
        read_only_fields = ['author']

class PostSerializer(serializers.ModelSerializer):
    author_details = UserSerializer(source='author', read_only=True)
    # Permite listar os comentários associados diretamente quando se puxa um post
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'created_at', 'author', 'author_details', 'category', 'comments']
        read_only_fields = ['author']

class NewsItemSerializer(serializers.ModelSerializer):
    author_details = UserSerializer(source='author', read_only=True)

    class Meta:
        model = NewsItem
        fields = ['id', 'title', 'description', 'relevance_date', 'created_at', 'author', 'author_details']
        read_only_fields = ['author']