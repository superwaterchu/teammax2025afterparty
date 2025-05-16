// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyBVEhGw-9vz7fYiJfbCOhStUzfTCGk_TKA",
    authDomain: "dragon-boat-messages.firebaseapp.com",
    databaseURL: "https://dragon-boat-messages-default-rtdb.firebaseio.com",
    projectId: "dragon-boat-messages",
    storageBucket: "dragon-boat-messages.appspot.com",
    messagingSenderId: "209114424558",
    appId: "1:209114424558:web:ed0ce9eda8b435d8564d57"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const messagesRef = database.ref('messages');

// DOM 元素
const messageForm = document.getElementById('message-form');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const languageSelect = document.getElementById('language');
const messageCards = document.getElementById('message-cards');
const loader = document.getElementById('loader');

// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
});

// 提交表單
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const language = languageSelect.value;
    
    if (!name || !message) return;
    
    // 顯示載入中
    messageForm.classList.add('loading');
    
    try {
        // 翻譯文本
        const translations = await translateMessage(message, language);
        
        // 儲存到 Firebase
        const newMessage = {
            name: name,
            originalMessage: message,
            originalLanguage: language,
            translations: translations,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            likes: 0
        };
        
        await messagesRef.push(newMessage);
        
        // 重置表單
        messageForm.reset();
    } catch (error) {
        console.error('Error submitting message:', error);
        alert('發送感言時發生錯誤，請稍後再試。');
    } finally {
        messageForm.classList.remove('loading');
    }
});

// 載入訊息
function loadMessages() {
    loader.style.display = 'block';
    
    messagesRef.orderByChild('timestamp').on('value', (snapshot) => {
        loader.style.display = 'none';
        messageCards.innerHTML = '';
        
        const messages = [];
        snapshot.forEach((childSnapshot) => {
            const message = childSnapshot.val();
            message.id = childSnapshot.key;
            messages.push(message);
        });
        
        // 按時間倒序顯示消息
        messages.reverse().forEach(message => {
            displayMessage(message);
        });
    });
}

// 顯示訊息卡片
function displayMessage(message) {
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
    const messageRef = messagesRef.child(messageId);
    messageRef.transaction((message) => {
        if (message) {
            message.likes = (message.likes || 0) + 1;
        }
        return message;
    });
}

// 翻譯訊息
async function translateMessage(text, sourceLanguage) {
    // 使用 LibreTranslate API 進行翻譯
    const translations = {
        zh: '',
        en: '',
        ja: ''
    };
    
    try {
        // 如果原始語言不是「自動偵測」，且與目標語言相符，則不需要翻譯
        Object.keys(translations).forEach(lang => {
            if (sourceLanguage === lang) {
                translations[lang] = text;
            }
        });
        
        // 翻譯缺少的語言
        for (const targetLang of Object.keys(translations)) {
            if (!translations[targetLang]) {
                try {
                    const sourceLang = sourceLanguage === 'auto' ? 'auto' : sourceLanguage;
                    
                    // 使用 LibreTranslate API
                    const response = await fetch('https://libretranslate.de/translate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            q: text,
                            source: sourceLang,
                            target: targetLang
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        translations[targetLang] = data.translatedText;
                    } else {
                        throw new Error(`Translation request failed with status ${response.status}`);
                    }
                } catch (error) {
                    console.error(`Error translating to ${targetLang}:`, error);
                    
                    // 使用備用翻譯方法 (模擬翻譯)
                    if (targetLang === 'zh') {
                        translations[targetLang] = `[${targetLang}] ${text}`;
                    } else if (targetLang === 'en') {
                        translations[targetLang] = `[${targetLang}] ${text}`;
                    } else if (targetLang === 'ja') {
                        translations[targetLang] = `[${targetLang}] ${text}`;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Translation error:', error);
    }
    
    return translations;
}

// 防止 XSS 攻擊的 HTML 字符轉義
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
} 