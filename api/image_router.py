from fastapi import APIRouter, UploadFile, File, HTTPException
from services.ai_service import get_meal_suggestions

# Router nesnemizi oluşturuyoruz
router = APIRouter()

@router.post("/analyze-ingredients")
async def analyze_ingredients(file: UploadFile = File(...)):
    """
    Kullanıcıdan görseli alır, geçerliliğini kontrol eder ve 
    yemek önerilerini döndürür.
    """
    # Dosyanın gerçekten bir resim olup olmadığını kontrol etme
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Lütfen geçerli bir resim dosyası yükleyin.")
    
    try:
        # Fotoğrafı RAM'de okuyup byte olarak alma
        contents = await file.read()
        
        # Fotoğraf analiz fonksiyonunu çağırma
        result = get_meal_suggestions(contents)
        
        return {"suggestions": result}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sunucu hatası: {str(e)}")