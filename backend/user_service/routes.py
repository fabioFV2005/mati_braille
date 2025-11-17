from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .database import get_db
from . import models
import user_service.schemas as schemas
import user_service.crud as crud
from .auth import crear_token_acceso

router = APIRouter()

@router.post("/usuarios/", response_model=schemas.UserResponse)
def crear_usuario(usuario: schemas.UserCreate, db: Session = Depends(get_db)):
    usuario_existente = db.query(models.User).filter(models.User.username == usuario.username).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Nombre de usuario ya registrado")
    
    nuevo_usuario = crud.crear_usuario(db=db, usuario=usuario)
    return nuevo_usuario

@router.post("/login/", response_model=schemas.Token)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    usuario = crud.login_usuario(db=db, username=request.username, password=request.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos"
        )
    
    access_token = crear_token_acceso(data={"sub": usuario.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": usuario
    }