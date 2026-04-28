from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import get_recipe_details, get_meal_suggestions_from_text

router = APIRouter()

# Kullanıcıdan gelecek verinin formatını belirliyoruz (JSON formatında meal_name bekliyoruz)
class RecipeRequest(BaseModel):
    meal_name: str

class TextIngredientRequest(BaseModel):
    ingredients: str

@router.post("/analyze-text-ingredients")
async def analyze_text_ingredients(request: TextIngredientRequest):
    if not request.ingredients:
        raise HTTPException(status_code=400, detail="Malzeme listesi boş olamaz.")
    
    try:
        result = get_meal_suggestions_from_text(request.ingredients)
        return {"suggestions": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sunucu hatası: {str(e)}")

@router.post("/get-recipe")
async def get_recipe(request: RecipeRequest):
    """
    Kullanıcının seçtiği yemeğin adını alır ve tarifini döndürür.
    """
    if not request.meal_name:
        raise HTTPException(status_code=400, detail="Yemek adı boş olamaz.")
    
    try:
        # Yapay zeka servisimizden seçilen yemeğin detaylarını alıyoruz
        result = get_recipe_details(request.meal_name)
        
        return {"recipe": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sunucu hatası: {str(e)}")