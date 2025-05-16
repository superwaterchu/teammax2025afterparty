// DOM 元素
const messageForm = document.getElementById('message-form');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const languageSelect = document.getElementById('language');
const messageCards = document.getElementById('message-cards');
const loader = document.getElementById('loader');

// 本地存儲消息陣列
let localMessages = [];
let messageId = 0;

// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
    console.log('頁面已載入');
    // 隱藏載入中提示
    if (loader) {
        loader.style.display = 'none';
    }
    
    // 載入已儲存的訊息
    loadMessages();
});

// 提交表單
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('表單提交');
    
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const language = languageSelect.value;
    
    if (!name || !message) return;
    
    try {
        // 模擬翻譯文本
        const translations = createTranslations(message, language);
        
        // 創建新消息
        const newMessage = {
            id: Date.now(), // 使用時間戳作為ID
            name: name,
            originalMessage: message,
            originalLanguage: language,
            translations: translations,
            timestamp: Date.now(),
            likes: 0
        };
        
        // 保存消息
        saveMessage(newMessage);
        
        // 重置表單
        messageForm.reset();
        
        console.log('消息已保存', newMessage);
    } catch (error) {
        console.error('提交消息時出錯:', error);
        alert('發送感言時發生錯誤，請稍後再試。');
    }
});

// 翻譯文本
async function createTranslations(text, sourceLanguage) {
    // 簡單模擬翻譯，直到GAS CORS問題解決
    const translations = {
        zh: sourceLanguage === 'zh' ? text : `${text}`,
        en: sourceLanguage === 'en' ? text : `${text}`,
        ja: sourceLanguage === 'ja' ? text : `${text}`
    };
    
    // 嘗試用JSONP方式訪問翻譯API
    // 注意：此功能可能不會生效，這只是嘗試
    if (sourceLanguage !== 'zh' && window.googleTranslateCallback === undefined) {
        window.googleTranslateCallback = function(data) {
            if (data && data.text) {
                const translatedElement = document.querySelector('.latest-message .translation-content');
                if (translatedElement) {
                    translatedElement.textContent = data.text;
                }
            }
        };
        
        try {
            const script = document.createElement('script');
            script.src = `https://script.google.com/macros/s/AKfycbxTxIl2Us_Xu9ReB8xOvpGPuFxIvKspIXcOxBPmH4Wru5RZAPvoK4ZxvLdvEEZ8QV9B-A/exec?text=${encodeURIComponent(text)}&source=${sourceLanguage}&target=zh-TW&callback=googleTranslateCallback`;
            document.body.appendChild(script);
        } catch (e) {
            console.error('翻譯嘗試失敗', e);
        }
    }
    
    return translations;
}

