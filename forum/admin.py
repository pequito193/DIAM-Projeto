from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Trail, Post, Comment, NewsItem

# 1. Configurar o painel para o nosso modelo de Utilizador personalizado
class CustomUserAdmin(UserAdmin):
    model = User
    # Colunas que aparecem na lista de utilizadores
    list_display = ['username', 'email', 'role', 'is_staff']
    
    # Adicionar o campo "role" (papel) ao painel de edição de utilizadores
    fieldsets = UserAdmin.fieldsets + (
        ('Permissões do Fórum', {'fields': ('role',)}),
    )

# 2. Registar o Utilizador
admin.site.register(User, CustomUserAdmin)

# 3. Registar os restantes modelos de forma simples
admin.site.register(Trail)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(NewsItem)

# (Opcional) Mudar o título que aparece no topo da página de Administração
admin.site.site_header = "Administração do Fórum Natureza"
admin.site.site_title = "Fórum Natureza Admin"