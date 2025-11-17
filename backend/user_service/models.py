from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    full_name = Column(String(255))
    role = Column(Enum('admin', 'teacher', 'student'), default='student')
    password = Column(String(255))
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime)

    # Quién creó este usuario para el registro
    creator = relationship("User", remote_side=[id], backref="created_users")