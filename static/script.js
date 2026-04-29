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

    // Çift girdi veya boş girdi kontrolleri (1. ve 2. Kurallar)
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

    // Butonu Kilitleme Animasyonu (5. Kural)
    const originalBtnText = recipeBtn.innerText;
    recipeBtn.disabled = true;
    recipeBtn.innerText = "Şef Hazırlıyor... 🧑‍🍳";
    recipeBtn.style.opacity = "0.7";
    recipeBtn.style.cursor = "not-allowed";

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