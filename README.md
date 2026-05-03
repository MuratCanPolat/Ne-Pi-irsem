# 🍳 Ne Pişirsem? - Yapay Zeka Destekli Yemek Pişirme Asistanı

Bu proje, kullanıcıların ellerindeki malzemelerin fotoğrafını yükleyerek veya malzemeleri metin olarak girerek yapay zeka destekli yemek tarifleri alabildiği bir web uygulamasıdır. 

Kullanıcılar beğendikleri tarifleri yerel bir veritabanına kaydedebilir, daha sonra inceleyebilir veya silebilirler.

## 🚀 Teknolojiler
* **Backend:** Python, FastAPI, Pydantic
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Yapay Zeka:** Google Gemini API (Görüntü ve Metin İşleme)
* **Veritabanı:** JSON Tabanlı Yerel Depolama (Local Storage)
* **Sunucu:** Uvicorn

## ✨ Özellikler
- **Görsel Algılama:** Yüklenen fotoğraftaki malzemeleri Gemini AI ile analiz etme.
- **Metin Algılama:** Virgülle ayrılmış malzeme listesinden anlamlı tarifler çıkarma.
- **Asenkron Çalışma:** Sayfa yenilenmeden (AJAX/Fetch) AI ile iletişim kurma ve arayüzü güncelleme.
- **Kalıcı Depolama (CRUD):** Beğenilen tarifleri `saved_recipes.json` dosyasına kaydetme, listeleme ve silme işlemleri.
- **Dinamik UX:** Akıllı yükleme animasyonları, durum butonları ve hata yönetimi (Method Not Allowed, Null Reference önlemleri).

## 🛠️ Kurulum
Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

1. Repoyu bilgisayarınıza klonlayın.
2. Gerekli kütüphaneleri yükleyin:
   ```bash
   pip install -r requirements.txt
   ```
3. .env dosyasını oluşturun ve API_KEY'i ekleyin:
   ```bash
   touch .env
   echo "API_KEY=your-api-key" >> .env
   ```

## 🏃‍♂️ Çalıştırma
Projenin ana dizininde terminale şu komutları sırasıyla yazın:

```bash
(venv)\Scripts\activate

uvicorn main:app --reload
```

ardından tarayıcınızda http://localhost:8000 adresini açın.