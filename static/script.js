const analyzeBtn = document.getElementById('analyzeBtn');
const imageInput = document.getElementById('imageInput');
const loading1 = document.getElementById('loading1');
const suggestionsSection = document.getElementById('suggestionsSection');
const suggestionsOutput = document.getElementById('suggestionsOutput');

const recipeBtn = document.getElementById('recipeBtn');
const loading2 = document.getElementById('loading2');
const recipeSection = document.getElementById('recipeSection');
const recipeOutput = document.getElementById('recipeOutput');
const textInput = document.getElementById('textInput');

// 1. AŞAMA: Fotoğrafı veya Metni Gönder ve Önerileri Al
analyzeBtn.addEventListener('click', async () => {
    const file = imageInput.files[0];
    const textContent = textInput.value.trim();

    // Çift girdi veya boş girdi kontrolleri
    if (file && textContent) {
        alert("🚨 Lütfen sadece bir seçenek kullanın: Ya fotoğraf yükleyin ya da metin yazın!");
        return;
    }
    if (!file && !textContent) {
        alert("🚨 Lütfen ya bir fotoğraf seçin ya da elinizdeki malzemeleri yazın!");
        return;
    }

    loading1.classList.remove('hidden');
    suggestionsSection.classList.add('hidden');
    recipeSection.classList.add('hidden');

    try {
        let response;

        // ÖNCELİK 1: Eğer fotoğraf yüklendiyse fotoğraf API'sine git
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            response = await fetch('/api/analyze-ingredients', {
                method: 'POST',
                body: formData
            });
        }
        // ÖNCELİK 2: Fotoğraf yok ama metin yazıldıysa metin API'sine git
        else {
            response = await fetch('/api/analyze-text-ingredients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients: textContent })
            });
        }

        const data = await response.json();

        if (response.ok) {
            let formattedHTML = "";
            let radioHTML = '<p style="margin-top: 0;"><b>Hangi yemeği seçiyorsun? 👇</b></p>';

            const lines = data.suggestions.split('\n');

            lines.forEach(line => {
                if (line.includes('###')) {
                    let mealName = line.replace(/### \d+\.\s*/g, '').trim();
                    formattedHTML += `<h4 style="color: #ff6b6b; margin-bottom: 5px; margin-top: 15px;">🍽️ ${mealName}</h4>`;

                    radioHTML += `
                        <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
                            <input type="radio" name="mealChoice" value="${mealName}" style="transform: scale(1.2); margin-right: 8px;">
                            ${mealName}
                        </label>
                    `;
                } else if (line.trim().startsWith('*')) {
                    let extra = line.replace('*', '').trim();
                    extra = extra.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                    formattedHTML += `<p style="margin-top: 0; font-size: 0.9em; color: #555;">${extra}</p>`;
                } else if (line.trim() !== "") {
                    formattedHTML += `<p>${line}</p>`;
                }
            });

            suggestionsOutput.innerHTML = formattedHTML;
            document.getElementById("meal-selection-container").innerHTML = radioHTML;
            suggestionsSection.classList.remove('hidden');
            document.getElementById("meal-selection-container").style.display = "block";

            const selectionDiv = document.querySelector('.selection-section');
            if (data.suggestions.includes("Şefimiz") || data.suggestions.includes("Üzgünüm")) {
                selectionDiv.style.display = 'none';
            } else {
                selectionDiv.style.display = 'block';
            }

        } else {
            alert("Hata: " + data.detail);
        }
    } catch (error) {
        alert("Bağlantı hatası: " + error);
    } finally {
        loading1.classList.add('hidden');
    }
});

