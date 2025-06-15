# models.py
from sqlalchemy import Column, Integer, String
from database import Base

class WishlistItem(Base):
    __tablename__ = "wishlist"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    platform = Column(String)
    thumbnail = Column(String)
    game_url = Column(String)