from django.urls import path
from . import views

urlpatterns = [
    # Autenticação
    path('signup/', views.signup),
    path('login/', views.login_view),
    path('logout/', views.logout_view),
    path('user/', views.user_view),

    # Fórum e Funcionalidades
    path('posts/', views.post_list_create),
    path('posts/<int:pk>/', views.post_detail_update_delete),
    path('comments/', views.comment_create),
    path('comments/<int:pk>/', views.comment_delete),
    path('news/', views.news_list_create),
    path('news/<int:pk>/', views.news_detail_update_delete),
    path('trails/', views.trail_list_create),
    path('trails/<int:pk>/', views.trail_detail_update_delete),
    path('users/', views.admin_user_list),
    path('users/<int:pk>/', views.admin_user_detail),
]