// 2. AŞAMA: Seçilen Yemeği Gönder ve Tarifi Al
recipeBtn.addEventListener('click', async () => {
    const selectedRadio = document.querySelector('input[name="mealChoice"]:checked');

    if (!selectedRadio) {
        alert("🚨 Lütfen önce tarifini görmek istediğiniz yemeği seçin!");
        return;
    }

    const mealName = selectedRadio.value;

    // Butonu Kilitleme Animasyonu
    const originalBtnText = recipeBtn.innerText;
    recipeBtn.disabled = true;
    recipeBtn.innerText = "Şef Hazırlıyor... 🧑‍🍳";
    recipeBtn.style.opacity = "0.7";
    recipeBtn.style.cursor = "not-allowed";

    saveRecipeBtn.disabled = false;
    saveRecipeBtn.innerText = "Bu Tarifi Kaydet 💾";
    saveRecipeBtn.style.backgroundColor = "#4CAF50";

    loading2.classList.remove('hidden');
    recipeSection.classList.add('hidden');

    try {
        const response = await fetch('/api/get-recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meal_name: mealName })
        });

        const data = await response.json();

        if (response.ok) {
            recipeOutput.innerText = data.recipe;
            recipeSection.classList.remove('hidden');
        } else {
            alert("Hata: " + data.detail);
        }
    } catch (error) {
        alert("Bağlantı hatası: " + error);
    } finally {
        loading2.classList.add('hidden');

        recipeBtn.disabled = false;
        recipeBtn.innerText = originalBtnText;
        recipeBtn.style.opacity = "1";
        recipeBtn.style.cursor = "pointer";
    }
});
const saveRecipeBtn = document.getElementById('saveRecipeBtn');
const viewSavedBtn = document.getElementById('viewSavedBtn');
const savedRecipesModal = document.getElementById('savedRecipesModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const savedRecipesList = document.getElementById('savedRecipesList');

// Tarifi Kaydetme
saveRecipeBtn.addEventListener('click', async () => {
    const selectedRadio = document.querySelector('input[name="mealChoice"]:checked');
    const mealName = selectedRadio ? selectedRadio.value : "İsimsiz Yemek";
    const recipeText = document.getElementById('recipeOutput').innerText;

    const originalText = saveRecipeBtn.innerText;
    saveRecipeBtn.disabled = true;
    saveRecipeBtn.innerText = "Kaydediliyor... ⏳";
    saveRecipeBtn.style.opacity = "0.7";



    try {
        const response = await fetch('/api/save-recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meal_name: mealName, recipe_text: recipeText })
        });

        const data = await response.json();

        if (response.ok) {
            saveRecipeBtn.innerText = "Kaydedildi! 🎉";
            saveRecipeBtn.style.backgroundColor = "#2e7d32";
            saveRecipeBtn.style.opacity = "1";
        } else {
            alert("🚨 Hata: " + (data.detail || data.message || "Bilinmeyen sunucu hatası"));
            saveRecipeBtn.disabled = false;
            saveRecipeBtn.innerText = originalText;
            saveRecipeBtn.style.opacity = "1";
        }
    } catch (error) {
        alert("Bağlantı hatası: " + error);
        saveRecipeBtn.disabled = false;
        saveRecipeBtn.innerText = originalText;
        saveRecipeBtn.style.opacity = "1";
    }
});

// Tarifleri Görüntüleme
viewSavedBtn.addEventListener('click', async () => {
    savedRecipesModal.style.display = 'flex';
    savedRecipesList.innerHTML = '<p>Şefin defteri getiriliyor... ⏳</p>';

    try {
        const response = await fetch('/api/get-saved-recipes');
        const data = await response.json();

        if (response.ok) {
            if (data.recipes.length === 0) {
                savedRecipesList.innerHTML = '<p style="color: #777;">Henüz kaydedilmiş bir tarifin yok. 🍽️</p>';
            } else {
                let htmlContent = "";
                data.recipes.forEach(recipe => {
                    htmlContent += `
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; margin-bottom: 15px; position: relative;">
                            <button class="delete-recipe-btn" data-meal="${recipe.meal_name}" style="position: absolute; top: 15px; right: 15px; background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight: bold;">🗑️ Sil</button>
                            <h3 style="margin-top: 0; color: #ff6b6b; border-bottom: 1px dashed #ddd; padding-bottom: 5px; padding-right: 60px;">🍽️ ${recipe.meal_name}</h3>
                            <p style="white-space: pre-wrap; font-size: 14.5px; color: #444; line-height: 1.5;">${recipe.recipe_text}</p>
                        </div>
                    `;
                });
                savedRecipesList.innerHTML = htmlContent;
            }
        } else {
            savedRecipesList.innerHTML = '<p style="color: red;">Tarifler yüklenirken bir hata oluştu!</p>';
        }
    } catch (error) {
        savedRecipesList.innerHTML = '<p style="color: red;">Bağlantı hatası oluştu!</p>';
    }
});

// Pop-up'ı Kapatma
closeModalBtn.addEventListener('click', () => {
    savedRecipesModal.style.display = 'none';
});

// Kullanıcı pencerenin dışındaki karanlık alana tıklarsa da kapansın
window.addEventListener('click', (event) => {
    if (event.target === savedRecipesModal) {
        savedRecipesModal.style.display = 'none';
    }
});

// Tarif Silme
savedRecipesList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-recipe-btn')) {
        const mealName = event.target.getAttribute('data-meal');

        if (!confirm(`"${mealName}" tarifini silmek istediğinize emin misiniz?`)) {
            return;
        }

        const originalText = event.target.innerText;
        event.target.innerText = "⏳";
        event.target.disabled = true;

        try {
            const response = await fetch('/api/delete-recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meal_name: mealName })
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                viewSavedBtn.click();
            } else {
                alert("🚨 Hata: " + (data.detail || data.message));
                event.target.innerText = originalText;
                event.target.disabled = false;
            }
        } catch (error) {
            alert("Bağlantı hatası: " + error);
            event.target.innerText = originalText;
            event.target.disabled = false;
        }
    }
});