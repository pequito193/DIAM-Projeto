from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_not_be_found # Auxiliar padrão do Django
from .models import User, Trail, Post, Comment, NewsItem
from .serializers import UserSerializer, TrailSerializer, PostSerializer, CommentSerializer, NewsItemSerializer

# ==========================================
# CRUD DE POSTS (FÓRUM)
# ==========================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def post_list_create(request):
    if request.method == 'GET':
        posts = Post.objects.all().order_by('-created_at')
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            # Grava associando o autor autenticado automaticamente
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def post_detail_update_delete(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'msg': 'Post não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PostSerializer(post)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # Permissão exclusiva: apenas o próprio autor ou moderador/admin podem editar
        if post.author != request.user and request.user.role not in ['MODERADOR', 'ADMINISTRADOR']:
            return Response({'msg': 'Não tem permissão para editar este post'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Permissão exclusiva: apenas o autor ou moderador/admin podem apagar
        if post.author != request.user and request.user.role not in ['MODERADOR', 'ADMINISTRADOR']:
            return Response({'msg': 'Não tem permissão para apagar este post'}, status=status.HTTP_403_FORBIDDEN)
            
        post.delete()
        return Response({'msg': 'Post eliminado com sucesso'}, status=status.HTTP_204_NO_CONTENT)


# ==========================================
# CRUD DE COMENTÁRIOS
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comment_create(request):
    serializer = CommentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def comment_delete(request, pk):
    try:
        comment = Comment.objects.get(pk=pk)
    except Comment.DoesNotExist:
        return Response({'msg': 'Comentário não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    # Apenas o autor do comentário ou equipa de moderação/administração podem remover
    if comment.author != request.user and request.user.role not in ['MODERADOR', 'ADMINISTRADOR']:
        return Response({'msg': 'Não tem permissão para remover este comentário'}, status=status.HTTP_403_FORBIDDEN)
        
    comment.delete()
    return Response({'msg': 'Comentário removido'}, status=status.HTTP_204_NO_CONTENT)


# ==========================================
# CRUD DE NOTÍCIAS (EXCLUSIVO ADMINISTRADOR)
# ==========================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def news_list_create(request):
    if request.method == 'GET':
        news = NewsItem.objects.all().order_by('-created_at')
        serializer = NewsItemSerializer(news, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        # Bloqueio explícito caso o utilizador não seja Administrador
        if request.user.role != 'ADMINISTRADOR':
            return Response({'msg': 'Apenas administradores podem publicar notícias'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = NewsItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# CRUD DE TRILHOS (CATÁLOGO AUXILIAR)
# ==========================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def trail_list_create(request):
    if request.method == 'GET':
        trails = Trail.objects.all()
        serializer = TrailSerializer(trails, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        # Gestão de catálogo protegida para Administradores
        if request.user.role != 'ADMINISTRADOR':
            return Response({'msg': 'Apenas administradores podem registar trilhos'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = TrailSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)