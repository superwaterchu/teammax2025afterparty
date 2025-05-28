// === Firebase Database 參考 ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-analytics.js";
import { getDatabase, ref, push, onValue, update, runTransaction } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyBpW90UQgv-WZT4Mv95dDLdKgp7R4xOVq0",
  authDomain: "teammax2025afterparty.firebaseapp.com",
  projectId: "teammax2025afterparty",
  storageBucket: "teammax2025afterparty.firebasestorage.app",
  messagingSenderId: "382059740232",
  appId: "1:382059740232:web:36c40c582a58ad3908ec7d",
  measurementId: "G-XZEY6P7K8Q"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase();
const messagesRef = ref(database, 'messages'); // Base reference to the 'messages' path

// DOM 元素
const messageForm = document.getElementById('message-form');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const messageCards = document.getElementById('message-cards');
const loader = document.getElementById('loader');
const emojiButton = document.getElementById('emoji-button');
const selectedEmoji = document.getElementById('selected-emoji');

// 本地存儲消息陣列
let localMessages = []; // 僅作為快取用，實際資料來自 Firebase

// 創建 emoji 選擇器
function createEmojiPicker() {
    const picker = document.createElement('div');
    picker.className = 'emoji-picker';
    document.body.appendChild(picker);

    // 常用的表情符號列表
    const emojis = [
        // --- 表情符號 (Smileys & Emotion) ---
        '😊', '😚', '😍', '🥳', '🤩', '😎', '🥺', '😭', '😱', '🥵',
        '😃', '😁', '😂', '🤣', '🥹', '😇', '🤫', '🤔', '🫠', '🤗',
        '🙃', '😮‍💨', '😅', '🤧', '🤯', '😡', '😴', '😷', '🤒', '🤕',
        '🥴', '😵‍💫', '🤢', '🤮', '🤑', '😮', '😵', '😩', '😫', '😤',
        '😠', '🤬', '😈', '🥶', '💀', '👹', '👺', '👻', '🤡', '💩',
    
        // --- 手勢與身體 (Hands & Body) ---
        '✊', '🙌', '💪', '👍', '🫶', '👏', '👋', '🤘', '👌', '✌️',
        '🤞', '🤙', '🙏', '🤲', '✍️', '🫦', '👂', '👃', '👀', '👅',
        '🙆‍♂️', '💁‍♀️', '🤷', '🧞‍♂️', '🧚', '🧟‍♂️', '👨‍🍳', '🤹‍♀️', '🧛', '🥷',
    
        // --- 運動與活動 (Sports & Activities) ---
        '🚣', '🏆', '🥇', '🥈', '🥉', '🏁', '🎯', '🏓', '⚽', '🏀',
        '🏈', '⚾', '🎾', '🏐', '🥅', '⛳', '🏄', '🏂', '🏅', '🎆',
    
        // --- 動物 (Animals & Nature) ---
        '🐲', '🦄', '🐈', '🦭', '🐶', '🐷', '🐭', '🐹', '🐰', '🐻',
        '🐼', '🐨', '🐯', '🦁', '🐮', '🦊', '🐻‍❄️', '🐵', '🐒', '🦍',
        '🐎', '🦓', '🦒', '🐘', '🦏', '🐊', '🐍', '🐢', '🦎', '🦖',
        '🦕', '🐳', '🐬', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🦀',
        '🦐', '🦑', '🦋', '🐦', '🦉', '🦅', '🦢', '🐥', '🐔', '🐧',
        '🦆', '🕊️', '🐾', '🌳', '🌲', '🌴', '🌵', '🌱', '🌿', '🍄',
    
        // --- 食物與飲料 (Food & Drink) ---
        '🍉', '🍌', '🍇', '🥭', '🍍', '🍓', '🥜', '🥪', '🫔', '🍳',
        '🍿', '🥫', '🍘', '🍝', '🍜', '🍛', '🍔', '🍕', '🍖', '🍗',
        '🍙', '🍚', '🍟', '🍠', '🍡', '🍢', '🍣', '🍤', '🍥', '🍦',
        '🍧', '🍨', '🍩', '🍪', '🍫', '🍬', '🍭', '🍮', '🍰', '🍞',
        '🥐', '🥖', '🥨', '🥞', '🧇', '🧀', '🥓', '🥩', '🥚', '🥗',
        '🍲', '🥘', '🥣', '🫕', '🥡', '🍱', '🍊', '🍎', '🍐', '🍋',
        '🍈', '🫐', '🍒', '🍑', '🥝', '🍅', '🍆', '🥑', '🥦', '🧅',
        '🧄', '🥥', '🧋', '🍻', '🍼', '🧃', '🥨', '🍵', '🥛', '🥤',
        '🍾', '🍷', '🍸', '🍹', '🧉', '🥂', '🍼', '🍺', '🍻', '🧊',
    
        // --- 慶祝與符號 (Celebration & Symbols) ---
        '❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🤎', '🤍', '❤️‍🔥',
        '✨', '🌟', '🎊', '🎈', '🎁', '🎀', '🎗️', '🎇', '🎆', '💯',
        '✅', '⭕', '❌', '💡', '🌈', '🔱', '💥', '👑', '💎', '💰',
        '💸', '㊗️', '㊙️', '♻️', '🔥', '🔴', '🟠', '🟡', '🟢', '🔵',
    
        // --- 物品與地點 (Objects & Places) ---
        '🛌', '🪂', '🏡', '🏠', '🚑', '🏢', '🏗️', '🏭', '🏫', '🏥',
        '🏦', '🏪', '🚌', '🚗', '🚕', '🚙', '🚚', '🚛', '🚜', '🛵',
        '🚲', '✈️', '🚢', '⛵', '🚤', '🚁', '🚂', '🚄', '🚅', '🚆',
        '🚇', '🚈', '🕰️', '⏳', '⌛', '⏰', '⏱️', '⏲️', '🗓️', '📅',
        '📆', '📖', '🖊️', '📝', '✏️', '🖍️', '📊', '📈', '📉', '📋',
        '📜', '📰', '📱', '💻', '🖥️', '⌨️', '🖱️', '🖨️', '💾', '💿',
        '📀', '🔋', '🔑', '🔒', '🔓', '🛡️', '⚙️', '🔗', '🪜', '🪚',
        '🛠️', '🪛', '💰', '💸', '✉️', '📧', '📦', '🎁', '🛒', '🛍️',
        '🗑️', '💡', '🪑', '🛋️', '🛏️', '🚽', '🚿', '🛀', '🧼', '🧴',
        '🩹', '🩺', '💉', '💊', '🧬', '🔬', '🔭', '📡', '🛰️', '🚀',
    
        // --- 天氣與自然 (Weather & Nature) ---
        '☀️', '🌙', '⭐', '☁️', '🌧️', '⛈️', '🌨️', '🌬️', '🍂', '🍁',
        '🌺', '🌻', '🌹', '🌷', '🌍', '🌎', '🌏', '🌋', '🗻', '🏕️',
        '🏖️', '🏝️', '🌃', '🌆', '🌄', '🌅', '🌉', '🌌', '🌠', '💈',

    ];

    emojis.forEach(emoji => {
        const option = document.createElement('div');
        option.className = 'emoji-option';
        option.textContent = emoji;
        option.addEventListener('click', () => {
            selectedEmoji.textContent = emoji;
            picker.classList.remove('active');
        });
        picker.appendChild(option);
    });

    return picker;
}

