import os
import django
from datetime import date, timedelta

# 1. Configurar o ambiente do Django para permitir o uso dos modelos fora do runserver
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Importar os modelos da aplicação
from forum.models import User, Trail, NewsItem

def seed():
    print("A iniciar o pré-preenchimento da base de dados...")

    # ==========================================
    # 1. CRIAR CONTA DE ADMINISTRADOR
    # ==========================================
    if not User.objects.filter(username='admin').exists():
        # Usamos create_user para garantir que a password fica hashed
        admin = User.objects.create_user(username='admin', password='admin', role='ADMINISTRADOR')
        print("Administrador criado (User: admin | Pass: admin)")
    else:
        admin = User.objects.get(username='admin')
        print("Administrador 'admin' já existia.")

    # ==========================================
    # 2. CRIAR CONTAS DE MODERADORES
    # ==========================================
    for i in range(1, 4):
        username = f'mod{i}'
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(username=username, password=username, role='MODERADOR')
            print(f"Moderador criado (User: {username} | Pass: {username})")
        else:
            print(f"Moderador '{username}' já existia.")

    # ==========================================
    # 3. CRIAR TRILHOS NO CATÁLOGO
    # ==========================================
    trilhos = [
        {"name": "Trilho dos Pescadores", "location": "Costa Vicentina, Alentejo", "weather_status": "Ensolarado - 22°C"},
        {"name": "Passadiços do Paiva", "location": "Arouca, Aveiro", "weather_status": "Céu Limpo - 18°C"},
        {"name": "Levada das 25 Fontes", "location": "Ilha da Madeira", "weather_status": "Nevoeiro - 15°C"},
        {"name": "Trilho das Sete Cidades", "location": "São Miguel, Açores", "weather_status": "Chuva Fraca - 17°C"},
        {"name": "Rota do Românico", "location": "Vale do Sousa", "weather_status": "Parcialmente Nublado - 20°C"},
    ]
    
    for t in trilhos:
        if not Trail.objects.filter(name=t['name']).exists():
            Trail.objects.create(**t)
            print(f"Trilho adicionado: {t['name']}")

    # ==========================================
    # 4. CRIAR NOTÍCIAS DIÁRIAS
    # ==========================================
    noticias = [
        {
            "title": "Alerta Laranja: Chuva Forte nos Açores", 
            "description": "Prevê-se chuva forte e vento intenso na zona da Lagoa das Sete Cidades. Aconselhamos o adiamento de caminhadas neste trilho durante o fim de semana.", 
            "relevance_date": date.today() + timedelta(days=20), 
            "author": admin
        },
        {
            "title": "Promoção: Botas Impermeáveis 30% OFF", 
            "description": "A nossa loja parceira 'Montanha Ativa' está com uma promoção imperdível em todas as botas de caminhada de alta montanha. Apresentem o código FORUM30 na caixa.", 
            "relevance_date": date.today() + timedelta(days=27), 
            "author": admin
        },
        {
            "title": "Encontro Anual: Passadiços do Paiva", 
            "description": "As inscrições para a nossa caminhada anual em grupo já estão abertas! Iremos percorrer os 8km dos passadiços no próximo mês. Mais detalhes no mural.", 
            "relevance_date": date.today() + timedelta(days=30), 
            "author": admin
        }
    ]
    
    for n in noticias:
        if not NewsItem.objects.filter(title=n['title']).exists():
            NewsItem.objects.create(**n)
            print(f"Notícia adicionada: {n['title']}")

    print("Pré-preenchimento concluído com sucesso!")

if __name__ == '__main__':
    seed()