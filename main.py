from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.image_router import router as image_router
from api.prompt_router import router as prompt_router
import json
import os
from pydantic import BaseModel

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



class RecipeSaveRequest(BaseModel):
    meal_name: str
    recipe_text: str

DB_FILE = "saved_recipes.json"

# Dosya yoksa boş liste oluşturur
if not os.path.exists(DB_FILE):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

@app.post("/api/save-recipe")
async def save_recipe(request: RecipeSaveRequest):
    try:
        # Mevcut tarifleri oku
        with open(DB_FILE, "r", encoding="utf-8") as f:
            recipes = json.load(f)
        
        # Yeni tarifi en başa ekle 
        new_recipe = {
            "meal_name": request.meal_name,
            "recipe_text": request.recipe_text
        }
        recipes.insert(0, new_recipe)
        
        # Dosyayı güncelle
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(recipes, f, ensure_ascii=False, indent=4)
            
        return {"status": "success", "message": "Tarif başarıyla kaydedildi!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/get-saved-recipes")
async def get_saved_recipes():
    try:
        if not os.path.exists(DB_FILE):
            return {"recipes": []}
        
        with open(DB_FILE, "r", encoding="utf-8") as f:
            recipes = json.load(f)
        return {"recipes": recipes}
    except Exception as e:
        return {"recipes": []}

    # Sistemin ayakta olup olmadığını test etmek için kök dizin kontrolü
app.mount("/", StaticFiles(directory="static", html=True), name="static")