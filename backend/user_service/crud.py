from sqlalchemy.orm import Session
import hashlib
import secrets
import hmac
from datetime import datetime

from .database import SessionLocal
from . import models
import user_service.schemas as schemas

# Password hashing using scrypt (standard library) with a random salt.
# Stored format: "<salt_hex>$<derived_key_hex>"
SCRYPT_N = 16384
SCRYPT_R = 8
SCRYPT_P = 1
SCRYPT_DKLEN = 64
SALT_SIZE = 16

def get_password_hash(password: str) -> str:
    salt = secrets.token_bytes(SALT_SIZE)
    derived = hashlib.scrypt(
        password.encode(),
        salt=salt,
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
        dklen=SCRYPT_DKLEN
    )
    return salt.hex() + '$' + derived.hex()

def verificar_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt_hex, hash_hex = hashed_password.split('$', 1)
    except ValueError:
        return False
    salt = bytes.fromhex(salt_hex)
    derived = hashlib.scrypt(
        plain_password.encode(),
        salt=salt,
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
        dklen=SCRYPT_DKLEN
    )
    return hmac.compare_digest(derived.hex(), hash_hex)

def crear_usuario(db: Session, usuario: schemas.UserCreate) -> models.User:
    nuevo_usuario = models.User(
        username=usuario.username,
        full_name=usuario.full_name,
        role=usuario.role,
        password=get_password_hash(usuario.password),
        created_by=usuario.created_by,
        created_at=datetime.now()
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

def login_usuario(db: Session, username: str, password: str) -> models.User | None:
    usuario = db.query(models.User).filter(models.User.username == username).first()
    
    if not usuario:
        return None
    
    if not verificar_password(password, usuario.password):
        return None
    
    return usuario

def obtener_usuario_por_id(db: Session, usuario_id: int) -> models.User | None:
    return db.query(models.User).filter(models.User.id == usuario_id).first()

def obtener_usuario_por_username(db: Session, username: str) -> models.User | None:
    return db.query(models.User).filter(models.User.username == username).first()