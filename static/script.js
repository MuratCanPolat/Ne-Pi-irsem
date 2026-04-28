const analyzeBtn = document.getElementById('analyzeBtn');
const imageInput = document.getElementById('imageInput');
const loading1 = document.getElementById('loading1');
const suggestionsSection = document.getElementById('suggestionsSection');
const suggestionsOutput = document.getElementById('suggestionsOutput');

const recipeBtn = document.getElementById('recipeBtn');
const mealChoice = document.getElementById('mealChoice');
const loading2 = document.getElementById('loading2');
const recipeSection = document.getElementById('recipeSection');
const recipeOutput = document.getElementById('recipeOutput');

const textInput = document.getElementById('textInput');

// 1. AŞAMA: Fotoğrafı Gönder ve Önerileri Al
analyzeBtn.addEventListener('click', async () => {
    const file = imageInput.files[0];
    const textContent = textInput.value.trim();

    // İkisi de boşsa uyarı ver
    if (!file && !textContent) {
        alert("Lütfen ya bir fotoğraf seçin ya da elinizdeki malzemeleri yazın!");
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
            suggestionsOutput.innerText = data.suggestions;
            suggestionsSection.classList.remove('hidden');

            // Başarılı işlem sonrası inputları temizle
            imageInput.value = "";
            textInput.value = "";
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
    const mealName = mealChoice.value.trim();
    if (!mealName) {
        alert("Lütfen tarifini istediğiniz yemeğin adını yazın!");
        return;
    }

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
    }
});