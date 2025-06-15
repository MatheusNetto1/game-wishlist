# main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine, Base
import httpx

# Criação das tabelas no banco de dados
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# URL da API externa
FREETOGAME_API_URL = "https://www.freetogame.com/api/games"

# Dependência para obter a sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Endpoints da wishlist ---

@app.get("/wishlist", response_model=list[schemas.WishlistItem])
def read_wishlist(db: Session = Depends(get_db)):
    return db.query(models.WishlistItem).all()

@app.post("/wishlist", response_model=schemas.WishlistItem)
def add_to_wishlist(item: schemas.WishlistItemCreate, db: Session = Depends(get_db)):
    db_item = models.WishlistItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/wishlist/{item_id}")
def delete_from_wishlist(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.WishlistItem).filter(models.WishlistItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}

# --- Integração com a API FreeToGame ---

@app.get("/search-games")
async def search_games(
    title: str = Query(None, description="Busca por título"),
    platform: str = Query(None, description="Filtrar por plataforma (pc, browser)"),
    genre: str = Query(None, description="Filtrar por gênero (shooter, mmorpg, etc)")
):
    params = {}
    if platform:
        params["platform"] = platform
    if genre:
        params["category"] = genre

    async with httpx.AsyncClient() as client:
        response = await client.get(FREETOGAME_API_URL, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Erro ao consultar a API externa")

    games = response.json()

    if title:
        games = [game for game in games if title.lower() in game["title"].lower()]

    return games

@app.post("/wishlist/from-freetogame", response_model=schemas.WishlistItem)
async def add_from_freetogame(id: int, db: Session = Depends(get_db)):
    url = f"https://www.freetogame.com/api/game?id={id}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Jogo não encontrado na API externa")

    data = response.json()

    # Verifica se o jogo já está na wishlist
    existing = db.query(models.WishlistItem).filter_by(title=data["title"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Jogo já está na wishlist")

    item = models.WishlistItem(
        title=data["title"],
        platform=data["platform"],
        thumbnail=data["thumbnail"],
        game_url=data["game_url"]
    )

    db.add(item)
    db.commit()
    db.refresh(item)
    return item
