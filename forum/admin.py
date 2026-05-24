from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Trail, Post, Comment, NewsItem

class CustomUserAdmin(UserAdmin):
    model = User
    # Colunas que aparecem na lista de utilizadores
    list_display = ['username', 'email', 'role', 'is_staff']
    
    # Adicionar o campo "role" (papel) ao painel de edição de utilizadores
    fieldsets = UserAdmin.fieldsets + (
        ('Permissões do Fórum', {'fields': ('role',)}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Trail)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(NewsItem)

admin.site.site_header = "Administração do Fórum Natureza"
admin.site.site_title = "Fórum Natureza Admin"