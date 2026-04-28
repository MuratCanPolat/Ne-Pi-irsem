from fastapi import APIRouter, UploadFile, File, HTTPException
from services.ai_service import get_meal_suggestions_from_text

# Router nesnemizi oluşturuyoruz
router = APIRouter()

@router.post("/analyze-ingredients")
async def analyze_ingredients(file: UploadFile = File(...)):
    """
    Kullanıcıdan görseli alır, geçerliliğini kontrol eder ve 
    yemek önerilerini döndürür.
    """
    # Dosyanın gerçekten bir resim olup olmadığını kontrol edelim
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Lütfen geçerli bir resim dosyası yükleyin.")
    
    try:
        # Fotoğrafı RAM'de okuyup byte olarak alıyoruz
        contents = await file.read()
        
        # Yapay zeka servisimizden 3 yemek önerisini alıyoruz
        result = get_meal_suggestions(contents)
        
        return {"suggestions": result}
    
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sunucu hatası: {str(e)}")