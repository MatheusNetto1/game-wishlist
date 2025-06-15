# schemas.py
from pydantic import BaseModel

class WishlistItemBase(BaseModel):
    title: str
    platform: str
    thumbnail: str
    game_url: str

class WishlistItemCreate(WishlistItemBase):
    pass

class WishlistItem(WishlistItemBase):
    id: int

    class Config:
        orm_mode = True