// 在app.js頂部替換Firebase相關代碼
// 移除原有Firebase配置
// 添加本地存儲功能
const localMessages = [];
let messageId = 0;

// 替換原有Firebase操作函數
function saveMessage(message) {
    message.id = messageId++;
    message.timestamp = Date.now();
    localMessages.unshift(message); // 添加到前面，最新的在最前
    displayAllMessages();
    localStorage.setItem('dragonBoatMessages', JSON.stringify(localMessages));
    return Promise.resolve();
}

// 加載訊息
function loadMessages() {
    const saved = localStorage.getItem('dragonBoatMessages');
    if (saved) {
        localMessages.push(...JSON.parse(saved));
    }
    displayAllMessages();
}

// 顯示所有訊息
function displayAllMessages() {
    messageCards.innerHTML = '';
    localMessages.forEach(message => {
        displayMessage(message);
    });
}

// 替換點讚功能
function incrementLikes(messageId) {
    const message = localMessages.find(m => m.id === parseInt(messageId));
    if (message) {
        message.likes = (message.likes || 0) + 1;
        localStorage.setItem('dragonBoatMessages', JSON.stringify(localMessages));
        document.querySelector(`#message-${messageId} .like-count`).textContent = message.likes;
    }
}
