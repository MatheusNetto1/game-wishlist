# wishlist-api/schemas.py
from pydantic import BaseModel, HttpUrl

class WishlistItemBase(BaseModel):
    title: str
    platform: str
    thumbnail: HttpUrl # Usar HttpUrl para validação de formato de URL
    game_url: HttpUrl # Usar HttpUrl para validação de formato de URL

class WishlistItemCreate(WishlistItemBase):
    pass

class WishlistItem(WishlistItemBase):
    id: int

    class Config:
        orm_mode = True # Habilita o modo ORM para que o Pydantic possa ler dados de objetos SQLAlchemy