// 初始化 emoji 選擇器
const emojiPicker = createEmojiPicker();

// 點擊 emoji 按鈕時顯示選擇器
emojiButton.addEventListener('click', () => {
    emojiPicker.classList.toggle('active');
});

// 點擊其他地方時關閉選擇器
document.addEventListener('click', (e) => {
    if (!emojiButton.contains(e.target) && !emojiPicker.contains(e.target)) {
        emojiPicker.classList.remove('active');
    }
});

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

// 監聽 Firebase 資料庫留言
function loadMessages() {
    console.log('從 Firebase 載入留言...');
    // onValue listens to changes at the 'messages' path
    onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        localMessages = [];
        messageCards.innerHTML = '';
        if (data) {
            // 轉換為陣列並依時間排序（新到舊）
            const arr = Object.entries(data).map(([id, msg]) => ({ ...msg, id }));
            arr.sort((a, b) => b.timestamp - a.timestamp);
            arr.forEach(msg => displayMessage(msg));
            localMessages = arr;
        }
        if (loader) loader.style.display = 'none';
    });
}

// 提交表單
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('表單提交開始');
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const emoji = selectedEmoji.textContent;
    if (!name || !message) return;
    try {
        console.log('嘗試翻譯...');
        // 先顯示「翻譯中」
        const tempMessage = {
            name: name,
            emoji: emoji,
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
        // 寫入 Firebase，取得新留言的 key
        // push adds a new child to the 'messages' path
        const newMsgRef = await push(messagesRef, tempMessage);
        // 重置表單
        messageForm.reset();
        // 翻譯
        const translations = await translateToAllLanguages(message);
        // 更新該留言的翻譯內容
        // update targets a specific message within the 'messages' path
        await update(ref(database, `messages/${newMsgRef.key}`), { translations });
    } catch (error) {
        console.error('提交消息時出錯:', error);
        alert('發送感言時發生錯誤，請稍後再試。');
    }
});

