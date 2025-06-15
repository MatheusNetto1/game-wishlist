from fastapi import FastAPI, Depends, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import models, schemas
from database import SessionLocal, engine, Base
import httpx
import logging
from pydantic import BaseModel

# Configuração de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Criação das tabelas no banco de dados
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Game Wishlist API",
    description="API para gerenciar jogos gratuitos e lista de desejos.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# URL da API externa
FREETOGAME_API_URL = "https://www.freetogame.com/api"

@app.on_event("startup")
async def startup_event():
    app.state.http_client = httpx.AsyncClient()
    logger.info("HTTPX AsyncClient inicializado.")

@app.on_event("shutdown")
async def shutdown_event():
    await app.state.http_client.aclose()
    logger.info("HTTPX AsyncClient fechado.")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_http_client():
    return app.state.http_client

# --- Endpoints da wishlist ---

@app.get("/wishlist", response_model=list[schemas.WishlistItem], summary="Obter todos os itens da wishlist")
def read_wishlist(db: Session = Depends(get_db)):
    logger.info("Requisição para ler a wishlist.")
    return db.query(models.WishlistItem).all()

@app.post("/wishlist", response_model=schemas.WishlistItem, status_code=201, summary="Adicionar um jogo à wishlist")
def add_to_wishlist(item: schemas.WishlistItemCreate, db: Session = Depends(get_db)):
    logger.info(f"Tentando adicionar jogo manual à wishlist: {item.title}")
    try:
        existing_item = db.query(models.WishlistItem).filter_by(game_url=str(item.game_url)).first()
        if existing_item:
            logger.warning(f"Jogo já existe na wishlist: {item.title}")
            raise HTTPException(status_code=409, detail="Jogo já está na wishlist.")

        db_item = models.WishlistItem(
            title=item.title,
            platform=item.platform,
            thumbnail=str(item.thumbnail),
            game_url=str(item.game_url)
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        logger.info(f"Jogo '{item.title}' adicionado à wishlist com ID: {db_item.id}")
        return db_item
    except IntegrityError as e:
        db.rollback()
        logger.error(f"IntegrityError ao adicionar jogo manual '{item.title}': {e}")
        raise HTTPException(status_code=409, detail="Conflito: Jogo com esta URL já existe na wishlist.")
    except Exception as e:
        db.rollback()
        logger.error(f"Erro inesperado ao adicionar jogo manual '{item.title}': {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {e}")

@app.delete("/wishlist/{item_id}", status_code=204, summary="Remover um jogo da wishlist")
def delete_from_wishlist(item_id: int, db: Session = Depends(get_db)):
    logger.info(f"Tentando remover jogo da wishlist com ID: {item_id}")
    item = db.query(models.WishlistItem).filter(models.WishlistItem.id == item_id).first()
    if item is None:
        logger.warning(f"Item da wishlist não encontrado para ID: {item_id}")
        raise HTTPException(status_code=404, detail="Item não encontrado na wishlist.")
    try:
        db.delete(item)
        db.commit()
        logger.info(f"Jogo com ID {item_id} removido da wishlist.")
        return Response(status_code=204)
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao remover item {item_id} da wishlist: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor ao remover item: {e}")

# --- Integração com a API FreeToGame ---

@app.get("/search-games", summary="Buscar jogos gratuitos na API externa")
async def search_games(
    title: str = Query(None),
    platform: str = Query(None),
    genre: str = Query(None),
    http_client: httpx.AsyncClient = Depends(get_http_client)
):
    logger.info(f"Buscando jogos com título='{title}', plataforma='{platform}', gênero='{genre}'")
    params = {}
    if platform:
        params["platform"] = platform
    if genre:
        params["category"] = genre

    try:
        response = await http_client.get(f"{FREETOGAME_API_URL}/games", params=params)
        response.raise_for_status()
    except httpx.HTTPStatusError as e:
        logger.error(f"Erro ao consultar FreeToGame API: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=502, detail=f"Erro ao consultar a API externa: {e.response.status_code}. Detalhes: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Erro de conexão com FreeToGame API: {e}")
        raise HTTPException(status_code=503, detail="Não foi possível conectar à API externa.")
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar jogos: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor ao buscar jogos: {e}")

    games = response.json()
    if title:
        games = [game for game in games if title.lower() in game["title"].lower()]
        logger.info(f"Filtrados {len(games)} jogos por título.")
    return games

# --- Schema para requisição com game_id ---

class GameIDRequest(BaseModel):
    game_id: int

@app.post("/wishlist/from-freetogame", response_model=schemas.WishlistItem, status_code=201, summary="Adicionar um jogo da API externa à wishlist")
async def add_from_freetogame(
    request: GameIDRequest,
    db: Session = Depends(get_db),
    http_client: httpx.AsyncClient = Depends(get_http_client)
):
    game_id = request.game_id
    logger.info(f"Tentando adicionar jogo da FreeToGame API à wishlist com ID: {game_id}")
    url = f"{FREETOGAME_API_URL}/game?id={game_id}"
    try:
        response = await http_client.get(url)
        response.raise_for_status()
    except httpx.HTTPStatusError as e:
        logger.error(f"Jogo não encontrado na FreeToGame API ou erro: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=404, detail=f"Jogo não encontrado na API externa (ID: {game_id}).")
    except httpx.RequestError as e:
        logger.error(f"Erro de conexão com FreeToGame API ao buscar jogo por ID: {e}")
        raise HTTPException(status_code=503, detail="Não foi possível conectar à API externa.")
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar detalhes do jogo na API externa (ID: {game_id}): {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor ao obter detalhes do jogo: {e}")

    data = response.json()
    game_url_str = str(data["game_url"])
    thumbnail_str = str(data["thumbnail"])

    try:
        existing = db.query(models.WishlistItem).filter_by(game_url=game_url_str).first()
        if existing:
            logger.warning(f"Jogo '{data['title']}' já está na wishlist.")
            raise HTTPException(status_code=409, detail="Jogo já está na wishlist.")

        item = models.WishlistItem(
            title=data["title"],
            platform=data["platform"],
            thumbnail=thumbnail_str,
            game_url=game_url_str
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        logger.info(f"Jogo '{item.title}' adicionado à wishlist com ID: {item.id}")
        return item
    except IntegrityError as e:
        db.rollback()
        logger.error(f"IntegrityError ao adicionar jogo '{data['title']}': {e}")
        raise HTTPException(status_code=409, detail="Conflito: Jogo com esta URL já existe na wishlist.")
    except Exception as e:
        db.rollback()
        logger.error(f"Erro inesperado ao adicionar jogo '{data['title']}': {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {e}")
