# wishlist-api/main.py
from fastapi import FastAPI, Depends, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError # Importa IntegrityError para tratamento específico
import models, schemas
from database import SessionLocal, engine, Base
import httpx
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Criação das tabelas no banco de dados
# Garante que as tabelas são criadas se não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Game Wishlist API",
    description="API para gerenciar jogos gratuitos e lista de desejos.",
    version="1.0.0"
)

# Configuração do CORS para permitir requisições de qualquer origem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite todas as origens durante o desenvolvimento
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Permite todos os cabeçalhos
)

# URL da API externa FreeToGame
FREETOGAME_API_URL = "https://www.freetogame.com/api"

# Inicializa o cliente HTTP assíncrono uma vez na inicialização da aplicação para reuso
# Isso é mais eficiente e recomendado para evitar a criação de múltiplas sessões TCP
@app.on_event("startup")
async def startup_event():
    app.state.http_client = httpx.AsyncClient()
    logger.info("HTTPX AsyncClient inicializado.")

# Fecha o cliente HTTP assíncrono no desligamento da aplicação
@app.on_event("shutdown")
async def shutdown_event():
    await app.state.http_client.aclose()
    logger.info("HTTPX AsyncClient fechado.")

# Dependência para obter uma sessão do banco de dados
# Garante que a sessão é fechada após cada requisição
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependência para obter o cliente HTTP
def get_http_client():
    return app.state.http_client

# --- Endpoints da wishlist ---

@app.get("/wishlist", response_model=list[schemas.WishlistItem], summary="Obter todos os itens da wishlist")
def read_wishlist(db: Session = Depends(get_db)):
    """
    Retorna todos os jogos atualmente na lista de desejos do usuário.
    """
    logger.info("Requisição para ler a wishlist.")
    return db.query(models.WishlistItem).all()

