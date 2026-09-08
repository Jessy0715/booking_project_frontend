from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    name: str
    description: str
    price: int

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    id: int

    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    start_date: datetime
    end_date: datetime

class BookingCreate(BookingBase):
    room_id: int

class Booking(BookingBase):
    id: int
    user_id: int
    room_id: int

    class Config:
        from_attributes = True

# Add these two classes
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
