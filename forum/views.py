from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from .models import User, Trail, Post, Comment, NewsItem
from django.contrib.auth import authenticate, login, logout
from .serializers import UserSerializer, TrailSerializer, PostSerializer, CommentSerializer, NewsItemSerializer

# ==========================================
# AUTENTICAÇÃO
# ==========================================
@api_view(['POST'])
def signup(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'msg': 'Invalid username/password'}, status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(username=username).exists():
        return Response({'msg': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.create_user(username=username, password=password)
    return Response({'msg': 'User ' + user.username + ' created'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user) # Cria a sessão
        return Response({'msg': 'User logged in'})
    else:
        return Response({'msg': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def logout_view(request):
    logout(request)
    return Response({'msg': 'User logged out'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
    # Envia os dados do utilizador autenticado para o react
    return Response({
        'username': request.user.username,
        'role': getattr(request.user, 'role', 'UTILIZADOR')
    })

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
        # Apenas o próprio autor ou moderador/admin podem editar
        if post.author != request.user and request.user.role not in ['MODERADOR', 'ADMINISTRADOR']:
            return Response({'msg': 'Não tem permissão para editar este post'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Apenas o autor ou moderador/admin podem apagar
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
        # Bloqueio explícito caso o utilizador não seja administrador
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
        # Gestão de catálogo protegida para administradores
        if request.user.role != 'ADMINISTRADOR':
            return Response({'msg': 'Apenas administradores podem registar trilhos'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = TrailSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# ==========================================
# GESTÃO DE NOTÍCIAS (APAGAR/EDITAR POR ADMIN)
# ==========================================
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def news_detail_update_delete(request, pk):
    try:
        news_item = NewsItem.objects.get(pk=pk)
    except NewsItem.DoesNotExist:
        return Response({'msg': 'Notícia não encontrada'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = NewsItemSerializer(news_item)
        return Response(serializer.data)

    elif request.method in ['PUT', 'DELETE']:
        if request.user.role != 'ADMINISTRADOR':
            return Response({'msg': 'Apenas administradores podem gerir notícias'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'PUT':
            serializer = NewsItemSerializer(news_item, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            news_item.delete()
            return Response({'msg': 'Notícia eliminada com sucesso'}, status=status.HTTP_204_NO_CONTENT)


# ==========================================
# GESTÃO DE TRILHOS (APAGAR/EDITAR POR ADMIN)
# ==========================================
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def trail_detail_update_delete(request, pk):
    try:
        trail = Trail.objects.get(pk=pk)
    except Trail.DoesNotExist:
        return Response({'msg': 'Trilho não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TrailSerializer(trail)
        return Response(serializer.data)

    elif request.method in ['PUT', 'DELETE']:
        if request.user.role != 'ADMINISTRADOR':
            return Response({'msg': 'Apenas administradores podem gerir trilhos'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'PUT':
            serializer = TrailSerializer(trail, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            trail.delete()
            return Response({'msg': 'Trilho eliminado com sucesso'}, status=status.HTTP_204_NO_CONTENT)
        
# ==========================================
# GESTÃO DE UTILIZADORES (EXCLUSIVO ADMIN)
# ==========================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_user_list(request):
    if request.user.role != 'ADMINISTRADOR':
        return Response({'msg': 'Acesso negado'}, status=status.HTTP_403_FORBIDDEN)
        
    users = User.objects.all().order_by('username')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, pk):
    if request.user.role != 'ADMINISTRADOR':
        return Response({'msg': 'Acesso negado'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        user_to_manage = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'msg': 'Utilizador não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        new_role = request.data.get('role')
        if new_role in ['UTILIZADOR', 'MODERADOR', 'ADMINISTRADOR']:
            user_to_manage.role = new_role
            user_to_manage.save()
            return Response(UserSerializer(user_to_manage).data)
        return Response({'msg': 'Papel de utilizador inválido'}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Impedir que o administrador apague a sua própria conta por engano
        if user_to_manage == request.user:
            return Response({'msg': 'Não pode eliminar a sua própria conta de administrador'}, status=status.HTTP_400_BAD_REQUEST)
            
        user_to_manage.delete()
        return Response({'msg': 'Utilizador eliminado com sucesso'}, status=status.HTTP_204_NO_CONTENT)