@app.post("/wishlist", response_model=schemas.WishlistItem, status_code=201, summary="Adicionar um jogo à wishlist")
def add_to_wishlist(item: schemas.WishlistItemCreate, db: Session = Depends(get_db)):
    """
    Adiciona um novo jogo à lista de desejos.
    O jogo deve ter título, plataforma, thumbnail e URL.
    Este endpoint é para adição manual, não da API externa.
    """
    logger.info(f"Tentando adicionar jogo manual à wishlist: {item.title}")
    try:
        # Verifica se o item já existe usando game_url (que é a restrição UNIQUE)
        existing_item = db.query(models.WishlistItem).filter_by(game_url=str(item.game_url)).first()
        if existing_item:
            logger.warning(f"Jogo já existe na wishlist: {item.title}")
            raise HTTPException(status_code=409, detail="Jogo já está na wishlist.")

        db_item = models.WishlistItem(
            title=item.title,
            platform=item.platform,
            thumbnail=str(item.thumbnail), # Convertendo HttpUrl para str antes de passar para o modelo
            game_url=str(item.game_url)    # Convertendo HttpUrl para str
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        logger.info(f"Jogo '{item.title}' adicionado à wishlist com ID: {db_item.id}")
        return db_item
    except IntegrityError as e:
        db.rollback() # Em caso de erro de integridade, reverta a transação
        logger.error(f"IntegrityError ao adicionar jogo manual '{item.title}': {e}")
        raise HTTPException(status_code=409, detail="Conflito: Jogo com esta URL já existe na wishlist.")
    except Exception as e:
        db.rollback() # Em caso de qualquer outro erro, reverta a transação
        logger.error(f"Erro inesperado ao adicionar jogo manual '{item.title}': {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {e}")

@app.delete("/wishlist/{item_id}", status_code=204, summary="Remover um jogo da wishlist")
def delete_from_wishlist(item_id: int, db: Session = Depends(get_db)):
    """
    Remove um jogo da lista de desejos pelo seu ID.
    """
    logger.info(f"Tentando remover jogo da wishlist com ID: {item_id}")
    item = db.query(models.WishlistItem).filter(models.WishlistItem.id == item_id).first()
    if item is None:
        logger.warning(f"Item da wishlist não encontrado para ID: {item_id}")
        raise HTTPException(status_code=404, detail="Item não encontrado na wishlist.")
    try:
        db.delete(item)
        db.commit()
        logger.info(f"Jogo com ID {item_id} removido da wishlist.")
        return Response(status_code=204) # 204 No Content para deleção bem-sucedida
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao remover item {item_id} da wishlist: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor ao remover item: {e}")

# --- Integração com a API FreeToGame ---

@app.get("/search-games", summary="Buscar jogos gratuitos na API externa")
async def search_games(
    title: str = Query(None, description="Busca por título do jogo (case-insensitive)"),
    platform: str = Query(None, description="Filtrar por plataforma (pc, browser)"),
    genre: str = Query(None, description="Filtrar por gênero (shooter, mmorpg, etc)"),
    http_client: httpx.AsyncClient = Depends(get_http_client)
):
    """
    Busca jogos gratuitos na API FreeToGame, com opções de filtro por título, plataforma e gênero.
    """
    logger.info(f"Buscando jogos com título='{title}', plataforma='{platform}', gênero='{genre}'")
    params = {}
    if platform:
        params["platform"] = platform
    if genre:
        params["category"] = genre

    try:
        response = await http_client.get(f"{FREETOGAME_API_URL}/games", params=params)
        response.raise_for_status() # Levanta um HTTPStatusError para respostas 4xx/5xx
    except httpx.HTTPStatusError as e:
        logger.error(f"Erro ao consultar FreeToGame API: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=502, detail=f"Erro ao consultar a API externa: {e.response.status_code}. Detalhes: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Erro de conexão com FreeToGame API: {e}")
        raise HTTPException(status_code=503, detail="Não foi possível conectar à API externa. Verifique sua conexão ou tente novamente mais tarde.")
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar jogos: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor ao buscar jogos: {e}")

    games = response.json()

    if title:
        # Filtra por título de forma case-insensitive
        games = [game for game in games if title.lower() in game["title"].lower()]
        logger.info(f"Filtrados {len(games)} jogos por título.")

    return games

@app.post("/wishlist/from-freetogame", response_model=schemas.WishlistItem, status_code=201, summary="Adicionar um jogo da API externa à wishlist")
async def add_from_freetogame(
    game_id: int = Query(..., description="ID do jogo na API FreeToGame"),
    db: Session = Depends(get_db),
    http_client: httpx.AsyncClient = Depends(get_http_client)
):
    """
    Adiciona um jogo específico da API FreeToGame à lista de desejos,
    buscando os detalhes do jogo pelo seu ID na API externa.
    """
    logger.info(f"Tentando adicionar jogo da FreeToGame API à wishlist com ID: {game_id}")
    url = f"{FREETOGAME_API_URL}/game?id={game_id}"
    try:
        response = await http_client.get(url)
        response.raise_for_status() # Levanta um HTTPStatusError se a resposta for 4xx/5xx
    except httpx.HTTPStatusError as e:
        logger.error(f"Jogo não encontrado na FreeToGame API ou erro: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=404, detail=f"Jogo não encontrado na API externa (ID: {game_id}).")
    except httpx.RequestError as e:
        logger.error(f"Erro de conexão com FreeToGame API ao buscar jogo por ID: {e}")
        raise HTTPException(status_code=503, detail="Não foi possível conectar à API externa para obter detalhes do jogo.")
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar detalhes do jogo na API externa (ID: {game_id}): {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor ao obter detalhes do jogo: {e}")

    data = response.json()

    # --- CORREÇÃO AQUI ---
    # Convertendo pydantic.HttpUrl para string antes de usar na consulta e no modelo
    game_url_str = str(data["game_url"])
    thumbnail_str = str(data["thumbnail"])

    try:
        # Verifica se o jogo já está na wishlist local usando 'game_url', que tem a restrição UNIQUE
        existing = db.query(models.WishlistItem).filter_by(game_url=game_url_str).first()
        if existing:
            logger.warning(f"Jogo '{data['title']}' (URL: {game_url_str}) já está na wishlist. ID Interno: {existing.id}")
            raise HTTPException(status_code=409, detail="Jogo já está na wishlist.")

        item = models.WishlistItem(
            title=data["title"],
            platform=data["platform"],
            thumbnail=thumbnail_str, # Usar a string convertida
            game_url=game_url_str    # Usar a string convertida
        )

        db.add(item)
        db.commit() # Tenta commitar a transação. Se houver erro de integridade, IntegrityError é levantado.
        db.refresh(item) # Atualiza o objeto com o ID gerado pelo banco de dados
        logger.info(f"Jogo '{item.title}' (ID Externo: {game_id}) adicionado à wishlist com ID Interno: {item.id}")
        return item
    except IntegrityError as e:
        db.rollback() # Em caso de erro de integridade (ex: duplicidade de game_url), reverta a transação
        logger.error(f"IntegrityError ao adicionar jogo '{data['title']}' (ID: {game_id}): {e}")
        raise HTTPException(status_code=409, detail="Conflito: Jogo com esta URL já existe na wishlist.")
    except Exception as e:
        db.rollback() # Em caso de qualquer outro erro durante as operações de DB, reverta a transação
        logger.error(f"Erro inesperado ao adicionar jogo '{data['title']}' (ID: {game_id}) à wishlist: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {e}")