// 使用Google Apps Script進行翻譯
async function translateWithGAS(text, fromLang, toLang) {
    // 您的GAS部署URL
    const gasUrl = 'https://script.google.com/macros/s/AKfycbyufCyQbvEkUgvm-uks6_E0jmQcwkwNnKQ89P_8ZS36zopsLtUEwfZBUv_y2S9n42vX_Q/exec';
    
    // 執行最多三次嘗試，處理潛在的超時問題
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            // 構建帶有參數的URL
            const url = `${gasUrl}?text=${encodeURIComponent(text)}&source=${fromLang}&target=${toLang}`;
            
            // 發送請求
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API回應錯誤: ${response.status}`);
            }
            
            // 獲取翻譯文本
            const translatedText = await response.text();
            
            // 檢查回應是否包含錯誤訊息
            if (translatedText.includes('缺少') || translatedText.includes('錯誤')) {
                throw new Error(`API回應: ${translatedText}`);
            }
            
            return translatedText;
        } catch (error) {
            console.error(`翻譯嘗試 ${attempt + 1} 失敗:`, error);
            
            // 最後一次嘗試失敗時，拋出錯誤
            if (attempt === 2) throw error;
            
            // 等待一小段時間後重試
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// 儲存訊息到本地
function saveMessage(message) {
    // 添加到消息數組
    localMessages.unshift(message);
    
    // 保存到本地存儲
    localStorage.setItem('dragonBoatMessages', JSON.stringify(localMessages));
    
    // 顯示消息
    displayMessage(message);
    
    console.log('保存了新消息', message);
}

// 載入訊息
function loadMessages() {
    console.log('嘗試載入已保存的消息');
    const saved = localStorage.getItem('dragonBoatMessages');
    
    if (saved) {
        try {
            localMessages = JSON.parse(saved);
            console.log('成功載入消息', localMessages.length);
            
            // 顯示所有消息
            messageCards.innerHTML = '';
            localMessages.forEach(message => {
                displayMessage(message);
            });
        } catch (e) {
            console.error('解析已保存消息時出錯:', e);
            localStorage.removeItem('dragonBoatMessages');
            localMessages = [];
        }
    } else {
        console.log('沒有發現已保存的消息');
        localMessages = [];
    }
}

// 顯示訊息卡片
function displayMessage(message) {
    console.log('顯示消息', message.id);
    
    const card = document.createElement('div');
    card.className = 'message-card';
    card.id = `message-${message.id}`;
    
    // 格式化時間
    const timestamp = new Date(message.timestamp);
    const formattedDate = timestamp.toLocaleDateString('zh-TW');
    const formattedTime = timestamp.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    
    // 建立卡片頭部
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    cardHeader.innerHTML = `
        <div class="card-author">${escapeHTML(message.name)}</div>
        <div class="card-timestamp">${formattedDate} ${formattedTime}</div>
    `;
    
    // 建立翻譯標籤
    const tabs = document.createElement('div');
    tabs.className = 'translation-tabs';
    
    const languageLabels = {
        'zh': '中文',
        'en': '英文',
        'ja': '日文'
    };
    
    // 用於儲存翻譯內容的元素
    const translationContent = document.createElement('div');
    translationContent.className = 'translation-content';
    
    // 建立翻譯標籤
    Object.keys(languageLabels).forEach((lang, index) => {
        const tab = document.createElement('div');
        tab.className = `tab ${index === 0 ? 'active' : ''}`;
        tab.textContent = languageLabels[lang];
        tab.dataset.language = lang;
        
        tab.addEventListener('click', () => {
            // 移除所有標籤的 active 類
            tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // 將當前標籤設為 active
            tab.classList.add('active');
            // 更新翻譯內容
            translationContent.textContent = message.translations[lang] || '(翻譯不可用)';
        });
        
        tabs.appendChild(tab);
    });
    
    // 設置初始翻譯內容為中文
    translationContent.textContent = message.translations.zh || '(翻譯不可用)';
    
    // 建立點讚按鈕
    const likeButton = document.createElement('button');
    likeButton.className = 'like-button';
    likeButton.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${message.likes || 0}</span>`;
    
    likeButton.addEventListener('click', () => {
        if (!likeButton.classList.contains('liked')) {
            incrementLikes(message.id);
            likeButton.classList.add('liked');
        }
    });
    
    // 組合所有元素
    card.appendChild(cardHeader);
    card.appendChild(tabs);
    card.appendChild(translationContent);
    card.appendChild(likeButton);
    
    messageCards.appendChild(card);
}

// 增加點讚數
function incrementLikes(messageId) {
    console.log('點讚', messageId);
    
    const messageIndex = localMessages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
        localMessages[messageIndex].likes = (localMessages[messageIndex].likes || 0) + 1;
        
        // 更新顯示
        const likeCountElement = document.querySelector(`#message-${messageId} .like-count`);
        if (likeCountElement) {
            likeCountElement.textContent = localMessages[messageIndex].likes;
        }
        
        // 儲存到本地儲存
        localStorage.setItem('dragonBoatMessages', JSON.stringify(localMessages));
        
        console.log('更新點讚數', localMessages[messageIndex].likes);
    }
}

// 防止 XSS 攻擊的 HTML 字符轉義
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 在页面加載時輸出調試信息
console.log('app.js 已加載 - 使用本地存儲版本 (v2)');