// 翻譯到所有目標語言
async function translateToAllLanguages(text) {
    const translations = {
        original: text,
        zh: text,  // 默認值為原文，以防翻譯失敗
        en: text,
        ja: text
    };

    try {
        // 偵測語言
        const detectedLang = detectLanguageCode(text);
        console.log('偵測語言結果:', detectedLang);

        // 翻譯到三種目標語言
        const zhPromise = translateLongText(text, 'zh-TW');
        const enPromise = translateLongText(text, 'en');
        const jaPromise = translateLongText(text, 'ja');

        // 並行處理所有翻譯請求
        const results = await Promise.allSettled([zhPromise, enPromise, jaPromise]);

        // 處理結果
        if (results[0].status === 'fulfilled') translations.zh = results[0].value;
        if (results[1].status === 'fulfilled') translations.en = results[1].value;
        if (results[2].status === 'fulfilled') translations.ja = results[2].value;

    } catch (error) {
        console.error('翻譯過程出錯:', error);
    }

    return translations;
}

// 語言偵測函數
function detectLanguageCode(text) {
    try {
        // 優先檢查 CJK 字符 (包含中文、日文、韓文的統一表意文字)
        if (/[\u2E80-\u9FFF]/.test(text)) {
            // 如果包含日文假名，則判定為日文
            if (/[\u3040-\u30FF]/.test(text)) { // 日文平假名、片假名
                return "ja";
            }
            // 否則，默認為繁體中文 (MyMemory API 支持 zh-TW)
            return "zh-TW";
        }
        // 基礎的英文判斷 (只包含拉丁字母、數字、空格和基礎標點)
        if (/^[A-Za-z0-9\s\.,!?'"£$€¥%^&*()_+=\-[\]{};:@#~<>/\\]+$/.test(text) && text.length > 0) {
            return "en";
        }
        // 如果以上規則都未匹配，或者文本為空/不符合英文基本模式，則默認為英文
        console.warn(`無法明確偵測語言，默認為 'en': "${text.substring(0, 50)}..."`);
        return "en";
    } catch (error) {
        console.error('語言偵測錯誤 (detectLanguageCode):', error);
        return "en"; // 出錯時默認為英文
    }
}

// 分割長文本為較小的段落
function splitTextForTranslation(text) {
    // 如果文本較短，直接返回
    if (text.length < 1000) return [text];

    // 按段落分割
    let paragraphs = text.split(/\n\s*\n/);

    // 如果段落仍然太長，按句子分割
    let chunks = [];
    for (let para of paragraphs) {
        if (para.length < 1000) {
            chunks.push(para);
        } else {
            // 按句號、問號、感嘆號等分割
            let sentences = para.split(/(?<=[.!?])\s+/);
            let currentChunk = "";

            for (let sentence of sentences) {
                if ((currentChunk + sentence).length < 950) {
                    currentChunk += (currentChunk ? " " : "") + sentence;
                } else {
                    if (currentChunk) chunks.push(currentChunk);
                    currentChunk = sentence;
                }
            }

            if (currentChunk) chunks.push(currentChunk);
        }
    }

    return chunks.length > 0 ? chunks : [text];
}

// 翻譯長文本，分段處理
async function translateLongText(text, targetLang) {
    // 分割文本
    const chunks = splitTextForTranslation(text);
    console.log(`將長文本分為 ${chunks.length} 個塊進行翻譯`);

    // 如果只有一個塊，直接翻譯
    if (chunks.length === 1) {
        return await translateText(text, targetLang);
    }

    // 翻譯每個塊
    let translatedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
        try {
            console.log(`翻譯塊 ${i+1}/${chunks.length}...`);
            const translatedChunk = await translateText(chunks[i], targetLang);
            translatedChunks.push(translatedChunk);
        } catch (error) {
            console.error(`翻譯塊 ${i+1} 失敗:`, error);
            // 出錯時使用原文
            translatedChunks.push(chunks[i]);
        }
    }

    // 合併翻譯結果
    return translatedChunks.join("\n\n");
}

