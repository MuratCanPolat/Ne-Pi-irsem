import os
import io
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image

load_dotenv(override=True)

GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")

if GOOGLE_API_KEY:
    print(f"🕵️ KULLANILAN API ANAHTARININ SON 4 HANESİ: ...{GOOGLE_API_KEY[-4:]}")

if not GOOGLE_API_KEY:
    raise ValueError("GEMINI_API_KEY bulunamadı! Lütfen .env dosyanızı kontrol edin.")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-3.1-flash-lite-preview')

def get_meal_suggestions(image_bytes: bytes) -> str:
    """
    1. AŞAMA (Görsel): Fotoğrafı analiz edip sadece yemek isimlerini sunar.
    WEBP veya PNG format hatalarını otomatik düzeltir.
    """
    try:
        # Gelen byte'ı görsele çevirme
        image = Image.open(io.BytesIO(image_bytes))

        # Görsel format düzeltme
        if image.mode != "RGB":
            image = image.convert("RGB")

        prompt = """
        Sen yaratıcı ve pratik bir şefsin. Sana gönderdiğim fotoğraftaki malzemeleri analiz et.
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

        # Hem prompt'u hem de düzeltilmiş görseli modele gönderme
        response = model.generate_content([prompt, image])
        return response.text

    except Exception as e:
        error_message = str(e)
        if "429" in error_message or "quota" in error_message.lower():
            return "Şefimiz şu an mutfakta çok yoğun! Lütfen 1 dakika bekleyip tekrar deneyin. 🧑‍🍳"
        return f"Üzgünüm, malzemeleri incelerken bir sorun oluştu. Hata detayı: {error_message}"


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
        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        error_message = str(e)
        if "429" in error_message or "quota" in error_message.lower():
            return "Şefimiz şu an mutfakta çok yoğun! Lütfen 1 dakika bekleyip tekrar deneyin. 🧑‍🍳"
        return f"Üzgünüm, malzemeleri incelerken bir sorun oluştu. Hata detayı: {error_message}"

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

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        error_message = str(e)
        if "429" in error_message or "Quota" in error_message:
            return "Şefimiz şu an mutfakta çok yoğun! Lütfen 1 dakika bekleyip tekrar deneyin. 🧑‍🍳"
        return f"Üzgünüm, tarifi hazırlarken bir sorun oluştu. Hata detayı: {error_message}"