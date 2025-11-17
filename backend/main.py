import traceback

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from user_service import models, database
    from user_service.routes import router

    models.Base.metadata.create_all(bind=database.engine)

    app = FastAPI(title="User Service")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/")
    def api_root():
        return {"message": "API funcionando correctamente"}

    app.include_router(router, prefix="/api", tags=["Usuarios"])

    @app.get("/")
    def root():
        return {"message": "correcto"}

    # Ver si mis apis funcionan
    @app.on_event("startup")
    async def startup_event():
        print(" Rutas registradas en FastAPI:")
        for route in app.routes:
            if hasattr(route, "methods") and hasattr(route, "path"):
                print(f"   {list(route.methods)} {route.path}")

    if __name__ == "__main__":
        import uvicorn
        uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)

except Exception as e:
    print("Error al iniciar la aplicación:")
    traceback.print_exc()
    input("Presiona Enter para salir...")