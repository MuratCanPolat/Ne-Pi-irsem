from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.image_router import router as image_router
from api.prompt_router import router as prompt_router

# FastAPI başlatma
app = FastAPI(title="Ne Pişirsem API", description="Yapay Zeka Destekli Yemek Asistanı")

# CORS Ayarları: HTML/JS 'in API'ye istek atabilmesi için gerekli
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme aşamasında her yerden gelen isteklere izin veriyoruz. Canlıya alırken dikkat etmeli.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları ana uygulamaya "/api" ön ekiyle dahil etme
app.include_router(image_router, prefix="/api")
app.include_router(prompt_router, prefix="/api")

# Sistemin ayakta olup olmadığını test etmek için kök dizin kontrolü
app.mount("/", StaticFiles(directory="static", html=True), name="static")