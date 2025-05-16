// DOM 元素
const messageForm = document.getElementById('message-form');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
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
    console.log('表單提交開始');
    
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    
    if (!name || !message) return;
    
    try {
        // 臨時消息ID
        const tempId = Date.now();
        
        // 創建並顯示帶有"翻譯中"提示的臨時消息
        const tempMessage = {
            id: tempId,
            name: name,
            originalMessage: message,
            translations: {
                original: message,
                zh: '翻譯中...',
                en: '翻譯中...',
                ja: '翻譯中...'
            },
            timestamp: Date.now(),
            likes: 0
        };
        
        // 立即顯示臨時消息
        saveMessage(tempMessage);
        
        // 重置表單
        messageForm.reset();
        
        // 後台進行翻譯
        console.log('開始翻譯...');
        const translations = await translateToAllLanguages(message);
        console.log('翻譯完成:', translations);
        
        // 更新消息的翻譯內容
        updateMessageTranslations(tempId, translations);
        
    } catch (error) {
        console.error('提交消息時出錯:', error);
        alert('發送感言時發生錯誤，請稍後再試。');
    }
});

// 翻譯到所有目標語言
async function translateToAllLanguages(text) {
    const translations = {
        original: text,
        zh: '',
        en: '',
        ja: ''
    };
    
    try {
        // 嘗試偵測語言（用英文翻譯結果來推斷）
        const detectResult = await detectLanguage(text);
        console.log('偵測語言結果:', detectResult);
        
        // 翻譯到三種目標語言
        const zhPromise = translateText(text, 'zh-TW');
        const enPromise = translateText(text, 'en');
        const jaPromise = translateText(text, 'ja');
        
        // 並行處理所有翻譯請求
        const results = await Promise.allSettled([zhPromise, enPromise, jaPromise]);
        
        // 處理結果
        if (results[0].status === 'fulfilled') translations.zh = results[0].value;
        else translations.zh = text;
        
        if (results[1].status === 'fulfilled') translations.en = results[1].value;
        else translations.en = text;
        
        if (results[2].status === 'fulfilled') translations.ja = results[2].value;
        else translations.ja = text;
        
    } catch (error) {
        console.error('翻譯過程出錯:', error);
        // 預設使用原文
        translations.zh = text;
        translations.en = text;
        translations.ja = text;
    }
    
    return translations;
}

// 偵測語言
async function detectLanguage(text) {
    try {
        return await detectLanguageCode(text);
    } catch (error) {
        console.error('語言偵測錯誤:', error);
        return 'en';
    }
}

// 翻譯文本到指定語言
async function translateText(text, targetLang) {
    try {
        // 首先進行語言偵測
        const detectedLang = await detectLanguageCode(text);
        console.log(`偵測到語言: ${detectedLang}`);
        
        // 使用偵測到的語言作為源語言
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${detectedLang}|${targetLang}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API回應錯誤: ${response.status}`);
        
        const data = await response.json();
        
        if (data.responseData && data.responseData.translatedText) {
            // 檢查是否返回了錯誤信息
            if (data.responseData.translatedText.includes('INVALID SOURCE LANGUAGE')) {
                throw new Error('無效的源語言');
            }
            return data.responseData.translatedText;
        } else {
            throw new Error('翻譯API未返回預期的數據結構');
        }
    } catch (error) {
        console.error(`翻譯到${targetLang}失敗:`, error);
        throw error;
    }
}

// 偵測語言並返回ISO代碼
async function detectLanguageCode(text) {
    try {
        // 簡單語言偵測邏輯
        const chinesePattern = /[\u4e00-\u9fa5]/;
        const japanesePattern = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
        const englishPattern = /^[a-zA-Z0-9\s\.,!?'":;-]+$/;
        
        if (chinesePattern.test(text)) return "zh-TW";
        if (japanesePattern.test(text) && !chinesePattern.test(text)) return "ja";
        if (englishPattern.test(text)) return "en";
        
        // 默認使用英文
        return "en";
    } catch (error) {
        console.error('語言偵測錯誤:', error);
        return "en"; // 默認英文
    }
}

// 更新消息的翻譯
function updateMessageTranslations(messageId, translations) {
    // 找到並更新消息
    const messageIndex = localMessages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
        localMessages[messageIndex].translations = translations;
        
        // 更新本地存儲
        localStorage.setItem('dragonBoatMessages', JSON.stringify(localMessages));
        
        // 更新UI
        const msgElement = document.getElementById(`message-${messageId}`);
        if (msgElement) {
            const contentElement = msgElement.querySelector('.translation-content');
            if (contentElement) {
                // 根據當前顯示的標籤更新內容
                const activeTab = msgElement.querySelector('.tab.active');
                if (activeTab) {
                    const lang = activeTab.dataset.language;
                    contentElement.textContent = translations[lang] || translations.original;
                }
            }
        }
        
        console.log('消息翻譯已更新', messageId);
    }
}

// 儲存訊息到本地
function saveMessage(message) {
    // 添加到消息數組最前面
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
    console.log('顯示消息', message.id, message);
    
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
        'original': '原文',
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
        tab.className = `tab ${index === 0 ? 'active' : ''} ${lang === 'original' ? 'original' : ''}`;
        tab.textContent = languageLabels[lang];
        tab.dataset.language = lang;
        
        tab.addEventListener('click', () => {
            // 移除所有標籤的 active 類
            tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // 將當前標籤設為 active
            tab.classList.add('active');
            // 更新翻譯內容 - 始終顯示某些內容
            translationContent.textContent = message.translations[lang] || message.originalMessage;
        });
        
        tabs.appendChild(tab);
    });
    
    // 設置初始翻譯內容為原文
    translationContent.textContent = message.translations.original || message.originalMessage;
    
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
console.log('app.js 已加載 - 多語言版本 (v4.0)');
