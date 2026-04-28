import os
import io
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GEMINI_API_KEY bulunamadı! Lütfen .env dosyanızı kontrol edin.")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def get_meal_suggestions_from_text(ingredients_text: str) -> str:
    """
    1. AŞAMA (Alternatif): Kullanıcının yazdığı malzemeleri analiz edip yemek önerir.
    """
    try:
        prompt = f"""
        Sen yaratıcı ve pratik bir şefsin. Kullanıcının elinde şu malzemeler var: {ingredients_text}
        Sadece bu malzemeleri (ve evde bulunabilecek tuz, yağ, karabiber gibi temel şeyleri) 
        kullanarak yapabileceğim en mantıklı ve lezzetli 3 yemeğin adını öner.
        Yemeklerin tarifini veya nasıl yapıldığını ŞU AN ANLATMA.
        
        Lütfen cevabını tam olarak şu formatta ver:
        ### 1. [Yemek Adı]
        * **Ekstra gerekenler:** (Varsa, yoksa 'Yok' yaz)
        
        ### 2. [Yemek Adı]
        * **Ekstra gerekenler:** (Varsa, yoksa 'Yok' yaz)
        
        ### 3. [Yemek Adı]
        * **Ekstra gerekenler:** (Varsa, yoksa 'Yok' yaz)
        """

        # Görsel olmadığı için sadece prompt'u gönderiyoruz
        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        return f"Üzgünüm, malzemeleri incelerken bir sorun oluştu. Hata detayı: {str(e)}"


def get_recipe_details(meal_name: str) -> str:
    """
    2. AŞAMA: Kullanıcının seçtiği yemeğin adım adım tarifini verir.
    Burada görsel analizine gerek yoktur, sadece metin tabanlı (text) bir istek atılır.
    """
    try:
        prompt = f"""
        Sen usta bir şefsin. Kullanıcı şu yemeği yapmaya karar verdi: "{meal_name}"
        Lütfen bu yemeğin nasıl yapılacağını kısa, öz ve anlaşılır adımlar halinde anlat.
        
        Cevabını şu formatta ver:
        **{meal_name} Tarifi**
        1. ...
        2. ...
        3. ...
        
        Afiyet olsun!
        """

        # Görsel olmadığı için sadece metin (prompt) gönderiyoruz
        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        return f"Üzgünüm, tarifi hazırlarken bir sorun oluştu. Hata detayı: {str(e)}"