// 翻譯文本到指定語言
async function translateText(text, targetLang) {
    try {
        const detectedSourceLang = detectLanguageCode(text); // 直接調用同步的偵測函數
        console.log(`偵測到的源語言: ${detectedSourceLang}, 翻譯目標: ${targetLang}`);

        // 如果源語言與目標語言相同，直接返回原文
        if (detectedSourceLang === targetLang ||
            (detectedSourceLang === 'zh-TW' && targetLang === 'zh')) {
            console.log(`源語言與目標語言相同 (${detectedSourceLang}=${targetLang})，返回原文`);
            return text;
        }

        const langPair = `${detectedSourceLang}|${targetLang}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
        console.log('請求 MyMemory API URL:', url);

        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text(); // 嘗試獲取錯誤詳情
            console.error(`MyMemory API HTTP 錯誤: ${response.status}`, errorBody);
            throw new Error(`API回應錯誤: ${response.status}`);
        }

        const data = await response.json();
        console.log('MyMemory API 響應數據:', data);

        // MyMemory API 有時即使 responseStatus 不是 200 也可能包含有用的錯誤信息
        if (data.responseStatus !== 200 && data.responseDetails) {
            console.error('MyMemory API 業務錯誤:', data.responseDetails);
            throw new Error(`翻譯API業務錯誤: ${data.responseDetails}`);
        }

        if (data.responseData && data.responseData.translatedText) {
            const translated = data.responseData.translatedText;
            // 有些情況下，即使成功，API也可能返回包含錯誤信息的字符串
            if (typeof translated === 'string' &&
                (translated.toUpperCase().includes("INVALID SOURCE LANGUAGE") ||
                 translated.toUpperCase().includes("INVALID TARGET LANGUAGE") ||
                 translated.toUpperCase().includes("INVALID LANGPAIR") ||
                 translated.toUpperCase().includes("PLEASE SPECIFY TEXT TO TRANSLATE"))) {
                console.warn(`API返回了錯誤信息: ${translated}`);
                throw new Error(`翻譯API返回錯誤信息: ${translated}`);
            }
            return translated;
        } else {
            console.error('MyMemory API 未返回預期的翻譯數據結構');
            throw new Error('翻譯API未返回預期的數據結構');
        }
    } catch (error) {
        console.error(`翻譯到 ${targetLang} 失敗:`, error);
        throw error; // 向上拋出錯誤，由 translateToAllLanguages 函數處理回退
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
        ${message.emoji ? `<div class="message-emoji">${message.emoji}</div>` : ''}
        <div class="card-author-info">
            <div class="card-author">${escapeHTML(message.name)}</div>
            <div class="card-timestamp">${formattedDate} ${formattedTime}</div>
        </div>
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

// 點讚功能
function incrementLikes(messageId) {
    // runTransaction targets the 'likes' property of a specific message within the 'messages' path
    const msgRef = ref(database, `messages/${messageId}/likes`);
    runTransaction(msgRef, (currentLikes) => {
        return (currentLikes || 0) + 1;
    });
}

// 防止 XSS 攻擊的 HTML 字符轉義
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 在页面加載時輸出調試信息
console.log('app.js 已加載 - Firebase 多語言即時同步版本');